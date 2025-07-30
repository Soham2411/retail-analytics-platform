from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, text
from app.models.database import Order, Customer, Product
import pandas as pd
import numpy as np

class CustomerAnalyticsService:
    def __init__(self, db: Session):
        self.db = db
    
    def calculate_rfm_analysis(self, filters: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Calculate RFM (Recency, Frequency, Monetary) analysis for customer segmentation
        """
        # Base query with joins
        query = self.db.query(
            Order.customer_id,
            Customer.customer_name,
            Customer.segment,
            Customer.region,
            func.max(Order.order_date).label('last_order_date'),
            func.count(Order.row_id).label('frequency'),
            func.sum(Order.sales).label('monetary')
        ).join(Customer, Order.customer_id == Customer.customer_id)
        
        # Apply filters if provided
        if filters:
            if filters.get('start_date') and filters.get('end_date'):
                query = query.filter(Order.order_date.between(filters['start_date'], filters['end_date']))
            if filters.get('regions'):
                query = query.filter(Customer.region.in_(filters['regions']))
            if filters.get('segments'):
                query = query.filter(Customer.segment.in_(filters['segments']))
        
        # Group by customer
        query = query.group_by(Order.customer_id, Customer.customer_name, Customer.segment, Customer.region)
        
        results = query.all()
        
        if not results:
            return {"error": "No data found for the given filters"}
        
        # Convert to DataFrame for easier manipulation
        df = pd.DataFrame([{
            'customer_id': r.customer_id,
            'customer_name': r.customer_name,
            'segment': r.segment,
            'region': r.region,
            'last_order_date': r.last_order_date,
            'frequency': r.frequency,
            'monetary': float(r.monetary)
        } for r in results])
        
        # Calculate recency (days since last order)
        current_date = datetime.now().date()
        df['last_order_date'] = pd.to_datetime(df['last_order_date']).dt.date
        df['recency'] = df['last_order_date'].apply(lambda x: (current_date - x).days)
        
        # Calculate RFM scores (1-5 scale, 5 being best)
        df['recency_score'] = pd.qcut(df['recency'], 5, labels=[5,4,3,2,1], duplicates='drop')
        df['frequency_score'] = pd.qcut(df['frequency'].rank(method='first'), 5, labels=[1,2,3,4,5], duplicates='drop')
        df['monetary_score'] = pd.qcut(df['monetary'], 5, labels=[1,2,3,4,5], duplicates='drop')
        
        # Convert scores to integers
        df['recency_score'] = df['recency_score'].astype(int)
        df['frequency_score'] = df['frequency_score'].astype(int)
        df['monetary_score'] = df['monetary_score'].astype(int)
        
        # Create RFM segment
        df['rfm_score'] = df['recency_score'].astype(str) + df['frequency_score'].astype(str) + df['monetary_score'].astype(str)
        
        # Assign customer segments based on RFM scores
        df['rfm_segment'] = df.apply(self._assign_rfm_segment, axis=1)
        
        # Calculate segment statistics
        segment_stats = df.groupby('rfm_segment').agg({
            'customer_id': 'count',
            'monetary': ['mean', 'sum'],
            'frequency': 'mean',
            'recency': 'mean'
        }).round(2)
        
        segment_stats.columns = ['customer_count', 'avg_monetary', 'total_monetary', 'avg_frequency', 'avg_recency']
        segment_stats = segment_stats.reset_index()
        
        # Prepare response data
        customers_data = df.to_dict('records')
        segments_data = segment_stats.to_dict('records')
        
        # Calculate overall metrics
        total_customers = len(df)
        total_revenue = df['monetary'].sum()
        avg_clv = df['monetary'].mean()
        
        return {
            "customers": customers_data,
            "segments": segments_data,
            "summary": {
                "total_customers": total_customers,
                "total_revenue": float(total_revenue),
                "average_customer_value": float(avg_clv),
                "analysis_date": current_date.isoformat()
            }
        }
    
    def _assign_rfm_segment(self, row) -> str:
        """Assign RFM segment based on RFM scores"""
        recency = row['recency_score']
        frequency = row['frequency_score']
        monetary = row['monetary_score']
        
        # Champions: High value, frequent buyers, recent purchases
        if recency >= 4 and frequency >= 4 and monetary >= 4:
            return "Champions"
        
        # Loyal Customers: Good recent customers with high frequency
        elif recency >= 3 and frequency >= 4:
            return "Loyal Customers"
        
        # Potential Loyalists: Recent customers with medium frequency
        elif recency >= 4 and frequency >= 2 and frequency <= 3:
            return "Potential Loyalists"
        
        # New Customers: Very recent but low frequency
        elif recency >= 4 and frequency <= 2:
            return "New Customers"
        
        # Promising: Recent with low-medium frequency and value
        elif recency >= 3 and frequency <= 2:
            return "Promising"
        
        # Need Attention: Above average recency, frequency & monetary
        elif recency >= 3 and frequency >= 3 and monetary >= 3:
            return "Need Attention"
        
        # About to Sleep: Below average recency and frequency
        elif recency <= 2 and frequency >= 2:
            return "About to Sleep"
        
        # At Risk: Some time since purchase, low frequency
        elif recency <= 2 and frequency <= 2 and monetary >= 3:
            return "At Risk"
        
        # Cannot Lose Them: Low recency but high monetary value
        elif recency <= 2 and monetary >= 4:
            return "Cannot Lose Them"
        
        # Hibernating: Low recency, frequency, but decent monetary
        elif recency <= 2 and frequency <= 2 and monetary >= 2:
            return "Hibernating"
        
        # Lost: Lowest recency, frequency & monetary
        else:
            return "Lost"
    
    def get_customer_lifetime_value(self, filters: Optional[Dict] = None) -> Dict[str, Any]:
        """Calculate Customer Lifetime Value metrics"""
        
        # Get customer data with purchase history
        query = self.db.query(
            Order.customer_id,
            Customer.customer_name,
            Customer.segment,
            func.count(Order.row_id).label('total_orders'),
            func.sum(Order.sales).label('total_spent'),
            func.avg(Order.sales).label('avg_order_value'),
            func.min(Order.order_date).label('first_order'),
            func.max(Order.order_date).label('last_order')
        ).join(Customer, Order.customer_id == Customer.customer_id)
        
        # Apply filters
        if filters:
            if filters.get('start_date') and filters.get('end_date'):
                query = query.filter(Order.order_date.between(filters['start_date'], filters['end_date']))
            if filters.get('regions'):
                query = query.filter(Customer.region.in_(filters['regions']))
        
        query = query.group_by(Order.customer_id, Customer.customer_name, Customer.segment)
        results = query.all()
        
        clv_data = []
        for r in results:
            # Calculate customer lifespan in days
            lifespan_days = (r.last_order - r.first_order).days + 1
            lifespan_months = max(lifespan_days / 30.44, 1)  # At least 1 month
            
            # Simple CLV calculation: Total Spent + (AOV * Frequency * Predicted Future Months)
            # Using 12 months as prediction window
            monthly_frequency = r.total_orders / lifespan_months
            predicted_clv = float(r.total_spent) + (float(r.avg_order_value) * monthly_frequency * 12)
            
            clv_data.append({
                'customer_id': r.customer_id,
                'customer_name': r.customer_name,
                'segment': r.segment,
                'total_orders': r.total_orders,
                'total_spent': float(r.total_spent),
                'avg_order_value': float(r.avg_order_value),
                'customer_lifespan_days': lifespan_days,
                'monthly_frequency': round(monthly_frequency, 2),
                'predicted_clv': round(predicted_clv, 2),
                'first_order': r.first_order.isoformat(),
                'last_order': r.last_order.isoformat()
            })
        
        # Sort by predicted CLV
        clv_data.sort(key=lambda x: x['predicted_clv'], reverse=True)
        
        # Calculate CLV distribution
        clv_values = [c['predicted_clv'] for c in clv_data]
        if clv_values:
            clv_distribution = {
                'mean': float(np.mean(clv_values)),
                'median': float(np.median(clv_values)),
                'std': float(np.std(clv_values)),
                'min': float(np.min(clv_values)),
                'max': float(np.max(clv_values)),
                'top_10_percent_threshold': float(np.percentile(clv_values, 90))
            }
        else:
            clv_distribution = {}
        
        return {
            "customers": clv_data,
            "distribution": clv_distribution,
            "summary": {
                "total_customers": len(clv_data),
                "total_predicted_value": sum(clv_values) if clv_values else 0,
                "high_value_customers": len([c for c in clv_data if c['predicted_clv'] > clv_distribution.get('top_10_percent_threshold', 0)])
            }
        }