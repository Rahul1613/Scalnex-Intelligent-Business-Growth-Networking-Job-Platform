from typing import Any, Dict, List


def issue(item: str, impact: str, fix: str) -> Dict[str, str]:
    return {"item": item, "impact": impact, "fix": fix}


def build_campaign_report(inputs: Dict[str, Any], sections: Dict[str, Any]) -> Dict[str, Any]:
    report: Dict[str, Any] = {
        "inputs": inputs,
        "sections": sections,
        "issues": []
    }

    # Collect issues with Issue -> Impact -> Fix pattern
    audience = sections.get("audience_platform_fit", {})
    if audience.get("score", 100) < 80:
        report["issues"].append(issue(
            "Audience–Platform Fit",
            audience.get("why_score_is_low", "Lower fit reduces efficiency and increases wasted spend."),
            f"Consider: {', '.join(audience.get('recommended_platform_changes', [])) or 'Refine audience or platform.'}"
        ))

    relevance = sections.get("message_relevance", {})
    if relevance.get("mismatch_explanation"):
        report["issues"].append(issue(
            "Message–Audience Relevance",
            relevance["mismatch_explanation"],
            relevance.get("message_improvements", "Align message with funnel stage and audience intent."),
        ))

    budget = sections.get("budget", {})
    if budget.get("classification") == "Low":
        report["issues"].append(issue(
            "Budget Adequacy",
            budget.get("why_budget_may_limit_reach", "Low budget limits test iterations and learnings."),
            budget.get("how_to_optimize_spend", "Focus budget on high-fit audiences and creatives."),
        ))

    return report
