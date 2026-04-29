import requests
import json
import time
import os

def test_sentiment_analyzer():
    url = "http://127.0.0.1:5000/api/sentiment/analyze"
    # Using a trending video or a known one for extraction
    payload = {
        "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    }
    
    print(f"Testing E2E for URL: {payload['url']}")
    try:
        response = requests.post(url, json=payload, timeout=120)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("Response Keys:", list(result.keys()))
            
            if result.get('success'):
                analysis = result.get('analysis', {})
                print("\n--- Analysis Summary ---")
                print(f"Total Comments: {analysis.get('stats', {}).get('total')}")
                print(f"Sentiment Score: {analysis.get('sentiment_score')}")
                
                files = analysis.get('files', {})
                print("\n--- Generated Files ---")
                print(f"Excel: {files.get('excel')}")
                print(f"Graphs: {files.get('graphs')}")
                
                # Verify files exist locally
                upload_folder = r"c:\Users\sujal\OneDrive\Desktop\scalnexx\seo\backend\uploads"
                
                if files.get('excel'):
                    excel_path = os.path.join(upload_folder, files.get('excel'))
                    if os.path.exists(excel_path):
                        print(f"SUCCESS: Excel file exists at {excel_path}")
                    else:
                        print(f"FAILURE: Excel file NOT found at {excel_path}")
                
                for g in files.get('graphs', []):
                    g_path = os.path.join(upload_folder, g)
                    if os.path.exists(g_path):
                        print(f"SUCCESS: Graph {g} exists at {g_path}")
                    else:
                        print(f"FAILURE: Graph {g} NOT found at {g_path}")
            else:
                print(f"Error in result: {result.get('error')}")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    # Wait a bit for backend to be ready
    print("Waiting for backend...")
    time.sleep(5)
    test_sentiment_analyzer()
