"""
User Experience Signals Analyzer
Analyzes mobile UX, layout stability, engagement potential, and navigation
"""
from bs4 import BeautifulSoup
import re
import logging

logger = logging.getLogger(__name__)

class UXSignalsAnalyzer:
    def __init__(self, soup, response):
        self.soup = soup
        self.response = response
    
    def analyze(self):
        """Analyze user experience signals"""
        analysis = {
            'mobile_ux': self._analyze_mobile_ux(),
            'layout_stability': self._analyze_layout_stability(),
            'engagement_potential': self._analyze_engagement_potential(),
            'navigation': self._analyze_navigation_ux(),
            'accessibility': self._analyze_accessibility(),
            'score': 0
        }
        
        # Calculate overall UX score
        analysis['score'] = self._calculate_ux_score(analysis)
        
        return analysis
    
    def _analyze_mobile_ux(self):
        """Analyze mobile user experience"""
        # Viewport meta tag
        viewport = self.soup.find('meta', attrs={'name': 'viewport'})
        has_viewport = viewport is not None
        
        # Check for mobile-friendly indicators
        # Responsive images
        images = self.soup.find_all('img')
        responsive_images = sum(1 for img in images if img.get('srcset') or 'responsive' in str(img.get('class', [])).lower())
        
        # Touch targets (links and buttons)
        interactive_elements = self.soup.find_all(['a', 'button', 'input'])
        # Estimate touch target size (simplified - would need CSS analysis for accurate sizing)
        adequate_touch_targets = len(interactive_elements)  # Simplified check
        
        # Font sizes (check for readable fonts)
        # This is simplified - real analysis would parse CSS
        has_readable_fonts = True  # Assume yes unless we detect issues
        
        return {
            'has_viewport': has_viewport,
            'responsive_images': responsive_images,
            'total_images': len(images),
            'interactive_elements': len(interactive_elements),
            'has_readable_fonts': has_readable_fonts,
            'mobile_friendly': has_viewport and len(interactive_elements) > 0
        }
    
    def _analyze_layout_stability(self):
        """Analyze layout stability (CLS - Cumulative Layout Shift)"""
        # Simplified CLS estimation
        # Real CLS requires browser metrics, but we can check for common causes
        
        images = self.soup.find_all('img')
        images_without_dimensions = sum(1 for img in images if not (img.get('width') and img.get('height')))
        
        # Check for async/defer scripts that might cause shifts
        scripts = self.soup.find_all('script')
        blocking_scripts = sum(1 for script in scripts if not (script.get('async') or script.get('defer')))
        
        # Check for embedded content (ads, videos) that might shift layout
        embeds = self.soup.find_all(['iframe', 'embed', 'object'])
        
        cls_risk_factors = {
            'images_without_dimensions': images_without_dimensions,
            'blocking_scripts': blocking_scripts,
            'embeds': len(embeds),
            'total_risk_factors': images_without_dimensions + blocking_scripts + len(embeds)
        }
        
        # Estimate CLS score
        if cls_risk_factors['total_risk_factors'] == 0:
            cls_estimate = 'Good'
            cls_score = 0.0
        elif cls_risk_factors['total_risk_factors'] < 3:
            cls_estimate = 'Needs Improvement'
            cls_score = 0.1
        else:
            cls_estimate = 'Poor'
            cls_score = 0.25
        
        return {
            'cls_estimate': cls_score,
            'cls_status': cls_estimate,
            'risk_factors': cls_risk_factors,
            'is_stable': cls_score < 0.1
        }
    
    def _analyze_engagement_potential(self):
        """Analyze potential for user engagement"""
        # Check for engagement elements
        text = self.soup.get_text()
        
        # Call-to-action buttons
        cta_keywords = ['buy', 'sign up', 'subscribe', 'download', 'learn more', 'get started', 'contact', 'click here']
        cta_count = sum(1 for keyword in cta_keywords if keyword.lower() in text.lower())
        
        # Interactive elements
        forms = self.soup.find_all('form')
        buttons = self.soup.find_all('button')
        links = self.soup.find_all('a', href=True)
        
        # Social sharing buttons
        social_indicators = ['share', 'facebook', 'twitter', 'linkedin', 'instagram']
        has_social = any(indicator in str(self.soup).lower() for indicator in social_indicators)
        
        # Video content
        videos = self.soup.find_all(['video', 'iframe'])
        has_video = len(videos) > 0
        
        # Comments section
        has_comments = 'comment' in str(self.soup).lower() or self.soup.find(class_=re.compile(r'comment', re.I))
        
        engagement_score = 0
        if cta_count > 0:
            engagement_score += 25
        if len(forms) > 0:
            engagement_score += 20
        if has_social:
            engagement_score += 15
        if has_video:
            engagement_score += 20
        if has_comments:
            engagement_score += 10
        if len(links) > 10:
            engagement_score += 10
        
        return {
            'cta_count': cta_count,
            'forms_count': len(forms),
            'buttons_count': len(buttons),
            'links_count': len(links),
            'has_social_sharing': has_social,
            'has_video': has_video,
            'has_comments': has_comments,
            'engagement_score': min(100, engagement_score),
            'engagement_level': 'High' if engagement_score >= 70 else 'Medium' if engagement_score >= 40 else 'Low'
        }
    
    def _analyze_navigation_ux(self):
        """Analyze navigation user experience"""
        # Main navigation
        nav = self.soup.find('nav')
        has_main_nav = nav is not None
        
        # Breadcrumbs
        breadcrumbs = self.soup.find(class_=re.compile(r'breadcrumb', re.I)) or self.soup.find('nav', attrs={'aria-label': re.compile(r'breadcrumb', re.I)})
        has_breadcrumbs = breadcrumbs is not None
        
        # Search functionality
        search = self.soup.find('input', attrs={'type': 'search'}) or self.soup.find(class_=re.compile(r'search', re.I))
        has_search = search is not None
        
        # Menu structure
        menu_items = []
        if nav:
            menu_items = nav.find_all('a', href=True)
        
        # Footer navigation
        footer = self.soup.find('footer')
        footer_links = []
        if footer:
            footer_links = footer.find_all('a', href=True)
        
        return {
            'has_main_navigation': has_main_nav,
            'navigation_items': len(menu_items),
            'has_breadcrumbs': has_breadcrumbs,
            'has_search': has_search,
            'footer_links': len(footer_links),
            'navigation_score': self._calculate_nav_score(has_main_nav, len(menu_items), has_breadcrumbs, has_search)
        }
    
    def _analyze_accessibility(self):
        """Analyze basic accessibility features"""
        # Alt text for images
        images = self.soup.find_all('img')
        images_with_alt = sum(1 for img in images if img.get('alt'))
        alt_text_coverage = (images_with_alt / len(images) * 100) if images else 100
        
        # Form labels
        forms = self.soup.find_all('form')
        labeled_inputs = 0
        total_inputs = 0
        for form in forms:
            inputs = form.find_all(['input', 'textarea', 'select'])
            total_inputs += len(inputs)
            for inp in inputs:
                if inp.get('aria-label') or inp.get('id') and form.find('label', attrs={'for': inp.get('id')}):
                    labeled_inputs += 1
        
        label_coverage = (labeled_inputs / total_inputs * 100) if total_inputs > 0 else 100
        
        # Heading hierarchy
        h1 = len(self.soup.find_all('h1'))
        h2 = len(self.soup.find_all('h2'))
        proper_hierarchy = h1 == 1 and h2 > 0
        
        # ARIA labels
        aria_elements = self.soup.find_all(attrs={'aria-label': True})
        
        return {
            'images_with_alt': images_with_alt,
            'total_images': len(images),
            'alt_text_coverage': round(alt_text_coverage, 1),
            'labeled_inputs': labeled_inputs,
            'total_inputs': total_inputs,
            'label_coverage': round(label_coverage, 1),
            'proper_heading_hierarchy': proper_hierarchy,
            'aria_elements': len(aria_elements),
            'accessibility_score': self._calculate_accessibility_score(alt_text_coverage, label_coverage, proper_hierarchy)
        }
    
    def _calculate_nav_score(self, has_nav, nav_items, has_breadcrumbs, has_search):
        """Calculate navigation UX score"""
        score = 0
        if has_nav:
            score += 40
        if nav_items >= 3:
            score += 20
        if has_breadcrumbs:
            score += 20
        if has_search:
            score += 20
        return min(100, score)
    
    def _calculate_accessibility_score(self, alt_coverage, label_coverage, proper_hierarchy):
        """Calculate accessibility score"""
        score = 0
        if alt_coverage >= 90:
            score += 35
        elif alt_coverage >= 70:
            score += 25
        
        if label_coverage >= 90:
            score += 35
        elif label_coverage >= 70:
            score += 25
        
        if proper_hierarchy:
            score += 30
        
        return min(100, score)
    
    def _calculate_ux_score(self, analysis):
        """Calculate overall UX score"""
        weights = {
            'mobile_ux': 0.25,
            'layout_stability': 0.25,
            'engagement_potential': 0.20,
            'navigation': 0.15,
            'accessibility': 0.15
        }
        
        score = 0
        
        # Mobile UX (25%)
        mobile_score = 0
        if analysis['mobile_ux']['mobile_friendly']:
            mobile_score += 50
        if analysis['mobile_ux']['responsive_images'] > 0:
            mobile_score += 25
        if analysis['mobile_ux']['has_readable_fonts']:
            mobile_score += 25
        score += mobile_score * weights['mobile_ux']
        
        # Layout Stability (25%)
        if analysis['layout_stability']['is_stable']:
            score += 100 * weights['layout_stability']
        else:
            score += 60 * weights['layout_stability']
        
        # Engagement (20%)
        score += analysis['engagement_potential']['engagement_score'] * weights['engagement_potential']
        
        # Navigation (15%)
        score += analysis['navigation']['navigation_score'] * weights['navigation']
        
        # Accessibility (15%)
        score += analysis['accessibility']['accessibility_score'] * weights['accessibility']
        
        return min(100, int(score))
