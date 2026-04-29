import requests
from bs4 import BeautifulSoup
import re
import json
import time
from datetime import datetime
from typing import List, Dict, Any

class GoogleReviewsScraper:
    """Scrape Google Reviews for a given business URL or name"""
    
    def __init__(self, query: str):
        self.query = query
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        }

    def scrape_reviews(self) -> Dict[str, Any]:
        """Attempt to scrape Google Reviews from search results or direct maps links"""
        # Note: True scraping of Google Reviews usually requires Maps API or complex JS rendering.
        # This is a simplified version looking for public review data in search snippets.
        
        result = {
            "platform": "Google Reviews",
            "query": self.query,
            "reviews": [],
            "rating": 0,
            "total_reviews": 0,
            "success": True
        }

        try:
            # Search URL
            search_url = f"https://www.google.com/search?q={requests.utils.quote(self.query + ' reviews')}"
            response = requests.get(search_url, headers=self.headers, timeout=15)
            
            if response.status_code != 200:
                result["success"] = False
                result["error"] = f"Failed to fetch search results: {response.status_code}"
                return result

            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract Rating
            rating_match = re.search(r'Rating: (\d+\.?\d*)/5', soup.get_text())
            if rating_match:
                result["rating"] = float(rating_match.group(1))
            
            # Extract Total Reviews
            reviews_count_match = re.search(r'(\d+(?:,\d+)*) Google reviews', soup.get_text())
            if reviews_count_match:
                result["total_reviews"] = int(reviews_count_match.group(1).replace(',', ''))

            # Extract some review snippets
            review_elements = soup.find_all('div', class_=re.compile(r'review|gws-local-reviews'))
            for elem in review_elements[:10]:
                text = elem.get_text(strip=True)
                if len(text) > 30:
                    result["reviews"].append({
                        "text": text,
                        "username": "User",
                        "timestamp": datetime.now().isoformat(),
                        "likes": 0
                    })
            
            if not result["reviews"]:
                # If no direct snippets, return success but with empty list
                # Frontend will handle the "No reviews found" state
                logger.info(f"No direct review snippets found for {self.query}")

        except Exception as e:
            result["success"] = False
            result["error"] = str(e)

        return result
