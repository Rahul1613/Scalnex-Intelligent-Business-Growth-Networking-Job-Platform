from typing import Any, Dict, List

PERSUASIVE_CTAS = ["get", "start", "book", "try", "download", "join", "buy"]
EMOTIONAL_TERMS = ["love", "amazing", "boost", "save", "unlock", "power", "fast", "new"]
CLARITY_PENALTIES = [",", ";", "...", "!!!"]


def score_variant(variant: Dict[str, Any], platform: str) -> Dict[str, Any]:
    headline = (variant.get("headline") or "").lower()
    body = (variant.get("body") or "").lower()
    cta = (variant.get("cta") or "").lower()
    plat = (platform or variant.get("platform") or "").lower()

    # CTA strength
    cta_strength = 100 if any(cta.startswith(t) or t in cta for t in PERSUASIVE_CTAS) else 70

    # Emotional triggers vs clarity
    emo_hits = sum(1 for t in EMOTIONAL_TERMS if t in (headline + " " + body))
    emotional_pull = min(100, 70 + emo_hits * 5)

    # Simplicity & clarity (penalize clutter)
    clarity = 100 - sum(5 for p in CLARITY_PENALTIES if p in (variant.get("headline") or "") or p in (variant.get("body") or ""))
    clarity = max(60, clarity)

    # Platform alignment
    platform_alignment = 85
    if "linkedin" in plat and emotional_pull > 85:
        platform_alignment = 75
    if "instagram" in plat and clarity > 95:
        platform_alignment = 80

    persuasion_score = int(0.35 * cta_strength + 0.25 * emotional_pull + 0.25 * clarity + 0.15 * platform_alignment)

    return {
        "persuasion_score": persuasion_score,
        "components": {
            "cta_strength": cta_strength,
            "emotional_pull": emotional_pull,
            "clarity": clarity,
            "platform_alignment": platform_alignment,
        },
        "explanation": {
            "why": "CTA strength, emotional resonance, clarity, and platform alignment drive persuasion without fabricating performance metrics.",
            "improve": "Tighten headline, use a direct CTA, and match tone to platform norms.",
        },
    }


def analyze_ab_test(variants: List[Dict[str, Any]], platform: str) -> Dict[str, Any]:
    analyses: List[Dict[str, Any]] = []
    for v in variants:
        analyses.append({"id": v.get("id"), "analysis": score_variant(v, platform)})

    winner = max(analyses, key=lambda x: x["analysis"]["persuasion_score"]) if analyses else None
    loser = min(analyses, key=lambda x: x["analysis"]["persuasion_score"]) if analyses else None

    result = {
        "results": analyses,
        "winner_id": winner["id"] if winner else None,
        "recommendation": None,
        "notes": "Winner chosen via persuasion analysis (CTA, emotion, clarity, platform fit). No synthetic CTR/ROI used.",
    }
    if winner and loser:
        result["recommendation"] = (
            f"Variant {winner['id']} wins due to higher persuasion score. Improve {loser['id']} by sharpening CTA and simplifying language."
        )
    return result
