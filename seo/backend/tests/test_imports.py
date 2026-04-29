import sys
import os

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    print("Attempting imports...")
    from advanced_seo_analyzer import AdvancedSEOAnalyzer
    from services.seo.performance_analyzer import fetch_page
    from textblob import TextBlob
    from sklearn.feature_extraction.text import TfidfVectorizer
    print("SUCCESS: All imports working correctly.")
except Exception as e:
    print(f"FAILURE: Import validation failed: {e}")
    sys.exit(1)
