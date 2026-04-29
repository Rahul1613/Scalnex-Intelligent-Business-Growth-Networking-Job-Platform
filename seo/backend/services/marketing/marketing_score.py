from typing import Dict, Any

def final_marketing_score(audience_fit: int, campaign_strategy: int, copy_quality: int, funnel_alignment: int, budget_efficiency: int) -> int:
    score = (
        0.30 * (audience_fit or 0)
        + 0.25 * (campaign_strategy or 0)
        + 0.20 * (copy_quality or 0)
        + 0.15 * (funnel_alignment or 0)
        + 0.10 * (budget_efficiency or 0)
    )
    return int(round(score))


def explain_subscore(name: str, value: int, why: str, improve: str) -> Dict[str, Any]:
    return {
        "name": name,
        "score": int(value or 0),
        "explanation": why,
        "improvements": improve,
    }
