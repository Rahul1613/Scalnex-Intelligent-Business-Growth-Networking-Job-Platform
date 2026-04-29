import re
from typing import Dict, List
from datetime import datetime

class EngagementCalculator:
    def __init__(self):
        self.engagement_indicators = {
            'cta_words': [
                'comment', 'share', 'like', 'follow', 'subscribe', 'click', 'link',
                'tag', 'mention', 'reply', 'respond', 'join', 'participate', 'vote'
            ],
            'interactive_words': [
                'you', 'your', 'what', 'when', 'where', 'how', 'why', 'which',
                'opinion', 'thoughts', 'think', 'feel', 'experience', 'story',
                'favorite', 'best', 'worst', 'choose', 'pick', 'decide'
            ],
            'question_indicators': ['?', 'what about', 'how about', 'tell me', 'let me know'],
            'diverse_content_types': ['image', 'video', 'text', 'carousel', 'reel', 'story']
        }
    
    def calculate_engagement_potential(self, content_data: Dict, platform: str) -> Dict:
        """Calculate engagement potential based on content analysis"""
        try:
            if not content_data or 'data' not in content_data:
                return self._create_error_result("No content data provided")
            
            data = content_data['data']
            
            # Extract content based on platform
            if platform == 'instagram':
                posts = data.get('posts', [])
                bio = data.get('bio', '')
            elif platform == 'facebook':
                posts = data.get('posts', [])
                bio = data.get('description', '')
            elif platform == 'youtube':
                posts = data.get('videos', [])
                bio = data.get('description', '')
            else:
                return self._create_error_result(f"Unsupported platform: {platform}")
            
            # Analyze different engagement factors
            cta_analysis = self._analyze_cta_usage(posts, bio)
            interactive_analysis = self._analyze_interactive_language(posts, bio)
            diversity_analysis = self._analyze_content_diversity(data)
            question_analysis = self._analyze_question_usage(posts, bio)
            timing_analysis = self._analyze_timing_factors(posts)
            
            # Calculate overall engagement potential
            engagement_score = self._calculate_engagement_score(
                cta_analysis, interactive_analysis, diversity_analysis, 
                question_analysis, timing_analysis
            )
            
            # Classify engagement level
            engagement_level = self._classify_engagement_level(engagement_score)
            
            # Generate explanation
            explanation = self._generate_engagement_explanation(
                cta_analysis, interactive_analysis, diversity_analysis,
                question_analysis, timing_analysis, engagement_level, platform
            )
            
            return {
                'success': True,
                'error': None,
                'platform': platform,
                'engagement_score': engagement_score,
                'engagement_level': engagement_level,
                'cta_analysis': cta_analysis,
                'interactive_analysis': interactive_analysis,
                'diversity_analysis': diversity_analysis,
                'question_analysis': question_analysis,
                'timing_analysis': timing_analysis,
                'explanation': explanation,
                'analysis_timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return self._create_error_result(f"Engagement calculation error: {str(e)}")
    
    def _analyze_cta_usage(self, posts: List[Dict], bio: str) -> Dict:
        """Analyze Call-to-Action usage for engagement"""
        total_cta_count = 0
        posts_with_cta = 0
        total_posts = len(posts)
        
        # Analyze posts
        for post in posts:
            if 'caption' in post:
                text = post.get('caption', '')
            elif 'content' in post:
                text = post.get('content', '')
            elif 'title' in post:
                text = post.get('title', '') + ' ' + post.get('description', '')
            else:
                text = ''
            
            cta_count = self._count_cta_words(text)
            total_cta_count += cta_count
            
            if cta_count > 0:
                posts_with_cta += 1
        
        # Analyze bio
        bio_cta_count = self._count_cta_words(bio)
        total_cta_count += bio_cta_count
        
        # Calculate metrics
        posts_with_cta_percentage = (posts_with_cta / total_posts * 100) if total_posts > 0 else 0
        avg_cta_per_post = total_cta_count / total_posts if total_posts > 0 else 0
        
        # Calculate score
        if posts_with_cta_percentage >= 70 and avg_cta_per_post >= 1:
            score = 90
        elif posts_with_cta_percentage >= 50 and avg_cta_per_post >= 0.5:
            score = 75
        elif posts_with_cta_percentage >= 30:
            score = 50
        else:
            score = 25
        
        return {
            'score': score,
            'posts_with_cta': posts_with_cta,
            'total_posts': total_posts,
            'posts_with_cta_percentage': round(posts_with_cta_percentage, 1),
            'avg_cta_per_post': round(avg_cta_per_post, 1),
            'bio_cta_count': bio_cta_count,
            'total_cta_count': total_cta_count
        }
    
    def _analyze_interactive_language(self, posts: List[Dict], bio: str) -> Dict:
        """Analyze interactive language usage"""
        total_interactive_count = 0
        posts_with_interactive = 0
        total_posts = len(posts)
        
        # Analyze posts
        for post in posts:
            if 'caption' in post:
                text = post.get('caption', '')
            elif 'content' in post:
                text = post.get('content', '')
            elif 'title' in post:
                text = post.get('title', '') + ' ' + post.get('description', '')
            else:
                text = ''
            
            interactive_count = self._count_interactive_words(text)
            total_interactive_count += interactive_count
            
            if interactive_count > 0:
                posts_with_interactive += 1
        
        # Analyze bio
        bio_interactive_count = self._count_interactive_words(bio)
        total_interactive_count += bio_interactive_count
        
        # Calculate metrics
        posts_with_interactive_percentage = (posts_with_interactive / total_posts * 100) if total_posts > 0 else 0
        avg_interactive_per_post = total_interactive_count / total_posts if total_posts > 0 else 0
        
        # Calculate score
        if posts_with_interactive_percentage >= 60 and avg_interactive_per_post >= 2:
            score = 90
        elif posts_with_interactive_percentage >= 40 and avg_interactive_per_post >= 1:
            score = 75
        elif posts_with_interactive_percentage >= 20:
            score = 50
        else:
            score = 25
        
        return {
            'score': score,
            'posts_with_interactive': posts_with_interactive,
            'total_posts': total_posts,
            'posts_with_interactive_percentage': round(posts_with_interactive_percentage, 1),
            'avg_interactive_per_post': round(avg_interactive_per_post, 1),
            'bio_interactive_count': bio_interactive_count,
            'total_interactive_count': total_interactive_count
        }
    
    def _analyze_content_diversity(self, data: Dict) -> Dict:
        """Analyze content type diversity for engagement"""
        media_types = data.get('media_types', {'image': 0, 'video': 0, 'text': 0})
        
        total_media = sum(media_types.values())
        
        if total_media == 0:
            return {
                'score': 0,
                'diversity_score': 0,
                'total_media': 0,
                'active_types': 0,
                'assessment': 'No content found'
            }
        
        # Calculate diversity score
        active_types = sum(1 for count in media_types.values() if count > 0)
        diversity_score = (active_types / len(media_types)) * 100
        
        # Calculate balance
        if active_types > 1:
            avg_per_type = total_media / active_types
            variance = sum((count - avg_per_type) ** 2 for count in media_types.values()) / active_types
            balance_score = max(0, 100 - (variance / avg_per_type))
        else:
            balance_score = 0
        
        # Overall diversity score for engagement
        overall_score = (diversity_score * 0.6) + (balance_score * 0.4)
        
        return {
            'score': round(overall_score),
            'diversity_score': round(diversity_score),
            'balance_score': round(balance_score),
            'total_media': total_media,
            'active_types': active_types,
            'media_types': media_types
        }
    
    def _analyze_question_usage(self, posts: List[Dict], bio: str) -> Dict:
        """Analyze question usage for engagement"""
        total_questions = 0
        posts_with_questions = 0
        total_posts = len(posts)
        
        # Analyze posts
        for post in posts:
            if 'caption' in post:
                text = post.get('caption', '')
            elif 'content' in post:
                text = post.get('content', '')
            elif 'title' in post:
                text = post.get('title', '') + ' ' + post.get('description', '')
            else:
                text = ''
            
            question_count = self._count_questions(text)
            total_questions += question_count
            
            if question_count > 0:
                posts_with_questions += 1
        
        # Analyze bio
        bio_questions = self._count_questions(bio)
        total_questions += bio_questions
        
        # Calculate metrics
        posts_with_questions_percentage = (posts_with_questions / total_posts * 100) if total_posts > 0 else 0
        avg_questions_per_post = total_questions / total_posts if total_posts > 0 else 0
        
        # Calculate score
        if posts_with_questions_percentage >= 40 and avg_questions_per_post >= 0.5:
            score = 90
        elif posts_with_questions_percentage >= 25 and avg_questions_per_post >= 0.3:
            score = 75
        elif posts_with_questions_percentage >= 10:
            score = 50
        else:
            score = 25
        
        return {
            'score': score,
            'posts_with_questions': posts_with_questions,
            'total_posts': total_posts,
            'posts_with_questions_percentage': round(posts_with_questions_percentage, 1),
            'avg_questions_per_post': round(avg_questions_per_post, 1),
            'bio_questions': bio_questions,
            'total_questions': total_questions
        }
    
    def _analyze_timing_factors(self, posts: List[Dict]) -> Dict:
        """Analyze timing factors that affect engagement"""
        # This is a simplified analysis - in production, would analyze actual posting times
        total_posts = len(posts)
        
        if total_posts == 0:
            return {
                'score': 50,
                'total_posts': 0,
                'frequency_score': 50,
                'assessment': 'No posts to analyze'
            }
        
        # Score based on posting frequency (more posts = more engagement opportunities)
        if total_posts >= 20:
            frequency_score = 90
        elif total_posts >= 10:
            frequency_score = 75
        elif total_posts >= 5:
            frequency_score = 60
        else:
            frequency_score = 40
        
        # Overall timing score
        overall_score = frequency_score
        
        return {
            'score': overall_score,
            'total_posts': total_posts,
            'frequency_score': frequency_score,
            'assessment': self._assess_timing_factors(overall_score)
        }
    
    def _count_cta_words(self, text: str) -> int:
        """Count Call-to-Action words in text"""
        if not text:
            return 0
        
        text_lower = text.lower()
        count = 0
        
        for cta in self.engagement_indicators['cta_words']:
            count += len(re.findall(rf'\b{re.escape(cta)}\b', text_lower))
        
        return count
    
    def _count_interactive_words(self, text: str) -> int:
        """Count interactive words in text"""
        if not text:
            return 0
        
        text_lower = text.lower()
        count = 0
        
        for word in self.engagement_indicators['interactive_words']:
            count += len(re.findall(rf'\b{re.escape(word)}\b', text_lower))
        
        return count
    
    def _count_questions(self, text: str) -> int:
        """Count questions in text"""
        if not text:
            return 0
        
        # Count question marks
        question_marks = text.count('?')
        
        # Count question phrases
        text_lower = text.lower()
        question_phrases = 0
        for phrase in self.engagement_indicators['question_indicators']:
            question_phrases += len(re.findall(rf'{re.escape(phrase)}', text_lower))
        
        return question_marks + question_phrases
    
    def _calculate_engagement_score(self, cta_analysis: Dict, interactive_analysis: Dict,
                                  diversity_analysis: Dict, question_analysis: Dict,
                                  timing_analysis: Dict) -> float:
        """Calculate overall engagement potential score"""
        weights = {
            'cta': 0.25,
            'interactive': 0.25,
            'diversity': 0.20,
            'questions': 0.20,
            'timing': 0.10
        }
        
        total_score = (
            cta_analysis['score'] * weights['cta'] +
            interactive_analysis['score'] * weights['interactive'] +
            diversity_analysis['score'] * weights['diversity'] +
            question_analysis['score'] * weights['questions'] +
            timing_analysis['score'] * weights['timing']
        )
        
        return round(total_score)
    
    def _classify_engagement_level(self, score: float) -> str:
        """Classify engagement potential level"""
        if score >= 80:
            return "High"
        elif score >= 60:
            return "Medium"
        else:
            return "Low"
    
    def _assess_timing_factors(self, score: int) -> str:
        """Assess timing factors"""
        if score >= 80:
            return "Excellent posting frequency"
        elif score >= 60:
            return "Good posting frequency"
        elif score >= 40:
            return "Moderate posting frequency"
        else:
            return "Low posting frequency"
    
    def _generate_engagement_explanation(self, cta_analysis: Dict, interactive_analysis: Dict,
                                        diversity_analysis: Dict, question_analysis: Dict,
                                        timing_analysis: Dict, engagement_level: str, platform: str) -> str:
        """Generate comprehensive engagement explanation"""
        explanation = f"Engagement Potential Analysis for {platform.title()}:\n\n"
        
        explanation += f"**Engagement Level**: {engagement_level}\n"
        explanation += f"**Overall Score**: {cta_analysis['score'] * 0.25 + interactive_analysis['score'] * 0.25 + diversity_analysis['score'] * 0.20 + question_analysis['score'] * 0.20 + timing_analysis['score'] * 0.10:.1f}/100\n\n"
        
        explanation += f"**Call-to-Action Analysis**:\n"
        explanation += f"• Posts with CTA: {cta_analysis['posts_with_cta_percentage']}%\n"
        explanation += f"• Average CTA per post: {cta_analysis['avg_cta_per_post']}\n\n"
        
        explanation += f"**Interactive Language**:\n"
        explanation += f"• Posts with interactive words: {interactive_analysis['posts_with_interactive_percentage']}%\n"
        explanation += f"• Average interactive words per post: {interactive_analysis['avg_interactive_per_post']}\n\n"
        
        explanation += f"**Content Diversity**:\n"
        explanation += f"• Active media types: {diversity_analysis['active_types']}/3\n"
        explanation += f"• Total media items: {diversity_analysis['total_media']}\n\n"
        
        explanation += f"**Question Usage**:\n"
        explanation += f"• Posts with questions: {question_analysis['posts_with_questions_percentage']}%\n"
        explanation += f"• Average questions per post: {question_analysis['avg_questions_per_post']}\n\n"
        
        explanation += f"**Timing Factors**:\n"
        explanation += f"• Total posts: {timing_analysis['total_posts']}\n"
        explanation += f"• Frequency score: {timing_analysis['frequency_score']}\n\n"
        
        explanation += "**Assessment**: "
        
        if engagement_level == "High":
            explanation += f"Excellent engagement potential with strong calls-to-action, interactive content, and diverse media. "
            explanation += "This profile is well-optimized for audience interaction and algorithm favorability."
        elif engagement_level == "Medium":
            explanation += f"Moderate engagement potential with some interactive elements. "
            explanation += "Improvement in specific areas could significantly boost engagement rates."
        else:
            explanation += f"Low engagement potential with limited interactive elements. "
            explanation += "Significant improvements needed in content strategy to drive audience engagement."
        
        explanation += f"\n\n**Recommendations**: "
        
        if cta_analysis['score'] < 70:
            explanation += "Add more clear calls-to-action to encourage specific user actions. "
        
        if interactive_analysis['score'] < 70:
            explanation += "Use more interactive language to encourage audience participation. "
        
        if diversity_analysis['score'] < 70:
            explanation += "Diversify content types to maintain audience interest. "
        
        if question_analysis['score'] < 70:
            explanation += "Include more questions to prompt audience responses. "
        
        if timing_analysis['score'] < 70:
            explanation += "Increase posting frequency for more engagement opportunities. "
        
        if all(analysis['score'] >= 70 for analysis in [cta_analysis, interactive_analysis, diversity_analysis, question_analysis, timing_analysis]):
            explanation += "Excellent engagement optimization across all factors. Maintain current content strategy."
        
        return explanation
    
    def _create_error_result(self, error_message: str) -> Dict:
        """Create error result"""
        return {
            'success': False,
            'error': error_message,
            'platform': None,
            'engagement_score': 0,
            'engagement_level': 'Unknown',
            'cta_analysis': {},
            'interactive_analysis': {},
            'diversity_analysis': {},
            'question_analysis': {},
            'timing_analysis': {},
            'explanation': f"Error: {error_message}",
            'analysis_timestamp': datetime.now().isoformat()
        }

# Example usage
if __name__ == "__main__":
    calculator = EngagementCalculator()
    
    # Test with sample data
    sample_data = {
        'data': {
            'posts': [
                {'caption': 'What do you think about our new products? Comment below!', 'media_type': 'image'},
                {'caption': 'Share your favorite moments with us! Tag a friend who would love this.', 'media_type': 'video'},
            ],
            'bio': 'Ask us anything! We love hearing from you.',
            'media_types': {'image': 3, 'video': 2, 'text': 0}
        }
    }
    
    result = calculator.calculate_engagement_potential(sample_data, 'instagram')
    print(result)
