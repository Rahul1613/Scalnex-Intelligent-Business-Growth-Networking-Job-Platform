from youtube_comment_downloader import YoutubeCommentDownloader, SORT_BY_RECENT
import traceback

def test_downloader(url):
    downloader = YoutubeCommentDownloader()
    print(f"--- Testing URL: {url} ---")
    try:
        generator = downloader.get_comments_from_url(url, sort_by=SORT_BY_RECENT)
        count = 0
        for comment in generator:
            print(f"[{count}] {comment.get('author')}: {comment.get('text')[:40]}...")
            count += 1
            if count >= 10: break
        print(f"Total fetched: {count}")
        if count == 0:
            print("No comments found. This might mean the scraper is being blocked or the video has no comments.")
    except Exception as e:
        print(f"An error occurred: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    # Test with the user's URL
    test_downloader("https://www.youtube.com/watch?v=wQNIELzbOxk")
    # Test with another popular video
    test_downloader("https://www.youtube.com/watch?v=9bZkp7q19f0") # PSY - GANGNAM STYLE
