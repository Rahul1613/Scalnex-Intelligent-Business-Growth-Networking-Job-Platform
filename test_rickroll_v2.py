from youtube_comment_downloader import YoutubeCommentDownloader
import sys

def test_url(url):
    downloader = YoutubeCommentDownloader()
    print(f"URL: {url} (No Sort)")
    try:
        comments = downloader.get_comments_from_url(url) # Removed sort_by
        batch = []
        for i, c in enumerate(comments):
            batch.append(c)
            if i >= 4: break
        print(f"Fetched {len(batch)} comments in batch test.")
        if len(batch) > 0:
            print(f"Sample: {batch[0].get('text')[:30]}")
        else:
            print("NO COMMENTS EXTRACTED.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_url("https://www.youtube.com/watch?v=wQNIELzbOxk")
