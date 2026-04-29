"""
Social Media Analytics Scraper - YouTube Focus
Scrapes public data from YouTube using youtube-comment-downloader and VADER
"""
import os
import re
import json
import logging
import time
import tempfile
import glob
from datetime import datetime
from typing import Dict, List, Optional
import pandas as pd
import matplotlib.pyplot as plt
import requests
from youtube_comment_downloader import YoutubeCommentDownloader, SORT_BY_RECENT
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

logger = logging.getLogger(__name__)

class YouTubeScraper:
    """Scrape YouTube channel and video data with deep analytics"""
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.analyzer = SentimentIntensityAnalyzer()
        self.upload_folder = 'uploads'
        if not os.path.exists(self.upload_folder):
            os.makedirs(self.upload_folder)

    def _finalize_comment_analysis(self, comment_rows: List[Dict], url: str) -> Dict:
        """
        Convert prepared comment rows into summary + excel + graphs.
        `comment_rows` is a list of dicts shaped like:
        {Author, Comment, Likes, PublishedTime, ReplyCount, Sentiment}
        """
        result = {
            'platform': 'YouTube',
            'url': url,
            'comments': [],
            'success': False,
            'summary': {
                'total': 0,
                'positive': 0,
                'negative': 0,
                'neutral': 0
            },
            'files': {
                'excel': None,
                'graphs': []
            }
        }

        # Summary
        for c in comment_rows:
            sentiment = (c.get("Sentiment") or "Neutral").lower()
            result['summary']['total'] += 1
            if sentiment in result['summary']:
                result['summary'][sentiment] += 1
            else:
                result['summary']['neutral'] += 1

        if not comment_rows:
            result['error'] = "No comments provided."
            return result

        # Excel Generation
        df = pd.DataFrame(comment_rows)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        excel_filename = f"yt_report_{timestamp}.xlsx"
        excel_path = os.path.join(self.upload_folder, excel_filename)
        df.to_excel(excel_path, index=False)
        result['files']['excel'] = excel_filename

        # Graph Generation
        plt.figure(figsize=(10, 6))
        sentiment_counts = df['Sentiment'].value_counts()
        plt.pie(
            sentiment_counts,
            labels=sentiment_counts.index,
            autopct='%1.1f%%',
            colors=['#10b981', '#ef4444', '#6b7280']
        )
        plt.title('Sentiment Distribution')
        pie_filename = f"yt_pie_{timestamp}.png"
        plt.savefig(os.path.join(self.upload_folder, pie_filename), transparent=True)
        result['files']['graphs'].append(pie_filename)
        plt.close()

        plt.figure(figsize=(12, 6))
        top_comments = df.nlargest(5, 'Likes') if 'Likes' in df.columns else df.head(5)
        # Simple matplotlib bar chart (avoid seaborn dependency)
        plt.barh(top_comments['Author'].astype(str), top_comments['Likes'].astype(float))
        plt.gca().invert_yaxis()
        plt.title('Top 5 Most Liked Comments')
        plt.xlabel('Likes')
        plt.ylabel('Author')
        plt.tight_layout()
        bar_filename = f"yt_bar_{timestamp}.png"
        plt.savefig(os.path.join(self.upload_folder, bar_filename), transparent=True)
        result['files']['graphs'].append(bar_filename)
        plt.close()

        plt.figure(figsize=(10, 6))
        counts = df['Sentiment'].value_counts()
        order = [s for s in ["Positive", "Negative", "Neutral"] if s in counts.index] + [s for s in counts.index if s not in ["Positive", "Negative", "Neutral"]]
        plt.bar(order, [counts.get(k, 0) for k in order], color=['#10b981', '#ef4444', '#6b7280'][:len(order)])
        plt.title('Sentiment Counts')
        plt.xlabel('Sentiment')
        plt.ylabel('Count')
        count_filename = f"yt_count_{timestamp}.png"
        plt.savefig(os.path.join(self.upload_folder, count_filename), transparent=True)
        result['files']['graphs'].append(count_filename)
        plt.close()

        result['comments'] = comment_rows
        result['success'] = True
        return result

    def analyze_pasted_comments(self, comments: List[str], url: str = "") -> Dict:
        """
        Always-works flow: user pastes comments text (one per line).
        No scraping, no API key, no cookies.
        """
        rows: List[Dict] = []
        for txt in (comments or [])[:500]:
            text = (txt or "").strip()
            if not text:
                continue
            sentiment = self.get_sentiment(text)
            rows.append({
                "Author": "User",
                "Comment": text,
                "Likes": 0,
                "PublishedTime": "Unknown",
                "ReplyCount": 0,
                "Sentiment": sentiment,
            })
        return self._finalize_comment_analysis(rows, url=url or "pasted_comments")

    def extract_video_id(self, url: str) -> Optional[str]:
        """Extract video ID from various YouTube URL formats"""
        patterns = [
            r'v=([a-zA-Z0-9_-]{11})',
            r'be/([a-zA-Z0-9_-]{11})',
            r'embed/([a-zA-Z0-9_-]{11})',
            r'/v/([a-zA-Z0-9_-]{11})',
            r'shorts/([a-zA-Z0-9_-]{11})'
        ]
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None

    def get_sentiment(self, text: str) -> str:
        """Analyze sentiment using VADER"""
        if not text:
            return "Neutral"
        score = self.analyzer.polarity_scores(text)['compound']
        if score >= 0.05:
            return "Positive"
        elif score <= -0.05:
            return "Negative"
        else:
            return "Neutral"

    def parse_count(self, count_str) -> int:
        """Parse YouTube count strings like '1.2K', '5M' into integers"""
        if not count_str:
            return 0
        if isinstance(count_str, int):
            return count_str
        
        count_str = str(count_str).lower().replace(',', '').strip()
        multiplier = 1
        if 'k' in count_str:
            multiplier = 1000
            count_str = count_str.replace('k', '')
        elif 'm' in count_str:
            multiplier = 1000000
            count_str = count_str.replace('m', '')
        elif 'b' in count_str:
            multiplier = 1000000000
            count_str = count_str.replace('b', '')
            
        try:
            return int(float(count_str) * multiplier)
        except (ValueError, TypeError):
            return 0

    def scrape_profile(self) -> Dict:
        """Deep comment extraction and local analytics engine"""
        print(f"DEBUG: YouTubeScraper: Starting deep analysis for {self.base_url}", flush=True)
        result = {
            'platform': 'YouTube',
            'url': self.base_url,
            'comments': [],
            'success': False,
            'summary': {
                'total': 0,
                'positive': 0,
                'negative': 0,
                'neutral': 0
            },
            'files': {
                'excel': None,
                'graphs': []
            }
        }

        def _fetch_comments_via_ytdlp(video_id: str, limit: int = 500) -> List[Dict]:
            """
            Keyless fallback: use `yt-dlp` to extract YouTube comments.
            Still no API keys and no cookies (kept intentionally simple).
            """
            try:
                import yt_dlp  # type: ignore
            except Exception:
                return []

            watch_url = f"https://www.youtube.com/watch?v={video_id}"
            ydl_opts = {
                "quiet": True,
                "no_warnings": True,
                "skip_download": True,
                "extractor_args": {"youtube": [f"max_comments:{limit}"]},
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(watch_url, download=False) or {}

            extracted = info.get("comments") or []
            comments: List[Dict] = []
            for c in extracted[:limit]:
                comments.append({
                    "author": c.get("author") or "Unknown",
                    "text": c.get("text") or "",
                    "votes": c.get("like_count") or 0,
                    "time": c.get("timestamp") or c.get("time_text") or "Unknown",
                    "replies": c.get("reply_count") or 0,
                })
            return comments

        try:
            video_id = self.extract_video_id(self.base_url)
            if not video_id:
                # If not a direct video URL, try to find one if it's a channel (limited support)
                resp = requests.get(self.base_url, timeout=10)
                matches = re.findall(r'/watch\?v=([a-zA-Z0-9_-]{11})', resp.text)
                if matches:
                    video_id = matches[0]
                else:
                    result['error'] = "Could not identify YouTube Video ID"
                    return result

            downloader = YoutubeCommentDownloader()
            print(f"DEBUG: YouTubeScraper: Extracting comments for video {video_id}...", flush=True)

            def _collect_comments_once() -> List[Dict]:
                # Prefer URL-based fetching; it is more reliable across library versions.
                watch_url = f"https://www.youtube.com/watch?v={video_id}"
                if hasattr(downloader, "get_comments_from_url"):
                    generator = downloader.get_comments_from_url(watch_url, sort_by=SORT_BY_RECENT)
                else:
                    generator = downloader.get_comments(video_id, sort_by=SORT_BY_RECENT)
                collected: List[Dict] = []
                count = 0
                for comment in generator:
                    count += 1
                    sentiment = self.get_sentiment(comment.get('text', ''))

                    comment_data = {
                        'Author': comment.get('author', 'Unknown'),
                        'Comment': comment.get('text', ''),
                        'Likes': self.parse_count(comment.get('votes', 0)),
                        'PublishedTime': comment.get('time', 'Unknown'),
                        'ReplyCount': self.parse_count(comment.get('replies', 0)),
                        'Sentiment': sentiment
                    }
                    collected.append(comment_data)

                    if count >= 500:  # local processing cap
                        break
                return collected

            all_comments: List[Dict] = []
            last_error: Optional[Exception] = None
            for attempt in range(2):
                try:
                    all_comments = _collect_comments_once()
                    last_error = None
                    break
                except json.JSONDecodeError as e:
                    # YouTube sometimes returns a consent/blocked/empty response that isn't JSON.
                    # The upstream library tries to json-decode it and crashes with:
                    # "Expecting value: line 1 column 1 (char 0)"
                    last_error = e
                    time.sleep(1.0 if attempt == 0 else 0.0)
                except Exception as e:
                    last_error = e
                    break

            # Keyless fallback when youtube_comment_downloader is blocked.
            if (last_error is not None and not all_comments) and (
                isinstance(last_error, json.JSONDecodeError) or "Expecting value: line 1 column 1" in str(last_error)
            ):
                try:
                    ytdlp_comments = _fetch_comments_via_ytdlp(video_id, limit=500)
                    if ytdlp_comments:
                        all_comments = []
                        for comment in ytdlp_comments:
                            sentiment = self.get_sentiment(comment.get('text', ''))
                            all_comments.append({
                                'Author': comment.get('author', 'Unknown'),
                                'Comment': comment.get('text', ''),
                                'Likes': self.parse_count(comment.get('votes', 0)),
                                'PublishedTime': comment.get('time', 'Unknown'),
                                'ReplyCount': self.parse_count(comment.get('replies', 0)),
                                'Sentiment': sentiment
                            })
                        last_error = None
                except Exception as ytdlp_e:
                    last_error = ytdlp_e

            if last_error is not None and not all_comments:
                msg = str(last_error)
                if isinstance(last_error, json.JSONDecodeError) or "Expecting value: line 1 column 1" in msg:
                    result['error'] = (
                        "Could not fetch YouTube comments (blocked/empty response). "
                        "This usually happens when comments are disabled, the video is restricted, "
                        "or YouTube serves a bot/consent page. Try another public video URL, "
                        "or use the 'paste comments' box."
                    )
                elif "Sign in to confirm you\u2019re not a bot" in msg or "confirm you’re not a bot" in msg or "not a bot" in msg:
                    result["error"] = (
                        "YouTube is requiring a bot-check for this video, so comments cannot be fetched anonymously. "
                        "Use a different public video URL, or use the 'paste comments' box."
                    )
                else:
                    result['error'] = f"Failed to fetch YouTube comments: {msg}"
                return result

            if not all_comments:
                result['error'] = "No comments found or accessible."
                return result
            finalized = self._finalize_comment_analysis(all_comments, url=self.base_url)
            finalized['platform'] = 'YouTube'
            print(f"DEBUG: YouTubeScraper: Analysis complete. Files generated.", flush=True)
            return finalized

        except Exception as e:
            logger.error(f"YouTubeScraper error: {e}")
            result['error'] = str(e)
            result['success'] = False
        
        return result

class InstagramScraper:
    """Simplified Instagram placeholder (Redesign focuses on YouTube)"""
    def __init__(self, url: str): self.url = url
    def scrape_profile(self): return {'success': False, 'error': 'Feature redesigned for YouTube focus.'}

class GoogleReviewsScraper:
    """Simplified Google placeholder"""
    def __init__(self, url: str): self.url = url
    def scrape_reviews(self): return {'success': False, 'error': 'Feature redesigned for YouTube focus.'}


class SocialMediaAnalytics:
    """
    Backwards-compatible façade used by `app.py`.
    The current implementation focuses on YouTube; other platforms return a graceful
    "not implemented" response instead of breaking imports at app startup.
    """

    @staticmethod
    def analyze_youtube(identifier: str, api_key: Optional[str] = None) -> Dict:
        # `identifier` is treated as a URL in the current UI/backend.
        scraper = YouTubeScraper(identifier)
        result = scraper.scrape_profile()
        result.setdefault("platform", "YouTube")
        return result

    @staticmethod
    def analyze_instagram(identifier: str) -> Dict:
        scraper = InstagramScraper(identifier)
        result = scraper.scrape_profile()
        result.setdefault("platform", "Instagram")
        return result

    @staticmethod
    def analyze_facebook(identifier: str) -> Dict:
        return {
            "platform": "Facebook",
            "success": False,
            "error": "Facebook analysis is not implemented in this build."
        }

    @staticmethod
    def calculate_engagement(result: Dict) -> Dict:
        """
        Normalize engagement signals for the frontend.
        For YouTube we derive simple metrics from the comment summary.
        """
        summary = (result or {}).get("summary") or {}
        total = int(summary.get("total") or 0)
        positive = int(summary.get("positive") or 0)
        negative = int(summary.get("negative") or 0)

        return {
            "totalInteractions": total,
            "positiveRate": (positive / total) if total else 0,
            "negativeRate": (negative / total) if total else 0,
        }
