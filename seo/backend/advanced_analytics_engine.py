import pandas as pd
import numpy as np
import os
import time
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Any, Optional

class AdvancedAnalyticsEngine:
    def __init__(self):
        self.upload_folder = "uploads"
        if not os.path.exists(self.upload_folder):
            os.makedirs(self.upload_folder)

    def clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Robust data cleaning: handles missing values and outliers."""
        # 1. Handle missing values
        # Fill numeric with mean, categorical with mode
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns
        
        for col in numeric_cols:
            df[col] = df[col].fillna(df[col].mean())
            
        for col in categorical_cols:
            if not df[col].mode().empty:
                df[col] = df[col].fillna(df[col].mode()[0])
        
        # 2. Outlier detection and capping (1st and 99th percentile)
        for col in numeric_cols:
            lower = df[col].quantile(0.01)
            upper = df[col].quantile(0.99)
            df[col] = df[col].clip(lower, upper)
            
        return df

    def get_segments(self, df: pd.DataFrame, n_clusters: int = 3) -> Dict[str, Any]:
        """Customer/Product segmentation using K-means clustering (Simulated)."""
        numeric_df = df.select_dtypes(include=[np.number])
        if numeric_df.empty or len(df) < n_clusters:
            return {"error": "Insufficient numeric data for segmentation"}
        
        # Scaling
        scaler = StandardScaler()
        scaled_data = scaler.fit_transform(numeric_df.fillna(0))
        
        # KMeans
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        df['segment'] = kmeans.fit_predict(scaled_data)
        
        segment_summary = []
        for i in range(n_clusters):
            segment_data = df[df['segment'] == i]
            summary = {
                "id": i,
                "name": f"Segment {i+1}",
                "size": len(segment_data),
                "percentage": round((len(segment_data) / len(df)) * 100, 1)
            }
            # Add top features of segment
            if not numeric_df.empty:
                summary["avg_value"] = round(segment_data[numeric_df.columns[0]].mean(), 2)
            segment_summary.append(summary)
            
        return {
            "segments": segment_summary,
            "data": df.sample(min(500, len(df))).to_dict(orient='records') # Return representative sample
        }

    def get_forecast(self, df: pd.DataFrame, target_col: str, periods: int = 6) -> List[Dict[str, Any]]:
        """Trend forecasting using robust linear extrapolation."""
        try:
            y = df[target_col].values
            x = np.arange(len(y))
            
            if len(y) < 2:
                return []
                
            # Weighted linear regression to favor recent trends
            weights = np.linspace(0.5, 1.0, len(y))
            z = np.polyfit(x, y, 1, w=weights)
            p = np.poly1d(z)
            
            future_x = np.arange(len(x), len(x) + periods)
            future_y = p(future_x)
            
            # Ensure no negative forecasts for positive metrics
            if np.all(y >= 0):
                future_y = np.maximum(future_y, 0)
                
            return [{"period": f"Month {i+1}", "value": float(v)} for i, v in enumerate(future_y)]
        except Exception as e:
            print(f"Forecasting error: {e}")
            return []

    def get_correlations(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Identify multi-metric correlations."""
        numeric_df = df.select_dtypes(include=[np.number])
        if numeric_df.empty:
            return []
            
        corr_matrix = numeric_df.corr().round(2)
        corrs = []
        
        cols = corr_matrix.columns
        for i in range(len(cols)):
            for j in range(i + 1, len(cols)):
                val = corr_matrix.iloc[i, j]
                if abs(val) > 0.3: # Only significant correlations
                    corrs.append({
                        "metric_a": cols[i],
                        "metric_b": cols[j],
                        "value": float(val),
                        "strength": "Strong" if abs(val) > 0.7 else "Moderate"
                    })
                    
        return sorted(corrs, key=lambda x: abs(x['value']), reverse=True)[:5]

    def generate_smart_charts(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Automatically generate 4-6 interesting charts based on data types."""
        charts = []
        
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
        date_cols = []
        
        # Try to identify date columns
        for col in categorical_cols:
            if 'date' in col.lower() or 'time' in col.lower() or 'day' in col.lower():
                try:
                    pd.to_datetime(df[col], errors='ignore')
                    date_cols.append(col)
                except:
                    pass

        # 1. Time Series (if date column exists)
        if date_cols and numeric_cols:
            date_col = date_cols[0]
            val_col = numeric_cols[0]
            # Group by date and sum
            try:
                time_data = df.groupby(date_col)[val_col].sum().reset_index()
                if len(time_data) > 30:
                    # If too many points, sample or aggregate further (e.g. top 30)
                    time_data = time_data.sample(n=30).sort_values(by=date_col)
                charts.append({
                    "id": "trend",
                    "title": f"{val_col} Over Time",
                    "type": "area",
                    "xKey": date_col,
                    "dataKey": val_col,
                    "data": time_data.to_dict(orient='records')
                })
            except: pass

        # 2. Categorical Distribution (Top 10 items)
        if categorical_cols:
            cat_col = categorical_cols[0]
            counts = df[cat_col].value_counts().head(10).reset_index()
            counts.columns = [cat_col, 'count']
            charts.append({
                "id": "distribution",
                "title": f"Top 10 {cat_col} Distribution",
                "type": "pie",
                "nameKey": cat_col,
                "dataKey": "count",
                "data": counts.to_dict(orient='records')
            })

        # 3. Numeric Breakdown by Category (Bar Chart)
        if categorical_cols and numeric_cols:
            cat_col = categorical_cols[0]
            num_col = numeric_cols[0] if len(numeric_cols) == 1 else numeric_cols[1] if len(numeric_cols) > 1 else numeric_cols[0]
            
            # Avg value by primary category
            try:
                bar_data = df.groupby(cat_col)[num_col].mean().sort_values(ascending=False).head(15).reset_index()
                charts.append({
                    "id": "breakdown",
                    "title": f"Average {num_col} by {cat_col}",
                    "type": "bar",
                    "xKey": cat_col,
                    "dataKey": num_col,
                    "data": bar_data.to_dict(orient='records')
                })
            except: pass

        # 4. Correlation / Scatter (Numeric vs Numeric)
        if len(numeric_cols) >= 2:
            x_col = numeric_cols[0]
            y_col = numeric_cols[1]
            # Sample up to 1000 points for a representative scatter plot
            scatter_sample = df[[x_col, y_col]].sample(min(1000, len(df)))
            charts.append({
                "id": "correlation",
                "title": f"{x_col} vs {y_col} (Sampled)",
                "type": "scatter",
                "xKey": x_col,
                "dataKey": y_col,
                "data": scatter_sample.to_dict(orient='records')
            })
            
        # 5. Histogram / Value Distribution (Bar)
        if len(numeric_cols) > 2:
             target = numeric_cols[2]
             # If too many unique values, create bins
             if df[target].nunique() > 20:
                 counts, bin_edges = np.histogram(df[target].dropna(), bins=15)
                 dist_data = []
                 for i in range(len(counts)):
                     dist_data.append({
                         "range": f"{bin_edges[i]:.2f}-{bin_edges[i+1]:.2f}",
                         "count": int(counts[i])
                     })
                 charts.append({
                    "id": "numeric_dist",
                    "title": f"{target} Distribution (Binned)",
                    "type": "bar",
                    "xKey": "range",
                    "dataKey": "count",
                    "data": dist_data
                 })
             else:
                 dist_data = df[target].value_counts().sort_index().reset_index()
                 dist_data.columns = [target, 'count']
                 charts.append({
                    "id": "numeric_dist",
                    "title": f"{target} Frequency",
                    "type": "bar",
                    "xKey": target,
                    "dataKey": "count",
                    "data": dist_data.to_dict(orient='records')
                 })

             return charts

    def analyze(self, filepath: str) -> Dict[str, Any]:
        """
        Full BI Analysis pipeline - Main entry point for analytics.
        Orchestrates all analysis methods and returns comprehensive report.
        """
        try:
            # Load data
            if filepath.endswith('.csv'):
                df = pd.read_csv(filepath)
            else:
                df = pd.read_excel(filepath)
        except Exception as e:
            return {"error": f"Read error: {str(e)}"}

        # Clean data
        df = self.clean_data(df)
        
        # Extract metadata
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
        
        main_metric = numeric_cols[0] if numeric_cols else None
        
        # Build comprehensive results
        results = {
            "summary": {
                "rows": len(df),
                "cols": len(df.columns),
                "numeric": len(numeric_cols),
                "categorical": len(categorical_cols)
            },
            "correlations": self.get_correlations(df),
            "data_health": {
                "missing": int(df.isna().sum().sum()),
                "duplicates": int(df.duplicated().sum())
            },
            "columns": [{"name": c, "type": str(df[c].dtype)} for c in df.columns],
            "raw_data": df.head(5000).fillna(0).to_dict(orient='records'),
            "auto_charts": self.generate_smart_charts(df)
        }
        
        # Add advanced analytics if we have numeric data
        if main_metric:
            results["forecast"] = self.get_forecast(df, main_metric)
            results["segmentation"] = self.get_segments(df)
            
        return results
