import random
import re
import math

class AdvancedContentGenerator:
    def __init__(self):
        self.tones = {
            "professional": "Direct, authoritative, and data-driven.",
            "casual": "Friendly, conversational, and accessible.",
            "technical": "Dense, jargon-rich, and highly detailed.",
            "persuasive": "Compelling, benefit-oriented, and action-focused."
        }
        
        self.templates = {
            "blog": {
                "hooks": [
                    "Is {topic} really the key to success for {audience}? Let's find out.",
                    "Why most {audience} are failing at {topic} (and how to fix it).",
                    "The ultimate guide to {topic} for {audience} in 2026."
                ]
            },
            "ad": {
                "hooks": [
                    "Struggling with {topic}? We've got you covered.",
                    "The #1 {topic} solution for {audience}.",
                    "Scale your {topic} today. No experience needed."
                ]
            }
        }

    def generate(self, topic, content_type="blog", tone="professional", audience="general", language="English"):
        """Simulate high-quality AI content generation."""
        hook = random.choice(self.templates.get(content_type, self.templates["blog"])["hooks"]).format(
            topic=topic, audience=audience
        )
        
        tone_style = self.tones.get(tone, self.tones["professional"])
        
        # simulated generation logic
        sections = [
            f"# {topic}: A Strategic Approach for {audience}",
            f"\n*{tone_style}*",
            f"\n## Introduction\n{hook}\n{topic} is reshaping how {audience} interact with the market. Research shows that {topic} accounts for over 40% of growth in most niches.",
            f"\n## Why {topic} Matters\nImplementing {topic} effectively requires a deep understanding of your {audience}. Without it, you're just shooting in the dark. Key benefits include:\n- Increased visibility\n- Higher engagement\n- Sustainable growth",
            f"\n## Implementation Strategy\n1. Identify {topic} core values.\n2. Target {audience} specific pain points.\n3. Measure and iterate.\n\nFollowing these steps ensures that {topic} becomes a core pillar of your strategy.",
            f"\n## Conclusion\nFor {audience}, the transition to {topic} isn't just optional—it's essential. Start today to stay ahead of the curve."
        ]
        
        content = "\n".join(sections)
        
        # Simulate language translation if not English
        if language != "English":
            content = f"[Translated to {language}]\n\n" + content
            
        return {
            "title": f"{topic} for {audience}",
            "content": content,
            "type": content_type,
            "tone": tone,
            "audience": audience,
            "language": language,
            "seo_score": self.calculate_seo_score(content, topic)["score"]
        }

    def rewrite(self, text, topic, improvement_type="seo"):
        """Rewrite content for better SEO or clarity."""
        if improvement_type == "seo":
            # Add more keywords and structure
            improved = f"# Optimized: {topic}\n\n" + text.replace(topic, f"**{topic}**")
            if "##" not in improved:
                improved = improved.replace("\n\n", "\n\n## Key Insight\n", 1)
        else:
            # Simple clarity improvement
            improved = text.replace("  ", " ").replace(" .", ".")
            
        return {
            "original": text,
            "improved": improved,
            "score_diff": random.randint(5, 15)
        }

    def calculate_seo_score(self, text, target_keyword):
        """Calculate detailed SEO and readability metrics."""
        words = re.findall(r'\w+', text.lower())
        word_count = len(words)
        
        if word_count == 0:
            return {"score": 0}
            
        # Keyword Density
        keyword_count = words.count(target_keyword.lower())
        density = (keyword_count / word_count) * 100
        
        # Readability (Simulated Flesch Reading Ease)
        avg_word_len = sum(len(w) for w in words) / word_count
        readability_score = max(0, min(100, 100 - (avg_word_len - 4) * 20))
        
        # Scoring Logic
        score = 0
        score += min(30, (word_count / 500) * 30) # Volume
        score += 30 if 0.5 <= density <= 2.5 else 10 # Density
        score += readability_score * 0.4 # Readability
        
        recommendations = []
        if density < 0.5: recommendations.append(f"Increase '{target_keyword}' frequency.")
        elif density > 3: recommendations.append(f"Reduce '{target_keyword}' to avoid keyword stuffing.")
        if word_count < 300: recommendations.append("Add more depth to reach 300+ words.")
        if not "##" in text: recommendations.append("Use H2 subheadings for better structure.")
        
        return {
            "score": round(score),
            "word_count": word_count,
            "keyword_density": f"{density:.2f}%",
            "readability": "Easy" if readability_score > 60 else "Moderate" if readability_score > 30 else "Hard",
            "recommendations": recommendations,
            "metrics": {
                "density_value": density,
                "readability_value": readability_score,
                "volume_value": word_count
            }
        }

    def generate_headlines(self, topic, audience):
        """Generate high-converting headlines and hooks."""
        headlines = [
            f"The 7 Secrets of {topic} for {audience}",
            f"Why {audience} Need {topic} in 2026",
            f"Mastering {topic}: A Comprehensive Guide for {audience}",
            f"How to Scale {topic} without {audience} Help",
            f"The Missing Link in your {topic} Strategy"
        ]
        hooks = [
            f"Stop ignoring {topic}. Here's why...",
            f"I found the secret to {topic} and it's simpler than you think.",
            f"POV: You're a {audience} and you finally figured out {topic}."
        ]
        return {
            "headlines": headlines,
            "hooks": hooks
        }
