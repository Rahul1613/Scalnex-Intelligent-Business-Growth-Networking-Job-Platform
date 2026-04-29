from youtube_comment_downloader import YoutubeCommentDownloader
import sys

def test_url(url):
    downloader = YoutubeCommentDownloader()
    print(f"Testing Corrected URL: {url}")
    try:
        comments = downloader.get_comments_from_url(url)
        batch = []
        for i, c in enumerate(comments):
            batch.append(c)
            if i >= 10: break
        print(f"Fetched {len(batch)} comments.")
        if len(batch) > 0:
            for j, c in enumerate(batch[:3]):
                print(f"  [{j}] {c.get('author')}: {c.get('text')[:50]}...")
        else:
            print("NO COMMENTS EXTRACTED.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_url("https://www.youtube.com/watch?v=wQNlELzbOxk")
