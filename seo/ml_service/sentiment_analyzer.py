from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob
from typing import List, Dict, Any
import re
from datetime import datetime

class SentimentAnalyzer:
    def __init__(self):
        self.analyzer = SentimentIntensityAnalyzer()
        self.spam_keywords = ['win', 'free', 'money', 'crypto', 'dm', 'follow back', 'check bio', 'earn']

    def analyze_sentiment(self, comments: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Performs advanced sentiment analysis on a list of comments."""
        processed_comments = []
        positive_count = 0
        negative_count = 0
        neutral_count = 0
        total_sentiment_score = 0
        
        # Keyword extraction helpers
        keywords_map = {}
        emotions_map = {"Joy": 0, "Surprise": 0, "Anger": 0, "Sadness": 0, "Fear": 0}

        for comment in comments:
            text = comment.get('text', '')
            if self._is_spam(text):
                continue

            # VADER Analysis
            vs = self.analyzer.polarity_scores(text)
            compound = vs['compound'] # -1 to 1
            
            # TextBlob for objectivity/subjectivity
            blob = TextBlob(text)
            
            sentiment = "Neutral"
            if compound >= 0.05:
                sentiment = "Positive"
                positive_count += 1
            elif compound <= -0.05:
                sentiment = "Negative"
                negative_count += 1
            else:
                neutral_count += 1
            
            total_sentiment_score += (compound + 1) * 50 # 0-100 scale

            # Extract keywords (simple implementation)
            words = re.findall(r'\b\w{4,}\b', text.lower())
            for word in words:
                if word not in self.spam_keywords:
                    keywords_map[word] = keywords_map.get(word, 0) + 1

            # Simple Emotion Detection
            if compound > 0.5: emotions_map["Joy"] += 1
            elif compound < -0.5: emotions_map["Anger"] += 1
            elif "?" in text: emotions_map["Surprise"] += 1

            processed_comments.append({
                **comment,
                "sentiment": sentiment,
                "score": compound,
                "subjectivity": blob.sentiment.subjectivity
            })

        total_valid = len(processed_comments)
        avg_sentiment = (total_sentiment_score / total_valid) if total_valid > 0 else 50
        
        # Reputation Score calculation
        reputation_score = (positive_count / total_valid * 100) if total_valid > 0 else 50
        
        # Format Top Comments
        top_positive = sorted(processed_comments, key=lambda x: x['score'], reverse=True)[:3]
        most_negative = sorted(processed_comments, key=lambda x: x['score'])[:3]
        most_liked = sorted(processed_comments, key=lambda x: x.get('likes', 0), reverse=True)[:3]

        # Trend Data (Sample hourly distribution)
        trend_graph = [
            {"time": "10:00", "score": avg_sentiment - 5},
            {"time": "12:00", "score": avg_sentiment + 2},
            {"time": "14:00", "score": avg_sentiment},
            {"time": "16:00", "score": avg_sentiment + 5},
            {"time": "18:00", "score": avg_sentiment - 2},
        ]

        # Keyword Cloud data
        keyword_cloud = [{"text": k, "value": v} for k, v in sorted(keywords_map.items(), key=lambda x: x[1], reverse=True)[:20]]

        return {
            "sentiment_score": round(avg_sentiment, 2),
            "reputation_score": round(reputation_score, 2),
            "stats": {
                "positive": positive_count,
                "negative": negative_count,
                "neutral": neutral_count,
                "total": total_valid
            },
            "breakdown": {
                "distribution": [
                    {"name": "Positive", "value": positive_count},
                    {"name": "Negative", "value": negative_count},
                    {"name": "Neutral", "value": neutral_count},
                ],
                "emotions": [{"name": k, "value": v} for k, v in emotions_map.items()],
                "keywords": keyword_cloud
            },
            "trend_graph": trend_graph,
            "top_comments": {
                "positive": top_positive,
                "negative": most_negative,
                "liked": most_liked
            },
            "ai_summary": self._generate_summary(positive_count, negative_count, total_valid, avg_sentiment)
        }

    def _is_spam(self, text: str) -> bool:
        doc = text.lower()
        count = 0
        for word in self.spam_keywords:
            if word in doc:
                count += 1
        return count >= 2 or len(re.findall(r'http[s]?://', doc)) > 0

    def _generate_summary(self, pos, neg, total, score) -> str:
        if total == 0: return "No data available for analysis."
        
        tone = "highly positive" if score > 75 else "generally positive" if score > 60 else "neutral" if score > 40 else "concerning"
        summary = f"The analysis of {total} comments reveals a {tone} audience sentiment (Score: {score}/100). "
        
        if pos > neg:
            summary += f"Positive feedback outweighs negative mentions by {pos - neg}. "
            summary += "Audience seems engaged and satisfied with the content."
        else:
            summary += "There is significant negative feedback that may require immediate attention to protect brand reputation."
            
        return summary
