from typing import Dict, Any

from services.social.page_fetcher import fetch_public_page
from services.social.content_extractor import extract
from services.social.activity_analyzer import analyze_activity
from services.social.content_quality_analyzer import evaluate_content_quality
from services.social.consistency_analyzer import analyze_consistency
from services.social.optimization_analyzer import analyze_profile_optimization
from services.social.engagement_potential import evaluate_engagement_potential
from services.social.social_score import final_social_score, explain_subscore

class SocialAnalyzer:
    def __init__(self):
        pass

    def analyze(self, url):
        """Main entry point to analyze a social media URL."""
        if "instagram.com" in url:
            return self._analyze_instagram(url)
        elif "facebook.com" in url:
            return self._analyze_facebook(url)
        elif "youtube.com" in url or "youtu.be" in url:
            return self._analyze_youtube(url)
        else:
            return {"error": "Platform not supported. Use Instagram, Facebook, or YouTube."}

    def _analyze_instagram(self, url):
        fetch = fetch_public_page(url)
        if not fetch.get("success"):
            return {"success": False, "platform": "instagram", "url": url, "error": fetch.get("error") or "Failed to fetch public page"}
        if not fetch.get("is_public"):
            return {"success": False, "platform": "instagram", "url": url, "error": "Profile not publicly accessible"}

        extracted = extract("instagram", fetch.get("html") or "")
        posts = extracted.get("recent_posts", [])

        activity = analyze_activity(posts)
        content_quality = evaluate_content_quality(posts)
        consistency = analyze_consistency(posts)
        optimization = analyze_profile_optimization("instagram", extracted)
        engagement_potential = evaluate_engagement_potential(posts)

        final = final_social_score(
            activity=activity.get("score", 0),
            content_quality=content_quality.get("score", 0),
            consistency=consistency.get("score", 0),
            optimization=optimization.get("score", 0),
            engagement_potential=engagement_potential.get("score", 0),
        )

        sections = {
            "activity": activity,
            "content_quality": content_quality,
            "consistency": consistency,
            "optimization": optimization,
            "engagement_potential": engagement_potential,
            "scores": {
                "final": final,
                "breakdown": [
                    explain_subscore("Activity", activity.get("score", 0), "Recent posts and gaps", "Active creators are favored", "Publish weekly; avoid long gaps."),
                    explain_subscore("Content Quality", content_quality.get("score", 0), "Length, CTA words, topic clarity", "Clear, actionable content is discoverable", "Use concise titles and explicit CTAs."),
                    explain_subscore("Consistency", consistency.get("score", 0), "Schedule stability", "Predictability aids algorithms", "Fix a weekly cadence."),
                    explain_subscore("Profile Optimization", optimization.get("score", 0), "Bio/link/niche keywords", "Improves discoverability", "Add link and niche keywords."),
                    explain_subscore("Engagement Potential", engagement_potential.get("score", 0), "CTAs, questions, variety", "Prompts invite interaction", "Ask a question; add CTA."),
                ],
            },
        }

        return {
            "success": True,
            "platform": "instagram",
            "url": url,
            "analysis": sections,
            "fetched_at": fetch.get("fetched_at"),
            "notes": "Follower counts and engagement rates are not used; only public textual signals are analyzed.",
        }

    def _analyze_facebook(self, url):
        fetch = fetch_public_page(url)
        if not fetch.get("success"):
            return {"success": False, "platform": "facebook", "url": url, "error": fetch.get("error") or "Failed to fetch public page"}
        if not fetch.get("is_public"):
            return {"success": False, "platform": "facebook", "url": url, "error": "Profile not publicly accessible"}

        extracted = extract("facebook", fetch.get("html") or "")
        posts = extracted.get("recent_posts", [])

        activity = analyze_activity(posts)
        content_quality = evaluate_content_quality(posts)
        consistency = analyze_consistency(posts)
        optimization = analyze_profile_optimization("facebook", {"description": extracted.get("description", "")})
        engagement_potential = evaluate_engagement_potential(posts)

        final = final_social_score(
            activity=activity.get("score", 0),
            content_quality=content_quality.get("score", 0),
            consistency=consistency.get("score", 0),
            optimization=optimization.get("score", 0),
            engagement_potential=engagement_potential.get("score", 0),
        )

        sections = {
            "activity": activity,
            "content_quality": content_quality,
            "consistency": consistency,
            "optimization": optimization,
            "engagement_potential": engagement_potential,
            "scores": {
                "final": final,
                "breakdown": [
                    explain_subscore("Activity", activity.get("score", 0), "Recent posts and gaps", "Active pages stay visible", "Post weekly"),
                    explain_subscore("Content Quality", content_quality.get("score", 0), "Caption clarity and CTAs", "Prompts drive actions", "Use verbs like share/comment"),
                    explain_subscore("Consistency", consistency.get("score", 0), "Schedule stability", "Predictability helps reach", "Fixed-day schedule"),
                    explain_subscore("Profile Optimization", optimization.get("score", 0), "Description/link/keywords", "Improves discovery", "Clarify niche; add link"),
                    explain_subscore("Engagement Potential", engagement_potential.get("score", 0), "CTAs/questions/variety", "Enables engagement", "Ask a question per post"),
                ],
            },
        }

        return {
            "success": True,
            "platform": "facebook",
            "url": url,
            "analysis": sections,
            "fetched_at": fetch.get("fetched_at"),
            "notes": "No likes/followers used; analysis is based on public text only.",
        }

    def _analyze_youtube(self, url):
        fetch = fetch_public_page(url)
        if not fetch.get("success"):
            return {"success": False, "platform": "youtube", "url": url, "error": fetch.get("error") or "Failed to fetch public page"}
        if not fetch.get("is_public"):
            return {"success": False, "platform": "youtube", "url": url, "error": "Channel not publicly accessible"}

        extracted = extract("youtube", fetch.get("html") or "")
        items = []
        # Build pseudo-items from titles/descs/dates for analyzers
        for i, t in enumerate(extracted.get("video_titles", [])[:10]):
            items.append({
                "title": t,
                "text": (extracted.get("video_descriptions", [""] * 10)[i] if i < len(extracted.get("video_descriptions", [])) else ""),
                "date": (extracted.get("upload_dates", [None] * 10)[i] if i < len(extracted.get("upload_dates", [])) else None),
            })

        activity = analyze_activity(items)
        content_quality = evaluate_content_quality(items)
        consistency = analyze_consistency(items)
        optimization = analyze_profile_optimization("youtube", {"channel_description": extracted.get("channel_description", "")})
        engagement_potential = evaluate_engagement_potential(items)

        final = final_social_score(
            activity=activity.get("score", 0),
            content_quality=content_quality.get("score", 0),
            consistency=consistency.get("score", 0),
            optimization=optimization.get("score", 0),
            engagement_potential=engagement_potential.get("score", 0),
        )

        sections = {
            "activity": activity,
            "content_quality": content_quality,
            "consistency": consistency,
            "optimization": optimization,
            "engagement_potential": engagement_potential,
            "scores": {
                "final": final,
                "breakdown": [
                    explain_subscore("Activity", activity.get("score", 0), "Recent uploads and gaps", "Active channels are surfaced more", "Upload on a consistent schedule."),
                    explain_subscore("Content Quality", content_quality.get("score", 0), "Title/description clarity & CTAs", "Clear titles increase CTR organically", "Use concise how/guide/review titles."),
                    explain_subscore("Consistency", consistency.get("score", 0), "Upload interval stability", "Regularity aids recommendations", "Set specific upload days."),
                    explain_subscore("Profile Optimization", optimization.get("score", 0), "Channel description & keywords", "Helps discovery & trust", "Clarify niche; add a link hub."),
                    explain_subscore("Engagement Potential", engagement_potential.get("score", 0), "CTAs and prompts", "Prompts enable interaction", "Ask a question in the video/description."),
                ],
            },
        }

        return {
            "success": True,
            "platform": "youtube",
            "url": url,
            "analysis": sections,
            "fetched_at": fetch.get("fetched_at"),
            "notes": "No subscriber/views metrics used; only public textual signals are analyzed.",
        }
