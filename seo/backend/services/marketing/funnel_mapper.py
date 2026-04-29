from typing import Dict, Any

STAGE_RULES = {
    "awareness": ["what", "why", "learn", "discover", "guide", "tips", "intro"],
    "consideration": ["compare", "features", "benefits", "case study", "how", "vs"],
    "conversion": ["get", "start", "buy", "book", "try", "download", "join", "now"],
}


def map_funnel_stage(message: str, goal: str) -> Dict[str, Any]:
    m = (message or "").lower()
    g = (goal or "").lower()

    scores = {"awareness": 0, "consideration": 0, "conversion": 0}
    for stage, cues in STAGE_RULES.items():
        scores[stage] = sum(1 for c in cues if c in m) + (1 if stage in g else 0)

    stage = max(scores, key=scores.get)
    explanation = f"Detected strongest signals for {stage} based on messaging cues and goal."

    improvements = ""
    if stage == "awareness":
        improvements = "Add soft CTAs and proof points to move users to consideration."
    elif stage == "consideration":
        improvements = "Include clear action verbs and offers to drive conversion."
    else:
        improvements = "Ensure landing experience matches the promise to prevent drop-off."

    return {
        "stage": stage,
        "why": explanation,
        "suggested_changes": improvements,
    }
