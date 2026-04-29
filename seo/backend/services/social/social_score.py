from typing import Dict, Any

def final_social_score(activity: int, content_quality: int, consistency: int, optimization: int, engagement_potential: int) -> int:
    score = (
        0.30 * (activity or 0)
        + 0.25 * (content_quality or 0)
        + 0.20 * (consistency or 0)
        + 0.15 * (optimization or 0)
        + 0.10 * (engagement_potential or 0)
    )
    return int(round(score))


def explain_subscore(name: str, value: int, what: str, why: str, improve: str) -> Dict[str, Any]:
    return {
        "name": name,
        "score": int(value or 0),
        "what_was_analyzed": what,
        "why_it_affects_growth": why,
        "improvements": improve,
    }
