"""
Advanced AI Response Formatting and Quality Enhancement Module
Provides tools for formatting, scoring, and enhancing AI responses
"""

import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass


@dataclass
class FormattedResponse:
    """Structured response with metadata"""
    answer: str
    summary: Optional[str] = None
    details: Optional[str] = None
    confidence: float = 0.85
    sources: List[str] = None
    follow_up_questions: List[str] = None
    word_count: int = 0
    
    def __post_init__(self):
        if self.sources is None:
            self.sources = []
        if self.follow_up_questions is None:
            self.follow_up_questions = []
        self.word_count = len(self.answer.split())


class AIResponseQualityScore:
    """Calculate response quality metrics"""
    
    @staticmethod
    def calculate_confidence(context_relevance: float, answer_length: int, 
                            context_coverage: float) -> float:
        """
        Calculate confidence score (0-1) based on multiple factors
        
        Args:
            context_relevance: 0-1 relevance score
            answer_length: number of words in answer
            context_coverage: how much context was used
        """
        # Base score from relevance
        base_score = context_relevance * 0.7
        
        # Length penalty/boost (longer isn't always better)
        length_score = min(1.0, answer_length / 300) * 0.2  # 300 words is optimal
        
        # Coverage bonus
        coverage_score = context_coverage * 0.1
        
        final_score = base_score + length_score + coverage_score
        return min(1.0, max(0.3, final_score))  # Clamp between 0.3 and 1.0
    
    @staticmethod
    def measure_text_coherence(text: str) -> float:
        """Measure text coherence (0-1)"""
        sentences = re.split(r'[.!?]+', text)
        valid_sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
        
        if not valid_sentences:
            return 0.5
        
        # Check for good sentence length distribution
        lengths = [len(s.split()) for s in valid_sentences]
        avg_length = sum(lengths) / len(lengths)
        
        # Coherence improves with reasonable sentence length
        coherence = min(1.0, avg_length / 20) if avg_length > 0 else 0.5
        return coherence


class ResponseFormatter:
    """Format responses for different purposes"""
    
    @staticmethod
    def truncate_response(text: str, word_limit: int) -> str:
        """Truncate response to word limit with ellipsis"""
        words = text.split()
        if len(words) <= word_limit:
            return text
        
        truncated = ' '.join(words[:word_limit])
        # Find last complete sentence
        last_period = truncated.rfind('.')
        if last_period > word_limit * 0.8:  # If period is reasonably close
            return truncated[:last_period + 1]
        return truncated + "..."
    
    @staticmethod
    def create_short_answer(long_answer: str) -> str:
        """Create concise summary from long answer"""
        sentences = re.split(r'[.!?]+', long_answer)
        valid_sentences = [s.strip() for s in sentences if s.strip()]
        
        # Take first 1-2 sentences
        summary = '. '.join(valid_sentences[:2])
        if summary and not summary.endswith('.'):
            summary += '.'
        
        return summary[:200]  # Max 200 chars
    
    @staticmethod
    def create_detailed_answer(short_answer: str, context_chunks: List[str]) -> str:
        """Expand answer with more context and details"""
        details = short_answer + "\n\n"
        
        # Add key points from context
        details += "**Key Details:**\n"
        for i, chunk in enumerate(context_chunks[:3], 1):
            # Extract first sentence from chunk
            sentences = re.split(r'[.!?]+', chunk)
            if sentences and sentences[0].strip():
                details += f"• {sentences[0].strip()}\n"
        
        return details
    
    @staticmethod
    def extract_sources_from_meta(meta_list: List[Dict]) -> List[str]:
        """Extract unique source filenames from metadata"""
        sources = set()
        for item in meta_list:
            filename = item.get("filename", "Unknown")
            sources.add(filename)
        return sorted(list(sources))
    
    @staticmethod
    def generate_follow_up_questions(query: str, answer: str) -> List[str]:
        """Generate smart follow-up questions based on query and answer"""
        follow_ups = []
        
        # Pattern-based suggestions
        keywords = ["how", "why", "what", "where", "when", "benefits", "cost", "process"]
        
        # Extract key topics from answer
        words = set(answer.lower().split())
        
        # Generate follow-ups
        suggestions = {
            "can you explain": "Can you provide more details about this?",
            "how to": "What are the steps involved?",
            "what is": "What are the benefits of this?",
            "why": "How does this impact my business?",
            "comparison": "What are the key differences?",
        }
        
        # Add relevant follow-ups based on query type
        for keyword, suggestion in suggestions.items():
            if keyword in query.lower():
                follow_ups.append(suggestion)
                if len(follow_ups) >= 3:
                    break
        
        # If we don't have enough, add generic ones
        if len(follow_ups) < 3:
            follow_ups.extend([
                "Can you provide more details about this?",
                "How does this relate to my specific needs?",
                "What are the best practices here?"
            ])
        
        return follow_ups[:3]


class ContextAnalyzer:
    """Analyze context chunks for quality and relevance"""
    
    @staticmethod
    def measure_relevance(query: str, chunks: List[str]) -> Tuple[float, int]:
        """
        Measure how relevant chunks are to query
        Returns: (relevance_score, most_relevant_count)
        """
        if not chunks:
            return 0.0, 0
        
        query_words = set(query.lower().split())
        relevant_count = 0
        total_matches = 0
        
        for chunk in chunks:
            chunk_words = set(chunk.lower().split())
            matches = len(query_words & chunk_words)
            total_matches += matches
            
            if matches > len(query_words) * 0.3:  # More than 30% match
                relevant_count += 1
        
        relevance = min(1.0, total_matches / (len(query_words) * len(chunks))) if query_words else 0.5
        return relevance, relevant_count
    
    @staticmethod
    def calculate_context_coverage(chunks: List[str]) -> float:
        """Calculate how much context we're using (0-1)"""
        if not chunks:
            return 0.0
        
        total_chars = sum(len(c) for c in chunks)
        # Ideal coverage: 1000-5000 chars
        if total_chars < 1000:
            return total_chars / 1000
        elif total_chars > 5000:
            return min(1.0, 5000 / total_chars)
        else:
            return 1.0


def format_response_json(answer: str, sources: List[str] = None, 
                        follow_ups: List[str] = None, 
                        confidence: float = 0.85,
                        answer_type: str = "detailed") -> Dict:
    """Format response for API JSON response"""
    return {
        "answer": answer,
        "sources": sources or [],
        "follow_up_questions": follow_ups or [],
        "confidence": round(confidence, 2),
        "type": answer_type,
        "metadata": {
            "word_count": len(answer.split()),
            "has_sources": len(sources or []) > 0,
            "has_follow_ups": len(follow_ups or []) > 0
        }
    }
