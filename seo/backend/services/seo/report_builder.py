from datetime import datetime
from typing import Any, Dict


def build_issue_map(section_name: str, details: Dict[str, Any]) -> Dict[str, Any]:
    issues = []
    for key, data in details.items():
        detail = data.get("details") if isinstance(data, dict) else None
        if not detail:
            continue
        issues.append({
            "section": section_name,
            "item": key,
            "issue": detail.get("what_was_detected"),
            "impact": detail.get("impact_on_seo"),
            "fix": detail.get("recommended_fix"),
        })
    return {"issues": issues}


def build_report(url: str, analyses: Dict[str, Any]) -> Dict[str, Any]:
    timestamp = datetime.utcnow().isoformat() + "Z"
    report = {
        "url": url,
        "timestamp": timestamp,
        "data_sources": {
            "html_fetch": "live_html",
            "keyword_suggestions": analyses.get("keyword_research", {}).get("source"),
        },
        "sections": {
            "performance": analyses.get("performance", {}),
            "on_page": analyses.get("on_page", {}),
            "technical": analyses.get("technical", {}),
            "accessibility": analyses.get("accessibility", {}),
            "keyword_research": analyses.get("keyword_research", {}),
        },
    }
    report.update(build_issue_map("on_page", analyses.get("on_page", {}).get("details", {})))
    report["issues"].extend(build_issue_map("technical", analyses.get("technical", {}).get("checks", {}))["issues"])
    report["issues"].extend(build_issue_map("accessibility", analyses.get("accessibility", {}).get("details", {}))["issues"])
    return report
