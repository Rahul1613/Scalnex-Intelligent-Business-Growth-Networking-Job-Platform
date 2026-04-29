from advanced_seo_analyzer import AdvancedSEOAnalyzer
import json

def test_full_analysis():
    url = "https://www.google.com"
    print(f"Testing full SEO analysis for: {url}")
    
    analyzer = AdvancedSEOAnalyzer(url)
    report = analyzer.analyze()
    
    keys_to_check = [
        'on_page_seo', 'technical_seo', 'content_quality', 
        'keyword_research', 'backlinks', 'internal_links', 
        'user_experience', 'structured_data', 'performance', 
        'security', 'recommendations', 'overall_score'
    ]
    
    missing = []
    for key in keys_to_check:
        if key not in report:
            missing.append(key)
        else:
            print(f"✅ {key} present")
    
    if missing:
        print(f"❌ Missing keys: {missing}")
    else:
        print("🚀 SUCCESS: All SEO modules integrated and returning data!")
        
    # Print overall score
    print(f"Overall Score: {report.get('overall_score')}")

if __name__ == "__main__":
    test_full_analysis()
