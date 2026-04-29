import requests
import json

def test_e2e(url):
    print(f"Testing E2E for URL: {url}")
    payload = {"url": url}
    try:
        response = requests.post("http://127.0.0.1:5000/api/sentiment/analyze", json=payload, timeout=120)
        print(f"Status Code: {response.status_code}")
        result = response.json()
        if result.get('success'):
            analysis = result.get('analysis', {})
            print(f"Success! Sentiment Score: {analysis.get('sentiment_score')}")
            print(f"Total Comments: {analysis.get('stats', {}).get('total')}")
            print(f"AI Summary: {analysis.get('ai_summary')}")
        else:
            print(f"Failure: {result.get('error')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_e2e("https://www.youtube.com/watch?v=wQNlELzbOxk")
