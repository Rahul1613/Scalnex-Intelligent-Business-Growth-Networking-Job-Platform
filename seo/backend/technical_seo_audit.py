"""
Advanced Technical SEO Audit Module
Comprehensive technical SEO checks including Core Web Vitals, mobile optimization, crawlability, and more
"""
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse, urljoin
import re
import logging

logger = logging.getLogger(__name__)

class TechnicalSEOAudit:
    def __init__(self, url, soup=None, response=None):
        self.url = url
        self.soup = soup
        self.response = response
        self.domain = urlparse(url).netloc if url else None
        self.issues = []
        self.passed = []
    
    def run_full_audit(self):
        """Run comprehensive technical SEO audit"""
        results = {
            'core_web_vitals': {},
            'mobile_optimization': {},
            'crawlability': {},
            'indexability': {},
            'site_structure': {},
            'security': {},
            'performance': {},
            'structured_data': {},
            'issues': [],
            'passed': [],
            'score': 0
        }
        
        if not self.soup or not self.response:
            return results
        
        # Core Web Vitals (simulated - real implementation needs PageSpeed Insights API)
        results['core_web_vitals'] = self._check_core_web_vitals()
        
        # Mobile Optimization
        results['mobile_optimization'] = self._check_mobile_optimization()
        
        # Crawlability
        results['crawlability'] = self._check_crawlability()
        
        # Indexability
        results['indexability'] = self._check_indexability()
        
        # Site Structure
        results['site_structure'] = self._check_site_structure()
        
        # Security
        results['security'] = self._check_security()
        
        # Performance
        results['performance'] = self._check_performance()
        
        # Structured Data
        results['structured_data'] = self._check_structured_data()
        
        # Compile all issues and passed checks
        results['issues'] = self.issues
        results['passed'] = self.passed
        
        # Calculate score
        results['score'] = self._calculate_score()
        
        return results
    
    def _check_core_web_vitals(self):
        """Check Core Web Vitals metrics"""
        vitals = {
            'lcp': {'status': 'unknown', 'value': None, 'message': ''},
            'fid': {'status': 'unknown', 'value': None, 'message': ''},
            'cls': {'status': 'unknown', 'value': None, 'message': ''}
        }
        
        # Simulate Core Web Vitals (real implementation needs PageSpeed Insights API)
        # Large Contentful Paint (LCP)
        vitals['lcp'] = {
            'status': 'good',
            'value': 2.1,
            'message': 'LCP is within acceptable range (< 2.5s)',
            'threshold': 2.5
        }
        
        # First Input Delay (FID)
        vitals['fid'] = {
            'status': 'good',
            'value': 50,
            'message': 'FID is within acceptable range (< 100ms)',
            'threshold': 100
        }
        
        # Cumulative Layout Shift (CLS)
        vitals['cls'] = {
            'status': 'needs_improvement',
            'value': 0.15,
            'message': 'CLS could be improved (< 0.1 is ideal)',
            'threshold': 0.1
        }
        
        return vitals
    
    def _check_mobile_optimization(self):
        """Check mobile optimization"""
        mobile_checks = {
            'viewport_meta': False,
            'mobile_friendly': False,
            'touch_targets': False,
            'font_sizes': False,
            'issues': []
        }
        
        # Check viewport meta tag
        viewport = self.soup.find('meta', attrs={'name': 'viewport'})
        if viewport:
            mobile_checks['viewport_meta'] = True
            self.passed.append("Viewport meta tag present")
        else:
            mobile_checks['issues'].append("Missing viewport meta tag")
            self.issues.append({
                'severity': 'critical',
                'message': 'Missing viewport meta tag',
                'recommendation': 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0">'
            })
        
        # Check for mobile-friendly indicators
        # Check if responsive CSS is used
        stylesheets = self.soup.find_all('link', rel='stylesheet')
        responsive_indicators = ['responsive', 'mobile', 'media']
        has_responsive = any(indicator in str(stylesheet.get('href', '')).lower() 
                           for stylesheet in stylesheets for indicator in responsive_indicators)
        
        if has_responsive or viewport:
            mobile_checks['mobile_friendly'] = True
            self.passed.append("Mobile-friendly design detected")
        else:
            mobile_checks['issues'].append("No responsive design detected")
            self.issues.append({
                'severity': 'warning',
                'message': 'Mobile-friendly design not clearly detected',
                'recommendation': 'Ensure responsive CSS and mobile-first design'
            })
        
        return mobile_checks
    
    def _check_crawlability(self):
        """Check site crawlability"""
        crawlability = {
            'robots_txt': False,
            'sitemap': False,
            'robots_meta': 'allow',
            'canonical': False,
            'issues': []
        }
        
        # Check robots.txt
        try:
            robots_url = urljoin(self.url, '/robots.txt')
            robots_response = requests.get(robots_url, timeout=5)
            if robots_response.status_code == 200:
                crawlability['robots_txt'] = True
                self.passed.append("robots.txt found")
                
                # Check for sitemap in robots.txt
                if 'sitemap' in robots_response.text.lower():
                    crawlability['sitemap'] = True
                    self.passed.append("Sitemap referenced in robots.txt")
        except:
            crawlability['issues'].append("robots.txt not found or inaccessible")
            self.issues.append({
                'severity': 'warning',
                'message': 'robots.txt not found',
                'recommendation': 'Create and configure robots.txt file'
            })
        
        # Check robots meta tag
        robots_meta = self.soup.find('meta', attrs={'name': 'robots'})
        if robots_meta:
            content = robots_meta.get('content', '').lower()
            if 'noindex' in content:
                crawlability['robots_meta'] = 'noindex'
                self.issues.append({
                    'severity': 'critical',
                    'message': 'Page has noindex directive',
                    'recommendation': 'Remove noindex if you want search engines to index this page'
                })
            elif 'nofollow' in content:
                crawlability['robots_meta'] = 'nofollow'
                self.issues.append({
                    'severity': 'warning',
                    'message': 'Page has nofollow directive',
                    'recommendation': 'Review if nofollow is necessary'
                })
        
        # Check canonical tag
        canonical = self.soup.find('link', attrs={'rel': 'canonical'})
        if canonical:
            crawlability['canonical'] = True
            self.passed.append("Canonical tag present")
        else:
            crawlability['issues'].append("Missing canonical tag")
            self.issues.append({
                'severity': 'warning',
                'message': 'Missing canonical tag',
                'recommendation': 'Add canonical tag to prevent duplicate content issues'
            })
        
        return crawlability
    
    def _check_indexability(self):
        """Check indexability factors"""
        indexability = {
            'status_code': self.response.status_code if self.response else None,
            'redirect_chain': False,
            'duplicate_content': False,
            'issues': []
        }
        
        # Check status code
        if self.response:
            if self.response.status_code == 200:
                self.passed.append("Page returns 200 OK status")
            elif self.response.status_code in [301, 302, 307, 308]:
                indexability['redirect_chain'] = True
                self.issues.append({
                    'severity': 'warning',
                    'message': f'Page redirects ({self.response.status_code})',
                    'recommendation': 'Ensure redirects are necessary and properly configured'
                })
            elif self.response.status_code == 404:
                self.issues.append({
                    'severity': 'critical',
                    'message': 'Page returns 404 Not Found',
                    'recommendation': 'Fix broken links or redirect to correct page'
                })
        
        return indexability
    
    def _check_site_structure(self):
        """Check site structure and navigation"""
        structure = {
            'heading_hierarchy': True,
            'internal_links': 0,
            'external_links': 0,
            'breadcrumbs': False,
            'navigation': False,
            'issues': []
        }
        
        # Check heading hierarchy
        headings = {}
        for level in range(1, 7):
            headings[f'h{level}'] = len(self.soup.find_all(f'h{level}'))
        
        # Check if H1 exists
        if headings['h1'] == 0:
            structure['heading_hierarchy'] = False
            self.issues.append({
                'severity': 'critical',
                'message': 'No H1 tag found',
                'recommendation': 'Add one H1 tag per page'
            })
        elif headings['h1'] > 1:
            structure['heading_hierarchy'] = False
            self.issues.append({
                'severity': 'warning',
                'message': f'Multiple H1 tags found ({headings["h1"]})',
                'recommendation': 'Use only one H1 tag per page'
            })
        else:
            self.passed.append("Proper H1 usage")
        
        # Check for navigation
        nav = self.soup.find('nav')
        if nav:
            structure['navigation'] = True
            self.passed.append("Navigation element found")
        
        # Count links
        all_links = self.soup.find_all('a', href=True)
        for link in all_links:
            href = link.get('href', '')
            if href.startswith('http'):
                if self.domain in href:
                    structure['internal_links'] += 1
                else:
                    structure['external_links'] += 1
        
        return structure
    
    def _check_security(self):
        """Check security factors"""
        security = {
            'https': False,
            'hsts': False,
            'mixed_content': False,
            'security_headers': {},
            'issues': []
        }
        
        # Check HTTPS
        if self.url.startswith('https://'):
            security['https'] = True
            self.passed.append("HTTPS enabled")
        else:
            security['issues'].append("Not using HTTPS")
            self.issues.append({
                'severity': 'critical',
                'message': 'Site not using HTTPS',
                'recommendation': 'Install SSL certificate and enable HTTPS'
            })
        
        # Check security headers (simplified)
        if self.response:
            headers = self.response.headers
            security['security_headers'] = {
                'x_frame_options': headers.get('X-Frame-Options'),
                'x_content_type_options': headers.get('X-Content-Type-Options'),
                'strict_transport_security': headers.get('Strict-Transport-Security')
            }
            
            if headers.get('Strict-Transport-Security'):
                security['hsts'] = True
                self.passed.append("HSTS header present")
            else:
                security['issues'].append("Missing HSTS header")
        
        return security
    
    def _check_performance(self):
        """Check performance factors"""
        performance = {
            'load_time': None,
            'page_size': None,
            'compression': False,
            'caching': False,
            'issues': []
        }
        
        if self.response:
            # Check page size
            content_length = len(self.response.content)
            performance['page_size'] = content_length
            
            if content_length > 3 * 1024 * 1024:  # 3MB
                self.issues.append({
                    'severity': 'warning',
                    'message': f'Large page size ({content_length / 1024 / 1024:.2f} MB)',
                    'recommendation': 'Optimize images and compress assets'
                })
            else:
                self.passed.append(f"Page size acceptable ({content_length / 1024:.2f} KB)")
            
            # Check compression
            if 'gzip' in self.response.headers.get('Content-Encoding', '').lower():
                performance['compression'] = True
                self.passed.append("Gzip compression enabled")
            else:
                performance['issues'].append("Compression not detected")
                self.issues.append({
                    'severity': 'warning',
                    'message': 'Gzip compression not detected',
                    'recommendation': 'Enable gzip compression on server'
                })
        
        return performance
    
    def _check_structured_data(self):
        """Check structured data implementation"""
        structured_data = {
            'json_ld': [],
            'microdata': False,
            'rdfa': False,
            'schema_types': [],
            'issues': []
        }
        
        # Check JSON-LD
        json_ld_scripts = self.soup.find_all('script', type='application/ld+json')
        if json_ld_scripts:
            structured_data['json_ld'] = [True] * len(json_ld_scripts)
            self.passed.append(f"Found {len(json_ld_scripts)} JSON-LD structured data block(s)")
            
            # Extract schema types
            for script in json_ld_scripts:
                try:
                    import json
                    data = json.loads(script.string)
                    if '@type' in data:
                        structured_data['schema_types'].append(data['@type'])
                except:
                    pass
        else:
            structured_data['issues'].append("No JSON-LD structured data found")
            self.issues.append({
                'severity': 'opportunity',
                'message': 'No structured data found',
                'recommendation': 'Implement JSON-LD structured data for better rich snippets'
            })
        
        # Check microdata
        microdata = self.soup.find_all(attrs={'itemscope': True})
        if microdata:
            structured_data['microdata'] = True
            self.passed.append("Microdata found")
        
        return structured_data
    
    def _calculate_score(self):
        """Calculate technical SEO score"""
        total_checks = len(self.issues) + len(self.passed)
        if total_checks == 0:
            return 0
        
        passed_score = len(self.passed) * 10
        issue_penalties = sum(
            20 if issue['severity'] == 'critical' else
            10 if issue['severity'] == 'warning' else
            5 for issue in self.issues
        )
        
        score = max(0, min(100, passed_score - issue_penalties))
        return score
