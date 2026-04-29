"""
Backlink Checker Module
Analyzes backlinks, domain authority, referring domains, and link quality
"""
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse, urljoin
import hashlib
import random
import logging

logger = logging.getLogger(__name__)

class BacklinkChecker:
    def __init__(self, url):
        self.url = url
        self.domain = urlparse(url).netloc if url else None
    
    def check_backlinks(self):
        """
        Check backlinks for a domain
        Note: This is a simulated implementation. Real backlink checking requires APIs like:
        - Ahrefs API
        - Moz API
        - SEMrush API
        - Majestic SEO API
        """
        if not self.domain:
            return {"error": "Domain not provided"}
        
        # Generate deterministic mock data based on domain
        domain_hash = int(hashlib.md5(self.domain.encode()).hexdigest(), 16)
        random.seed(domain_hash)
        
        # Simulate backlink metrics
        total_backlinks = random.randint(100, 10000)
        referring_domains = random.randint(10, min(total_backlinks // 5, 500))
        domain_authority = random.randint(10, 90)
        page_authority = random.randint(10, 90)
        spam_score = random.randint(0, 20)
        
        # Simulate backlink types
        backlink_types = {
            'dofollow': int(total_backlinks * 0.7),
            'nofollow': int(total_backlinks * 0.3),
            'sponsored': random.randint(0, total_backlinks // 20),
            'ugc': random.randint(0, total_backlinks // 30)
        }
        
        # Simulate anchor text distribution
        anchor_texts = [
            {'text': 'click here', 'count': random.randint(5, 50), 'type': 'generic'},
            {'text': self.domain, 'count': random.randint(10, 100), 'type': 'branded'},
            {'text': 'website', 'count': random.randint(5, 30), 'type': 'generic'},
            {'text': 'homepage', 'count': random.randint(3, 20), 'type': 'generic'},
        ]
        
        # Simulate top referring domains
        top_referring_domains = []
        for i in range(min(10, referring_domains)):
            top_referring_domains.append({
                'domain': f'referrer{i+1}.com',
                'backlinks': random.randint(1, 50),
                'domain_authority': random.randint(20, 80),
                'link_type': random.choice(['dofollow', 'nofollow'])
            })
        
        # Calculate quality score
        quality_score = self._calculate_quality_score(
            domain_authority, spam_score, referring_domains, backlink_types
        )
        
        return {
            'domain': self.domain,
            'total_backlinks': total_backlinks,
            'referring_domains': referring_domains,
            'domain_authority': domain_authority,
            'page_authority': page_authority,
            'spam_score': spam_score,
            'quality_score': quality_score,
            'backlink_types': backlink_types,
            'anchor_texts': anchor_texts,
            'top_referring_domains': sorted(top_referring_domains, key=lambda x: x['backlinks'], reverse=True),
            'recommendations': self._generate_recommendations(
                domain_authority, spam_score, referring_domains, quality_score
            )
        }
    
    def _calculate_quality_score(self, da, spam_score, referring_domains, backlink_types):
        """Calculate overall backlink quality score"""
        score = 0
        
        # Domain Authority (40% weight)
        score += (da / 100) * 40
        
        # Spam Score (30% weight - lower is better)
        score += ((100 - spam_score) / 100) * 30
        
        # Referring Domains diversity (20% weight)
        diversity_score = min(100, (referring_domains / 100) * 100)
        score += (diversity_score / 100) * 20
        
        # Dofollow ratio (10% weight)
        dofollow_ratio = backlink_types['dofollow'] / sum(backlink_types.values()) if sum(backlink_types.values()) > 0 else 0
        score += dofollow_ratio * 10
        
        return round(score, 1)
    
    def _generate_recommendations(self, da, spam_score, referring_domains, quality_score):
        """Generate recommendations based on backlink metrics"""
        recommendations = []
        
        if da < 30:
            recommendations.append({
                'priority': 'high',
                'message': 'Low Domain Authority detected',
                'action': 'Focus on building high-quality backlinks from authoritative domains'
            })
        
        if spam_score > 10:
            recommendations.append({
                'priority': 'critical',
                'message': f'High spam score ({spam_score}%)',
                'action': 'Review and disavow toxic backlinks using Google Search Console'
            })
        
        if referring_domains < 20:
            recommendations.append({
                'priority': 'medium',
                'message': 'Limited referring domain diversity',
                'action': 'Build relationships with diverse, relevant websites in your niche'
            })
        
        if quality_score < 50:
            recommendations.append({
                'priority': 'high',
                'message': 'Overall backlink quality needs improvement',
                'action': 'Focus on earning natural, relevant backlinks through quality content and outreach'
            })
        
        return recommendations
    
    def analyze_link_profile(self, backlink_data):
        """Analyze link profile health"""
        analysis = {
            'strengths': [],
            'weaknesses': [],
            'opportunities': [],
            'threats': []
        }
        
        da = backlink_data.get('domain_authority', 0)
        spam_score = backlink_data.get('spam_score', 0)
        referring_domains = backlink_data.get('referring_domains', 0)
        
        # Strengths
        if da > 50:
            analysis['strengths'].append(f"Strong Domain Authority ({da})")
        if spam_score < 5:
            analysis['strengths'].append(f"Low spam score ({spam_score}%)")
        if referring_domains > 100:
            analysis['strengths'].append(f"Good referring domain diversity ({referring_domains})")
        
        # Weaknesses
        if da < 30:
            analysis['weaknesses'].append(f"Low Domain Authority ({da})")
        if spam_score > 10:
            analysis['weaknesses'].append(f"High spam score ({spam_score}%)")
        if referring_domains < 20:
            analysis['weaknesses'].append(f"Limited referring domains ({referring_domains})")
        
        # Opportunities
        analysis['opportunities'].append("Build relationships with industry publications")
        analysis['opportunities'].append("Create shareable content to earn natural backlinks")
        analysis['opportunities'].append("Participate in relevant forums and communities")
        
        # Threats
        if spam_score > 15:
            analysis['threats'].append("High spam score may lead to Google penalties")
        if backlink_data.get('backlink_types', {}).get('sponsored', 0) > backlink_data.get('total_backlinks', 1) * 0.1:
            analysis['threats'].append("Too many sponsored links may look unnatural")
        
        return analysis
