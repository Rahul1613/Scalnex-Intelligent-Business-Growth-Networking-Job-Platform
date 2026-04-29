from typing import Any, Dict, Optional
from urllib.parse import urlparse

from bs4 import BeautifulSoup


def _build_detail(importance: str, detected: str, impact: str, fix: str) -> Dict[str, str]:
    return {
        "why_this_matters_for_seo": importance,
        "what_was_detected": detected,
        "impact_on_seo": impact,
        "recommended_fix": fix,
    }


class TechnicalAnalyzer:
    def analyze(self, url: str, soup: Optional[BeautifulSoup]) -> Dict[str, Any]:
        if soup is None:
            return {
                "score": 0,
                "checks": {},
                "issues": ["No HTML content available for technical SEO checks."],
            }

        parsed = urlparse(url)
        https_enabled = parsed.scheme == "https"
        viewport = soup.find("meta", attrs={"name": "viewport"})
        robots = soup.find("meta", attrs={"name": "robots"})
        canonical = soup.find("link", attrs={"rel": "canonical"})

        score = 100
        if not https_enabled:
            score -= 35
        if viewport is None:
            score -= 25
        if robots is None:
            score -= 15
        if canonical is None:
            score -= 15
        score = max(0, score)

        checks = {
            "https": {
                "enabled": https_enabled,
                "details": _build_detail(
                    "HTTPS is a ranking signal and protects user data.",
                    "HTTPS is enabled." if https_enabled else "HTTPS is not enabled.",
                    "Non-HTTPS pages may be downgraded and flagged as insecure.",
                    "Install an SSL certificate and redirect all traffic to HTTPS.",
                ),
            },
            "viewport": {
                "present": viewport is not None,
                "details": _build_detail(
                    "Viewport meta ensures proper mobile rendering, which is essential for mobile-first indexing.",
                    "Viewport tag found." if viewport is not None else "Viewport tag missing.",
                    "Without a viewport tag, mobile UX suffers and rankings can drop.",
                    "Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">.",
                ),
            },
            "robots_meta": {
                "present": robots is not None,
                "content": robots.get("content") if robots else None,
                "details": _build_detail(
                    "Robots meta tags control crawl and index behavior.",
                    "Robots meta tag present." if robots is not None else "Robots meta tag missing.",
                    "Incorrect directives can block indexing or reduce crawl efficiency.",
                    "Ensure robots meta allows indexing unless intentionally blocked.",
                ),
            },
            "canonical": {
                "present": canonical is not None,
                "href": canonical.get("href") if canonical else None,
                "details": _build_detail(
                    "Canonical tags prevent duplicate content issues and consolidate ranking signals.",
                    "Canonical tag present." if canonical is not None else "Canonical tag missing.",
                    "Missing canonicals can split ranking authority across URLs.",
                    "Add a canonical link tag pointing to the preferred URL.",
                ),
            },
        }

        return {
            "score": score,
            "checks": checks,
            "issues": [],
        }
