import requests
from bs4 import BeautifulSoup
import time
import re
import os
import random
import json
import logging
from urllib.parse import urlparse, urljoin
import textstat
import matplotlib
matplotlib.use('Agg') # Non-interactive backend
import matplotlib.pyplot as plt
import numpy as np
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from io import BytesIO

from services.seo.accessibility_analyzer import AccessibilityAnalyzer
from services.seo.onpage_analyzer import OnPageAnalyzer
from services.seo.performance_analyzer import PerformanceAnalyzer, fetch_page
from services.seo.seo_score import compute_final_score
from services.seo.technical_analyzer import TechnicalAnalyzer

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SEOAnalyzer:
    def __init__(self, url):
        self.url = url
        if not self.url.startswith('http'):
            self.url = 'https://' + self.url
        self.domain = urlparse(self.url).netloc
        self.soup = None
        self.start_time = 0
        self.response = None
        self.load_time = 0
        self.ttfb_seconds = None
        self.html_bytes = None
        self.on_page_analyzer = OnPageAnalyzer()
        self.technical_analyzer = TechnicalAnalyzer()
        self.accessibility_analyzer = AccessibilityAnalyzer()
        self.performance_analyzer = PerformanceAnalyzer()
        self.accessibility_score = 0
        self.report_data = {
            "score": 0,
            "url": self.url,
            "domain": self.domain,
            "timestamp": time.time(),
            "preview_image": None,
            "load_time_ms": 0,
            "categories": {
                "on_page": {"score": 0, "issues": [], "passed": []},
                "technical": {"score": 0, "issues": [], "passed": []},
                "off_page": {"score": 0, "issues": [], "passed": []}, # Simulated
                "performance": {"score": 0, "issues": [], "passed": []},
                "security": {"score": 0, "issues": [], "passed": []}
            }
        }
        self.charts = {} # Store paths to generated charts

    def analyze(self):
        """Main analysis pipeline"""
        try:
            self._crawl()
            if self.response and self.response.status_code == 200:
                self._extract_preview()
                
                # 1. On-Page SEO
                self._analyze_on_page()
                
                # 2. Technical SEO
                self._analyze_technical()
                
                # 3. Performance (Images + Speed)
                self._analyze_performance()

                # 4. Accessibility
                self._analyze_accessibility()
                
                # 5. Security
                self._analyze_security()
                
                # 6. Scoring
                self._calculate_final_score()
                
            else:
                self.report_data["error"] = f"Failed to crawl URL: Status {self.response.status_code if self.response else 'Unknown'}"
        except Exception as e:
            logger.error(f"Analysis Failed: {e}")
            self.report_data["error"] = f"Analysis failed: {str(e)}"
        
        return self.report_data

    def generate_pdf(self, output_path):
        """Generates a professional PDF report"""
        doc = SimpleDocTemplate(output_path, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
        story = []
        styles = getSampleStyleSheet()
        
        # Title Style
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            textColor=colors.HexColor('#2563EB')
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=18,
            spaceBefore=20,
            spaceAfter=10,
            textColor=colors.HexColor('#111827')
        )
        
        # 1. Cover Page
        story.append(Paragraph(f"SEO Audit Report", title_style))
        story.append(Paragraph(f"Generated for: {self.domain}", styles['Normal']))
        story.append(Paragraph(f"Date: {time.strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Score Visualization (Text fallback if chart fails)
        score_text = f"Overall SEO Score: {self.report_data['score']}/100"
        story.append(Paragraph(score_text, heading_style))
        
        # Generate Charts for PDF
        self._generate_pdf_charts()
        
        if 'radar' in self.charts:
            im = RLImage(self.charts['radar'], width=400, height=300)
            story.append(im)
            
        story.append(PageBreak())
        
        # 2. Executive Summary / Category Breakdown
        story.append(Paragraph("Executive Summary", title_style))
        
        # Category Scores Table
        cat_data = [["Category", "Score", "Status"]]
        for cat, data in self.report_data["categories"].items():
            status = "Good" if data["score"] >= 80 else "Warning" if data["score"] >= 50 else "Critical"
            cat_data.append([cat.replace('_', ' ').title(), f"{data['score']}/100", status])
            
        t = Table(cat_data, colWidths=[200, 100, 100])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EFF6FF')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#1E40AF')),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        story.append(t)
        story.append(Spacer(1, 20))
        
        # 3. Detailed Recommendations
        for cat, data in self.report_data["categories"].items():
            if not data['issues']:
                continue
                
            story.append(Paragraph(f"{cat.replace('_', ' ').title()} Issues", heading_style))
            
            for issue in data['issues']:
                # Severity Color
                color = "red" if issue['severity'] == 'critical' else "orange" if issue['severity'] == 'warning' else "blue"
                story.append(Paragraph(f"<font color='{color}'><b>[{issue['severity'].upper()}]</b></font> {issue['message']}", styles['Normal']))
                story.append(Paragraph(f"<i>Fix: {issue['recommendation']}</i>", styles['Italic']))
                story.append(Spacer(1, 8))
                
            story.append(Spacer(1, 10))
            
        story.append(PageBreak())
        story.append(Paragraph("End of Report", styles['Normal']))
        
        try:
            doc.build(story)
            return True
        except Exception as e:
            logger.error(f"PDF Generation Failed: {e}")
            return False

    def _generate_pdf_charts(self):
        """Generates matplotlib charts for the PDF"""
        try:
            # 1. Radar Chart
            categories = list(self.report_data['categories'].keys())
            scores = [data['score'] for data in self.report_data['categories'].values()]
            
            # Close the loop
            categories = [*categories, categories[0]]
            scores = [*scores, scores[0]]
            
            label_locs = np.linspace(start=0, stop=2 * np.pi, num=len(scores))
            
            plt.figure(figsize=(6, 6))
            plt.subplot(polar=True)
            plt.plot(label_locs, scores, label='Score')
            plt.fill(label_locs, scores, alpha=0.25)
            plt.title('SEO Performance Radar', size=20, y=1.05)
            lines, labels = plt.thetagrids(np.degrees(label_locs), labels=categories)
            
            radar_path = f"uploads/{self.domain.replace(':', '_')}_radar.png"
            plt.savefig(radar_path)
            plt.close()
            self.charts['radar'] = radar_path
            
        except Exception as e:
            logger.error(f"Chart Generation Error: {e}")

    # --- Analysis Helpers ---

    def _crawl(self):
        try:
            fetch_result = fetch_page(self.url)
            self.response = fetch_result["response"]
            self.soup = fetch_result["soup"]
            self.ttfb_seconds = fetch_result["ttfb_seconds"]
            self.html_bytes = fetch_result["html_bytes"]
            self.load_time = (self.ttfb_seconds or 0) * 1000
        except Exception as e:
            raise Exception(f"Crawl Error: {str(e)}")

    def _extract_preview(self):
        og_img = self.soup.find('meta', property='og:image')
        if og_img and og_img.get('content'):
            self.report_data["preview_image"] = og_img['content']

    def _add_issue(self, category, severity, message, recommendation=None):
        self.report_data["categories"][category]["issues"].append({
            "severity": severity,
            "message": message,
            "recommendation": recommendation or "Fix this issue to improve SEO score."
        })

    def _add_pass(self, category, message):
        self.report_data["categories"][category]["passed"].append(message)

    # --- 1. On-Page Analysis ---
    def _analyze_on_page(self):
        cat = "on_page"
        result = self.on_page_analyzer.analyze(self.url, self.soup)
        self.report_data["categories"][cat]["score"] = result.get("score", 0)
        details = result.get("details", {})
        for detail in details.values():
            info = detail.get("details", {}) if isinstance(detail, dict) else {}
            message = info.get("what_was_detected")
            recommendation = info.get("recommended_fix")
            if detail.get("score", 0) < 100:
                self._add_issue(cat, "warning", message, recommendation)
            else:
                self._add_pass(cat, message)

    # --- 2. Technical Analysis ---
    def _analyze_technical(self):
        cat = "technical"
        result = self.technical_analyzer.analyze(self.url, self.soup)
        self.report_data["categories"][cat]["score"] = result.get("score", 0)
        checks = result.get("checks", {})
        for check in checks.values():
            info = check.get("details", {}) if isinstance(check, dict) else {}
            message = info.get("what_was_detected")
            recommendation = info.get("recommended_fix")
            if message and "missing" in message.lower():
                self._add_issue(cat, "warning", message, recommendation)
            else:
                self._add_pass(cat, message or "Technical check passed.")

    # --- 3. Performance ---
    def _analyze_performance(self):
        cat = "performance"
        result = self.performance_analyzer.analyze(
            self.url,
            response=self.response,
            soup=self.soup,
            ttfb_seconds=self.ttfb_seconds,
            html_bytes=self.html_bytes,
        )
        self.report_data['load_time_ms'] = int((self.ttfb_seconds or 0) * 1000)
        self.report_data["categories"][cat]["score"] = result.get("score", 0)
        for detail in result.get("explanations", {}).values():
            message = detail.get("why_score_is_low") or detail.get("why_this_matters_for_seo")
            recommendation = detail.get("recommended_improvements")
            if detail.get("score", 0) < 100:
                self._add_issue(cat, "warning", message, recommendation)
            else:
                self._add_pass(cat, message)

    # --- 4. Accessibility ---
    def _analyze_accessibility(self):
        cat = "performance"
        result = self.accessibility_analyzer.analyze(self.soup)
        self.accessibility_score = result.get("score", 0)
        detail = result.get("details", {}).get("alt_text", {})
        info = detail.get("details", {})
        if result.get("score", 0) < 100:
            self._add_issue(cat, "warning", info.get("what_was_detected"), info.get("recommended_fix"))
        else:
            self._add_pass(cat, info.get("what_was_detected"))

    # --- 4. Security ---
    def _analyze_security(self):
        cat = "security"
        if self.url.startswith("https"):
            self._add_pass(cat, "HTTPS enabled.")
        else:
            self._add_issue(cat, "critical", "Not using HTTPS.", "Install SSL certificate.")

    # --- 5. Off-Page (Unavailable) ---
    def _analyze_offpage_mock(self):
        cat = "off_page"
        self._add_issue(cat, "warning", "Off-page metrics not available without backlink datasets.", "Connect a backlink data source to enrich off-page scoring.")
        self.report_data['backlinks'] = None
        self.report_data['da'] = None

    # --- 6. Final Calculation ---
    def _calculate_final_score(self):
        self.report_data["score"] = compute_final_score(
            performance=self.report_data["categories"].get("performance", {}).get("score", 0),
            on_page=self.report_data["categories"].get("on_page", {}).get("score", 0),
            technical=self.report_data["categories"].get("technical", {}).get("score", 0),
            accessibility=self.accessibility_score,
        )

if __name__ == "__main__":
    url = "https://example.com"
    analyzer = SEOAnalyzer(url)
    report = analyzer.analyze()
    print(json.dumps(report, indent=2))
    analyzer.generate_pdf("example_report.pdf")
