import requests
from bs4 import BeautifulSoup
import re
import json
from datetime import datetime
from urllib.parse import urlparse, parse_qs

class YouTubeDataExtractor:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
    
    def extract_channel_data(self, channel_url):
        """Extract real YouTube channel data"""
        try:
            # Normalize URL
            channel_url = self._normalize_url(channel_url)
            
            # Fetch channel page
            response = self.session.get(channel_url, timeout=10)
            response.raise_for_status()
            
            # Extract data from HTML
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # First try to extract from initial data
            channel_data = self._extract_initial_data(soup, channel_url)
            
            # If initial extraction failed, try alternative methods
            if not channel_data.get('subscribers') and not channel_data.get('channel_name'):
                channel_data.update(self._extract_from_meta_tags(soup))
                channel_data.update(self._extract_from_visible_elements(soup))
            
            # Extract videos
            videos = self._extract_videos(soup)
            
            # Calculate metrics
            metrics = self._calculate_metrics(channel_data, videos)
            
            return {
                'success': True,
                'platform': 'youtube',
                'profile_url': channel_url,
                'data': {
                    'channel_name': channel_data.get('channel_name', self._extract_channel_name_from_url(channel_url)),
                    'description': channel_data.get('description', ''),
                    'subscribers': channel_data.get('subscribers', 0),
                    'total_views': channel_data.get('total_views', 0),
                    'video_count': channel_data.get('video_count', len(videos)),
                    'joined_date': channel_data.get('joined_date', ''),
                    'country': channel_data.get('country', ''),
                    'videos': videos,
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
    
    def _extract_initial_data(self, soup, channel_url):
        """Extract initial data from YouTube page"""
        channel_data = {}
        
        try:
            # Look for JSON data in script tags
            scripts = soup.find_all('script')
            for script in scripts:
                if script.string and ('var ytInitialData' in script.string or 'window["ytInitialData"]' in script.string):
                    try:
                        # Extract JSON data
                        if 'var ytInitialData' in script.string:
                            json_text = script.string.split('var ytInitialData = ')[1].split(';</script>')[0]
                        else:
                            json_text = script.string.split('window["ytInitialData"] = ')[1].split(';</script>')[0]
                        
                        data = json.loads(json_text)
                        
                        # Extract channel header information
                        header = self._find_in_data(data, ['header', 'pageHeaderRenderer', 'content'])
                        if header:
                            channel_data.update(self._extract_header_data(header))
                        
                        # Extract tab data
                        tabs = self._find_in_data(data, ['contents', 'twoColumnBrowseResultsRenderer', 'tabs'])
                        if tabs:
                            channel_data.update(self._extract_tab_data(tabs))
                        
                        break
                    except Exception as e:
                        print(f"Error parsing initial data: {e}")
                        continue
        except Exception as e:
            print(f"Error extracting initial data: {e}")
        
        return channel_data
    
    def _find_in_data(self, data, path):
        """Find data in nested structure using path"""
        current = data
        for key in path:
            if isinstance(current, dict) and key in current:
                current = current[key]
            elif isinstance(current, list) and current:
                current = current[0]
            else:
                return None
        return current
    
    def _extract_header_data(self, header):
        """Extract data from header section"""
        data = {}
        
        try:
            # Look for channel title
            title = self._find_in_data(header, ['title'])
            if title:
                data['channel_name'] = self._get_text(title)
            
            # Look for subscriber count
            subscriber = self._find_in_data(header, ['subscriberCountText'])
            if subscriber:
                data['subscribers'] = self._parse_count(self._get_text(subscriber))
            
            # Look for video count
            video_count = self._find_in_data(header, ['videoCountText'])
            if video_count:
                data['video_count'] = self._parse_count(self._get_text(video_count))
            
            # Look for view count
            view_count = self._find_in_data(header, ['viewCountText'])
            if view_count:
                data['total_views'] = self._parse_count(self._get_text(view_count))
            
            # Look for description
            description = self._find_in_data(header, ['description'])
            if description:
                data['description'] = self._get_text(description)
        except Exception as e:
            print(f"Error extracting header data: {e}")
        
        return data
    
    def _extract_tab_data(self, tabs):
        """Extract data from tabs section"""
        data = {}
        
        try:
            for tab in tabs:
                if isinstance(tab, dict) and 'tabRenderer' in tab:
                    tab_content = tab['tabRenderer'].get('content', {})
                    
                    # Look for about section
                    about_section = self._find_in_data(tab_content, ['sectionListRenderer', 'contents'])
                    if about_section:
                        for section in about_section:
                            if isinstance(section, dict) and 'itemSectionRenderer' in section:
                                contents = section['itemSectionRenderer'].get('contents', [])
                                for content in contents:
                                    if isinstance(content, dict) and 'aboutChannelRenderer' in content:
                                        about_data = content['aboutChannelRenderer']
                                        
                                        # Extract description
                                        desc = self._find_in_data(about_data, ['description'])
                                        if desc:
                                            data['description'] = self._get_text(desc)
                                        
                                        # Extract joined date
                                        joined = self._find_in_data(about_data, ['joinedDateText'])
                                        if joined:
                                            data['joined_date'] = self._get_text(joined)
                                        
                                        # Extract country
                                        country = self._find_in_data(about_data, ['country'])
                                        if country:
                                            data['country'] = self._get_text(country)
                                        
                                        break
        except Exception as e:
            print(f"Error extracting tab data: {e}")
        
        return data
    
    def _get_text(self, element):
        """Extract text from element"""
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
    
    def _extract_channel_name_from_url(self, url):
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
    
    def _normalize_url(self, url):
        """Normalize YouTube URL to standard format"""
        if not url:
            return url
        
        # Handle different YouTube URL formats
        if '@' in url:
            # Handle @username format
            username = url.split('@')[-1].split('?')[0]
            return f"https://www.youtube.com/@{username}"
        elif '/channel/' in url:
            return url
        elif '/c/' in url:
            return url
        elif '/user/' in url:
            return url
        else:
            return url
    
    def _extract_channel_info(self, soup, channel_url):
        """Extract channel information from HTML"""
        channel_info = {}
        
        # Try to extract from script tags first (most reliable)
        scripts = soup.find_all('script')
        for script in scripts:
            if script.string and 'var ytInitialData' in script.string:
                try:
                    # Extract JSON data from script
                    json_text = script.string.split('var ytInitialData = ')[1].split(';</script>')[0]
                    data = json.loads(json_text)
                    
                    # Navigate to channel data
                    header = self._navigate_json_path(data, ['header', 'pageHeaderRenderer', 'content'])
                    if header:
                        channel_info.update(self._extract_from_header(header))
                    
                    # Try alternative paths
                    tabs = self._navigate_json_path(data, ['contents', 'twoColumnBrowseResultsRenderer', 'tabs'])
                    if tabs:
                        channel_info.update(self._extract_from_tabs(tabs))
                    
                    break
                except:
                    continue
        
        # Fallback to meta tags and visible text
        if not channel_info.get('channel_name'):
            channel_info.update(self._extract_from_visible_elements(soup))
        
        # Extract from meta tags
        meta_tags = self._extract_from_meta_tags(soup)
        channel_info.update(meta_tags)
        
        return channel_info
    
    def _navigate_json_path(self, data, path):
        """Navigate through nested JSON structure"""
        current = data
        for key in path:
            if isinstance(current, dict) and key in current:
                current = current[key]
            elif isinstance(current, list) and key.isdigit() and int(key) < len(current):
                current = current[int(key)]
            else:
                return None
        return current
    
    def _extract_from_header(self, header):
        """Extract data from header section"""
        info = {}
        
        try:
            # Find title
            title_elem = self._find_element_by_type(header, 'title')
            if title_elem:
                title = self._get_text_from_element(title_elem)
                info['channel_name'] = title
            
            # Find subscriber count
            subscriber_elem = self._find_element_by_text(header, ['subscribers', 'subscriber'])
            if subscriber_elem:
                info['subscribers'] = self._parse_count(subscriber_elem)
            
            # Find video count
            video_elem = self._find_element_by_text(header, ['videos', 'video'])
            if video_elem:
                info['video_count'] = self._parse_count(video_elem)
            
            # Find view count
            view_elem = self._find_element_by_text(header, ['views', 'view'])
            if view_elem:
                info['total_views'] = self._parse_count(view_elem)
            
            # Find description
            desc_elem = self._find_element_by_type(header, 'description')
            if desc_elem:
                info['description'] = self._get_text_from_element(desc_elem)
            
        except Exception as e:
            print(f"Error extracting from header: {e}")
        
        return info
    
    def _extract_from_tabs(self, tabs):
        """Extract data from tabs section"""
        info = {}
        
        try:
            for tab in tabs:
                if isinstance(tab, dict) and 'tabRenderer' in tab:
                    tab_content = tab['tabRenderer'].get('content', {})
                    
                    # Look for about tab
                    if 'sectionListRenderer' in tab_content:
                        sections = tab_content['sectionListRenderer'].get('contents', [])
                        for section in sections:
                            if 'itemSectionRenderer' in section:
                                items = section['itemSectionRenderer'].get('contents', [])
                                for item in items:
                                    if 'aboutChannelRenderer' in item:
                                        about_data = item['aboutChannelRenderer']
                                        info['description'] = self._get_text_from_element(about_data.get('description', {}))
                                        info['joined_date'] = self._get_text_from_element(about_data.get('joinedDateText', {}))
                                        info['country'] = self._get_text_from_element(about_data.get('country', {}))
                                        break
        except Exception as e:
            print(f"Error extracting from tabs: {e}")
        
        return info
    
    def _extract_from_visible_elements(self, soup):
        """Extract data from visible HTML elements"""
        info = {}
        
        # Channel name from title
        title_tag = soup.find('title')
        if title_tag:
            title = title_tag.get_text()
            if ' - YouTube' in title:
                info['channel_name'] = title.replace(' - YouTube', '')
        
        # Meta description
        meta_desc = soup.find('meta', {'name': 'description'})
        if meta_desc:
            content = meta_desc.get('content', '')
            info['description'] = content
        
        return info
    
    def _extract_from_meta_tags(self, soup):
        """Extract data from meta tags"""
        info = {}
        
        # OG tags
        og_title = soup.find('meta', {'property': 'og:title'})
        if og_title:
            title = og_title.get('content', '')
            if ' - YouTube' in title:
                info['channel_name'] = title.replace(' - YouTube', '')
        
        og_description = soup.find('meta', {'property': 'og:description'})
        if og_description:
            info['description'] = og_description.get('content', '')
        
        return info
    
    def _extract_videos(self, soup):
        """Extract video information"""
        videos = []
        
        try:
            # Try to find videos from script data
            scripts = soup.find_all('script')
            for script in scripts:
                if script.string and 'var ytInitialData' in script.string:
                    try:
                        json_text = script.string.split('var ytInitialData = ')[1].split(';</script>')[0]
                        data = json.loads(json_text)
                        
                        # Navigate to video grid
                        contents = self._navigate_json_path(data, ['contents', 'twoColumnBrowseResultsRenderer', 'tabs'])
                        if contents:
                            for tab in contents:
                                if isinstance(tab, dict) and 'tabRenderer' in tab:
                                    tab_content = tab['tabRenderer'].get('content', {})
                                    
                                    # Look for video grid
                                    if 'richGridRenderer' in tab_content:
                                        grid_contents = tab_content['richGridRenderer'].get('contents', [])
                                        for item in grid_contents[:12]:  # Limit to 12 videos
                                            if 'richItemRenderer' in item:
                                                video_data = item['richItemRenderer'].get('content', {})
                                                if 'videoRenderer' in video_data:
                                                    video_info = self._extract_video_info(video_data['videoRenderer'])
                                                    if video_info:
                                                        videos.append(video_info)
                        break
                    except:
                        continue
        except Exception as e:
            print(f"Error extracting videos from script: {e}")
        
        # Fallback: try to find videos from visible elements
        if not videos:
            videos = self._extract_videos_from_visible(soup)
        
        return videos
    
    def _extract_video_info(self, video_data):
        """Extract information from video data"""
        try:
            title = self._get_text_from_element(video_data.get('title', {}))
            view_count = self._get_text_from_element(video_data.get('viewCountText', {}))
            published_time = self._get_text_from_element(video_data.get('publishedTimeText', {}))
            
            # Extract video ID and URL
            navigation_endpoint = video_data.get('navigationEndpoint', {})
            watch_endpoint = navigation_endpoint.get('watchEndpoint', {})
            video_id = watch_endpoint.get('videoId', '')
            
            if title and video_id:
                return {
                    'title': title,
                    'video_id': video_id,
                    'url': f"https://www.youtube.com/watch?v={video_id}",
                    'views': self._parse_count(view_count),
                    'published_time': published_time,
                    'media_type': 'video'
                }
        except Exception as e:
            print(f"Error extracting video info: {e}")
        
        return None
    
    def _extract_videos_from_visible(self, soup):
        """Extract videos from visible HTML elements"""
        videos = []
        
        # Look for video links
        video_links = soup.find_all('a', href=re.compile(r'/watch\?v='))
        
        for link in video_links[:12]:  # Limit to 12 videos
            href = link.get('href', '')
            if '/watch?v=' in href:
                video_id = href.split('v=')[1].split('&')[0] if 'v=' in href else ''
                title = link.get('title', '') or link.get_text(strip=True)
                
                if video_id and title:
                    videos.append({
                        'title': title,
                        'video_id': video_id,
                        'url': f"https://www.youtube.com/watch?v={video_id}",
                        'views': 0,  # Can't extract views from visible HTML easily
                        'published_time': '',
                        'media_type': 'video'
                    })
        
        return videos
    
    def _calculate_metrics(self, channel_data, videos):
        """Calculate additional metrics"""
        metrics = {}
        
        # Average views per video
        total_videos = channel_data.get('video_count', 0)
        total_views = channel_data.get('total_views', 0)
        
        if total_videos > 0:
            metrics['avg_views_per_video'] = total_views // total_videos
        else:
            metrics['avg_views_per_video'] = 0
        
        # Engagement rate estimation (based on recent videos)
        if videos:
            recent_views = [v.get('views', 0) for v in videos[:6] if v.get('views', 0) > 0]
            if recent_views:
                avg_recent_views = sum(recent_views) / len(recent_views)
                subscribers = channel_data.get('subscribers', 1)
                metrics['engagement_rate'] = (avg_recent_views / subscribers) * 100
            else:
                metrics['engagement_rate'] = 0
        else:
            metrics['engagement_rate'] = 0
        
        # Video frequency (estimated)
        if total_videos > 0:
            joined_date = channel_data.get('joined_date', '')
            if joined_date and 'joined' in joined_date.lower():
                # Extract year from joined date
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
    
    def _find_element_by_type(self, data, element_type):
        """Find element by type in nested structure"""
        if isinstance(data, dict):
            for key, value in data.items():
                if key == element_type:
                    return value
                result = self._find_element_by_type(value, element_type)
                if result:
                    return result
        elif isinstance(data, list):
            for item in data:
                result = self._find_element_by_type(item, element_type)
                if result:
                    return result
        return None
    
    def _find_element_by_text(self, data, search_terms):
        """Find element containing specific text"""
        if isinstance(data, dict):
            for key, value in data.items():
                if isinstance(value, str):
                    for term in search_terms:
                        if term.lower() in value.lower():
                            return value
                result = self._find_element_by_text(value, search_terms)
                if result:
                    return result
        elif isinstance(data, list):
            for item in data:
                result = self._find_element_by_text(item, search_terms)
                if result:
                    return result
        return None
    
    def _get_text_from_element(self, element):
        """Extract text from element (handles different formats)"""
        if isinstance(element, str):
            return element
        elif isinstance(element, dict):
            # Common text keys in YouTube data
            for key in ['simpleText', 'text', 'content', 'runs']:
                if key in element:
                    if key == 'runs' and isinstance(element[key], list):
                        return ''.join(run.get('text', '') for run in element[key])
                    return element[key]
            return ''
        elif isinstance(element, list):
            return ' '.join(self._get_text_from_element(item) for item in element)
        else:
            return str(element) if element else ''
    
    def _parse_count(self, count_text):
        """Parse count string to number"""
        if not count_text:
            return 0
        
        if isinstance(count_text, dict):
            count_text = self._get_text_from_element(count_text)
        
        if isinstance(count_text, str):
            # Remove common separators and convert to lowercase
            count_text = count_text.replace(',', '').replace(' ', '').lower()
            
            # Handle K, M, B suffixes
            if 'k' in count_text:
                number = float(count_text.replace('k', ''))
                return int(number * 1000)
            elif 'm' in count_text:
                number = float(count_text.replace('m', ''))
                return int(number * 1000000)
            elif 'b' in count_text:
                number = float(count_text.replace('b', ''))
                return int(number * 1000000000)
            else:
                # Extract pure number
                match = re.search(r'\d+', count_text)
                return int(match.group()) if match else 0
        
        return 0

# Test the extractor
if __name__ == "__main__":
    extractor = YouTubeDataExtractor()
    result = extractor.extract_channel_data("https://youtube.com/@luffyxjoyboy0")
    print(json.dumps(result, indent=2))
