from typing import Dict, Any, List

HEADLINE_IDEAL_RANGE = (30, 70)  # characters


def assess_copy(variant: Dict[str, Any]) -> Dict[str, Any]:
    headline = (variant.get("headline") or "").strip()
    body = (variant.get("body") or "").strip()
    cta = (variant.get("cta") or "").strip()
    platform = (variant.get("platform") or "").lower()

    strengths: List[str] = []
    weaknesses: List[str] = []
    improvements: List[str] = []

    # Headline length
    hlen = len(headline)
    if HEADLINE_IDEAL_RANGE[0] <= hlen <= HEADLINE_IDEAL_RANGE[1]:
        strengths.append(f"Headline length is within a clear readability range ({hlen} chars).")
        headline_score = 100
    else:
        weaknesses.append(f"Headline length is {hlen} chars. Aim for {HEADLINE_IDEAL_RANGE[0]}-{HEADLINE_IDEAL_RANGE[1]} chars.")
        improvements.append("Tighten or expand headline to improve scanability.")
        headline_score = 70

    # CTA clarity
    clear_cta_terms = ["get", "start", "buy", "book", "learn", "try", "download", "join"]
    has_clear_cta = any(cta.lower().startswith(t) or t in cta.lower() for t in clear_cta_terms)
    if has_clear_cta:
        strengths.append("CTA uses an action verb and is easy to understand.")
        cta_score = 100
    else:
        weaknesses.append("CTA lacks a strong action verb.")
        improvements.append("Use a direct action verb (e.g., 'Get Started', 'Book a Demo').")
        cta_score = 70

    # Tone analysis (very simple heuristic)
    emotional_terms = ["love", "amazing", "boost", "save", "unlock", "power"]
    rational_terms = ["features", "benefits", "case study", "data", "evidence"]
    emo = sum(1 for t in emotional_terms if t in (headline + " " + body).lower())
    rat = sum(1 for t in rational_terms if t in (headline + " " + body).lower())
    if emo > rat:
        tone = "emotional"
    elif rat > emo:
        tone = "rational"
    else:
        tone = "balanced"

    # Platform suitability
    platform_fit_score = 80
    if "linkedin" in platform and tone == "emotional":
        platform_fit_score = 70
        weaknesses.append("Tone skews emotional for LinkedIn audiences.")
        improvements.append("Add rational proof points (benefits, outcomes) for B2B context.")
    if "instagram" in platform and tone == "rational":
        platform_fit_score = 75
        improvements.append("Use more visual/emotional hooks for Instagram.")

    copy_score = int(0.35 * headline_score + 0.35 * cta_score + 0.30 * platform_fit_score)

    return {
        "copy_score": copy_score,
        "tone": tone,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "improvement_suggestions": improvements,
    }
