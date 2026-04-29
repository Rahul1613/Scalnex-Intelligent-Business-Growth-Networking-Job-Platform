from typing import Dict, Any
import re

KEYWORDS_HINT = ["expert", "official", "reviews", "tutorials", "guide", "news", "tips", "agency", "studio"]
LINK_RE = re.compile(r"https?://[\w./-]+", re.I)
HASHTAG_RE = re.compile(r"#[\w_]+")


def analyze_profile_optimization(platform: str, extracted: Dict[str, Any]) -> Dict[str, Any]:
    platform = (platform or "").lower()
    bio = (extracted.get("bio") or extracted.get("description") or extracted.get("channel_description") or "").strip()

    has_desc = bool(bio)
    has_link = bool(LINK_RE.search(bio))
    keywords = [k for k in KEYWORDS_HINT if k in bio.lower()]
    niche_clear = len(keywords) >= 1 or any(k in bio.lower() for k in ["for ", "we help", "i help", "subscribe for", "new videos on"])

    # Instagram hashtag presence primarily in captions, but bio may have some
    hashtags_bio = HASHTAG_RE.findall(bio)

    score = 0
    score += 30 if has_desc else 10
    score += 25 if has_link else 15
    score += 25 if niche_clear else 15
    score += 20 if (platform == "instagram" and hashtags_bio) else 10

    improvements = []
    if not has_desc:
        improvements.append("Add a clear profile description that states your niche and value.")
    if not has_link:
        improvements.append("Include a relevant external link (website or link hub).")
    if not niche_clear:
        improvements.append("State who you help and what topics you cover.")
    if platform == "instagram" and not hashtags_bio:
        improvements.append("Add 1–2 branded hashtags in bio (optional).")

    return {
        "score": int(score),
        "why": "Profile clarity and links improve discoverability and trust.",
        "details": {
            "has_description": has_desc,
            "has_external_link": has_link,
            "niche_keywords_detected": keywords,
            "hashtags_in_bio": bool(hashtags_bio),
        },
        "improvements": improvements or ["Refine bio to highlight niche and add a link."]
    }
