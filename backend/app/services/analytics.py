import pandas as pd
import os
from datetime import datetime
from typing import List, Dict

class AnalyticsService:
    def __init__(self, db=None):
        # db parameter for compatibility with existing main.py
        # Load CSV data once when service starts
        csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'Sample - Superstore.csv')
        self.df = pd.read_csv(csv_path)
        
        # Convert Order Date to datetime
        self.df['Order Date'] = pd.to_datetime(self.df['Order Date'])
        self.df['Year-Month'] = self.df['Order Date'].dt.to_period('M')
        
    def get_kpis(self) -> Dict:
        """Get key performance indicators"""
        total_sales = float(self.df['Sales'].sum())
        total_customers = int(self.df['Customer ID'].nunique())
        total_orders = int(self.df['Order ID'].nunique())
        total_profit = float(self.df['Profit'].sum())
        avg_profit_margin = (total_profit / total_sales * 100) if total_sales > 0 else 0
        
        return {
            "total_sales": total_sales,
            "total_customers": total_customers,
            "total_orders": total_orders,
            "avg_profit_margin": round(avg_profit_margin, 2),
            "total_profit": total_profit
        }
    
    def get_sales_trends(self) -> List[Dict]:
        """Get monthly sales trends"""
        monthly_sales = self.df.groupby('Year-Month')['Sales'].sum().reset_index()
        monthly_sales['Year-Month'] = monthly_sales['Year-Month'].astype(str)
        
        return [
            {
                "month": row['Year-Month'],
                "sales": float(row['Sales'])
            }
            for _, row in monthly_sales.iterrows()
        ]
    
    def get_regional_performance(self) -> List[Dict]:
        """Get sales performance by region"""
        regional_data = self.df.groupby('Region').agg({
            'Sales': 'sum',
            'Order ID': 'nunique'
        }).reset_index()
        
        return [
            {
                "region": row['Region'],
                "sales": float(row['Sales']),
                "orders": int(row['Order ID'])
            }
            for _, row in regional_data.iterrows()
        ]
    
    def get_category_analysis(self) -> List[Dict]:
        """Get product category performance"""
        category_data = self.df.groupby('Category').agg({
            'Sales': 'sum',
            'Order ID': 'nunique',
            'Quantity': 'sum'
        }).reset_index()
        
        return [
            {
                "category": row['Category'],
                "total_sales": float(row['Sales']),
                "total_orders": int(row['Order ID']),
                "total_quantity": int(row['Quantity'])
            }
            for _, row in category_data.iterrows()
        ]
    
    def get_customer_segments(self) -> List[Dict]:
        """Get customer segment analysis"""
        segment_data = self.df.groupby('Segment').agg({
            'Customer ID': 'nunique'
        }).reset_index()
        
        total_customers = segment_data['Customer ID'].sum()
        
        return [
            {
                "segment": row['Segment'],
                "count": int(row['Customer ID']),
                "percentage": round((row['Customer ID'] / total_customers * 100), 1)
            }
            for _, row in segment_data.iterrows()
        ]
    
    def get_top_products(self, limit: int = 10) -> List[Dict]:
        """Get top performing products by sales"""
        product_data = self.df.groupby(['Product ID', 'Product Name', 'Category']).agg({
            'Sales': 'sum',
            'Quantity': 'sum'
        }).reset_index().sort_values('Sales', ascending=False).head(limit)
        
        return [
            {
                "product_name": row['Product Name'],
                "category": row['Category'],
                "total_quantity": int(row['Quantity']),
                "total_sales": float(row['Sales'])
            }
            for _, row in product_data.iterrows()
        ]
    
    # Keep filtered methods for compatibility (they'll just call the main methods)
    def get_kpis_filtered(self, filters: dict = None) -> Dict:
        return self.get_kpis()
    
    def get_sales_trends_filtered(self, filters: dict = None) -> List[Dict]:
        return self.get_sales_trends()
    
    def get_regional_performance_filtered(self, filters: dict = None) -> List[Dict]:
        return self.get_regional_performance()
    
    def get_top_products_filtered(self, filters: dict = None, limit: int = 10) -> List[Dict]:
        return self.get_top_products(limit)