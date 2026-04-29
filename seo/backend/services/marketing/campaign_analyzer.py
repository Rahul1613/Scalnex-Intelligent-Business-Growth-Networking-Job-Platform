from typing import Dict, Any

# Static CPM guidance ranges (USD) - illustrative, rule-only, not real-time
CPM_GUIDE = {
    "Google Ads": (8, 25),
    "Facebook Ads": (5, 15),
    "Instagram Ads": (6, 18),
    "LinkedIn Ads": (20, 65),
    "YouTube": (9, 20),
}

AUDIENCE_PLATFORM_RULES = [
    ("b2b", ["LinkedIn Ads"], 95),
    ("startup founders", ["LinkedIn Ads", "Twitter"], 85),
    ("gen z", ["Instagram Ads", "YouTube", "TikTok"], 90),
    ("local", ["Facebook Ads", "Instagram Ads"], 80),
    ("ecommerce", ["Instagram Ads", "Facebook Ads", "Google Ads"], 85),
]


def audience_platform_fit(audience: str, platform: str) -> Dict[str, Any]:
    a = (audience or "").lower()
    p = platform or ""
    base = 60
    best = None
    for key, preferred, score in AUDIENCE_PLATFORM_RULES:
        if key in a:
            best = (preferred, score)
            break
    if best:
        preferred, score = best
        fit_score = score if p in preferred else max(40, score - 35)
    else:
        fit_score = base
    explanation = {
        "score": fit_score,
        "why_this_matters": "Audience-platform fit determines how efficiently you can reach and persuade your target buyers.",
        "recommended_platform_changes": [],
    }
    if best and p not in best[0]:
        explanation["why_score_is_low"] = f"{p} is not a typical high-fit platform for {audience}."
        explanation["recommended_platform_changes"] = best[0]
    elif not best:
        explanation["why_this_matters"] += " Using general-fit platforms until audience definition is refined."
    return explanation


def budget_adequacy(budget: float, platform: str) -> Dict[str, Any]:
    low, high = CPM_GUIDE.get(platform, (8, 25))
    # Use CPM guidance to classify adequacy without fabricating reach
    # Rule: strong if budget >= 50 * low CPM, adequate if >= 20 * low CPM, else low
    if budget is None or budget <= 0:
        classification = "Low"
        reason = "No budget provided."
    elif budget >= 50 * low:
        classification = "Strong"
        reason = f"Budget supports multiple audience touches at typical CPM range ({low}-{high})."
    elif budget >= 20 * low:
        classification = "Adequate"
        reason = f"Budget allows initial testing at typical CPM range ({low}-{high})."
    else:
        classification = "Low"
        reason = f"Budget may limit testing frequency at typical CPM range ({low}-{high})."
    return {
        "classification": classification,
        "why_budget_may_limit_reach": reason if classification == "Low" else None,
        "how_to_optimize_spend": "Concentrate budget on 1-2 high-fit audiences and 1-2 creatives; avoid spread-thin multi-platform buys."
    }


def message_audience_relevance(message: str, audience: str, goal: str) -> Dict[str, Any]:
    m = (message or "").lower()
    a = (audience or "").lower()
    g = (goal or "").lower()

    # Simple rule-based intent mapping
    intent = "consideration"
    if any(k in g for k in ["lead", "signup", "purchase", "book", "demo", "trial"]):
        intent = "conversion"
    elif any(k in g for k in ["learn", "awareness", "reach", "view"]):
        intent = "awareness"

    score = 100
    issues = []

    if intent == "awareness" and not any(k in m for k in ["what", "why", "guide", "intro", "discover", "learn"]):
        score -= 20; issues.append("Message lacks educational/intro hooks for awareness stage.")
    if intent == "consideration" and not any(k in m for k in ["compare", "benefits", "features", "case study", "how"]):
        score -= 20; issues.append("Message doesn't address evaluation concerns for consideration stage.")
    if intent == "conversion" and not any(k in m for k in ["get", "start", "buy", "book", "try", "now"]):
        score -= 25; issues.append("Message lacks clear action verbs for conversion stage.")

    if any(k in a for k in ["b2b", "founder", "professional"]) and any(k in m for k in ["fun", "viral", "meme"]):
        score -= 15; issues.append("Tone mismatched: playful phrasing for a B2B audience.")

    return {
        "score": max(0, score),
        "mismatch_explanation": "; ".join(issues) if issues else None,
        "message_improvements": "Match tone and CTA to funnel stage; address objections with benefits and proof."
    }
