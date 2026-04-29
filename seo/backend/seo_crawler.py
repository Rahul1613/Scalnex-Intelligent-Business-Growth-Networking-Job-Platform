"""
Real SEO Website Crawler for 3D Visualization
Extracts actual SEO data from live websites
"""

import requests
import re
import time
import urllib.parse
import urllib.robotparser
from bs4 import BeautifulSoup
from typing import Dict, List, Set, Optional
from urllib.parse import urljoin, urlparse
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SEOCrawler:
    def __init__(self, max_depth: int = 2, max_pages: int = 20, delay: float = 1.0):
        self.max_depth = max_depth
        self.max_pages = max_pages
        self.delay = delay
        self.visited_urls: Set[str] = set()
        self.pages_data: List[Dict] = []
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })

    def can_crawl(self, url: str, base_domain: str) -> bool:
        """Check if URL can be crawled based on robots.txt and domain"""
        try:
            parsed = urlparse(url)
            # Support both www and non-www
            norm_netloc = parsed.netloc.replace('www.', '')
            norm_base = base_domain.replace('www.', '')
            
            if norm_netloc != norm_base:
                return False
            
            robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
            rp = urllib.robotparser.RobotFileParser()
            rp.set_url(robots_url)
            try:
                # Use a small timeout for robots.txt
                rp.read()
                return rp.can_fetch('*', url)
            except:
                return True  # If robots.txt fails or times out, allow crawling
        except:
            return False

    def extract_links(self, soup: BeautifulSoup, base_url: str, base_domain: str) -> List[str]:
        """Extract internal links from page"""
        links = []
        norm_base = base_domain.replace('www.', '')
        
        for link in soup.find_all('a', href=True):
            href = link['href'].strip()
            if not href or href.startswith(('#', 'javascript:', 'mailto:', 'tel:')):
                continue
                
            full_url = urljoin(base_url, href)
            parsed = urlparse(full_url)
            
            # Support both www and non-www
            norm_netloc = parsed.netloc.replace('www.', '')
            
            # Only include internal links (same domain)
            if norm_netloc == norm_base:
                # Remove fragments and query params for cleaner URLs
                clean_url = parsed._replace(query="", fragment="").geturl()
                links.append(clean_url)
        
        return list(set(links))  # Remove duplicates

    def extract_meta_data(self, soup: BeautifulSoup, url: str) -> Dict:
        """Extract SEO metadata from page"""
        data = {
            'url': url,
            'title': '',
            'meta_description': '',
            'meta_robots': '',
            'canonical': '',
            'word_count': 0,
            'headings': {'h1': 0, 'h2': 0, 'h3': 0, 'h4': 0, 'h5': 0, 'h6': 0},
            'issues': [],
            'keywords': [],
            'links_to': []
        }

        # Title
        title_tag = soup.find('title')
        if title_tag:
            data['title'] = title_tag.get_text().strip()

        # Meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc:
            data['meta_description'] = meta_desc.get('content', '').strip()

        # Meta robots
        meta_robots = soup.find('meta', attrs={'name': 'robots'})
        if meta_robots:
            data['meta_robots'] = meta_robots.get('content', '').strip()

        # Canonical
        canonical = soup.find('link', attrs={'rel': 'canonical'})
        if canonical:
            data['canonical'] = canonical.get('href', '').strip()

        # Headings
        for i in range(1, 7):
            headings = soup.find_all(f'h{i}')
            data[f'h{i}'] = len(headings)
            data['headings'][f'h{i}'] = len(headings)

        # Word count (from main content areas)
        content_tags = soup.find_all(['p', 'div', 'article', 'main', 'section'])
        text_content = ' '.join([tag.get_text() for tag in content_tags])
        words = re.findall(r'\b\w+\b', text_content.lower())
        data['word_count'] = len(words)

        # Keywords (simple frequency analysis)
        word_freq = {}
        for word in words:
            if len(word) > 3:  # Skip very short words
                word_freq[word] = word_freq.get(word, 0) + 1
        
        # Get top keywords
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        data['keywords'] = [word for word, freq in sorted_words[:10]]

        # SEO Issues
        if not data['title']:
            data['issues'].append('missing_title')
        elif len(data['title']) < 30 or len(data['title']) > 60:
            data['issues'].append('title_length_issue')

        if not data['meta_description']:
            data['issues'].append('missing_meta_description')
        elif len(data['meta_description']) < 120 or len(data['meta_description']) > 160:
            data['issues'].append('meta_description_length_issue')

        if data['headings']['h1'] == 0:
            data['issues'].append('missing_h1')
        elif data['headings']['h1'] > 1:
            data['issues'].append('multiple_h1_tags')

        if data['word_count'] < 300:
            data['issues'].append('low_word_count')

        return data

    def calculate_seo_score(self, page_data: Dict) -> int:
        """Calculate SEO score based on real data (0-100)"""
        score = 100
        
        # Title issues
        if 'missing_title' in page_data['issues']:
            score -= 20
        elif 'title_length_issue' in page_data['issues']:
            score -= 10
        
        # Meta description issues
        if 'missing_meta_description' in page_data['issues']:
            score -= 15
        elif 'meta_description_length_issue' in page_data['issues']:
            score -= 5
        
        # Heading issues
        if 'missing_h1' in page_data['issues']:
            score -= 15
        elif 'multiple_h1_tags' in page_data['issues']:
            score -= 10
        
        # Content issues
        if 'low_word_count' in page_data['issues']:
            score -= 10
        
        # Bonus points for good practices
        if page_data['canonical']:
            score += 5
        
        if page_data['meta_robots']:
            score += 5
        
        # Ensure score stays within bounds
        return max(0, min(100, score))

    def crawl_page(self, url: str, depth: int, base_domain: str) -> Optional[Dict]:
        """Crawl a single page and extract SEO data"""
        try:
            logger.info(f"Crawling: {url} (depth: {depth})")
            
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract SEO data
            page_data = self.extract_meta_data(soup, url)
            page_data['depth'] = depth
            
            # Calculate SEO score
            page_data['seo_score'] = self.calculate_seo_score(page_data)
            
            # Extract links (only if not at max depth)
            if depth < self.max_depth:
                links = self.extract_links(soup, url, base_domain)
                page_data['links_to'] = [urlparse(link).path for link in links[:10]]  # Limit to 10 links
            
            return page_data
            
        except Exception as e:
            logger.error(f"Error crawling {url}: {str(e)}")
            return None

    def crawl_website(self, start_url: str) -> Dict:
        """Main crawling function"""
        logger.info(f"Starting crawl of: {start_url}")
        
        parsed_start = urlparse(start_url)
        base_domain = parsed_start.netloc
        base_url = f"{parsed_start.scheme}://{parsed_start.netloc}"
        
        # Reset state
        self.visited_urls.clear()
        self.pages_data.clear()
        
        # Queue for BFS crawling
        queue = [(start_url, 0)]
        
        while queue and len(self.pages_data) < self.max_pages:
            url, depth = queue.pop(0)
            
            if url in self.visited_urls or depth > self.max_depth:
                continue
            
            if not self.can_crawl(url, base_domain):
                continue
            
            self.visited_urls.add(url)
            
            # Crawl the page
            page_data = self.crawl_page(url, depth, base_domain)
            if page_data:
                self.pages_data.append(page_data)
                
                # Add new links to queue
                if depth < self.max_depth:
                    for link in page_data['links_to']:
                        full_link = urljoin(base_url, link)
                        if full_link not in self.visited_urls:
                            queue.append((full_link, depth + 1))
            
            # Respect crawling delay
            time.sleep(self.delay)
        
        # Prepare final response
        result = {
            'site_url': start_url,
            'pages': []
        }
        
        for i, page in enumerate(self.pages_data):
            page['id'] = f'page_{i+1}'
            # Convert full URLs to relative paths for cleaner display
            page['url'] = urlparse(page['url']).path or '/'
            result['pages'].append(page)
        
        logger.info(f"Crawling completed. Found {len(result['pages'])} pages.")
        return result

if __name__ == "__main__":
    # Test the crawler
    crawler = SEOCrawler(max_depth=2, max_pages=10)
    result = crawler.crawl_website("https://example.com")
    print(f"Found {len(result['pages'])} pages")
    for page in result['pages']:
        print(f"Page: {page['url']} - SEO Score: {page['seo_score']}")
