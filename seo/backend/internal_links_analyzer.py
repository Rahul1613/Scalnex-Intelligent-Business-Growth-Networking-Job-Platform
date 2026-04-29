"""
Internal Links Analyzer
Analyzes internal linking structure, orphan pages detection, and link quality
"""
from bs4 import BeautifulSoup
from urllib.parse import urlparse, urljoin
import logging

logger = logging.getLogger(__name__)

class InternalLinksAnalyzer:
    def __init__(self, soup, url, domain):
        self.soup = soup
        self.url = url
        self.domain = domain
    
    def analyze(self):
        """Analyze internal linking structure"""
        all_links = self.soup.find_all('a', href=True)
        
        internal_links = []
        external_links = []
        anchor_texts = []
        
        for link in all_links:
            href = link.get('href', '')
            anchor_text = link.get_text(strip=True)
            
            # Resolve relative URLs
            if href.startswith('/') or not href.startswith('http'):
                full_url = urljoin(self.url, href)
            else:
                full_url = href
            
            parsed = urlparse(full_url)
            
            if parsed.netloc == self.domain or parsed.netloc == '':
                internal_links.append({
                    'url': full_url,
                    'anchor_text': anchor_text,
                    'is_nofollow': 'nofollow' in link.get('rel', [])
                })
                if anchor_text:
                    anchor_texts.append(anchor_text.lower())
            else:
                external_links.append({
                    'url': full_url,
                    'anchor_text': anchor_text
                })
        
        # Analyze link structure
        analysis = {
            'total_internal_links': len(internal_links),
            'total_external_links': len(external_links),
            'unique_internal_links': len(set(link['url'] for link in internal_links)),
            'anchor_text_diversity': self._analyze_anchor_diversity(anchor_texts),
            'link_distribution': self._analyze_link_distribution(internal_links),
            'navigation_links': self._analyze_navigation(),
            'content_links': len([l for l in internal_links if l['anchor_text']]),
            'orphan_page_risk': self._check_orphan_risk(internal_links),
            'score': 0
        }
        
        # Calculate score
        analysis['score'] = self._calculate_score(analysis)
        
        return analysis
    
    def _analyze_anchor_diversity(self, anchor_texts):
        """Analyze anchor text diversity"""
        if not anchor_texts:
            return {
                'diversity_score': 0,
                'unique_anchors': 0,
                'total_anchors': 0,
                'is_diverse': False
            }
        
        unique_anchors = len(set(anchor_texts))
        total_anchors = len(anchor_texts)
        diversity_ratio = unique_anchors / total_anchors
        
        return {
            'diversity_score': round(diversity_ratio * 100, 1),
            'unique_anchors': unique_anchors,
            'total_anchors': total_anchors,
            'is_diverse': diversity_ratio > 0.7  # Good diversity threshold
        }
    
    def _analyze_link_distribution(self, internal_links):
        """Analyze how links are distributed"""
        # Count links by type (navigation, content, footer, etc.)
        nav_links = 0
        content_links = 0
        footer_links = 0
        
        # Simple heuristic: links in nav are navigation, links in footer are footer, rest are content
        nav = self.soup.find('nav')
        footer = self.soup.find('footer')
        
        nav_link_urls = set()
        footer_link_urls = set()
        
        if nav:
            nav_link_urls = {urljoin(self.url, a.get('href', '')) for a in nav.find_all('a', href=True)}
        
        if footer:
            footer_link_urls = {urljoin(self.url, a.get('href', '')) for a in footer.find_all('a', href=True)}
        
        for link in internal_links:
            if link['url'] in nav_link_urls:
                nav_links += 1
            elif link['url'] in footer_link_urls:
                footer_links += 1
            else:
                content_links += 1
        
        return {
            'navigation_links': nav_links,
            'content_links': content_links,
            'footer_links': footer_links,
            'has_good_distribution': content_links > nav_links  # More content links than nav is good
        }
    
    def _analyze_navigation(self):
        """Analyze navigation structure"""
        nav = self.soup.find('nav')
        
        if not nav:
            return {
                'has_navigation': False,
                'link_count': 0,
                'is_accessible': False
            }
        
        nav_links = nav.find_all('a', href=True)
        
        return {
            'has_navigation': True,
            'link_count': len(nav_links),
            'is_accessible': len(nav_links) > 0,
            'has_logical_structure': len(nav_links) >= 3  # At least 3 nav links
        }
    
    def _check_orphan_risk(self, internal_links):
        """Check if page might be orphaned (no internal links pointing to it)"""
        # This is a simplified check - in reality, you'd crawl the entire site
        # For now, we check if this page has good internal linking
        
        if len(internal_links) == 0:
            return {
                'is_orphan_risk': True,
                'risk_level': 'High',
                'recommendation': 'Add internal links to connect this page to your site structure'
            }
        elif len(internal_links) < 3:
            return {
                'is_orphan_risk': True,
                'risk_level': 'Medium',
                'recommendation': 'Add more internal links to improve page connectivity'
            }
        else:
            return {
                'is_orphan_risk': False,
                'risk_level': 'Low',
                'recommendation': 'Good internal linking structure'
            }
    
    def _calculate_score(self, analysis):
        """Calculate internal links score"""
        score = 0
        
        # Internal links present (30%)
        if analysis['total_internal_links'] > 0:
            score += 15
        if analysis['total_internal_links'] >= 5:
            score += 15
        
        # Anchor text diversity (25%)
        if analysis['anchor_text_diversity']['is_diverse']:
            score += 25
        
        # Link distribution (25%)
        if analysis['link_distribution']['has_good_distribution']:
            score += 25
        
        # Navigation structure (10%)
        if analysis['navigation_links']['has_navigation']:
            score += 10
        
        # Orphan page risk (10%)
        if not analysis['orphan_page_risk']['is_orphan_risk']:
            score += 10
        
        return min(100, score)
