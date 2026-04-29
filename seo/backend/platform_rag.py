import os
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from google import genai
from dotenv import load_dotenv
from typing import Dict, List

# Try to import advanced formatter
try:
    from ai_response_formatter import (
        ResponseFormatter, ContextAnalyzer, AIResponseQualityScore
    )
except ImportError:
    ResponseFormatter = None
    ContextAnalyzer = None
    AIResponseQualityScore = None

load_dotenv()
API_KEY = (os.getenv("GEMINI_API_KEY") or os.getenv("SOCIAL_API_KEY") or "").strip().strip('"').strip("'")

# Global variables
_embedder = None
_index = None
_chunks = []

def get_embedder():
    global _embedder
    if _embedder is None:
        _embedder = SentenceTransformer('all-MiniLM-L6-v2')
    return _embedder

def setup_platform_rag():
    global _index, _chunks
    
    # We only initialize once
    if _index is not None and len(_chunks) > 0:
        return
        
    rag_file = os.path.join('rag_data', 'project_info.txt')
    if not os.path.exists(rag_file):
        print(f"Warning: {rag_file} not found. Platform RAG will be empty.")
        return
        
    with open(rag_file, 'r', encoding='utf-8') as f:
        text = f.read()
        
    # Split by double newline to keep logical paragraphs/features together
    raw_chunks = [c.strip() for c in text.split('\n\n') if c.strip()]
    _chunks = raw_chunks
    
    if not _chunks:
        return
        
    embedder = get_embedder()
    embeddings = embedder.encode(_chunks)
    embeddings = np.array(embeddings).astype('float32')
    
    dim = embeddings.shape[1]
    _index = faiss.IndexFlatL2(dim)
    _index.add(embeddings)
    
    # Optionally save to vector_db/project.index if we want persistence across reboots
    os.makedirs('vector_db', exist_ok=True)
    faiss.write_index(_index, os.path.join('vector_db', 'project.index'))

def ask_platform_query(query_text):
    global _index, _chunks
    
    # Ensure index exists
    if _index is None:
        setup_platform_rag()
        
    if _index is None or _index.ntotal == 0:
        return "I am currently disconnected from the platform knowledge base."
        
    embedder = get_embedder()
    query_emb = embedder.encode([query_text])
    query_emb = np.array(query_emb).astype('float32')
    
    # Search top 2 most relevant chunks
    k = min(2, _index.ntotal)
    distances, indices = _index.search(query_emb, k)
    
    context_text = "\n".join([_chunks[idx] for idx in indices[0] if idx >= 0])
    
    prompt = f"""
    You are the official Scalnex (Scalnex) AI Assistant.
    Your ONLY job is to answer questions strictly about the Scalnex platform and its features. 
    Use the provided platform context to answer the user's question accurately.

    CRITICAL RULES:
    1. Your answer MUST be extremely short, strictly 1 or 2 sentences maximum.
    2. Do NOT provide lists, bullet points, or long explanations.
    3. If the user asks something completely unrelated to the platform or context (e.g. general math, coding, generic knowledge), politely redirect them back to platform discussion.

    CONTEXT:
    {context_text}
    
    QUESTION:
    {query_text}
    
    SHORT ANSWER:
    """
    
    try:
        if not API_KEY:
            return "I'm having trouble connecting to my central brain right now."
        client = genai.Client(api_key=API_KEY)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        return (response.text or "").strip()
    except Exception as e:
        print(f"Platform RAG Gemini Error: {e}")
        return "I'm having trouble connecting to my central brain right now."


def ask_platform_query_advanced(query_text: str, answer_type: str = "short") -> Dict:
    """
    Advanced platform query with rich metadata and suggestions.
    
    Args:
        query_text: User question about the platform
        answer_type: "short" or "detailed"
    
    Returns:
        Dict with answer, follow-ups, confidence, and metadata
    """
    global _index, _chunks
    
    # Ensure index exists
    if _index is None:
        setup_platform_rag()
        
    if _index is None or _index.ntotal == 0:
        return {
            "answer": "I'm currently disconnected from the platform knowledge base.",
            "confidence": 0.0,
            "follow_up_questions": [],
            "answer_type": "error",
            "metadata": {"chunks_used": 0}
        }
    
    embedder = get_embedder()
    query_emb = embedder.encode([query_text])
    query_emb = np.array(query_emb).astype('float32')
    
    # Search for relevant chunks
    k = min(3, _index.ntotal)
    distances, indices = _index.search(query_emb, k)
    
    # Collect context chunks
    context_chunks = []
    for idx in indices[0]:
        if idx >= 0 and idx < len(_chunks):
            context_chunks.append(_chunks[idx])
    
    context_text = "\n".join(context_chunks)
    
    # Generate appropriate prompt based on answer_type
    brevity_instruction = "Keep your answer to 1-2 sentences maximum." if answer_type == "short" else "Provide a clear, well-explained answer in 2-3 sentences."
    
    prompt = f"""
You are the official Scalnex AI Assistant.
Your ONLY job is to answer questions strictly about the Scalnex platform and its features.
{brevity_instruction}

Use the provided platform context to answer accurately. If the user asks something unrelated to the platform, politely redirect them.

CONTEXT:
{context_text}

QUESTION:
{query_text}

ANSWER:
"""
    
    try:
        if not API_KEY:
            return {
                "answer": "I'm having trouble connecting to my central brain right now.",
                "confidence": 0.0,
                "follow_up_questions": [],
                "answer_type": "error"
            }
        
        client = genai.Client(api_key=API_KEY)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        answer = (response.text or "").strip()
        
        # Calculate quality metrics
        confidence = 0.85
        follow_ups = []
        
        if ResponseFormatter and ContextAnalyzer and AIResponseQualityScore:
            try:
                # Measure relevance and coverage
                relevance, _ = ContextAnalyzer.measure_relevance(query_text, context_chunks)
                context_coverage = ContextAnalyzer.calculate_context_coverage(context_chunks)
                
                # Calculate confidence
                confidence = AIResponseQualityScore.calculate_confidence(
                    relevance,
                    len(answer.split()),
                    context_coverage
                )
                
                # Generate follow-up questions
                follow_ups = ResponseFormatter.generate_follow_up_questions(query_text, answer)
                
            except Exception as e:
                print(f"Error in quality metrics: {e}")
        
        return {
            "answer": answer,
            "confidence": round(confidence, 2),
            "follow_up_questions": follow_ups,
            "answer_type": answer_type,
            "metadata": {
                "word_count": len(answer.split()),
                "chunks_used": len(context_chunks),
                "has_follow_ups": len(follow_ups) > 0
            }
        }
        
    except Exception as e:
        print(f"Platform RAG Gemini Error: {e}")
        return {
            "answer": "I'm having trouble connecting to my central brain right now.",
            "confidence": 0.0,
            "follow_up_questions": ["Try asking about our main features or getting started"],
            "answer_type": "error"
        }

