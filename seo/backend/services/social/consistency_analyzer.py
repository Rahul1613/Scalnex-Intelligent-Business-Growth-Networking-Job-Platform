from typing import Dict, Any, List, Optional
from datetime import datetime

ISO_FMT = "%Y-%m-%d"


def _parse_date(d: Optional[str]) -> Optional[datetime]:
    try:
        if not d:
            return None
        return datetime.strptime(d, ISO_FMT)
    except Exception:
        return None


def analyze_consistency(items: List[Dict[str, Any]]) -> Dict[str, Any]:
    dates = [_parse_date(it.get("date")) for it in items if it.get("date")]
    dates = sorted([d for d in dates if d], reverse=True)

    if not items:
        return {
            "score": 60,
            "why": "No measurable posting history in public HTML.",
            "explanation": "Consistency measures schedule stability; missing posts reduce confidence.",
            "improvements": ["Define a posting rhythm (e.g., Tue/Thu).", "Publish at least weekly for 8 weeks."],
        }

    if len(dates) < 3:
        return {
            "score": 70,
            "why": "Few dated items available; limited visibility into schedule.",
            "explanation": "Stable upload frequency helps algorithms anticipate content.",
            "improvements": ["Maintain steady cadence for multiple weeks."]
        }

    # Compute gap variance
    gaps: List[int] = []
    for i in range(len(dates) - 1):
        gaps.append(abs((dates[i] - dates[i + 1]).days))
    if not gaps:
        return {
            "score": 70,
            "why": "Insufficient data to compute interval variance.",
            "explanation": "Regular gaps indicate reliability to algorithms and audiences.",
            "improvements": ["Aim for consistent intervals between posts."]
        }
    avg_gap = sum(gaps) / len(gaps)
    variance = sum((g - avg_gap) ** 2 for g in gaps) / len(gaps)

    if variance <= 30 and avg_gap <= 14:
        score = 88; why = "Intervals are relatively stable and recent."
    elif variance <= 60 and avg_gap <= 30:
        score = 78; why = "Some stability; moderate gaps detected."
    else:
        score = 65; why = "Irregular intervals and/or long gaps reduce consistency."

    return {
        "score": int(score),
        "why": why,
        "explanation": "Consistency improves algorithmic visibility and audience habit formation.",
        "improvements": [
            "Plan a fixed-day schedule (e.g., Mon/Wed/Fri).",
            "Use batching and scheduling tools to avoid long gaps.",
        ],
    }
