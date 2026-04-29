import torch
from transformers import pipeline
from detoxify import Detoxify
from nrclex import NRCLex
from keybert import KeyBERT
import pandas as pd
import numpy as np
from typing import List, Dict, Any
import re
from datetime import datetime
import logging
from tqdm import tqdm
import os

logger = logging.getLogger(__name__)

class AdvancedYouTubeAnalyzer:
    def __init__(self):
        logger.info("Initializing Advanced YouTube Analyzer Models...")
        
        self.sentiment_pipe = None
        self.detox_model = None
        self.kw_model = None
        
        # Set transformers cache to avoid network issues
        os.environ['HF_HOME'] = os.path.expanduser('~/.cache/huggingface')
        
        # Load Sentiment Model (Local BERT)
        try:
            logger.info("Loading BERT sentiment model...")
            self.sentiment_pipe = pipeline(
                "sentiment-analysis", 
                model="nlptown/bert-base-multilingual-uncased-sentiment",
                device=0 if torch.cuda.is_available() else -1
            )
            logger.info("✓ BERT sentiment model loaded")
        except Exception as e:
            logger.error(f"Failed to load BERT sentiment model: {e}")
            self.sentiment_pipe = None

        # Load Toxicity Model (Local Detoxify)
        try:
            logger.info("Loading Detoxify model...")
            self.detox_model = Detoxify('original', device='cuda' if torch.cuda.is_available() else 'cpu')
            logger.info("✓ Detoxify model loaded")
        except Exception as e:
            logger.error(f"Failed to load Detoxify model: {e}")
            self.detox_model = None

        # Load KeyBERT
        try:
            logger.info("Loading KeyBERT model...")
            self.kw_model = KeyBERT()
            logger.info("✓ KeyBERT model loaded")
        except Exception as e:
            logger.error(f"Failed to load KeyBERT: {e}")
            self.kw_model = None

    def analyze_comments(self, comments: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Deep analysis of YouTube comments using local ML models."""
        if not comments:
            return self._empty_response()

        processed_data = []
        sentiment_scores = []
        emotions_agg = {}
        toxicity_agg = {
            'toxicity': [], 'severe_toxicity': [], 'obscene': [], 
            'threat': [], 'insult': [], 'identity_attack': []
        }
        
        spam_count = 0
        toxic_count = 0
        
        all_text = [c.get('text', '') for c in comments][:200] # Increased from 100 to 200
        
        # 1. Sentiment Analysis
        sentiment_results = []
        if self.sentiment_pipe:
            sentiment_results = self.sentiment_pipe(all_text)

        # 2. Toxicity Analysis
        detox_results = {}
        if self.detox_model:
            detox_results = self.detox_model.predict(all_text)

        # 3. Process Individual Comments
        for i, comment in enumerate(comments[:200]): # Increased from 100 to 200
            text = comment.get('text', '')
            
            # Sentiment mapping (nlptown returns 1-5 stars)
            score_map = {"1 star": -1, "2 stars": -0.5, "3 stars": 0, "4 stars": 0.5, "5 stars": 1}
            s_label = sentiment_results[i]['label'] if i < len(sentiment_results) else "3 stars"
            s_score = score_map.get(s_label, 0)
            sentiment_scores.append(s_score)

            # Toxicity
            is_toxic = False
            if detox_results:
                t_score = detox_results['toxicity'][i]
                if t_score > 0.5:
                    is_toxic = True
                    toxic_count += 1
                for key in toxicity_agg:
                    toxicity_agg[key].append(detox_results[key][i])

            # Emotions (NRClex)
            emotion = NRCLex(text)
            for emo_name, emo_val in emotion.affect_frequencies.items():
                emotions_agg[emo_name] = emotions_agg.get(emo_name, 0) + emo_val

            # Spam Detection (simplified)
            if self._is_spam(text):
                spam_count += 1

            processed_data.append({
                **comment,
                "sentiment_label": "Positive" if s_score > 0 else "Negative" if s_score < 0 else "Neutral",
                "sentiment_score": s_score,
                "is_toxic": is_toxic,
                "influence_points": comment.get('likes', 0) * (2 if s_score > 0 else 1)
            })

        # 4. Keyword Extraction (Global)
        full_blob = " ".join(all_text)
        keywords = []
        if self.kw_model:
            keywords = self.kw_model.extract_keywords(full_blob, keyphrase_ngram_range=(1, 2), stop_words='english', top_n=15)

        # 5. Influencer Report
        influencers = self._generate_influencer_report(processed_data)

        # 6. Trend Analysis
        trends = self._calculate_trends(processed_data)

        # Calculate Averages
        avg_sentiment = np.mean(sentiment_scores) if sentiment_scores else 0
        reputation_score = (avg_sentiment + 1) * 50 # 0-100 scale
        
        toxic_summary = {k: np.mean(v) if v else 0 for k, v in toxicity_agg.items()}

        return {
            "sentiment_score": round(reputation_score, 2),
            "reputation_score": round(reputation_score * (1 - toxic_summary['toxicity']), 2),
            "stats": {
                "positive": len([s for s in sentiment_scores if s > 0]),
                "negative": len([s for s in sentiment_scores if s < 0]),
                "neutral": len([s for s in sentiment_scores if s == 0]),
                "total": len(comments),
                "spam_count": spam_count,
                "toxic_count": toxic_count
            },
            "toxicity_summary": toxic_summary,
            "emotion_distribution": [{"name": k, "value": int(v)} for k, v in emotions_agg.items() if v > 0],
            "top_keywords": [{"text": k, "value": float(v)} for k, v in keywords],
            "influencer_report": influencers,
            "trend_analysis": trends,
            "top_comments": {
                "positive": sorted([p for p in processed_data if p['sentiment_score'] > 0], key=lambda x: x['influence_points'], reverse=True)[:5],
                "negative": sorted([p for p in processed_data if p['sentiment_score'] < 0], key=lambda x: x['influence_points'], reverse=True)[:5]
            },
            "ai_summary": self._generate_summary(reputation_score, toxic_summary['toxicity'], len(comments))
        }

    def _is_spam(self, text: str) -> bool:
        doc = text.lower()
        spam_signals = ['win', 'free', 'money', 'crypto', 'dm', 'check bio', 'earn', 'gift']
        count = sum(1 for s in spam_signals if s in doc)
        return count >= 2 or len(re.findall(r'http[s]?://', doc)) > 0

    def _generate_influencer_report(self, data: List[Dict]) -> List[Dict]:
        user_stats = {}
        for c in data:
            user = c['username']
            if user not in user_stats:
                user_stats[user] = {'likes': 0, 'comments': 0, 'sentiments': []}
            user_stats[user]['likes'] += c.get('likes', 0)
            user_stats[user]['comments'] += 1
            user_stats[user]['sentiments'].append(c['sentiment_score'])
        
        report = []
        for user, stats in user_stats.items():
            avg_s = np.mean(stats['sentiments'])
            inf_score = (stats['likes'] * 10) + (stats['comments'] * 5)
            report.append({
                "username": user,
                "likes": stats['likes'],
                "total_comments": stats['comments'],
                "avg_sentiment": float(avg_s),
                "influence_score": float(inf_score)
            })
        
        return sorted(report, key=lambda x: x['influence_score'], reverse=True)[:10]

    def _calculate_trends(self, data: List[Dict]) -> List[Dict]:
        # Simple simulated trend based on index if timestamps are not detailed
        # In a real scenario, we'd group by actual datetime
        chunks = np.array_split(data, min(len(data), 10))
        trends = []
        for i, chunk in enumerate(chunks):
            avg_s = np.mean([c['sentiment_score'] for c in chunk]) if len(chunk) > 0 else 0
            trends.append({"time": f"Phase {i+1}", "score": (avg_s + 1) * 50})
        return trends

    def _generate_summary(self, rep_score, toxicity, total) -> str:
        tone = "excellent" if rep_score > 80 else "positive" if rep_score > 60 else "neutral" if rep_score > 40 else "poor"
        tox_level = "low" if toxicity < 0.1 else "moderate" if toxicity < 0.3 else "high"
        
        return f"Overall brand reputation is {tone} based on {total} comments. Toxicity levels are {tox_level}. " \
               f"Strategic focus should be on engaging top influencers identified in the report."

    def _empty_response(self) -> Dict:
        return {
            "sentiment_score": 0, "reputation_score": 0,
            "stats": {"positive": 0, "negative": 0, "neutral": 0, "total": 0, "spam_count": 0, "toxic_count": 0},
            "toxicity_summary": {k: 0 for k in ['toxicity', 'severe_toxicity', 'obscene', 'threat', 'insult', 'identity_attack']},
            "emotion_distribution": [], "top_keywords": [], "influencer_report": [], "trend_analysis": [],
            "top_comments": {"positive": [], "negative": []}, "ai_summary": "No comments provided."
        }
