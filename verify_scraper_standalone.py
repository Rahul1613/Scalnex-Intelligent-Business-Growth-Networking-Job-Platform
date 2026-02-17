import sys
import os

# Add the backend directory to sys.path
backend_dir = r"c:\Users\sujal\OneDrive\Desktop\scalnexx\seo\backend"
sys.path.append(backend_dir)

from social_media_scraper import YouTubeScraper

def verify_scraper():
    url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ" # Rickroll
    print(f"VERIFY: Starting standalone test for {url}")
    
    scraper = YouTubeScraper(url)
    result = scraper.scrape_profile()
    
    if result.get('success'):
        print("\n--- STANDALONE SUCCESS ---")
        print(f"Total Comments: {result['summary']['total']}")
        print(f"Sentiment breakdown: {result['summary']}")
        print(f"Excel Report: {result['files']['excel']}")
        print(f"Graphs Generated: {len(result['files']['graphs'])}")
        for g in result['files']['graphs']:
            print(f" - {g}")
            
        # Check files exist
        upload_folder = 'uploads'
        excel_path = os.path.join(upload_folder, result['files']['excel'])
        if os.path.exists(excel_path):
            print(f"OK: Excel file exists at {excel_path}")
        else:
            print(f"ERROR: Excel file missing at {excel_path}")
            
    else:
        print("\n--- STANDALONE FAILURE ---")
        print(f"Error: {result.get('error')}")

if __name__ == "__main__":
    verify_scraper()
