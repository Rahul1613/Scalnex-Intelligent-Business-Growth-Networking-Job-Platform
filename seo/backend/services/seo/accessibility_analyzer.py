from typing import Any, Dict, Optional

from bs4 import BeautifulSoup


def _build_detail(importance: str, detected: str, impact: str, fix: str) -> Dict[str, str]:
    return {
        "why_this_matters_for_seo": importance,
        "what_was_detected": detected,
        "impact_on_seo": impact,
        "recommended_fix": fix,
    }


class AccessibilityAnalyzer:
    def analyze(self, soup: Optional[BeautifulSoup]) -> Dict[str, Any]:
        if soup is None:
            return {
                "score": 0,
                "images": {},
                "details": {},
                "issues": ["No HTML content available for accessibility analysis."],
            }

        images = soup.find_all("img")
        total_images = len(images)
        missing_alt = sum(1 for img in images if not img.get("alt"))
        missing_ratio = (missing_alt / total_images) if total_images else 0

        if missing_ratio <= 0.10:
            score = 100
        elif missing_ratio <= 0.30:
            score = 70
        else:
            score = 40

        details = {
            "alt_text": _build_detail(
                "Alt text improves accessibility and helps search engines understand image content.",
                f"{missing_alt} of {total_images} images are missing alt text.",
                "Missing alt text reduces accessibility compliance and image search visibility.",
                "Add descriptive alt text to every meaningful image.",
            )
        }

        return {
            "score": score,
            "images": {
                "total": total_images,
                "missing_alt": missing_alt,
                "missing_alt_ratio": round(missing_ratio, 3),
            },
            "details": details,
            "issues": [],
        }
