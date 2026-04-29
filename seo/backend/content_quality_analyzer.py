"""
Content Quality & User Intent Analyzer
Analyzes content quality, user intent matching, readability, and content structure
"""
import re
from bs4 import BeautifulSoup
import textstat
from collections import Counter
import logging

logger = logging.getLogger(__name__)

class ContentQualityAnalyzer:
    def __init__(self, soup, url):
        self.soup = soup
        self.url = url
    
    def analyze(self):
        """Comprehensive content quality analysis"""
        text = self.soup.get_text(separator=' ', strip=True)
        text_lower = text.lower()
        
        # Extract main content (remove nav, footer, scripts, etc.)
        main_content = self._extract_main_content()
        
        analysis = {
            'user_intent': self._analyze_user_intent(main_content),
            'content_quality': self._analyze_content_quality(main_content),
            'readability': self._analyze_readability(main_content),
            'structure': self._analyze_structure(),
            'topic_coverage': self._analyze_topic_coverage(main_content),
            'score': 0
        }
        
        # Calculate overall content quality score
        analysis['score'] = self._calculate_content_score(analysis)
        
        return analysis
    
    def _extract_main_content(self):
        """Extract main content, excluding navigation, footer, etc."""
        # Remove script and style elements
        for script in self.soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()
        
        # Try to find main content area
        main = self.soup.find('main') or self.soup.find('article') or self.soup.find('div', class_=re.compile(r'content|main|post|article', re.I))
        
        if main:
            return main.get_text(separator=' ', strip=True)
        else:
            return self.soup.get_text(separator=' ', strip=True)
    
    def _analyze_user_intent(self, content):
        """Analyze if content matches user search intent"""
        intent_signals = {
            'informational': 0,
            'transactional': 0,
            'navigational': 0,
            'commercial': 0
        }
        
        content_lower = content.lower()
        
        # Informational intent signals
        informational_keywords = ['what', 'how', 'why', 'when', 'where', 'guide', 'tutorial', 'explain', 'learn', 'understand', 'definition', 'meaning']
        for keyword in informational_keywords:
            intent_signals['informational'] += content_lower.count(keyword)
        
        # Transactional intent signals
        transactional_keywords = ['buy', 'purchase', 'order', 'price', 'cost', 'discount', 'deal', 'sale', 'shop', 'cart', 'checkout']
        for keyword in transactional_keywords:
            intent_signals['transactional'] += content_lower.count(keyword)
        
        # Commercial intent signals
        commercial_keywords = ['best', 'top', 'review', 'compare', 'vs', 'alternative', 'recommend', 'should i']
        for keyword in commercial_keywords:
            intent_signals['commercial'] += content_lower.count(keyword)
        
        # Determine primary intent
        primary_intent = max(intent_signals, key=intent_signals.get)
        intent_confidence = intent_signals[primary_intent] / max(sum(intent_signals.values()), 1) * 100
        
        return {
            'primary_intent': primary_intent,
            'intent_confidence': round(intent_confidence, 1),
            'signals': intent_signals,
            'matches_intent': intent_confidence > 30  # At least 30% confidence
        }
    
    def _analyze_content_quality(self, content):
        """Analyze content quality metrics"""
        words = content.split()
        word_count = len(words)
        sentences = re.split(r'[.!?]+', content)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        # Check for original content indicators
        unique_phrases = len(set(words))
        uniqueness_ratio = unique_phrases / max(word_count, 1)
        
        # Check for helpful content indicators
        helpful_indicators = ['example', 'tip', 'step', 'benefit', 'advantage', 'important', 'note', 'remember']
        helpful_count = sum(1 for word in words if word.lower() in helpful_indicators)
        
        # Paragraph analysis
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
        avg_paragraph_length = sum(len(p.split()) for p in paragraphs) / max(len(paragraphs), 1)
        
        # List detection
        lists = self.soup.find_all(['ul', 'ol'])
        list_count = len(lists)
        
        return {
            'word_count': word_count,
            'sentence_count': len(sentences),
            'avg_sentence_length': round(sum(len(s.split()) for s in sentences) / max(len(sentences), 1), 1),
            'uniqueness_ratio': round(uniqueness_ratio * 100, 1),
            'helpful_indicators': helpful_count,
            'paragraph_count': len(paragraphs),
            'avg_paragraph_length': round(avg_paragraph_length, 1),
            'list_count': list_count,
            'has_lists': list_count > 0,
            'is_original': uniqueness_ratio > 0.5,
            'is_helpful': helpful_count > 5
        }
    
    def _analyze_readability(self, content):
        """Analyze readability metrics"""
        try:
            # Flesch Reading Ease (0-100, higher is easier)
            flesch_ease = textstat.flesch_reading_ease(content[:5000])
            
            # Flesch-Kincaid Grade Level
            fk_grade = textstat.flesch_kincaid_grade(content[:5000])
            
            # Average Sentence Length
            sentences = re.split(r'[.!?]+', content)
            sentences = [s.strip() for s in sentences if s.strip()]
            avg_sentence_length = sum(len(s.split()) for s in sentences) / max(len(sentences), 1)
            
            # Determine readability level
            if flesch_ease >= 70:
                readability_level = 'Easy'
            elif flesch_ease >= 50:
                readability_level = 'Medium'
            else:
                readability_level = 'Difficult'
            
            return {
                'flesch_reading_ease': round(flesch_ease, 1),
                'flesch_kincaid_grade': round(fk_grade, 1),
                'avg_sentence_length': round(avg_sentence_length, 1),
                'readability_level': readability_level,
                'is_readable': flesch_ease >= 50,  # Good readability threshold
                'recommended_grade_level': f"Grade {int(fk_grade)}"
            }
        except Exception as e:
            logger.error(f"Readability analysis error: {e}")
            return {
                'flesch_reading_ease': 'N/A',
                'flesch_kincaid_grade': 'N/A',
                'readability_level': 'Unknown',
                'is_readable': False
            }
    
    def _analyze_structure(self):
        """Analyze content structure"""
        # Heading hierarchy
        headings = {}
        for level in range(1, 7):
            headings[f'h{level}'] = len(self.soup.find_all(f'h{level}'))
        
        # Check heading hierarchy is logical
        has_h1 = headings['h1'] > 0
        has_h2 = headings['h2'] > 0
        proper_hierarchy = has_h1 and (headings['h1'] == 1)
        
        # Paragraph structure
        paragraphs = self.soup.find_all('p')
        short_paragraphs = sum(1 for p in paragraphs if len(p.get_text().split()) < 50)
        long_paragraphs = sum(1 for p in paragraphs if len(p.get_text().split()) > 150)
        
        # Lists
        lists = self.soup.find_all(['ul', 'ol'])
        
        # Images with proper structure
        images = self.soup.find_all('img')
        images_with_alt = sum(1 for img in images if img.get('alt'))
        
        return {
            'headings': headings,
            'has_proper_hierarchy': proper_hierarchy,
            'paragraph_count': len(paragraphs),
            'short_paragraphs': short_paragraphs,
            'long_paragraphs': long_paragraphs,
            'list_count': len(lists),
            'images_count': len(images),
            'images_with_alt': images_with_alt,
            'structure_score': self._calculate_structure_score(headings, paragraphs, lists)
        }
    
    def _analyze_topic_coverage(self, content):
        """Analyze topic coverage and related keywords"""
        words = re.findall(r'\b[a-z]{4,}\b', content.lower())
        
        # Filter stop words
        stop_words = {'that', 'this', 'with', 'from', 'have', 'been', 'will', 'your', 'their', 'there', 'these', 'would', 'could', 'should', 'about', 'which', 'other', 'more', 'very', 'what', 'when', 'where', 'them', 'than', 'then', 'some', 'many', 'most', 'much', 'such', 'only', 'also', 'into', 'over', 'after', 'before', 'under', 'above', 'below', 'between', 'through', 'during', 'while', 'until', 'since'}
        meaningful_words = [w for w in words if w not in stop_words and len(w) > 3]
        
        # Count keyword frequency
        keyword_freq = Counter(meaningful_words)
        top_keywords = dict(keyword_freq.most_common(20))
        
        # Calculate keyword diversity
        unique_keywords = len(set(meaningful_words))
        total_words = len(meaningful_words)
        diversity_ratio = unique_keywords / max(total_words, 1)
        
        return {
            'top_keywords': top_keywords,
            'keyword_diversity': round(diversity_ratio * 100, 1),
            'unique_keywords': unique_keywords,
            'total_keywords': total_words,
            'topic_coverage': 'Good' if diversity_ratio > 0.3 else 'Limited'
        }
    
    def _calculate_structure_score(self, headings, paragraphs, lists):
        """Calculate structure quality score"""
        score = 0
        
        # H1 present and single
        if headings.get('h1', 0) == 1:
            score += 25
        elif headings.get('h1', 0) > 1:
            score += 10
        
        # Has H2 headings
        if headings.get('h2', 0) > 0:
            score += 20
        
        # Good paragraph structure
        if len(paragraphs) > 5:
            score += 20
        
        # Has lists
        if len(lists) > 0:
            score += 15
        
        # Short paragraphs (readable)
        short_p = sum(1 for p in paragraphs if len(p.get_text().split()) < 50)
        if short_p > len(paragraphs) * 0.5:
            score += 20
        
        return min(100, score)
    
    def _calculate_content_score(self, analysis):
        """Calculate overall content quality score"""
        score = 0
        
        # User Intent (25%)
        if analysis['user_intent']['matches_intent']:
            score += 25
        
        # Content Quality (30%)
        quality = analysis['content_quality']
        if quality['word_count'] >= 600:
            score += 10
        if quality['is_original']:
            score += 10
        if quality['is_helpful']:
            score += 10
        
        # Readability (20%)
        if analysis['readability'].get('is_readable', False):
            score += 20
        
        # Structure (15%)
        score += analysis['structure']['structure_score'] * 0.15
        
        # Topic Coverage (10%)
        if analysis['topic_coverage']['topic_coverage'] == 'Good':
            score += 10
        
        return min(100, int(score))
