from typing import Dict, Any, List

CTA_WORDS = ["comment", "watch", "share", "subscribe", "like", "save", "join", "follow"]
QUESTION_MARK = "?"


def evaluate_engagement_potential(items: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not items:
        return {
            "score": 60,
            "classification": "Low",
            "why": "No measurable public text to assess interaction design.",
            "improvements": [
                "Add explicit prompts (e.g., ask a question).",
                "Include clear CTAs (watch, comment, share).",
                "Vary formats (short vs long, how-tos, reviews).",
            ],
        }

    cta_hits = 0
    questions = 0
    lengths: List[int] = []
    for it in items:
        t = (it.get("caption") or it.get("text") or it.get("title") or "").strip()
        if not t:
            continue
        lengths.append(len(t))
        low = t.lower()
        cta_hits += sum(1 for w in CTA_WORDS if w in low)
        questions += 1 if QUESTION_MARK in t else 0

    # Normalize heuristics to score
    base = 60
    base += min(20, cta_hits * 3)
    base += min(15, questions * 5)
    # Diversity approximation via length variance
    if lengths:
        avg = sum(lengths) / len(lengths)
        variance = sum((l - avg) ** 2 for l in lengths) / len(lengths)
        if variance >= 1500:
            base += 10
        elif variance >= 500:
            base += 5

    score = int(max(0, min(100, base)))
    if score >= 85:
        cls = "High"
    elif score >= 70:
        cls = "Medium"
    else:
        cls = "Low"

    return {
        "score": score,
        "classification": cls,
        "why": "CTA use, question prompts, and content variety increase interaction likelihood.",
        "improvements": [
            "Include specific CTAs (e.g., 'Comment your thoughts').",
            "Ask 1 question per post to invite replies.",
            "Mix formats (tips, how-to, stories) to engage different audiences.",
        ],
    }
