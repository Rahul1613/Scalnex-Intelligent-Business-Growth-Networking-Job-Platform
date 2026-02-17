from youtube_comment_downloader import YoutubeCommentDownloader, SORT_BY_RECENT
import sys

def test_url(url):
    downloader = YoutubeCommentDownloader()
    print(f"URL: {url}")
    try:
        comments = downloader.get_comments_from_url(url, sort_by=SORT_BY_RECENT)
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
    if len(sys.argv) > 1:
        test_url(sys.argv[1])
    else:
        test_url("https://www.youtube.com/watch?v=wQNIELzbOxk")
