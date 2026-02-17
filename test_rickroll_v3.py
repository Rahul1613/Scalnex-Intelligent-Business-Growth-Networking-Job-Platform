from youtube_comment_downloader import YoutubeCommentDownloader
import sys

def test_id(video_id):
    downloader = YoutubeCommentDownloader()
    print(f"Video ID: {video_id}")
    try:
        # get_comments_from_url also accepts video IDs in some versions/implementations
        # or we can construct a short URL
        url = f"https://youtu.be/{video_id}"
        print(f"Constructed URL: {url}")
        comments = downloader.get_comments_from_url(url)
        batch = []
        for i, c in enumerate(comments):
            batch.append(c)
            if i >= 4: break
        print(f"Fetched {len(batch)} comments.")
        if len(batch) > 0:
            print(f"Sample: {batch[0].get('text')[:30]}")
        else:
            print("NO COMMENTS EXTRACTED.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_id("wQNIELzbOxk")
