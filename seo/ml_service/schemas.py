from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

# --- Reach Optimization Schemas ---
class PredictionInput(BaseModel):
    platform: str = Field(..., description="Platform like Google, Instagram, Facebook, etc.")
    budget: float = Field(..., gt=0, description="Ad budget amount")
    industry: str = Field(..., description="Target industry")
    audience_size: str = Field(..., description="Target audience size (e.g., Small, Medium, Large)")
    ad_type: str = Field(..., description="Type of ad (Video, Image, Carousel)")
    caption: str = Field(..., description="Ad caption text")
    hashtags: str = Field("", description="Comma separated hashtags")

class OptimizationSuggestion(BaseModel):
    category: str
    suggestion: str
    impact: str = "High"

class PredictionOutput(BaseModel):
    estimated_reach: int
    estimated_impressions: int
    engagement_rate: float
    ctr: float
    confidence_score: float
    reach_trend_graph: List[Dict[str, Any]]
    budget_reach_graph: List[Dict[str, Any]]
    platform_comparison_graph: List[Dict[str, Any]]
    insights: List[str]
    optimization_suggestions: List[OptimizationSuggestion]

class TrainInput(BaseModel):
    data_path: Optional[str] = None

# --- Content Intelligence Schemas ---

class ContentAnalysisResult(BaseModel):
    # Predictions
    predicted_reach: int
    predicted_engagement_rate: float
    viral_probability: float # 0-1 score
    
    # Analysis
    visual_impact_score: float # 0-10
    text_impact_score: float # 0-10
    
    # Graphs
    engagement_trend_graph: List[Dict[str, Any]]
    platform_comparison_graph: List[Dict[str, Any]]
    
    # Recommendations
    caption_suggestions: List[str]
    hashtag_recommendations: List[str]
    posting_time_suggestion: str
    thumbnail_improvement: Optional[str] = None
    
    explanation: str
    confidence_score: float

# --- Sentiment & Reputation Analyzer Schemas ---

class SentimentAnalysisInput(BaseModel):
    url: str = Field(..., description="Public social media URL")
    platform: str = Field(..., description="Platform (instagram, youtube, facebook, google_reviews)")
    comments: List[Dict[str, Any]] = Field(..., description="List of comment objects with text, username, and timestamp")

class SentimentStats(BaseModel):
    positive: int
    negative: int
    neutral: int
    total: int

class SentimentBreakdown(BaseModel):
    distribution: List[Dict[str, Any]] # For Pie Chart
    emotions: List[Dict[str, Any]] # For Emotion Distribution
    keywords: List[Dict[str, Any]] # For Keyword Cloud

class AdvancedSentimentStats(BaseModel):
    positive: int
    negative: int
    neutral: int
    total: int
    spam_count: int
    toxic_count: int

class EmotionScore(BaseModel):
    name: str
    value: int

class ToxicityScores(BaseModel):
    toxicity: float
    severe_toxicity: float
    obscene: float
    threat: float
    insult: float
    identity_attack: float

class InfluencerInfo(BaseModel):
    username: str
    likes: int
    total_comments: int
    avg_sentiment: float
    influence_score: float

class AdvancedSentimentAnalysisResult(BaseModel):
    sentiment_score: float # 0-100
    reputation_score: float # 0-100
    stats: AdvancedSentimentStats
    toxicity_summary: ToxicityScores
    emotion_distribution: List[EmotionScore]
    top_keywords: List[Dict[str, Any]]
    influencer_report: List[InfluencerInfo]
    trend_analysis: List[Dict[str, Any]]
    top_comments: Dict[str, List[Dict[str, Any]]] # positive, negative
    ai_summary: str
    report_urls: Dict[str, str] = {} # Excel, PDF placeholders

class SentimentAnalysisResult(BaseModel):
    sentiment_score: float # 0-100
    reputation_score: float # 0-100
    stats: SentimentStats
    breakdown: SentimentBreakdown
    trend_graph: List[Dict[str, Any]]
    top_comments: Dict[str, List[Dict[str, Any]]] # Updated to Dict for consistency
    ai_summary: str
    is_real_time: bool = True
