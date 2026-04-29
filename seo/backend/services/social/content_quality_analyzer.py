from typing import Dict, Any, List
import re

CTA_WORDS = ["comment", "watch", "share", "subscribe", "like", "save", "join", "follow"]
QUESTION_RE = re.compile(r"\?")


def _analyze_text_block(text: str) -> Dict[str, Any]:
    t = (text or "").strip()
    length = len(t)
    # Length scoring
    if length < 20:
        len_score = 60; len_note = "Too short to convey value."
    elif 60 <= length <= 180:
        len_score = 90; len_note = "Optimal length for clarity."
    elif length <= 320:
        len_score = 80; len_note = "Slightly long but acceptable."
    else:
        len_score = 70; len_note = "Very long; consider tightening."

    cta_hits = sum(1 for w in CTA_WORDS if w in t.lower())
    cta_score = min(100, 70 + cta_hits * 10)
    cta_note = "CTA words encourage interaction."

    topic_clear = any(k in t.lower() for k in ["how", "guide", "tips", "review", "case study", "tutorial", "explained"])
    topic_score = 90 if topic_clear else 70
    topic_note = "Topic clarity improves comprehension."

    return {
        "length": length,
        "length_score": len_score,
        "length_note": len_note,
        "cta_hits": cta_hits,
        "cta_score": cta_score,
        "cta_note": cta_note,
        "topic_clear": topic_clear,
        "topic_score": topic_score,
        "topic_note": topic_note,
    }


def evaluate_content_quality(items: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not items:
        return {
            "score": 65,
            "why": "No measurable text blocks; using conservative default.",
            "details": [],
            "improvements": [
                "Add clear titles/captions with a focused topic.",
                "Include a concise CTA (e.g., 'watch', 'comment').",
            ],
        }
    analyses = []
    for it in items:
        t = it.get("caption") or it.get("text") or it.get("title") or ""
        if t:
            analyses.append(_analyze_text_block(t))
    if not analyses:
        return {
            "score": 65,
            "why": "Text content not measurable from public HTML.",
            "details": [],
            "improvements": ["Ensure captions/titles are present in public content."],
        }
    avg = lambda k: sum(a[k] for a in analyses) / len(analyses)
    length_score = avg("length_score")
    cta_score = avg("cta_score")
    topic_score = avg("topic_score")
    score = int(0.4 * length_score + 0.35 * cta_score + 0.25 * topic_score)
    return {
        "score": score,
        "why": "Balanced evaluation of length, CTA usage, and topic clarity.",
        "details": analyses[:5],
        "improvements": [
            "Target 60–180 chars for captions/titles.",
            "Use clear CTAs like 'watch', 'comment', 'share'.",
            "Make the topic explicit (how/guide/review).",
        ],
    }
