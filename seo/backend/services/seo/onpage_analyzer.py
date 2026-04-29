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


class OnPageAnalyzer:
    def analyze(self, url: str, soup: Optional[BeautifulSoup]) -> Dict[str, Any]:
        if soup is None:
            return {
                "score": 0,
                "details": {},
                "issues": ["No HTML content available to analyze on-page SEO."],
            }

        parsed = urlparse(url)
        domain = parsed.netloc

        title_tag = soup.find("title")
        title_text = title_tag.text.strip() if title_tag and title_tag.text else ""
        title_len = len(title_text)
        title_optimal = 50 <= title_len <= 60

        meta_desc_tag = soup.find("meta", attrs={"name": "description"})
        meta_desc = meta_desc_tag.get("content", "").strip() if meta_desc_tag else ""
        meta_len = len(meta_desc)
        meta_optimal = 140 <= meta_len <= 160

        headings = {f"h{level}": len(soup.find_all(f"h{level}")) for level in range(1, 7)}
        h1_count = headings.get("h1", 0)
        h1_ok = h1_count == 1
        heading_hierarchy_ok = all(headings[f"h{level}"] == 0 or headings[f"h{level-1}"] > 0 for level in range(2, 7))

        links = soup.find_all("a", href=True)
        internal_links = 0
        external_links = 0
        for link in links:
            href = link.get("href", "")
            if href.startswith("http"):
                if domain in href:
                    internal_links += 1
                else:
                    external_links += 1

        score = 100
        if not title_optimal:
            score -= 20
        if not meta_optimal:
            score -= 20
        if not h1_ok:
            score -= 25
        if not heading_hierarchy_ok:
            score -= 10
        if internal_links == 0:
            score -= 10
        score = max(0, score)

        details = {
            "title": {
                "text": title_text,
                "length": title_len,
                "score": 100 if title_optimal else 60,
                "details": _build_detail(
                    "Title tags help search engines understand the topic of the page.",
                    "Title tag missing." if not title_text else f"Title length is {title_len} characters.",
                    "Non-optimized titles reduce relevance signals and click-through rates.",
                    "Keep titles between 50-60 characters and include a primary keyword early.",
                ),
            },
            "meta_description": {
                "text": meta_desc,
                "length": meta_len,
                "score": 100 if meta_optimal else 60,
                "details": _build_detail(
                    "Meta descriptions influence search result snippets and CTR.",
                    "Meta description missing." if not meta_desc else f"Meta description length is {meta_len} characters.",
                    "Poor descriptions reduce SERP click-through and relevance context.",
                    "Write a compelling 140-160 character description with the target keyword.",
                ),
            },
            "headings": {
                "h1_count": h1_count,
                "heading_counts": headings,
                "score": 100 if h1_ok and heading_hierarchy_ok else 60,
                "details": _build_detail(
                    "Heading structure gives search engines a content outline and hierarchy.",
                    f"Detected {h1_count} H1 tags; heading hierarchy {'looks valid' if heading_hierarchy_ok else 'has gaps' }.",
                    "Poor heading structure makes it harder for crawlers to interpret page importance.",
                    "Use exactly one H1 and ensure H2-H6 follow a logical hierarchy.",
                ),
            },
            "links": {
                "internal_links": internal_links,
                "external_links": external_links,
                "score": 100 if internal_links > 0 else 60,
                "details": _build_detail(
                    "Internal links help distribute authority and guide crawlers to key pages.",
                    f"Found {internal_links} internal links and {external_links} external links.",
                    "Too few internal links can reduce crawl efficiency and topical authority.",
                    "Add contextual internal links to important pages and maintain balanced external links.",
                ),
            },
        }

        return {
            "score": score,
            "details": details,
            "internal_links": internal_links,
            "external_links": external_links,
            "issues": [],
        }
