from youtube_comment_downloader import YoutubeCommentDownloader
import time

def test_multi():
    downloader = YoutubeCommentDownloader()
    urls = [
        "https://www.youtube.com/watch?v=9bZkp7q19f0", # Gangnam
        "https://www.youtube.com/watch?v=kJQP7kiw5Fk", # Despacito
        "https://www.youtube.com/watch?v=JGwWNGJdvx8", # Ed Sheeran
        "https://www.youtube.com/watch?v=wQNIELzbOxk"  # Rickroll
    ]
    for url in urls:
        print(f"Testing: {url}")
        try:
            start = time.time()
            comments = downloader.get_comments_from_url(url)
            count = 0
            for c in comments:
                count += 1
                if count >= 3: break
            print(f"-> Result: {'SUCCESS' if count > 0 else 'FAILED'} (Fetched {count}, Time: {time.time()-start:.2f}s)")
        except Exception as e:
            print(f"-> Error: {e}")

if __name__ == "__main__":
    test_multi()
