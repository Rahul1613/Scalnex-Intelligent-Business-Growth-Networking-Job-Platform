import json
from typing import Any, Dict, List
from urllib.parse import quote

import requests


class KeywordResearch:
    def __init__(self, base_keyword: str):
        self.base_keyword = base_keyword

    def fetch_google_autocomplete(self, keyword: str, max_results: int = 20) -> Dict[str, Any]:
        url = f"https://suggestqueries.google.com/complete/search?client=firefox&q={quote(keyword)}"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = json.loads(response.text)
        suggestions = data[1] if len(data) > 1 else []
        keywords = []
        for suggestion in suggestions:
            suggestion_text = suggestion.strip()
            if suggestion_text and suggestion_text not in keywords:
                keywords.append(suggestion_text)
        return {
            "keywords": keywords[:max_results],
            "source": "google_autocomplete",
        }

    def classify_intent(self, keyword: str) -> str:
        lower = keyword.lower()
        transactional_terms = ["buy", "price", "pricing", "deal", "discount", "hire", "service", "services", "order", "book", "near me"]
        navigational_terms = ["login", "official", "homepage", "contact", "address", "phone", "site"]
        informational_terms = ["how", "what", "why", "guide", "tips", "ideas", "examples", "tutorial"]

        if any(term in lower for term in transactional_terms):
            return "transactional"
        if any(term in lower for term in navigational_terms):
            return "navigational"
        if any(term in lower for term in informational_terms):
            return "informational"
        return "informational"

    def research(self, max_results: int = 20) -> Dict[str, Any]:
        data = self.fetch_google_autocomplete(self.base_keyword, max_results=max_results)
        keywords = []
        for suggestion in data["keywords"]:
            keywords.append({
                "keyword": suggestion,
                "intent": self.classify_intent(suggestion),
                "source": data["source"],
            })
        return {
            "keywords": keywords,
            "source": data["source"],
        }
