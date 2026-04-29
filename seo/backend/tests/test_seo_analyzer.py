import sys
import os
import json
import logging

# Add the backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from advanced_seo_analyzer import AdvancedSEOAnalyzer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_analysis(url):
    print(f"\n--- Testing Analysis for: {url} ---")
    try:
        analyzer = AdvancedSEOAnalyzer(url)
        print(f"Initialized analyzer for domain: {analyzer.domain}")
        
        print("Starting analysis (this may take a while if PageSpeed is hit)...")
        report = analyzer.analyze()
        
        # Save report to a file for inspection
        with open('test_report.json', 'w') as f:
            json.dump(report, f, indent=4)
        print("Report saved to test_report.json")
        
        if 'error' in report:
            print(f"Error during analysis: {report['error']}")
            return
            
        print("\n--- Analysis Results ---")
        print(f"Overall Score: {report.get('overall_score')}")
        
        # Check Backlinks (should not be generic mock anymore)
        bl = report.get('backlinks', {})
        print(f"\nBacklinks:")
        print(f"  Total: {bl.get('total_backlinks')}")
        print(f"  Referring Domains: {bl.get('referring_domains')}")
        print(f"  Domain Authority: {bl.get('domain_authority')}")
        
        # Check Internal Links
        il = report.get('internal_links', {})
        print(f"\nInternal Links:")
        print(f"  Total: {il.get('total_internal_links')}")
        print(f"  Diversity: {il.get('anchor_text_diversity', {}).get('diversity_score')}%")
        
        # Check UX
        ux = report.get('user_experience', {})
        print(f"\nUser Experience:")
        print(f"  Score: {ux.get('score')}")
        print(f"  LCP: {ux.get('core_web_vitals', {}).get('lcp')}")
        print(f"  CLS Status: {ux.get('layout_stability', {}).get('cls_status')}")
        
        # Check Content Quality
        cq = report.get('content_quality', {})
        print(f"\nContent Quality:")
        print(f"  Score: {cq.get('score')}")
        print(f"  Intent: {cq.get('user_intent', {}).get('primary_intent')}")
        print(f"  Word Count: {cq.get('content_quality', {}).get('word_count')}")
        
        print("\n--- Test Completed Successfully ---")
        
    except Exception as e:
        print(f"Test failed with exception: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # Test with a simple, reliable URL
    test_url = "https://www.google.com"
    test_analysis(test_url)
