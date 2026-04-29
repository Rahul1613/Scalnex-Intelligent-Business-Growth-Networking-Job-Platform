"""
Advanced Keyword Research Module
Provides keyword suggestions, difficulty analysis, search volume estimates, and competitor analysis
"""
import re
import requests
from bs4 import BeautifulSoup
from collections import Counter
from urllib.parse import urlparse
import logging

logger = logging.getLogger(__name__)

class KeywordResearch:
    def __init__(self, url=None):
        self.url = url
        self.domain = None
        if url:
            self.domain = urlparse(url).netloc
    
    def extract_keywords_from_page(self, html_content):
        """Extract keywords from page content"""
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Get text content
        text = soup.get_text()
        
        # Extract words (simple approach - can be enhanced with NLP)
        words = re.findall(r'\b[a-z]{3,}\b', text.lower())
        
        # Filter common stop words
        stop_words = {'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'way', 'use', 'her', 'she', 'him', 'has', 'had', 'did', 'get', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'way', 'use'}
        keywords = [w for w in words if w not in stop_words]
        
        # Count frequency
        keyword_freq = Counter(keywords)
        
        return dict(keyword_freq.most_common(20))
    
    def analyze_keyword_density(self, html_content, target_keywords=None):
        """Analyze keyword density in content"""
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Get all text
        text = soup.get_text().lower()
        total_words = len(re.findall(r'\b\w+\b', text))
        
        if total_words == 0:
            return {}
        
        density_results = {}
        
        if target_keywords:
            for keyword in target_keywords:
                count = text.count(keyword.lower())
                density = (count / total_words) * 100 if total_words > 0 else 0
                density_results[keyword] = {
                    'count': count,
                    'density': round(density, 2),
                    'status': 'optimal' if 1 <= density <= 3 else 'low' if density < 1 else 'high'
                }
        
        return density_results
    
    def suggest_keywords(self, seed_keyword, max_results=10):
        """
        Suggest related keywords based on seed keyword
        Uses semantic analysis and common patterns
        """
        suggestions = []
        
        # Common keyword modifiers
        modifiers = {
            'questions': ['what', 'how', 'why', 'when', 'where', 'who', 'which'],
            'intent': ['best', 'top', 'review', 'guide', 'tutorial', 'vs', 'compare'],
            'location': ['near me', 'local', 'online', 'usa', 'uk'],
            'time': ['2024', '2025', 'latest', 'new', 'updated'],
            'comparison': ['vs', 'compared to', 'alternative', 'similar to']
        }
        
        # Generate variations
        base = seed_keyword.lower()
        
        # Question-based
        for q in modifiers['questions']:
            suggestions.append(f"{q} {base}")
            suggestions.append(f"{base} {q}")
        
        # Intent-based
        for intent in modifiers['intent']:
            suggestions.append(f"{intent} {base}")
            suggestions.append(f"{base} {intent}")
        
        # Long-tail variations
        suggestions.extend([
            f"{base} guide",
            f"{base} tips",
            f"{base} examples",
            f"learn {base}",
            f"{base} explained"
        ])
        
        # Estimate difficulty and volume (mock data - in production use real APIs)
        results = []
        for i, kw in enumerate(suggestions[:max_results]):
            # Simulate difficulty based on keyword length and complexity
            difficulty = min(100, 20 + len(kw.split()) * 10 + hash(kw) % 30)
            volume = max(100, 10000 - (difficulty * 50))
            
            results.append({
                'keyword': kw,
                'difficulty': difficulty,
                'estimated_volume': volume,
                'competition': 'high' if difficulty > 70 else 'medium' if difficulty > 40 else 'low',
                'cpc_estimate': round(difficulty / 10, 2)  # Mock CPC
            })
        
        return sorted(results, key=lambda x: x['estimated_volume'], reverse=True)
    
    def analyze_competitor_keywords(self, competitor_urls):
        """Analyze keywords used by competitors"""
        competitor_keywords = {}
        
        for url in competitor_urls[:3]:  # Limit to 3 competitors
            try:
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
                response = requests.get(url, headers=headers, timeout=10)
                if response.status_code == 200:
                    keywords = self.extract_keywords_from_page(response.text)
                    competitor_keywords[url] = keywords
            except Exception as e:
                logger.error(f"Error analyzing competitor {url}: {e}")
        
        return competitor_keywords
    
    def get_keyword_opportunities(self, current_keywords, competitor_keywords):
        """Find keyword opportunities by comparing with competitors"""
        opportunities = []
        
        # Flatten competitor keywords
        all_competitor_kw = set()
        for kw_dict in competitor_keywords.values():
            all_competitor_kw.update(kw_dict.keys())
        
        current_kw_set = set(current_keywords.keys())
        
        # Find keywords competitors use but we don't
        missing_keywords = all_competitor_kw - current_kw_set
        
        for kw in missing_keywords[:10]:  # Top 10 opportunities
            # Count how many competitors use this keyword
            competitor_count = sum(1 for kw_dict in competitor_keywords.values() if kw in kw_dict)
            
            opportunities.append({
                'keyword': kw,
                'competitor_usage': competitor_count,
                'opportunity_score': competitor_count * 10,
                'recommendation': f"Consider targeting '{kw}' - used by {competitor_count} competitors"
            })
        
        return sorted(opportunities, key=lambda x: x['opportunity_score'], reverse=True)
