import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import os
import time

def generate_insights(filepath):
    """
    Reads a CSV/Excel and generates advanced insights for dashboard visualization.
    Returns a dict with: 'summary_cards', 'charts', 'pdf_path'.
    """
    try:
        df = pd.read_csv(filepath)
    except:
        try:
            df = pd.read_excel(filepath)
        except:
            return {"error": "Unsupported file format. Please use CSV or Excel."}

    # --- Pre-processing ---
    # Detect Date Columns
    date_cols = []
    for col in df.columns:
        if df[col].dtype == 'object':
            try:
                pd.to_datetime(df[col], errors='raise')
                date_cols.append(col)
            except:
                pass
    
    # Use first date col as index if found
    if date_cols:
        date_col = date_cols[0]
        df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
        df = df.sort_values(by=date_col)
    
    # Identify Numeric and Categorical
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
    
    # Assume 'Sales' or 'Revenue' or first numeric is the "Main Metric"
    main_metric = next((col for col in numeric_cols if 'sales' in col.lower() or 'revenue' in col.lower()), numeric_cols[0] if numeric_cols else None)
    
    # --- 1. Summary Cards ---
    summary_cards = []
    summary_cards.append({"title": "Total Rows", "value": f"{len(df):,}"})
    summary_cards.append({"title": "Total Columns", "value": str(len(df.columns))})
    
    if main_metric:
        total_val = df[main_metric].sum()
        summary_cards.append({"title": f"Total {main_metric}", "value": f"{total_val:,.2f}"})
        avg_val = df[main_metric].mean()
        summary_cards.append({"title": f"Avg {main_metric}", "value": f"{avg_val:,.2f}"})
        
    if categorical_cols:
        top_cat_col = categorical_cols[0]
        try:
            top_val = df[top_cat_col].mode()[0]
            summary_cards.append({"title": f"Top {top_cat_col}", "value": str(top_val)})
        except:
            pass

    # --- 2. Advanced Insights (Forecast & Anomalies) ---
    forecast_data = [] # For Chart
    anomalies = []
    
    if main_metric and len(df) > 5:
        # Anomaly Detection (Z-Score)
        mean_val = df[main_metric].mean()
        std_val = df[main_metric].std()
        threshold = 2
        
        anomaly_points = df[(df[main_metric] - mean_val).abs() > threshold * std_val]
        summary_cards.append({"title": "Anomalies Detected", "value": str(len(anomaly_points))})
        
        # Simple Linear Forecast (Next 3 periods)
        # Using index as time proxy
        y = df[main_metric].values
        x = np.arange(len(y))
        
        if len(x) > 1:
            z = np.polyfit(x, y, 1)
            p = np.poly1d(z)
            
            # Forecast next 6 points
            future_x = np.arange(len(x), len(x) + 6)
            future_y = p(future_x)
            
            forecast_data = [{"point": f"Future {i+1}", "value": float(v)} for i, v in enumerate(future_y)]

    # --- 3. Chart Generation (6 Charts) ---
    charts = []

    # Chart 1: Time Series Trend (if date exists) OR Bar Chart of Index
    if date_cols and main_metric:
        # Group by Date
        ts_df = df.groupby(date_cols[0])[main_metric].sum().reset_index()
        charts.append({
            "id": 1,
            "title": f"{main_metric} Over Time",
            "type": "area",
            "xKey": date_cols[0],
            "dataKey": main_metric,
            "data": ts_df.to_dict(orient='records')
        })
    elif main_metric:
        charts.append({
            "id": 1,
            "title": f"Top 20 {main_metric} Entries",
            "type": "bar",
            "xKey": "index",
            "dataKey": main_metric,
            "data": df.head(20).reset_index().to_dict(orient='records')
        })

    # Chart 2: Categorical Distribution
    if categorical_cols:
        cat_col = categorical_cols[0]
        dist = df[cat_col].value_counts().head(5).reset_index()
        dist.columns = ['name', 'value']
        charts.append({
            "id": 2,
            "title": f"Top 5 {cat_col} Distribution",
            "type": "pie",
            "dataKey": "value",
            "nameKey": "name",
            "data": dist.to_dict(orient='records')
        })
    
    # Chart 3: Top Items (Bar)
    if categorical_cols and main_metric:
        cat_col = categorical_cols[0] if len(categorical_cols) == 1 else categorical_cols[1] if len(categorical_cols) > 1 else categorical_cols[0]
        grouped = df.groupby(cat_col)[main_metric].sum().sort_values(ascending=False).head(7).reset_index()
        charts.append({
            "id": 3,
            "title": f"Top 7 {cat_col} by {main_metric}",
            "type": "bar",
            "xKey": cat_col,
            "dataKey": main_metric,
            "data": grouped.to_dict(orient='records')
        })

    # Chart 4: Correlation / Scatter
    if len(numeric_cols) >= 2:
        x_col, y_col = numeric_cols[0], numeric_cols[1]
        # Increase sample size for 10k rows
        scatter_sample = df[[x_col, y_col]].sample(min(1000, len(df)))
        charts.append({
            "id": 4,
            "title": f"{x_col} vs {y_col} (Correlation)",
            "type": "scatter",
            "xKey": x_col,
            "dataKey": y_col,
            "data": scatter_sample.to_dict(orient='records')
        })

    # Chart 5: Forecast Visualization
    if forecast_data:
        charts.append({
            "id": 5,
            "title": f"{main_metric} Forecast (Next 6 Periods)",
            "type": "bar",
            "xKey": "point",
            "dataKey": "value",
            "data": forecast_data
        })
        
    # Chart 6: Data Quality
    metrics_summary = []
    for col in df.columns:
        metrics_summary.append({"column": col, "missing": int(df[col].isna().sum())})
    charts.append({
        "id": 6,
        "title": "Data Quality (Missing Values)",
        "type": "bar_vertical",
        "xKey": "column",
        "dataKey": "missing",
        "data": metrics_summary
    })

    # --- 2.5 Data Health Metrics ---
    duplicates = int(df.duplicated().sum())
    
    # Count zeros in numeric cols
    zeros_count = 0
    if numeric_cols:
        zeros_count = int((df[numeric_cols] == 0).sum().sum())
        
    data_health = {
        "duplicates": duplicates,
        "zeros": zeros_count,
        "missing_breakdown": metrics_summary # Reuse from chart 6 logic
    }

    # --- 4. Generate PDF Report ---
    pdf_filename = f"analytics_report_{int(time.time())}.pdf"
    pdf_path = os.path.join("uploads", pdf_filename)
    
    _generate_pdf(pdf_path, filepath.split('/')[-1], summary_cards, charts, df, data_health)

    return {
        "filename": filepath.split('/')[-1],
        "summary_cards": summary_cards,
        "charts": charts,
        "data_health": data_health,
        "pdf_filename": pdf_filename
    }

def _generate_pdf(output_path, filename, summary, charts, df, data_health={}):
    """Internal helper to generate PDF using ReportLab"""
    try:
        doc = SimpleDocTemplate(output_path, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
        story = []
        styles = getSampleStyleSheet()
        
        # Title
        story.append(Paragraph(f"Advanced Analytics Report", styles['Title']))
        story.append(Paragraph(f"Source File: {filename}", styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Summary Section
        story.append(Paragraph("Executive Summary", styles['Heading2']))
        data = [[item['title'], item['value']] for item in summary]
        t = Table(data, colWidths=[200, 150])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(t)
        story.append(Spacer(1, 20))
        
        # Automatic Insights
        story.append(Paragraph("Automated Data Insights", styles['Heading2']))
        story.append(Paragraph("• Trends and patterns were analyzed using statistical models.", styles['Normal']))
        story.append(Paragraph("• Anomalies were checked using Z-Score deviation.", styles['Normal']))
        story.append(Paragraph("• Forecasting was applied using linear regression.", styles['Normal']))
        story.append(Spacer(1, 10))
        
        # Data Health Section
        story.append(Paragraph("Data Health & Quality", styles['Heading2']))
        health_data = [
            ["Metric", "Count"],
            ["Duplicate Rows", str(data_health.get('duplicates', 0))],
            ["Cells with Zero Value", str(data_health.get('zeros', 0))],
            ["Columns with Missing Data", str(len([m for m in data_health.get('missing_breakdown', []) if m['missing'] > 0]))]
        ]
        t_health = Table(health_data, colWidths=[200, 100], hAlign='LEFT')
        t_health.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (1, 0), colors.HexColor('#e5e7eb')),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('PADDING', (0, 0), (-1, -1), 6),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.red if data_health.get('duplicates', 0) > 0 else colors.black),
        ]))
        story.append(t_health)
        story.append(Spacer(1, 15))
        
        # Generate and Embed Charts (Matplotlib)
        # We need to recreate 1-2 key charts for the PDF
        if len(charts) > 0:
            main_chart = charts[0] # Time series or Main Bar
            plt.figure(figsize=(6, 4))
            
            x_vals = [str(d[main_chart['xKey']]) for d in main_chart['data']]
            y_vals = [d[main_chart['dataKey']] for d in main_chart['data']]
            
            plt.plot(x_vals, y_vals, marker='o')
            plt.title(main_chart['title'])
            plt.xticks(rotation=45)
            plt.tight_layout()
            
            chart_img = f"uploads/temp_chart_{int(time.time())}.png"
            plt.savefig(chart_img)
            plt.close()
            
            story.append(RLImage(chart_img, width=400, height=250))
        
        story.append(PageBreak())
        story.append(Paragraph("End of Report", styles['Normal']))
        
        doc.build(story)
        return True
    except Exception as e:
        print(f"PDF Gen Error: {e}")
        return False

def answer_query(filepath, query):
    # Keep existing simple query logic for now
    try:
        df = pd.read_csv(filepath)
    except:
        df = pd.read_excel(filepath)
    query = query.lower()
    
    if "total" in query:
        num_cols = df.select_dtypes(include=[np.number]).columns
        for col in num_cols:
            if col.lower() in query:
                return f"Total {col} is {df[col].sum():,.2f}"
    
    return "I analyzed the data. Try asking for 'total sales' or specifics."
