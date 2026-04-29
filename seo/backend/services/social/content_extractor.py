from typing import Dict, Any, List, Optional
from bs4 import BeautifulSoup
import re

# We only parse publicly visible HTML. No login, no APIs.

CTA_WORDS = ["comment", "watch", "share", "subscribe", "like", "save"]
HASHTAG_RE = re.compile(r"#[\w_]+")
LINK_RE = re.compile(r"https?://[\w./-]+", re.I)
DATE_RE = re.compile(r"(\d{4}-\d{2}-\d{2})")  # ISO dates if present in markup


def _text(soup: BeautifulSoup) -> str:
    return soup.get_text(" ", strip=True) if soup else ""


def extract_instagram(html: str) -> Dict[str, Any]:
    soup = BeautifulSoup(html or "", "html.parser")
    text = _text(soup).lower()
    bio = None
    highlights = False
    recent_posts: List[Dict[str, Any]] = []

    # Heuristics based on common public markup fragments
    # Bio: look for meta property="og:description" or <meta name="description">
    desc_meta = soup.find("meta", attrs={"property": "og:description"}) or soup.find("meta", attrs={"name": "description"})
    if desc_meta and desc_meta.get("content"):
        bio = desc_meta["content"].strip()

    # Highlights: simple heuristic - existence of the word "Highlights" in page text
    if "highlights" in text or "stories" in text:
        highlights = True

    # Captions: scrape visible text blocks resembling posts
    # Search for elements that often contain captions
    for cap in soup.select("article, div[role='button'], span")[:15]:
        t = (cap.get_text(" ", strip=True) or "").strip()
        if t and (len(t) > 20) and any(w in t.lower() for w in CTA_WORDS + ["#"]):
            hashtags = HASHTAG_RE.findall(t)
            links = LINK_RE.findall(t)
            date_match = DATE_RE.search(t)
            recent_posts.append({
                "caption": t[:280],
                "hashtags": hashtags,
                "links": links,
                "date": date_match.group(1) if date_match else None,
            })
    return {
        "bio": bio,
        "has_highlights": highlights,
        "recent_posts": recent_posts[:5],
    }


def extract_facebook(html: str) -> Dict[str, Any]:
    soup = BeautifulSoup(html or "", "html.parser")
    desc_meta = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", attrs={"property": "og:description"})
    description = (desc_meta.get("content") if desc_meta else None) or None

    # Find visible post-like blocks
    posts: List[Dict[str, Any]] = []
    for blk in soup.select("div, article, span")[:20]:
        t = (blk.get_text(" ", strip=True) or "").strip()
        if t and len(t) > 30 and any(w in t.lower() for w in CTA_WORDS):
            posts.append({
                "text": t[:300],
                "media": "unknown",
                "date": DATE_RE.search(t).group(1) if DATE_RE.search(t) else None,
            })
    return {"description": description, "recent_posts": posts[:5]}


def extract_youtube(html: str) -> Dict[str, Any]:
    soup = BeautifulSoup(html or "", "html.parser")
    desc_meta = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", attrs={"property": "og:description"})
    channel_desc = (desc_meta.get("content") if desc_meta else None) or None

    # Titles: use <title> and potential video title anchors in public HTML
    titles: List[str] = []
    for el in soup.select("a, h3, h4, span")[:50]:
        t = (el.get_text(" ", strip=True) or "").strip()
        if t and 5 <= len(t) <= 120 and any(k in t.lower() for k in ["video", "how", "review", "watch", "guide", "episode", "vlog"]):
            titles.append(t)

    # Descriptions: pull short paragraphs
    descriptions: List[str] = []
    for el in soup.select("p")[:30]:
        t = (el.get_text(" ", strip=True) or "").strip()
        if t and len(t) > 30:
            descriptions.append(t[:200])

    # Upload dates are often hidden; mark when not measurable
    upload_dates: List[Optional[str]] = []
    for el in soup.find_all(text=DATE_RE):
        m = DATE_RE.search(el)
        if m:
            upload_dates.append(m.group(1))
    return {
        "channel_description": channel_desc,
        "video_titles": titles[:10],
        "video_descriptions": descriptions[:10],
        "upload_dates": upload_dates[:10] if upload_dates else [],
    }


def extract(platform: str, html: str) -> Dict[str, Any]:
    if platform == "instagram":
        return extract_instagram(html)
    if platform == "facebook":
        return extract_facebook(html)
    if platform == "youtube":
        return extract_youtube(html)
    return {}
