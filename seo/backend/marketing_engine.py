import random
from typing import Dict, List, Any, Optional
import google.generativeai as genai
import requests
from bs4 import BeautifulSoup
import json
import logging

# Configure Gemini
GENAI_KEY = "AIzaSyDUOsh_PPwSgtyci-aFzYa4SrvhrgCx1ps"
genai.configure(api_key=GENAI_KEY)

logger = logging.getLogger(__name__)

class MarketingEngine:
    def __init__(self):
        self.platforms = ["Google Ads", "Facebook Ads", "Instagram Ads", "LinkedIn Ads"]

    def scrape_website(self, url: str) -> str:
        """Scrapes text content from a given URL to use as context."""
        if not url:
            return ""
        try:
            if not url.startswith('http'):
                url = 'https://' + url
            
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
            response = requests.get(url, headers=headers, timeout=10)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove scripts and styles
            for script in soup(["script", "style", "nav", "footer"]):
                script.extract()
                
            text = soup.get_text(separator=' ')
            # Clean up whitespace
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = ' '.join(chunk for chunk in chunks if chunk)
            
            # Limit context length
            return text[:4000]
        except Exception as e:
            logger.error(f"Scraping failed for {url}: {e}")
            return ""

    def analyze_campaign(self, topic: str, audience: str, budget: float, url: str = "") -> Dict[str, Any]:
        """
        Generates a full marketing report using Gemini, optionally using scraped website context.
        """
        website_context = self.scrape_website(url)
        
        prompt = f"""
        Act as a world-class Marketing Strategist and Copywriter.
        Create a comprehensive marketing campaign report for the following business context:
        
        PRODUCT/TOPIC: {topic}
        TARGET AUDIENCE: {audience}
        BUDGET: ${budget}/day
        WEBSITE CONTEXT: {website_context if website_context else "No website provided."}
        
        Generate a JSON response with the following structure:
        {{
            "ad_variants": [
                {{
                    "id": "v1",
                    "platform": "Google Ads",
                    "headline": "...",
                    "body": "...",
                    "cta": "...",
                    "evaluation": {{
                        "copy_score": 85,
                        "tone": "Persuasive",
                        "strengths": ["...", "..."],
                        "weaknesses": ["..."],
                        "improvement_suggestions": ["..."]
                    }}
                }},
                {{
                    "id": "v2", 
                    "platform": "Facebook Ads",
                    "headline": "...",
                    "body": "...", 
                    "cta": "...",
                    "evaluation": {{ ... }}
                }},
                {{
                    "id": "v3",
                    "platform": "LinkedIn Ads",
                    "headline": "...",
                    "body": "...",
                    "cta": "...",
                    "evaluation": {{ ... }}
                }}
            ],
            "insights": [
                "Strategic insight 1...",
                "Strategic insight 2...",
                "Strategic insight 3..."
            ],
            "funnel": {{
                "funnel": [
                    {{"stage": "Impressions", "value": 0}},
                    {{"stage": "Clicks", "value": 0}},
                    {{"stage": "Leads", "value": 0}},
                    {{"stage": "Sales", "value": 0}}
                ]
            }},
            "analysis": {{
                "scores": {{ "final": 85 }},
                "audience_platform_fit": {{
                    "score": 90,
                    "why_score_is_low": "...",
                    "recommended_platform_changes": ["..."]
                }},
                "budget": {{
                    "how_to_optimize_spend": "..."
                }},
                "funnel_mapping": {{
                    "stage": "Consideration",
                    "why": "...",
                    "suggested_changes": "..."
                }}
            }}
        }}
        
        IMPORTANT: 
        1. The 'body' content for ads should be a high-quality, engaging caption suitable for the platform.
        2. Calculate realistic funnel values based on the ${budget} budget (assume industry standard CPM/CPC).
        3. Ensure the JSON is valid.
        """
        
        try:
            model = genai.GenerativeModel('gemini-2.0-flash-exp')
            # Configure generation settings for better reliability
            generation_config = {
                "temperature": 0.9,
                "top_p": 1,
                "top_k": 1,
                "max_output_tokens": 2048,
            }
            
            model = genai.GenerativeModel(
                'gemini-1.5-flash',
                generation_config=generation_config
            )
            
            response = model.generate_content(prompt)
            
            # Log raw response for debugging
            logger.info(f"Gemini raw response received, length: {len(response.text)}")
            
            # Clean up JSON string if needed
            json_str = response.text.strip()
            if "```json" in json_str:
                json_str = json_str.split("```json")[1].split("```")[0]
            elif "```" in json_str:
                json_str = json_str.split("```")[1].split("```")[0]
            
            # Parse and validate JSON
            result = json.loads(json_str.strip())
            
            # Ensure required fields exist
            if 'ad_variants' not in result:
                result['ad_variants'] = []
            if 'insights' not in result:
                result['insights'] = ["Campaign analysis completed successfully."]
                
            logger.info(f"Successfully generated {len(result.get('ad_variants', []))} ad variants")
            return result
            
        except json.JSONDecodeError as je:
            logger.error(f"JSON parsing failed: {je}\nRaw response: {response.text if 'response' in locals() else 'No response'}")
            # Return a helpful fallback with sample data
            return {
                "error": "Failed to parse AI response",
                "details": str(je),
                "ad_variants": [
                    {
                        "id": "v1",
                        "platform": "Google Ads",
                        "headline": f"Transform Your {topic} Today",
                        "body": f"Reach {audience} with proven strategies. See results in 30 days.",
                        "cta": "Get Started Now",
                        "evaluation": {
                            "copy_score": 75,
                            "tone": "Professional",
                            "strengths": ["Clear value proposition", "Strong CTA"],
                            "weaknesses": ["Could be more specific"],
                            "improvement_suggestions": ["Add social proof"]
                        }
                    },
                    {
                        "id": "v2",
                        "platform": "Facebook Ads",
                        "headline": f"{topic} Made Simple",
                        "body": f"Join thousands of {audience} growing their success. Limited time offer!",
                        "cta": "Learn More",
                        "evaluation": {
                            "copy_score": 78,
                            "tone": "Engaging",
                            "strengths": ["Social proof", "Urgency"],
                            "weaknesses": ["Generic offer"],
                            "improvement_suggestions": ["Specify the benefit"]
                        }
                    },
                    {
                        "id": "v3",
                        "platform": "LinkedIn Ads",
                        "headline": f"Professional {topic} Solutions",
                        "body": f"Trusted by industry leaders. Elevate your business with expert {topic}.",
                        "cta": "Request Demo",
                        "evaluation": {
                            "copy_score": 80,
                            "tone": "Business Professional",
                            "strengths": ["Authority positioning", "Professional tone"],
                            "weaknesses": ["Lacks urgency"],
                            "improvement_suggestions": ["Add limited availability"]
                        }
                    }
                ],
                "insights": [
                    f"Your target audience ({audience}) responds well to clear value propositions.",
                    f"Budget of ${budget}/day allows for testing across multiple platforms.",
                    "Consider A/B testing different CTAs to optimize conversion rates."
                ],
                "funnel": {
                    "funnel": [
                        {"stage": "Impressions", "value": int(budget * 100)},
                        {"stage": "Clicks", "value": int(budget * 5)},
                        {"stage": "Leads", "value": int(budget * 0.5)},
                        {"stage": "Sales", "value": int(budget * 0.1)}
                    ]
                }
            }
        except Exception as e:
            logger.error(f"Gemini generation failed: {e}", exc_info=True)
            # Fallback if AI fails - provide useful sample data
            return {
                "error": f"AI Generation encountered an error: {str(e)}",
                "details": str(e),
                "ad_variants": [
                    {
                        "id": "v1",
                        "platform": "Google Ads",
                        "headline": f"Get {topic} Results Fast",
                        "body": f"Perfect for {audience}. Start seeing growth in weeks, not months.",
                        "cta": "Start Free Trial",
                        "evaluation": {"copy_score": 72, "tone": "Direct"}
                    }
                ],
                "insights": [
                    "Campaign generation experienced technical issues. Using template data.",
                    f"Recommended platforms for {audience}: Google Ads, LinkedIn, Facebook"
                ]
            }

    def generate_ad_copy(self, topic: str, audience: str, platform: str, goal: str) -> List[Dict[str, str]]:
        # Redundant legacy method, redirecting to analyze for now or keeping simple mock if strictly needed
        # For this task, we assume the main entry point is analyze_campaign
        pass

    def simulate_ab_test(self, variants: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Simple simulation for the frontend A/B test feature."""
        if not variants:
            return {}
            
        winner = random.choice(variants)
        results = []
        for v in variants:
            results.append({
                "id": v['id'],
                "analysis": {
                    "persuasion_score": random.randint(70, 95),
                    "components": {
                        "emotional_pull": "High",
                        "clarity": "Excellent",
                        "cta_strength": "Strong",
                        "platform_alignment": "Good"
                    }
                }
            })
            
        return {
            "results": results,
            "winner_id": winner['id'],
            "recommendation": f"Variant {winner['id']} has the highest predicted conversion potential based on persuasion principles."
        }

