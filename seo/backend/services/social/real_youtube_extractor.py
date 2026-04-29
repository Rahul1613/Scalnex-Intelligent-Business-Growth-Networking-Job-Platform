import requests
from bs4 import BeautifulSoup
import re
import json
from datetime import datetime
from urllib.parse import urlparse
import time

class RealYouTubeExtractor:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0',
            'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
        })
    
    def extract_real_youtube_data(self, channel_url):
        """Extract real YouTube channel data"""
        try:
            # Normalize URL
            channel_url = self._normalize_url(channel_url)
            
            print(f"Fetching YouTube channel: {channel_url}")
            
            # Fetch the channel page
            response = self.session.get(channel_url, timeout=15)
            response.raise_for_status()
            
            html_content = response.text
            
            # Extract real data using multiple methods
            channel_data = self._extract_real_channel_data(html_content, channel_url)
            
            # If we couldn't get real data, try the videos page
            if not channel_data.get('subscribers'):
                videos_url = channel_url + '/videos'
                print(f"Trying videos page: {videos_url}")
                videos_response = self.session.get(videos_url, timeout=15)
                videos_content = videos_response.text
                channel_data.update(self._extract_from_videos_page(videos_content))
            
            # Extract recent videos
            videos = self._extract_real_videos(html_content)
            
            # If no videos from main page, try videos page
            if not videos:
                videos_url = channel_url + '/videos'
                videos_response = self.session.get(videos_url, timeout=15)
                videos_content = videos_response.text
                videos = self._extract_real_videos(videos_content)
            
            # Calculate metrics
            metrics = self._calculate_real_metrics(channel_data, videos)
            
            return {
                'success': True,
                'platform': 'youtube',
                'profile_url': channel_url,
                'data': {
                    'channel_name': channel_data.get('channel_name', self._extract_name_from_url(channel_url)),
                    'subscribers': channel_data.get('subscribers', 0),
                    'total_views': channel_data.get('total_views', 0),
                    'video_count': channel_data.get('video_count', len(videos)),
                    'avg_views_per_video': channel_data.get('avg_views_per_video', 0),
                    'description': channel_data.get('description', ''),
                    'joined_date': channel_data.get('joined_date', ''),
                    'country': channel_data.get('country', ''),
                    'videos': videos,
                    'metrics': metrics,
                    'verification_status': channel_data.get('verified', False)
                },
                'extraction_timestamp': datetime.now().isoformat(),
                'data_source': 'real_youtube_extraction'
            }
            
        except Exception as e:
            print(f"Error extracting YouTube data: {e}")
            return {
                'success': False,
                'error': f'Failed to extract real YouTube data: {str(e)}',
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
        elif '/channel/' in url:
            return url if url.startswith('http') else f"https://www.youtube.com{url}"
        elif '/c/' in url:
            return url if url.startswith('http') else f"https://www.youtube.com{url}"
        elif '/user/' in url:
            return url if url.startswith('http') else f"https://www.youtube.com{url}"
        else:
            return url
    
    def _extract_real_channel_data(self, html_content, channel_url):
        """Extract real channel data from HTML"""
        data = {}
        
        try:
            # Method 1: Extract from meta tags
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Channel name from title
            title_tag = soup.find('title')
            if title_tag:
                title = title_tag.get_text()
                if ' - YouTube' in title:
                    data['channel_name'] = title.replace(' - YouTube', '')
            
            # Description from meta tags
            desc_meta = soup.find('meta', {'name': 'description'})
            if desc_meta:
                data['description'] = desc_meta.get('content', '')
            
            # OG tags
            og_title = soup.find('meta', {'property': 'og:title'})
            if og_title:
                title = og_title.get('content', '')
                if ' - YouTube' in title:
                    data['channel_name'] = title.replace(' - YouTube', '')
            
            # Method 2: Extract from JSON data in script tags
            scripts = soup.find_all('script')
            for script in scripts:
                if script.string and ('var ytInitialData' in script.string or 'window["ytInitialData"]' in script.string):
                    try:
                        # Extract JSON data
                        if 'var ytInitialData' in script.string:
                            json_match = re.search(r'var ytInitialData = ({.+?});', script.string)
                        else:
                            json_match = re.search(r'window\["ytInitialData"\] = ({.+?});', script.string)
                        
                        if json_match:
                            json_text = json_match.group(1)
                            data_obj = json.loads(json_text)
                            
                            # Extract from header
                            header_data = self._extract_from_json_header(data_obj)
                            data.update(header_data)
                            
                            # Extract from tabs
                            tabs_data = self._extract_from_json_tabs(data_obj)
                            data.update(tabs_data)
                            
                            break
                    except Exception as e:
                        print(f"Error parsing JSON data: {e}")
                        continue
            
            # Method 3: Extract from visible text patterns
            if not data.get('subscribers'):
                data.update(self._extract_from_visible_text(html_content))
            
            # Method 4: Try to extract from page source patterns
            if not data.get('subscribers'):
                data.update(self._extract_from_source_patterns(html_content))
            
        except Exception as e:
            print(f"Error extracting channel data: {e}")
        
        return data
    
    def _extract_from_json_header(self, data_obj):
        """Extract data from JSON header section"""
        data = {}
        
        try:
            # Navigate to header section
            header = self._navigate_json_path(data_obj, ['header', 'pageHeaderRenderer', 'content'])
            if header:
                # Extract channel name
                title = self._find_text_in_json(header, ['title'])
                if title:
                    data['channel_name'] = title
                
                # Extract subscriber count
                subscriber = self._find_text_in_json(header, ['subscriberCountText', 'subscriberCount'])
                if subscriber:
                    data['subscribers'] = self._parse_count(subscriber)
                
                # Extract video count
                video_count = self._find_text_in_json(header, ['videoCountText', 'videoCount'])
                if video_count:
                    data['video_count'] = self._parse_count(video_count)
                
                # Extract view count
                view_count = self._find_text_in_json(header, ['viewCountText', 'viewCount'])
                if view_count:
                    data['total_views'] = self._parse_count(view_count)
                
                # Extract description
                description = self._find_text_in_json(header, ['description'])
                if description:
                    data['description'] = description
                
                # Check verification
                verified = self._find_in_json(header, ['verified'])
                if verified:
                    data['verified'] = True
        except Exception as e:
            print(f"Error extracting from JSON header: {e}")
        
        return data
    
    def _extract_from_json_tabs(self, data_obj):
        """Extract data from JSON tabs section"""
        data = {}
        
        try:
            tabs = self._navigate_json_path(data_obj, ['contents', 'twoColumnBrowseResultsRenderer', 'tabs'])
            if tabs:
                for tab in tabs:
                    if isinstance(tab, dict) and 'tabRenderer' in tab:
                        tab_content = tab['tabRenderer'].get('content', {})
                        
                        # Look for about section
                        about_section = self._find_in_json(tab_content, ['sectionListRenderer', 'contents'])
                        if about_section:
                            for section in about_section:
                                if isinstance(section, dict) and 'itemSectionRenderer' in section:
                                    contents = section['itemSectionRenderer'].get('contents', [])
                                    for content in contents:
                                        if isinstance(content, dict) and 'aboutChannelRenderer' in content:
                                            about_data = content['aboutChannelRenderer']
                                            
                                            # Extract description
                                            desc = self._find_text_in_json(about_data, ['description'])
                                            if desc:
                                                data['description'] = desc
                                            
                                            # Extract joined date
                                            joined = self._find_text_in_json(about_data, ['joinedDateText'])
                                            if joined:
                                                data['joined_date'] = joined
                                            
                                            # Extract country
                                            country = self._find_text_in_json(about_data, ['country'])
                                            if country:
                                                data['country'] = country
                                            
                                            break
        except Exception as e:
            print(f"Error extracting from JSON tabs: {e}")
        
        return data
    
    def _extract_from_visible_text(self, html_content):
        """Extract data from visible text patterns"""
        data = {}
        
        try:
            # Look for subscriber count patterns
            sub_patterns = [
                r'(\d+(?:,\d+)*(?:\.\d+)?[KMBkmb]?)\s*subscribers?',
                r'"subscriberCountText":"([^"]+)"',
                r'subscribers?["\s:]+["\s]*([0-9,KMBkmb.]+)',
                r'(\d+(?:,\d+)*)\s*subscribers',
            ]
            
            for pattern in sub_patterns:
                match = re.search(pattern, html_content, re.IGNORECASE)
                if match:
                    count_text = match.group(1)
                    data['subscribers'] = self._parse_count(count_text)
                    break
            
            # Look for video count patterns
            video_patterns = [
                r'(\d+(?:,\d+)*(?:\.\d+)?[KMBkmb]?)\s*videos?',
                r'"videoCountText":"([^"]+)"',
                r'videos?["\s:]+["\s]*([0-9,KMBkmb.]+)',
                r'(\d+(?:,\d+)*)\s*videos',
            ]
            
            for pattern in video_patterns:
                match = re.search(pattern, html_content, re.IGNORECASE)
                if match:
                    count_text = match.group(1)
                    data['video_count'] = self._parse_count(count_text)
                    break
            
            # Look for view count patterns
            view_patterns = [
                r'(\d+(?:,\d+)*(?:\.\d+)?[KMBkmb]?)\s*views?',
                r'"viewCountText":"([^"]+)"',
                r'views?["\s:]+["\s]*([0-9,KMBkmb.]+)',
                r'(\d+(?:,\d+)*)\s*views',
            ]
            
            for pattern in view_patterns:
                match = re.search(pattern, html_content, re.IGNORECASE)
                if match:
                    count_text = match.group(1)
                    data['total_views'] = self._parse_count(count_text)
                    break
        except Exception as e:
            print(f"Error extracting from visible text: {e}")
        
        return data
    
    def _extract_from_source_patterns(self, html_content):
        """Extract data from HTML source patterns"""
        data = {}
        
        try:
            # Look for ytInitialData patterns
            patterns = [
                r'"subscriberCountText":\s*{\s*"runs":\s*\[\s*{\s*"text":\s*"([^"]+)"',
                r'"videoCountText":\s*{\s*"runs":\s*\[\s*{\s*"text":\s*"([^"]+)"',
                r'"viewCountText":\s*{\s*"runs":\s*\[\s*{\s*"text":\s*"([^"]+)"',
                r'"title":\s*"([^"]+)"',
            ]
            
            for pattern in patterns:
                matches = re.findall(pattern, html_content)
                for match in matches:
                    if 'subscriber' in pattern.lower():
                        data['subscribers'] = self._parse_count(match)
                    elif 'video' in pattern.lower() and 'count' in pattern.lower():
                        data['video_count'] = self._parse_count(match)
                    elif 'view' in pattern.lower() and 'count' in pattern.lower():
                        data['total_views'] = self._parse_count(match)
                    elif 'title' in pattern.lower() and 'channel' not in data:
                        data['channel_name'] = match.replace(' - YouTube', '')
        except Exception as e:
            print(f"Error extracting from source patterns: {e}")
        
        return data
    
    def _extract_from_videos_page(self, videos_content):
        """Extract data from videos page"""
        data = {}
        
        try:
            soup = BeautifulSoup(videos_content, 'html.parser')
            
            # Look for channel info in videos page
            channel_info = soup.find('yt-formatted-string', {'id': 'channel-name'})
            if channel_info:
                data['channel_name'] = channel_info.get_text(strip=True)
            
            # Look for subscriber count in videos page
            sub_element = soup.find('yt-formatted-string', {'id': 'videos-count'})
            if sub_element:
                sub_text = sub_element.get_text()
                sub_match = re.search(r'(\d+(?:,\d+)*(?:\.\d+)?[KMBkmb]?)', sub_text)
                if sub_match:
                    data['subscribers'] = self._parse_count(sub_match.group(1))
        except Exception as e:
            print(f"Error extracting from videos page: {e}")
        
        return data
    
    def _extract_real_videos(self, html_content):
        """Extract real video data"""
        videos = []
        
        try:
            # Method 1: Extract from JSON data
            soup = BeautifulSoup(html_content, 'html.parser')
            scripts = soup.find_all('script')
            
            for script in scripts:
                if script.string and ('var ytInitialData' in script.string or 'window["ytInitialData"]' in script.string):
                    try:
                        if 'var ytInitialData' in script.string:
                            json_match = re.search(r'var ytInitialData = ({.+?});', script.string)
                        else:
                            json_match = re.search(r'window\["ytInitialData"\] = ({.+?});', script.string)
                        
                        if json_match:
                            json_text = json_match.group(1)
                            data_obj = json.loads(json_text)
                            
                            # Extract videos from rich grid
                            videos = self._extract_videos_from_json(data_obj)
                            if videos:
                                return videos
                    except Exception as e:
                        continue
            
            # Method 2: Extract from HTML patterns
            video_patterns = [
                r'"videoId":"([^"]+)"[^}]*"title":{"runs":\[{"text":"([^"]+)"',
                r'"videoId":"([^"]+)"[^}]*"title":{"simpleText":"([^"]+)"',
                r'watch\?v=([^"]+)"[^>]*title="([^"]*)"',
            ]
            
            for pattern in video_patterns:
                matches = re.findall(pattern, html_content)
                for video_id, title in matches:
                    if video_id and title:
                        videos.append({
                            'title': title,
                            'video_id': video_id,
                            'url': f"https://www.youtube.com/watch?v={video_id}",
                            'views': 0,  # Will be extracted separately
                            'published_time': '',
                            'media_type': 'video'
                        })
                
                if videos:
                    break
            
            # Method 3: Extract view counts for videos
            if videos:
                videos = self._extract_video_views(html_content, videos)
            
        except Exception as e:
            print(f"Error extracting videos: {e}")
        
        return videos[:12]  # Limit to 12 videos
    
    def _extract_videos_from_json(self, data_obj):
        """Extract videos from JSON data"""
        videos = []
        
        try:
            # Navigate to rich grid renderer
            tabs = self._navigate_json_path(data_obj, ['contents', 'twoColumnBrowseResultsRenderer', 'tabs'])
            if tabs:
                for tab in tabs:
                    if isinstance(tab, dict) and 'tabRenderer' in tab:
                        tab_content = tab['tabRenderer'].get('content', {})
                        
                        # Look for rich grid
                        rich_grid = self._find_in_json(tab_content, ['richGridRenderer'])
                        if rich_grid:
                            contents = rich_grid.get('contents', [])
                            for item in contents:
                                if isinstance(item, dict) and 'richItemRenderer' in item:
                                    video_data = item['richItemRenderer'].get('content', {})
                                    if 'videoRenderer' in video_data:
                                        video_info = self._extract_video_info(video_data['videoRenderer'])
                                        if video_info:
                                            videos.append(video_info)
        except Exception as e:
            print(f"Error extracting videos from JSON: {e}")
        
        return videos
    
    def _extract_video_info(self, video_data):
        """Extract video information from video renderer"""
        try:
            title = self._find_text_in_json(video_data, ['title'])
            video_id = self._find_in_json(video_data, ['videoId'])
            view_text = self._find_text_in_json(video_data, ['viewCountText'])
            published_time = self._find_text_in_json(video_data, ['publishedTimeText'])
            
            if video_id and title:
                return {
                    'title': title,
                    'video_id': video_id,
                    'url': f"https://www.youtube.com/watch?v={video_id}",
                    'views': self._parse_count(view_text) if view_text else 0,
                    'published_time': published_time or '',
                    'media_type': 'video'
                }
        except Exception as e:
            print(f"Error extracting video info: {e}")
        
        return None
    
    def _extract_video_views(self, html_content, videos):
        """Extract view counts for videos"""
        try:
            for video in videos:
                video_id = video['video_id']
                # Look for view count pattern for this specific video
                view_pattern = rf'"videoId":"{video_id}"[^}}]*"viewCountText":{{"runs":\[{{"text":"([^"]+)"'
                match = re.search(view_pattern, html_content)
                if match:
                    video['views'] = self._parse_count(match.group(1))
        except Exception as e:
            print(f"Error extracting video views: {e}")
        
        return videos
    
    def _calculate_real_metrics(self, channel_data, videos):
        """Calculate real metrics from extracted data"""
        metrics = {}
        
        subscribers = channel_data.get('subscribers', 0)
        total_views = channel_data.get('total_views', 0)
        video_count = channel_data.get('video_count', len(videos))
        
        # Average views per video
        if video_count > 0:
            metrics['avg_views_per_video'] = total_views // video_count if total_views > 0 else 0
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
        
        return metrics
    
    def _navigate_json_path(self, data, path):
        """Navigate through nested JSON structure"""
        current = data
        for key in path:
            if isinstance(current, dict) and key in current:
                current = current[key]
            elif isinstance(current, list) and current:
                current = current[0]
            else:
                return None
        return current
    
    def _find_in_json(self, data, keys):
        """Find data in JSON structure by trying multiple keys"""
        for key in keys:
            result = self._navigate_json_path(data, [key])
            if result:
                return result
        return None
    
    def _find_text_in_json(self, data, keys):
        """Find text in JSON structure"""
        for key in keys:
            result = self._navigate_json_path(data, [key])
            if result:
                return self._extract_text_from_element(result)
        return ''
    
    def _extract_text_from_element(self, element):
        """Extract text from JSON element"""
        if isinstance(element, str):
            return element
        elif isinstance(element, dict):
            # Common text keys
            for key in ['simpleText', 'text']:
                if key in element:
                    return element[key]
            
            # Handle runs array
            if 'runs' in element and isinstance(element['runs'], list):
                return ''.join(run.get('text', '') for run in element['runs'])
        
        return ''
    
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
    
    def _extract_name_from_url(self, url):
        """Extract channel name from URL"""
        try:
            if '@' in url:
                return url.split('@')[-1].split('?')[0]
            elif '/channel/' in url:
                return url.split('/channel/')[-1].split('?')[0]
            elif '/c/' in url:
                return url.split('/c/')[-1].split('?')[0]
            elif '/user/' in url:
                return url.split('/user/')[-1].split('?')[0]
            else:
                return 'Unknown Channel'
        except:
            return 'Unknown Channel'

# Test the real extractor
if __name__ == "__main__":
    extractor = RealYouTubeExtractor()
    result = extractor.extract_real_youtube_data("https://youtube.com/@luffyxjoyboy0")
    print(json.dumps(result, indent=2))
