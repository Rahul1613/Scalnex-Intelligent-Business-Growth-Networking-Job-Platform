"""
Meta Tag Generator Module
Generates optimized meta tags, Open Graph tags, Twitter Cards, and structured data
"""
import re
from bs4 import BeautifulSoup
import logging

logger = logging.getLogger(__name__)

class MetaGenerator:
    def __init__(self):
        pass
    
    def generate_meta_tags(self, title, description, url, image_url=None, keywords=None, author=None):
        """Generate comprehensive meta tags"""
        meta_tags = {
            'basic': {},
            'open_graph': {},
            'twitter_card': {},
            'structured_data': {}
        }
        
        # Basic Meta Tags
        meta_tags['basic'] = {
            'title': self._optimize_title(title),
            'description': self._optimize_description(description),
            'keywords': keywords or '',
            'author': author or '',
            'viewport': 'width=device-width, initial-scale=1.0',
            'charset': 'UTF-8',
            'language': 'en'
        }
        
        # Open Graph Tags
        meta_tags['open_graph'] = {
            'og:title': self._optimize_title(title),
            'og:description': self._optimize_description(description),
            'og:url': url,
            'og:type': 'website',
            'og:image': image_url or '',
            'og:site_name': self._extract_site_name(url)
        }
        
        # Twitter Card Tags
        meta_tags['twitter_card'] = {
            'twitter:card': 'summary_large_image',
            'twitter:title': self._optimize_title(title),
            'twitter:description': self._optimize_description(description),
            'twitter:image': image_url or '',
            'twitter:url': url
        }
        
        return meta_tags
    
    def _optimize_title(self, title, max_length=60, min_length=30):
        """Optimize title length"""
        if not title:
            return ""
        
        title = title.strip()
        
        if len(title) > max_length:
            title = title[:max_length-3] + "..."
        elif len(title) < min_length:
            # Add site name or description if too short
            pass
        
        return title
    
    def _optimize_description(self, description, max_length=160, min_length=120):
        """Optimize description length"""
        if not description:
            return ""
        
        description = description.strip()
        
        if len(description) > max_length:
            description = description[:max_length-3] + "..."
        elif len(description) < min_length:
            # Pad description if needed
            pass
        
        return description
    
    def _extract_site_name(self, url):
        """Extract site name from URL"""
        from urllib.parse import urlparse
        parsed = urlparse(url)
        return parsed.netloc.replace('www.', '')
    
    def generate_html_meta_tags(self, meta_tags):
        """Generate HTML meta tag strings"""
        html_tags = []
        
        # Basic meta tags
        html_tags.append(f'<title>{meta_tags["basic"]["title"]}</title>')
        html_tags.append(f'<meta name="description" content="{meta_tags["basic"]["description"]}">')
        
        if meta_tags["basic"]["keywords"]:
            html_tags.append(f'<meta name="keywords" content="{meta_tags["basic"]["keywords"]}">')
        
        if meta_tags["basic"]["author"]:
            html_tags.append(f'<meta name="author" content="{meta_tags["basic"]["author"]}">')
        
        html_tags.append(f'<meta name="viewport" content="{meta_tags["basic"]["viewport"]}">')
        
        # Open Graph tags
        for key, value in meta_tags["open_graph"].items():
            if value:
                html_tags.append(f'<meta property="{key}" content="{value}">')
        
        # Twitter Card tags
        for key, value in meta_tags["twitter_card"].items():
            if value:
                html_tags.append(f'<meta name="{key}" content="{value}">')
        
        return '\n'.join(html_tags)
    
    def generate_json_ld(self, data):
        """Generate JSON-LD structured data"""
        json_ld = {
            "@context": "https://schema.org",
            "@type": data.get('type', 'WebPage'),
            "name": data.get('title', ''),
            "description": data.get('description', ''),
            "url": data.get('url', ''),
        }
        
        if data.get('image'):
            json_ld['image'] = data['image']
        
        if data.get('datePublished'):
            json_ld['datePublished'] = data['datePublished']
        
        if data.get('author'):
            json_ld['author'] = {
                "@type": "Person",
                "name": data['author']
            }
        
        return json_ld
    
    def analyze_existing_meta(self, html_content):
        """Analyze existing meta tags and provide recommendations"""
        soup = BeautifulSoup(html_content, 'html.parser')
        analysis = {
            'present': {},
            'missing': [],
            'issues': [],
            'recommendations': []
        }
        
        # Check title
        title_tag = soup.find('title')
        if title_tag:
            title_text = title_tag.text.strip()
            analysis['present']['title'] = title_text
            title_len = len(title_text)
            if title_len < 30:
                analysis['issues'].append(f"Title too short ({title_len} chars, recommended: 30-60)")
            elif title_len > 60:
                analysis['issues'].append(f"Title too long ({title_len} chars, recommended: 30-60)")
        else:
            analysis['missing'].append('title')
        
        # Check meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc and meta_desc.get('content'):
            desc_text = meta_desc['content'].strip()
            analysis['present']['description'] = desc_text
            desc_len = len(desc_text)
            if desc_len < 120:
                analysis['issues'].append(f"Description too short ({desc_len} chars, recommended: 120-160)")
            elif desc_len > 160:
                analysis['issues'].append(f"Description too long ({desc_len} chars, recommended: 120-160)")
        else:
            analysis['missing'].append('meta description')
        
        # Check Open Graph
        og_tags = soup.find_all('meta', property=lambda x: x and x.startswith('og:'))
        if og_tags:
            analysis['present']['open_graph'] = len(og_tags)
        else:
            analysis['missing'].append('Open Graph tags')
        
        # Check Twitter Card
        twitter_tags = soup.find_all('meta', attrs={'name': lambda x: x and x.startswith('twitter:')})
        if twitter_tags:
            analysis['present']['twitter_card'] = len(twitter_tags)
        else:
            analysis['missing'].append('Twitter Card tags')
        
        # Check JSON-LD
        json_ld = soup.find_all('script', type='application/ld+json')
        if json_ld:
            analysis['present']['json_ld'] = len(json_ld)
        else:
            analysis['missing'].append('JSON-LD structured data')
        
        # Generate recommendations
        if 'title' in analysis['missing']:
            analysis['recommendations'].append("Add a title tag (30-60 characters)")
        if 'meta description' in analysis['missing']:
            analysis['recommendations'].append("Add meta description (120-160 characters)")
        if 'Open Graph tags' in analysis['missing']:
            analysis['recommendations'].append("Add Open Graph tags for better social media sharing")
        if 'Twitter Card tags' in analysis['missing']:
            analysis['recommendations'].append("Add Twitter Card tags for better Twitter sharing")
        if 'JSON-LD structured data' in analysis['missing']:
            analysis['recommendations'].append("Add JSON-LD structured data for rich snippets")
        
        return analysis
