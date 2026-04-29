from typing import Dict, Any, List

def build_report(platform: str, url: str, fetched_at: str, extracted: Dict[str, Any], sections: Dict[str, Any]) -> Dict[str, Any]:
    measurable: List[str] = []
    limitations: List[str] = []

    # Measurable signals by presence
    if extracted.get("bio") or extracted.get("description") or extracted.get("channel_description"):
        measurable.append("Profile description present")
    if extracted.get("recent_posts") or extracted.get("video_titles"):
        measurable.append("Recent content text detected")
    if sections.get("activity", {}).get("most_recent"):
        measurable.append("Recent date extracted")
    if sections.get("content_quality", {}).get("details"):
        measurable.append("Caption/title structure analyzed")

    # Non-measurable limitations
    if not sections.get("activity", {}).get("most_recent"):
        limitations.append("Exact timestamps not reliably available in public HTML")
    limitations.append("Follower counts, likes, and engagement rates are platform-restricted and not used")

    recommendations: List[str] = []
    for key in ("activity", "content_quality", "consistency", "optimization", "engagement_potential"):
        recs = sections.get(key, {}).get("improvements", [])
        if isinstance(recs, list):
            recommendations.extend(recs)
        elif isinstance(recs, str):
            recommendations.append(recs)

    return {
        "platform": platform,
        "profile_url": url,
        "collected_at": fetched_at,
        "measurable_signals": measurable,
        "non_measurable_limitations": limitations,
        "recommendations": recommendations[:10],
        "sections": sections,
    }
