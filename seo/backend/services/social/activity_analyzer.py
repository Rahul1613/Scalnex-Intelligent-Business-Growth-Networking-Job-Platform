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


def analyze_activity(items: List[Dict[str, Any]]) -> Dict[str, Any]:
    dates = [_parse_date(it.get("date")) for it in items if it.get("date")]
    dates = [d for d in dates if d is not None]
    now = datetime.utcnow()

    if not items:
        return {
            "score": 40,
            "classification": "Inactive",
            "why": "No recent public content detected.",
            "limitations": ["Dates may be missing from public HTML."],
            "improvements": ["Publish a new post/video.", "Establish a weekly cadence."],
        }

    if not dates:
        # Cannot measure exact recency; use presence as weak positive
        return {
            "score": 65,
            "classification": "Semi-active",
            "why": "Recent content appears present but dates are not measurable.",
            "limitations": ["Timestamps not available in public HTML."],
            "improvements": ["Maintain a consistent schedule (e.g., 2–3 times per week)."],
        }

    dates.sort(reverse=True)
    most_recent = dates[0]
    gap_days = (now - most_recent).days
    # Compute average gap across last N
    gaps: List[int] = []
    for i in range(len(dates) - 1):
        gaps.append(abs((dates[i] - dates[i + 1]).days))
    avg_gap = sum(gaps) / len(gaps) if gaps else gap_days

    if gap_days <= 14 and avg_gap <= 14:
        score = 90
        cls = "Active"
        why = "Recent updates with stable cadence."
    elif gap_days <= 30 and avg_gap <= 30:
        score = 75
        cls = "Semi-active"
        why = "Some recent activity; cadence could improve."
    else:
        score = 55
        cls = "Inactive"
        why = "Long gaps detected between posts/uploads."

    return {
        "score": score,
        "classification": cls,
        "why": why,
        "most_recent": most_recent.strftime(ISO_FMT),
        "avg_gap_days": int(avg_gap),
        "improvements": [
            "Post on a predictable schedule (e.g., same days each week).",
            "Batch-produce content to avoid long gaps.",
        ],
    }
