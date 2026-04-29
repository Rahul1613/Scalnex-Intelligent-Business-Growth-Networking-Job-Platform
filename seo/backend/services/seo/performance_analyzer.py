import time
from typing import Any, Dict, Optional
import os

import requests
from bs4 import BeautifulSoup

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}


def fetch_page(url: str, timeout: int = 20, headers: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    """Fetch a page while measuring TTFB (time to first byte)."""
    start_time = time.time()
    req_headers = headers if headers else DEFAULT_HEADERS
    response = requests.get(url, headers=req_headers, timeout=timeout, stream=True, allow_redirects=True)
    response.raw.decode_content = True
    first_byte = response.raw.read(1)
    ttfb_seconds = max(0.0, time.time() - start_time)
    remainder = response.raw.read()
    content = first_byte + remainder
    response._content = content
    response.encoding = response.apparent_encoding
    soup = BeautifulSoup(response.text or "", "html.parser")
    return {
        "response": response,
        "soup": soup,
        "ttfb_seconds": ttfb_seconds,
        "html_bytes": len(content),
    }


def run_pagespeed_insights(url: str, strategy: str = "mobile") -> Optional[Dict[str, Any]]:
    """Call Google PageSpeed Insights API when PAGESPEED_API_KEY is configured.
    Returns the parsed JSON or None if the call fails or key missing.
    """
    api_key = os.getenv("PAGESPEED_API_KEY") or os.environ.get("PAGESPEED_API_KEY")
    if not api_key:
        return None

    endpoint = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
    params = {"url": url, "key": api_key, "strategy": strategy}
    try:
        resp = requests.get(endpoint, params=params, timeout=20)
        if resp.status_code == 200:
            return resp.json()
        else:
            return None
    except Exception:
        return None


def _score_ttfb(ttfb_seconds: Optional[float]) -> int:
    if ttfb_seconds is None:
        return 0
    if ttfb_seconds <= 0.5:
        return 100
    if ttfb_seconds <= 1:
        return 80
    if ttfb_seconds <= 2:
        return 50
    return 20


def _score_html_size(html_kb: Optional[float]) -> int:
    if html_kb is None:
        return 0
    if html_kb <= 100:
        return 100
    if html_kb <= 300:
        return 70
    return 40


def _score_resource_count(resource_count: Optional[int]) -> int:
    if resource_count is None:
        return 0
    if resource_count <= 30:
        return 100
    if resource_count <= 60:
        return 70
    return 40


def _build_explanation(value: Any, score: int, why: str, low_reason: Optional[str], improvements: str) -> Dict[str, Any]:
    explanation = {
        "value": value,
        "score": score,
        "why_this_matters_for_seo": why,
        "recommended_improvements": improvements,
    }
    if score < 100 and low_reason:
        explanation["why_score_is_low"] = low_reason
    return explanation


class PerformanceAnalyzer:
    def analyze(
        self,
        url: str,
        response: Optional[requests.Response] = None,
        soup: Optional[BeautifulSoup] = None,
        ttfb_seconds: Optional[float] = None,
        html_bytes: Optional[int] = None,
    ) -> Dict[str, Any]:
        limitations = []

        if response is None or soup is None or html_bytes is None or ttfb_seconds is None:
            try:
                fetch_result = fetch_page(url)
                response = fetch_result["response"]
                soup = fetch_result["soup"]
                ttfb_seconds = fetch_result["ttfb_seconds"]
                html_bytes = fetch_result["html_bytes"]
            except Exception as exc:
                return {
                    "score": 0,
                    "metrics": {},
                    "explanations": {},
                    "limitations": [f"Unable to fetch page to measure performance: {exc}"],
                    "data_source": "live_html",
                }

        html_kb = round((html_bytes or 0) / 1024, 2) if html_bytes is not None else None
        scripts = len(soup.find_all("script")) if soup else None
        images = len(soup.find_all("img")) if soup else None
        stylesheets = len(soup.find_all("link", rel=lambda x: x and "stylesheet" in x)) if soup else None
        resource_count = None
        if scripts is not None and images is not None and stylesheets is not None:
            resource_count = scripts + images + stylesheets

        ttfb_score = _score_ttfb(ttfb_seconds)
        html_score = _score_html_size(html_kb)
        resource_score = _score_resource_count(resource_count)
        score_values = [ttfb_score, html_score, resource_score]
        overall_score = int(sum(score_values) / len(score_values)) if score_values else 0

        explanations = {
            "ttfb": _build_explanation(
                value=round(ttfb_seconds, 3) if ttfb_seconds is not None else None,
                score=ttfb_score,
                why="Time to first byte reflects server responsiveness. Slow TTFB delays crawling and user perceived speed.",
                low_reason="The server took longer than recommended to send the first byte.",
                improvements="Use server-side caching, optimize backend processing, and reduce cold-start overhead.",
            ),
            "html_size": _build_explanation(
                value=html_kb,
                score=html_score,
                why="Large HTML payloads slow crawling and delay rendering, which can hurt SEO performance.",
                low_reason="The HTML payload exceeds recommended size thresholds.",
                improvements="Reduce inline markup, remove unused elements, and compress HTML where possible.",
            ),
            "resource_count": _build_explanation(
                value=resource_count,
                score=resource_score,
                why="Excessive resources increase page complexity and slow rendering, impacting SEO and usability.",
                low_reason="The page loads too many script/image/stylesheet resources.",
                improvements="Bundle scripts/styles, lazy-load images, and remove unused assets.",
            ),
        }

        # Try PageSpeed Insights if API key provided and available
        pagespeed_data = run_pagespeed_insights(url)
        pagespeed_score = None
        if pagespeed_data:
            try:
                pagespeed_score = int(pagespeed_data["lighthouseResult"]["categories"]["performance"]["score"] * 100)
                # Blend the pagespeed score with our lightweight assessment
                overall_score = int((overall_score + pagespeed_score) / 2)
                explanations["pagespeed"] = {
                    "value": pagespeed_score,
                    "score": pagespeed_score,
                    "why_this_matters_for_seo": "Lighthouse / PageSpeed provides field/lab metrics (LCP/FCP/CLS) for user experience.",
                    "recommended_improvements": "Review lighthouse suggestions (serve images next-gen, reduce unused JS/CSS, use proper caching).",
                }
            except Exception:
                pagespeed_score = None

        metrics = {
            "ttfb_seconds": round(ttfb_seconds, 3) if ttfb_seconds is not None else None,
            "html_size_kb": html_kb,
            "resource_count": resource_count,
            "resource_breakdown": {
                "scripts": scripts,
                "images": images,
                "stylesheets": stylesheets,
            },
        }

        if pagespeed_data:
            metrics["pagespeed_raw"] = pagespeed_data

        return {
            "score": overall_score,
            "metrics": metrics,
            "explanations": explanations,
            "limitations": limitations,
            "data_source": "live_html",
        }
