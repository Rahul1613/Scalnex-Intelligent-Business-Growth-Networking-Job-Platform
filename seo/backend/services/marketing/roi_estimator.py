from typing import Dict, Any

EFFICIENCY_ORDER = ["Poor", "Average", "Good", "Excellent"]


def classify_efficiency(audience_fit: int, budget_class: str, funnel_stage: str) -> Dict[str, Any]:
    score = 0
    # Audience fit weight
    if audience_fit >= 85:
        score += 2
    elif audience_fit >= 70:
        score += 1

    # Budget adequacy
    if budget_class == "Strong":
        score += 2
    elif budget_class == "Adequate":
        score += 1

    # Funnel alignment (conversion > consideration > awareness)
    if funnel_stage == "conversion":
        score += 2
    elif funnel_stage == "consideration":
        score += 1

    if score <= 1:
        label = "Poor"
    elif score == 2:
        label = "Average"
    elif score in (3, 4):
        label = "Good"
    else:
        label = "Excellent"

    explanation = "Efficiency reflects audience fit, budget strength, and whether messaging targets the right funnel stage."
    improvements = "Improve audience-platform fit, allocate budget to best-fit platform, and align message to conversion intent."

    return {
        "efficiency": label,
        "why": explanation,
        "how_to_improve": improvements,
    }
