import sys
import os
import pandas as pd
import numpy as np
import json
import logging

# Add the backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from advanced_analytics_engine import AdvancedAnalyticsEngine
from analytics_engine import generate_insights

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def generate_large_dataset(filename, rows=10000):
    """Generate a large mock dataset for testing"""
    print(f"Generating large dataset with {rows} rows...")
    dates = pd.date_range(start='2020-01-01', periods=rows, freq='h')
    data = {
        'Date': dates,
        'Revenue': np.random.randint(100, 1000, size=rows),
        'Orders': np.random.randint(5, 50, size=rows),
        'Category': np.random.choice(['Electronics', 'Books', 'Clothing', 'Home', 'Toys'], size=rows),
        'Region': np.random.choice(['North', 'South', 'East', 'West'], size=rows),
        'Feedback_Score': np.random.uniform(1.0, 5.0, size=rows)
    }
    df = pd.DataFrame(data)
    
    # Ensure some missing values and duplicates for health check
    df.loc[np.random.choice(df.index, 100), 'Revenue'] = np.nan
    df = pd.concat([df, df.head(50)], ignore_index=True)
    
    filepath = os.path.join('uploads', filename)
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
        
    df.to_csv(filepath, index=False)
    print(f"File saved to {filepath}")
    return filepath

class CustomEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(CustomEncoder, self).default(obj)

def test_large_analysis(filepath):
    print(f"\n--- Testing Large Data Analysis for: {filepath} ---")
    try:
        # 1. Advanced Analytics Engine
        engine = AdvancedAnalyticsEngine()
        print("Running AdvancedAnalyticsEngine.analyze...")
        results = engine.analyze(filepath)
        
        print(f"Rows processed: {results['summary']['rows']}")
        print(f"Auto Charts generated: {len(results['auto_charts'])}")
        
        # Verify scatter plot has sampling
        scatter = next((c for c in results['auto_charts'] if c['type'] == 'scatter'), None)
        if scatter:
            print(f"Scatter plot points: {len(scatter['data'])}")
            
        # Verify raw data limit
        print(f"Raw data rows: {len(results['raw_data'])}")
        
        # 2. Legacy Analytics Engine
        print("\nRunning legacy generate_insights...")
        insights = generate_insights(filepath)
        print(f"Summary cards: {len(insights['summary_cards'])}")
        print(f"Charts generated: {len(insights['charts'])}")
        
        # Verify Time Series distribution in legacy
        ts_chart = next((c for c in insights['charts'] if c['id'] == 1), None)
        if ts_chart:
            print(f"Time series points: {len(ts_chart['data'])}")

        print("\n--- Test Completed Successfully ---")
        
        # Save results for inspection
        with open('test_large_analytics_report.json', 'w') as f:
            json.dump({'advanced': results, 'legacy': insights}, f, indent=4, cls=CustomEncoder)
        print("Full report saved to test_large_analytics_report.json")
        
    except Exception as e:
        print(f"Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    filepath = generate_large_dataset('test_large_data.csv', 10000)
    test_large_analysis(filepath)
