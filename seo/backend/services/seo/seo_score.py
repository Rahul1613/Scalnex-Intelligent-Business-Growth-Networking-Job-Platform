from typing import Optional


def compute_final_score(
    performance: Optional[float] = 0,
    on_page: Optional[float] = 0,
    technical: Optional[float] = 0,
    accessibility: Optional[float] = 0,
    content_quality: Optional[float] = 0,
    backlinks: Optional[float] = 0,
    ux: Optional[float] = 0
) -> int:
    perf_score = performance or 0
    onpage_score = on_page or 0
    tech_score = technical or 0
    access_score = accessibility or 0
    content_score = content_quality or 0
    backlink_score = backlinks or 0
    ux_score = ux or 0

    # New Weighted Calculation (Total = 1.0)
    final_score = (
        0.15 * perf_score       # Speed and performance
        + 0.20 * onpage_score   # Title, Meta, Alt tags
        + 0.15 * tech_score     # Sitemaps, Robots, Errors
        + 0.10 * access_score   # Accessibility
        + 0.15 * content_score  # Content quality and NLP
        + 0.15 * backlink_score # Links and Authority
        + 0.10 * ux_score       # User experience signals
    )
    return int(round(final_score))
