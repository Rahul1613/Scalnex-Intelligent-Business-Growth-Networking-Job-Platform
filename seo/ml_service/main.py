from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fusion import MultimodalPredictor
from sentiment_analyzer import SentimentAnalyzer
from advanced_analyzer import AdvancedYouTubeAnalyzer
from model import ReachOptimizer
from schemas import (
    PredictionInput, PredictionOutput, TrainInput, 
    ContentAnalysisResult, SentimentAnalysisInput, 
    SentimentAnalysisResult, AdvancedSentimentAnalysisResult
)
import uvicorn
import logging
import shutil
import os
import tempfile

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global model instances
reach_optimizer = None
content_predictor = None
sentiment_analyzer = None
advanced_analyzer = None

# Startup/Shutdown Event
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global reach_optimizer, content_predictor, sentiment_analyzer, advanced_analyzer
    logger.info("Starting up... Initializing ML models...")
    try:
        reach_optimizer = ReachOptimizer()
        logger.info("✓ Reach Optimizer loaded")
    except Exception as e:
        logger.warning(f"Failed to load Reach Optimizer: {e}")
    
    try:
        content_predictor = MultimodalPredictor()
        logger.info("✓ Content Predictor loaded")
    except Exception as e:
        logger.warning(f"Failed to load Content Predictor: {e}")
    
    try:
        sentiment_analyzer = SentimentAnalyzer()
        logger.info("✓ Sentiment Analyzer loaded")
    except Exception as e:
        logger.warning(f"Failed to load Sentiment Analyzer: {e}")
    
    try:
        advanced_analyzer = AdvancedYouTubeAnalyzer()
        logger.info("✓ Advanced Analyzer loaded")
    except Exception as e:
        logger.warning(f"Failed to load Advanced Analyzer: {e}")
    
    logger.info("All models initialized successfully!")
    yield
    
    # Shutdown
    logger.info("Shutting down...")

app = FastAPI(
    title="AI Social & Content Intelligence Engine", 
    version="2.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AI Engine Running (Reach Optimization + Content Intelligence)"}

@app.get("/health")
def health_check():
    return {
        "status": "healthy", 
        "reach_model": reach_optimizer.model is not None,
        "content_model": content_predictor.model is not None,
        "sentiment_vader": sentiment_analyzer.analyzer is not None,
        "sentiment_bert": advanced_analyzer.sentiment_pipe is not None,
        "detoxify_model": advanced_analyzer.detox_model is not None,
        "keybert_model": advanced_analyzer.kw_model is not None
    }

# --- Reach Optimization Endpoints ---
@app.post("/predict", response_model=PredictionOutput)
def predict_reach(input_data: PredictionInput):
    try:
        return reach_optimizer.predict(input_data)
    except Exception as e:
        logger.error(f"Reach Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Content Intelligence Endpoints ---
@app.post("/analyze", response_model=ContentAnalysisResult)
def analyze_content(
    file: UploadFile = File(...),
    platform: str = Form(...),
    budget: float = Form(...),
    caption: str = Form(""),
    audience_size: str = Form("Medium")
):
    try:
        # Save uploaded file temporarily
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name
            
        logger.info(f"Analyzing file: {tmp_path} for platform: {platform}")
        
        metadata = {
            "platform": platform,
            "budget": budget,
            "caption": caption,
            "audience_size": audience_size
        }
        
        result = content_predictor.predict(tmp_path, metadata)
        
        # Cleanup
        os.unlink(tmp_path)
        
        return result
        
    except Exception as e:
        logger.error(f"Content Analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Sentiment & Reputation Analyzer Endpoints ---
@app.post("/sentiment/analyze", response_model=SentimentAnalysisResult)
def analyze_sentiment(input_data: SentimentAnalysisInput):
    try:
        logger.info(f"Analyzing sentiment for: {input_data.url}")
        result = sentiment_analyzer.analyze_sentiment(input_data.comments)
        return result
    except Exception as e:
        logger.error(f"Sentiment Analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/sentiment/advanced", response_model=AdvancedSentimentAnalysisResult)
def analyze_advanced_sentiment(input_data: SentimentAnalysisInput):
    try:
        logger.info(f"Deep Analysis requested for: {input_data.url}")
        result = advanced_analyzer.analyze_comments(input_data.comments)
        return result
    except Exception as e:
        logger.error(f"Advanced Sentiment Analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
