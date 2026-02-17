from youtube_comment_downloader import YoutubeCommentDownloader, SORT_BY_RECENT
import json

def test_downloader(url):
    downloader = YoutubeCommentDownloader()
    print(f"Testing URL: {url}")
    try:
        comments = downloader.get_comments_from_url(url, sort_by=SORT_BY_RECENT)
        count = 0
        for comment in comments:
            print(f"Comment {count}: {comment.get('text')[:50]}...")
            count += 1
            if count >= 5: break
        print(f"Total fetched for test: {count}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_downloader("https://www.youtube.com/watch?v=wQNIELzbOxk")
