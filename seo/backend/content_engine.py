import random
import datetime

class ContentGenerator:
    def __init__(self):
        self.templates = {
            "blog": {
                "intro": [
                    "In the ever-evolving world of {topic}, staying ahead is crucial.",
                    "Have you ever wondered how {topic} impacts your daily life?",
                    "Mastering {topic} is a game-changer for professionals in the field."
                ],
                "body_paragraphs": [
                    "One key aspect of {topic} is understanding the fundamentals. It serves as the backbone for future growth.",
                    "Another critical factor is the implementation strategy. efficient execution can lead to {benefit}.",
                    "Experts suggest that {topic} will continue to shape the industry landscape for years to come."
                ],
                "conclusion": [
                    "To wrap up, {topic} is an essential skill to cultivate.",
                    "The journey of mastering {topic} is ongoing, but the rewards are substantial.",
                    "Start implementing these {topic} strategies today to see immediate results."
                ]
            }
        }

    def generate_blog(self, topic, tone="professional", length="medium"):
        """Generates a structured blog post."""
        # Simple word count simulation
        target_words = 500 if length == "short" else 1000 if length == "medium" else 1800
        
        intro = random.choice(self.templates["blog"]["intro"]).format(topic=topic)
        body = "\n\n".join([
            f"## The Importance of {topic}\n" + 
            random.choice(self.templates["blog"]["body_paragraphs"]).format(topic=topic, benefit="significant ROI") +
            f"\n\n## Key Strategies for {topic}\n" +
            "1. **Analyze the Data**: Always start with a clear understanding of your metrics.\n" +
            "2. **Optimize Process**: Streamline workflow to ensure efficiency.\n" +
            "3. **Scale Gradually**: Don't rush; build a solid foundation first.\n\n" +
            random.choice(self.templates["blog"]["body_paragraphs"]).format(topic=topic, benefit="enhanced productivity")
        ])
        conclusion = random.choice(self.templates["blog"]["conclusion"]).format(topic=topic)

        # Tone adjustment (simple prefixing)
        tone_prefix = ""
        if tone == "casual":
            tone_prefix = "Hey folks! Let's dive in.\n\n"
        elif tone == "technical":
            tone_prefix = "**Technical Analysis Report**\n\n"

        content = f"# {topic}: A Comprehensive Guide\n\n{tone_prefix}{intro}\n\n{body}\n\n## Conclusion\n{conclusion}"
        
        return {
            "title": f"{topic}: A Comprehensive Guide",
            "content": content,
            "meta_description": f"Learn everything about {topic} in this detailed guide. Expert tips and strategies included.",
            "estimated_read_time": f"{target_words // 200} min read"
        }

    def generate_social_posts(self, platform, topic, count=3):
        """Generates social media posts."""
        hashtags = f"#{topic.replace(' ', '')} #{topic.split()[0]}Tips #Growth #Success"
        posts = []
        for i in range(count):
            if platform == "twitter":
                posts.append(f"🚀 Mastering {topic} is key to success in 2025! Here's why... 🧵👇 {hashtags}")
            elif platform == "linkedin":
                posts.append(f"I've been reflecting on the impact of {topic} recently.\n\nIt's clear that organizations prioritizing this are seeing massive gains.\n\nWhat's your experience with {topic}? Let's discuss in the comments! 👇\n\n{hashtags}")
            elif platform == "instagram":
                posts.append(f"✨ {topic} Vibes ✨\n\nDouble tap if you agree! ❤️\n\nLink in bio for more info.\n.\n.\n.\n{hashtags}")
            else:
                posts.append(f"New update on {topic}! Check it out. {hashtags}")
        return posts

    def generate_video_ideas(self, niche):
        """Generates video ideas."""
        titles = [
            f"How to Master {niche} in 10 Minutes",
            f"The TRUTH About {niche} (Must Watch)",
            f"5 Common Mistakes Beginners Make in {niche}",
            f"{niche} Tutorial for Beginners 2025",
            f"I Tried {niche} for 30 Days - Here's What Happened"
        ]
        ideas = []
        for t in titles:
            ideas.append({
                "title": t,
                "hook": f"Stop doing {niche} wrong! In this video, I'll show you the secret...",
                "thumbnail_text": f"Master {niche} FAST"
            })
        return ideas

    def analyze_seo(self, text):
        """Simple SEO analysis."""
        word_count = len(text.split())
        words = text.lower().split()
        # Mock keyword density
        keywords = {}
        for w in words:
            if len(w) > 4:
                keywords[w] = keywords.get(w, 0) + 1
        
        top_keywords = sorted(keywords.items(), key=lambda x: x[1], reverse=True)[:5]
        
        score = min(100, max(50, word_count // 5)) # Mock score logic
        
        suggestions = []
        if word_count < 300:
            suggestions.append("Content is too short. Aim for at least 300 words.")
        if not "##" in text:
            suggestions.append("Use subheadings (H2, H3) to structure your content.")
        
        return {
            "score": score,
            "word_count": word_count,
            "readability": "Good",
            "top_keywords": top_keywords,
            "suggestions": suggestions
        }

    def suggest_keywords(self, seed_keyword):
        """Generates keyword suggestions."""
        modifiers = ["best", "guide", "tutorial", "strategies", "for beginners", "2025", "tools", "benefits"]
        suggestions = []
        for mod in modifiers:
            kw = f"{seed_keyword} {mod}" if random.random() > 0.5 else f"{mod} {seed_keyword}"
            suggestions.append({
                "keyword": kw,
                "volume": random.randint(100, 50000),
                "difficulty": random.randint(10, 90),
                "cpc": round(random.uniform(0.5, 15.0), 2)
            })
        return sorted(suggestions, key=lambda x: x['volume'], reverse=True)
