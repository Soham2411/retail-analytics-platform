# backend/app/services/geographic_analytics.py
from sqlalchemy.orm import Session
from typing import Dict, List, Any, Optional
import pandas as pd
from datetime import datetime

class GeographicAnalyticsService:
    
    @staticmethod
    def get_sales_by_region(
        db: Session,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        category: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get sales data aggregated by region for heatmap visualization"""
        
        # Base query
        query = """
        SELECT 
            o.region,
            COUNT(DISTINCT o.order_id) as total_orders,
            COUNT(DISTINCT o.customer_id) as unique_customers,
            SUM(o.quantity * p.price) as total_revenue,
            AVG(o.quantity * p.price) as avg_order_value,
            SUM(o.quantity) as total_units_sold,
            COUNT(DISTINCT p.product_id) as unique_products_sold
        FROM orders o
        JOIN products p ON o.product_id = p.product_id
        WHERE 1=1
        """
        
        params = []
        
        # Add date filters
        if start_date:
            query += " AND o.order_date >= %s"
            params.append(start_date)
        if end_date:
            query += " AND o.order_date <= %s"
            params.append(end_date)
        if category:
            query += " AND p.category = %s"
            params.append(category)
            
        query += " GROUP BY o.region ORDER BY total_revenue DESC"
        
        # Execute query
        df = pd.read_sql(query, db.bind, params=params)
        
        # Calculate additional metrics
        df['revenue_per_customer'] = df['total_revenue'] / df['unique_customers']
        df['market_share'] = (df['total_revenue'] / df['total_revenue'].sum() * 100).round(2)
        
        # Convert to list of dictionaries for JSON response
        regions_data = df.to_dict('records')
        
        # Calculate summary statistics
        summary = {
            'total_regions': len(df),
            'total_revenue': float(df['total_revenue'].sum()),
            'total_orders': int(df['total_orders'].sum()),
            'total_customers': int(df['unique_customers'].sum()),
            'top_region': {
                'name': df.iloc[0]['region'] if not df.empty else None,
                'revenue': float(df.iloc[0]['total_revenue']) if not df.empty else 0,
                'market_share': float(df.iloc[0]['market_share']) if not df.empty else 0
            }
        }
        
        return {
            'regions': regions_data,
            'summary': summary
        }
    
    @staticmethod
    def get_sales_by_state(
        db: Session,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        category: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get sales data by state (simulated from regions for demo)"""
        
        # For demo purposes, we'll create state-level data from regions
        # In a real scenario, you'd have actual state data in your database
        
        region_data = GeographicAnalyticsService.get_sales_by_region(
            db, start_date, end_date, category
        )
        
        # Simulate state data by breaking down regions
        state_mapping = {
            'North': ['New York', 'Vermont', 'Maine', 'New Hampshire'],
            'South': ['Florida', 'Georgia', 'Alabama', 'South Carolina'],
            'East': ['Virginia', 'North Carolina', 'Maryland', 'Delaware'],
            'West': ['California', 'Nevada', 'Oregon', 'Washington'],
            'Central': ['Texas', 'Oklahoma', 'Kansas', 'Nebraska']
        }
        
        states_data = []
        for region in region_data['regions']:
            region_name = region['region']
            if region_name in state_mapping:
                states_in_region = state_mapping[region_name]
                # Distribute region data across states (simplified)
                for i, state in enumerate(states_in_region):
                    # Use different distribution weights
                    weight = [0.4, 0.3, 0.2, 0.1][i] if i < 4 else 0.1
                    
                    states_data.append({
                        'state': state,
                        'state_code': state[:2].upper(),
                        'region': region_name,
                        'total_revenue': float(region['total_revenue'] * weight),
                        'total_orders': int(region['total_orders'] * weight),
                        'unique_customers': int(region['unique_customers'] * weight),
                        'avg_order_value': float(region['avg_order_value']),
                        'market_share': float(region['market_share'] * weight)
                    })
        
        return {
            'states': states_data,
            'summary': region_data['summary']
        }
    
    @staticmethod
    def get_geographic_trends(
        db: Session,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Get geographic trends over time"""
        
        query = """
        SELECT 
            o.region,
            DATE_TRUNC('month', o.order_date) as month,
            SUM(o.quantity * p.price) as monthly_revenue,
            COUNT(DISTINCT o.order_id) as monthly_orders,
            COUNT(DISTINCT o.customer_id) as monthly_customers
        FROM orders o
        JOIN products p ON o.product_id = p.product_id
        WHERE 1=1
        """
        
        params = []
        if start_date:
            query += " AND o.order_date >= %s"
            params.append(start_date)
        if end_date:
            query += " AND o.order_date <= %s"
            params.append(end_date)
            
        query += " GROUP BY o.region, DATE_TRUNC('month', o.order_date) ORDER BY month, o.region"
        
        df = pd.read_sql(query, db.bind, params=params)
        df['month'] = df['month'].dt.strftime('%Y-%m')
        
        # Calculate growth rates
        trends_data = []
        for region in df['region'].unique():
            region_df = df[df['region'] == region].sort_values('month')
            region_df['revenue_growth'] = region_df['monthly_revenue'].pct_change() * 100
            region_df['order_growth'] = region_df['monthly_orders'].pct_change() * 100
            
            trends_data.extend(region_df.to_dict('records'))
        
        return {
            'trends': trends_data,
            'regions': df['region'].unique().tolist()
        }
    
    @staticmethod
    def get_regional_comparison(
        db: Session,
        metric: str = 'revenue',
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Compare regions across different metrics"""
        
        valid_metrics = ['revenue', 'orders', 'customers', 'aov']
        if metric not in valid_metrics:
            metric = 'revenue'
        
        # Get regional data
        region_data = GeographicAnalyticsService.get_sales_by_region(
            db, start_date, end_date
        )
        
        # Sort by selected metric
        metric_mapping = {
            'revenue': 'total_revenue',
            'orders': 'total_orders', 
            'customers': 'unique_customers',
            'aov': 'avg_order_value'
        }
        
        sorted_regions = sorted(
            region_data['regions'],
            key=lambda x: x[metric_mapping[metric]],
            reverse=True
        )
        
        # Calculate percentiles and rankings
        values = [r[metric_mapping[metric]] for r in sorted_regions]
        for i, region in enumerate(sorted_regions):
            region['rank'] = i + 1
            region['percentile'] = ((len(sorted_regions) - i) / len(sorted_regions)) * 100
        
        return {
            'regions': sorted_regions,
            'metric': metric,
            'summary': {
                'best_performer': sorted_regions[0] if sorted_regions else None,
                'worst_performer': sorted_regions[-1] if sorted_regions else None,
                'average_value': sum(values) / len(values) if values else 0,
                'total_regions': len(sorted_regions)
            }
        }