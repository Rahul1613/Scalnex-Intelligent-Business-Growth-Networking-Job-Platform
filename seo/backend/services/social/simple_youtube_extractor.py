import requests
from bs4 import BeautifulSoup
import re
import json
from datetime import datetime
from urllib.parse import urlparse

class SimpleYouTubeExtractor:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        })
    
    def extract_channel_data(self, channel_url):
        """Extract YouTube channel data using regex and HTML parsing"""
        try:
            # Normalize URL
            channel_url = self._normalize_url(channel_url)
            
            # Fetch channel page
            response = self.session.get(channel_url, timeout=10)
            response.raise_for_status()
            
            html_content = response.text
            
            # Extract data using regex patterns
            channel_data = {
                'channel_name': self._extract_channel_name(html_content, channel_url),
                'subscribers': self._extract_subscribers(html_content),
                'total_views': self._extract_total_views(html_content),
                'video_count': self._extract_video_count(html_content),
                'description': self._extract_description(html_content),
                'joined_date': self._extract_joined_date(html_content),
                'country': self._extract_country(html_content),
                'videos': self._extract_videos(html_content)
            }
            
            # Calculate metrics
            metrics = self._calculate_metrics(channel_data)
            
            return {
                'success': True,
                'platform': 'youtube',
                'profile_url': channel_url,
                'data': {
                    **channel_data,
                    'metrics': metrics
                },
                'extraction_timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to extract YouTube data: {str(e)}',
                'platform': 'youtube',
                'profile_url': channel_url,
                'data': None
            }
    
    def _normalize_url(self, url):
        """Normalize YouTube URL"""
        if not url:
            return url
        
        if '@' in url:
            username = url.split('@')[-1].split('?')[0]
            return f"https://www.youtube.com/@{username}"
        return url
    
    def _extract_channel_name(self, html_content, url):
        """Extract channel name"""
        # Try multiple methods
        
        # Method 1: From title tag
        title_match = re.search(r'<title>([^<]+)</title>', html_content)
        if title_match:
            title = title_match.group(1)
            if ' - YouTube' in title:
                return title.replace(' - YouTube', '')
        
        # Method 2: From JSON data
        json_match = re.search(r'"channelId":"[^"]*","title":"([^"]+)"', html_content)
        if json_match:
            return json_match.group(1)
        
        # Method 3: From URL
        if '@' in url:
            return url.split('@')[-1].split('?')[0]
        
        return 'Unknown Channel'
    
    def _extract_subscribers(self, html_content):
        """Extract subscriber count"""
        patterns = [
            r'"subscriberCountText":{"runs":\[{"text":"([^"]+)"\}',
            r'"subscriberCountText":"([^"]+)"',
            r'"subscriberCount":(\d+)',
            r'subscribers?["\s:]+["\s]*([0-9,KMBkmb.]+)',
            r'(\d+(?:\.\d+)?[KMBkmb]+)\s*subscribers?',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, html_content, re.IGNORECASE)
            if match:
                count_text = match.group(1)
                return self._parse_count(count_text)
        
        return 0
    
    def _extract_total_views(self, html_content):
        """Extract total view count"""
        patterns = [
            r'"viewCountText":{"runs":\[{"text":"([^"]+)"\}',
            r'"viewCountText":"([^"]+)"',
            r'"viewCount":(\d+)',
            r'(\d+(?:\.\d+)?[KMBkmb]+)\s*views?',
            r'"views":(\d+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, html_content, re.IGNORECASE)
            if match:
                count_text = match.group(1)
                return self._parse_count(count_text)
        
        return 0
    
    def _extract_video_count(self, html_content):
        """Extract video count"""
        patterns = [
            r'"videoCountText":{"runs":\[{"text":"([^"]+)"\}',
            r'"videoCountText":"([^"]+)"',
            r'"videoCount":(\d+)',
            r'(\d+(?:\.\d+)?[KMBkmb]+)\s*videos?',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, html_content, re.IGNORECASE)
            if match:
                count_text = match.group(1)
                return self._parse_count(count_text)
        
        # Fallback: count video links
        video_links = re.findall(r'"/watch\?v=[^"]+', html_content)
        return len(set(video_links))  # Remove duplicates
    
    def _extract_description(self, html_content):
        """Extract channel description"""
        patterns = [
            r'"description":"([^"]+)"',
            r'<meta name="description" content="([^"]+)"',
            r'<meta property="og:description" content="([^"]+)"',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, html_content)
            if match:
                desc = match.group(1)
                # Clean up escaped characters
                desc = desc.replace('\\n', ' ').replace('\\', '')
                return desc[:500]  # Limit length
        
        return ''
    
    def _extract_joined_date(self, html_content):
        """Extract joined date"""
        patterns = [
            r'"joinedDateText":{"runs":\[{"text":"([^"]+)"\}',
            r'"joinedDateText":"([^"]+)"',
            r'Joined\s+([^"]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, html_content)
            if match:
                return match.group(1)
        
        return ''
    
    def _extract_country(self, html_content):
        """Extract country"""
        patterns = [
            r'"country":{"simpleText":"([^"]+)"',
            r'"country":"([^"]+)"',
            r'Country:\s*([^",\n]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, html_content)
            if match:
                return match.group(1)
        
        return ''
    
    def _extract_videos(self, html_content):
        """Extract recent videos"""
        videos = []
        
        # Find video data in JSON
        video_matches = re.findall(r'"videoRenderer":{[^}]*"videoId":"([^"]+)"[^}]*"title":{"runs":\[{"text":"([^"]+)"\}', html_content)
        
        for video_id, title in video_matches[:12]:  # Limit to 12 videos
            if video_id and title:
                # Try to extract view count for this video
                view_pattern = rf'"videoId":"{video_id}"[^}}]*"viewCountText":{{"runs":\[{{"text":"([^"]+)"'
                view_match = re.search(view_pattern, html_content)
                views = self._parse_count(view_match.group(1)) if view_match else 0
                
                # Try to extract published time
                time_pattern = rf'"videoId":"{video_id}"[^}}]*"publishedTimeText":{{"simpleText":"([^"]+)"'
                time_match = re.search(time_pattern, html_content)
                published_time = time_match.group(1) if time_match else ''
                
                videos.append({
                    'title': title,
                    'video_id': video_id,
                    'url': f"https://www.youtube.com/watch?v={video_id}",
                    'views': views,
                    'published_time': published_time,
                    'media_type': 'video'
                })
        
        return videos
    
    def _parse_count(self, count_text):
        """Parse count string to number"""
        if not count_text:
            return 0
        
        if isinstance(count_text, str):
            # Clean up the text
            count_text = count_text.replace(',', '').replace(' ', '').replace('"', '').replace('\\', '').lower()
            
            # Handle K, M, B suffixes
            if 'k' in count_text:
                try:
                    number = float(count_text.replace('k', ''))
                    return int(number * 1000)
                except:
                    return 0
            elif 'm' in count_text:
                try:
                    number = float(count_text.replace('m', ''))
                    return int(number * 1000000)
                except:
                    return 0
            elif 'b' in count_text:
                try:
                    number = float(count_text.replace('b', ''))
                    return int(number * 1000000000)
                except:
                    return 0
            else:
                # Extract pure number
                match = re.search(r'\d+', count_text)
                return int(match.group()) if match else 0
        
        return 0
    
    def _calculate_metrics(self, channel_data):
        """Calculate additional metrics"""
        metrics = {}
        
        total_videos = channel_data.get('video_count', 0)
        total_views = channel_data.get('total_views', 0)
        subscribers = channel_data.get('subscribers', 1)
        videos = channel_data.get('videos', [])
        
        # Average views per video
        if total_videos > 0:
            metrics['avg_views_per_video'] = total_views // total_videos
        else:
            metrics['avg_views_per_video'] = 0
        
        # Engagement rate (based on recent videos)
        if videos:
            recent_views = [v.get('views', 0) for v in videos[:6] if v.get('views', 0) > 0]
            if recent_views:
                avg_recent_views = sum(recent_views) / len(recent_views)
                metrics['engagement_rate'] = (avg_recent_views / subscribers) * 100 if subscribers > 0 else 0
            else:
                metrics['engagement_rate'] = 0
        else:
            metrics['engagement_rate'] = 0
        
        # Video frequency
        if total_videos > 0:
            joined_date = channel_data.get('joined_date', '')
            if joined_date and any(char.isdigit() for char in joined_date):
                year_match = re.search(r'\b(20\d{2})\b', joined_date)
                if year_match:
                    joined_year = int(year_match.group(1))
                    years_active = datetime.now().year - joined_year
                    if years_active > 0:
                        metrics['videos_per_year'] = total_videos / years_active
                    else:
                        metrics['videos_per_year'] = total_videos
                else:
                    metrics['videos_per_year'] = total_videos
            else:
                metrics['videos_per_year'] = total_videos
        else:
            metrics['videos_per_year'] = 0
        
        return metrics

# Test the extractor
if __name__ == "__main__":
    extractor = SimpleYouTubeExtractor()
    result = extractor.extract_channel_data("https://youtube.com/@luffyxjoyboy0")
    print(json.dumps(result, indent=2))
