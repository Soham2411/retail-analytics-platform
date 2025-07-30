from sqlalchemy.orm import Session
from sqlalchemy import func, text
from typing import Dict, List, Any, Tuple, Optional
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from app.models.database import Order, Product, Customer

class ProductAnalyticsService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_abc_analysis(self, 
                        start_date: Optional[datetime] = None,
                        end_date: Optional[datetime] = None,
                        categories: Optional[List[str]] = None,
                        regions: Optional[List[str]] = None,
                        segments: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Perform ABC Analysis - Pareto principle for product revenue contribution
        """
        # Build base query
        query = self.db.query(
            Product.product_id,
            Product.product_name,
            Product.category,
            Product.sub_category,
            func.sum(Order.sales).label('total_revenue'),
            func.sum(Order.quantity).label('total_quantity'),
            func.count(Order.row_id).label('order_count')
        ).join(Order, Product.product_id == Order.product_id)
        
        # Apply filters
        if start_date:
            query = query.filter(Order.order_date >= start_date)
        if end_date:
            query = query.filter(Order.order_date <= end_date)
        if categories:
            query = query.filter(Product.category.in_(categories))
        if regions or segments:
            query = query.join(Customer, Order.customer_id == Customer.customer_id)
            if regions:
                query = query.filter(Customer.region.in_(regions))
            if segments:
                query = query.filter(Customer.segment.in_(segments))
        
        # Group by product and order by revenue
        products = query.group_by(
            Product.product_id, 
            Product.product_name, 
            Product.category, 
            Product.sub_category
        ).order_by(func.sum(Order.sales).desc()).all()
        
        if not products:
            return {
                'abc_classification': [],
                'pareto_data': [],
                'distribution': {'A': 0, 'B': 0, 'C': 0},
                'total_revenue': 0
            }
        
        # Convert to DataFrame for easier calculation
        df = pd.DataFrame([{
            'product_id': p.product_id,
            'product_name': p.product_name,
            'category': p.category,
            'sub_category': p.sub_category,
            'revenue': float(p.total_revenue),
            'quantity': int(p.total_quantity),
            'order_count': int(p.order_count)
        } for p in products])
        
        # Calculate cumulative percentage
        df['cumulative_revenue'] = df['revenue'].cumsum()
        total_revenue = df['revenue'].sum()
        df['revenue_percentage'] = (df['revenue'] / total_revenue * 100).round(2)
        df['cumulative_percentage'] = (df['cumulative_revenue'] / total_revenue * 100).round(2)
        
        # ABC Classification
        df['abc_class'] = 'C'  # Default to C
        df.loc[df['cumulative_percentage'] <= 80, 'abc_class'] = 'A'
        df.loc[(df['cumulative_percentage'] > 80) & (df['cumulative_percentage'] <= 95), 'abc_class'] = 'B'
        
        # Prepare response data
        abc_classification = df.to_dict('records')
        
        # Pareto chart data (top 20 products for visualization)
        pareto_data = df.head(20)[['product_name', 'revenue', 'cumulative_percentage']].to_dict('records')
        
        # Distribution count
        distribution = df['abc_class'].value_counts().to_dict()
        distribution = {k: int(v) for k, v in distribution.items()}
        
        return {
            'abc_classification': abc_classification,
            'pareto_data': pareto_data,
            'distribution': distribution,
            'total_revenue': float(total_revenue)
        }
    
    def get_profitability_matrix(self,
                               start_date: Optional[datetime] = None,
                               end_date: Optional[datetime] = None,
                               categories: Optional[List[str]] = None,
                               regions: Optional[List[str]] = None,
                               segments: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Create profitability matrix: Profit Margin vs Sales Volume
        """
        # Build base query
        query = self.db.query(
            Product.product_id,
            Product.product_name,
            Product.category,
            Product.sub_category,
            func.sum(Order.sales).label('total_sales'),
            func.sum(Order.profit).label('total_profit'),
            func.sum(Order.quantity).label('total_quantity'),
            func.count(Order.row_id).label('order_count')
        ).join(Order, Product.product_id == Order.product_id)
        
        # Apply filters
        if start_date:
            query = query.filter(Order.order_date >= start_date)
        if end_date:
            query = query.filter(Order.order_date <= end_date)
        if categories:
            query = query.filter(Product.category.in_(categories))
        if regions or segments:
            query = query.join(Customer, Order.customer_id == Customer.customer_id)
            if regions:
                query = query.filter(Customer.region.in_(regions))
            if segments:
                query = query.filter(Customer.segment.in_(segments))
        
        products = query.group_by(
            Product.product_id, 
            Product.product_name, 
            Product.category, 
            Product.sub_category
        ).all()
        
        if not products:
            return {
                'matrix_data': [],
                'quadrants': {'stars': 0, 'cash_cows': 0, 'question_marks': 0, 'dogs': 0},
                'category_performance': []
            }
        
        # Calculate metrics
        matrix_data = []
        for p in products:
            profit_margin = (float(p.total_profit) / float(p.total_sales) * 100) if p.total_sales > 0 else 0
            sales_volume = float(p.total_sales)
            
            matrix_data.append({
                'product_id': p.product_id,
                'product_name': p.product_name,
                'category': p.category,
                'sub_category': p.sub_category,
                'profit_margin': round(profit_margin, 2),
                'sales_volume': sales_volume,
                'total_profit': float(p.total_profit),
                'quantity': int(p.total_quantity),
                'order_count': int(p.order_count)
            })
        
        # Calculate medians for quadrant classification
        df = pd.DataFrame(matrix_data)
        median_margin = df['profit_margin'].median()
        median_volume = df['sales_volume'].median()
        
        # Classify into quadrants
        def classify_quadrant(row):
            if row['profit_margin'] >= median_margin and row['sales_volume'] >= median_volume:
                return 'stars'
            elif row['profit_margin'] >= median_margin and row['sales_volume'] < median_volume:
                return 'question_marks'
            elif row['profit_margin'] < median_margin and row['sales_volume'] >= median_volume:
                return 'cash_cows'
            else:
                return 'dogs'
        
        df['quadrant'] = df.apply(classify_quadrant, axis=1)
        
        # Add quadrant to matrix data
        for i, item in enumerate(matrix_data):
            item['quadrant'] = df.iloc[i]['quadrant']
        
        # Count quadrants
        quadrants = df['quadrant'].value_counts().to_dict()
        quadrants = {k: int(v) for k, v in quadrants.items()}
        
        # Category performance
        category_perf = df.groupby('category').agg({
            'profit_margin': 'mean',
            'sales_volume': 'sum',
            'total_profit': 'sum'
        }).round(2).reset_index()
        
        category_performance = category_perf.to_dict('records')
        
        return {
            'matrix_data': matrix_data,
            'quadrants': quadrants,
            'category_performance': category_performance,
            'medians': {
                'profit_margin': round(median_margin, 2),
                'sales_volume': round(median_volume, 2)
            }
        }
    
    def get_sales_velocity_analysis(self,
                                  start_date: Optional[datetime] = None,
                                  end_date: Optional[datetime] = None,
                                  categories: Optional[List[str]] = None,
                                  regions: Optional[List[str]] = None,
                                  segments: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Analyze sales velocity and momentum trends
        """
        # Get monthly sales data for trend analysis
        query = self.db.query(
            Product.product_id,
            Product.product_name,
            Product.category,
            func.date_trunc('month', Order.order_date).label('month'),
            func.sum(Order.sales).label('monthly_sales'),
            func.sum(Order.quantity).label('monthly_quantity')
        ).join(Order, Product.product_id == Order.product_id)
        
        # Apply filters
        if start_date:
            query = query.filter(Order.order_date >= start_date)
        if end_date:
            query = query.filter(Order.order_date <= end_date)
        if categories:
            query = query.filter(Product.category.in_(categories))
        if regions or segments:
            query = query.join(Customer, Order.customer_id == Customer.customer_id)
            if regions:
                query = query.filter(Customer.region.in_(regions))
            if segments:
                query = query.filter(Customer.segment.in_(segments))
        
        monthly_data = query.group_by(
            Product.product_id,
            Product.product_name,
            Product.category,
            func.date_trunc('month', Order.order_date)
        ).order_by(
            Product.product_id,
            func.date_trunc('month', Order.order_date)
        ).all()
        
        if not monthly_data:
            return {
                'velocity_trends': [],
                'momentum_classification': {},
                'seasonal_patterns': []
            }
        
        # Convert to DataFrame for analysis
        df = pd.DataFrame([{
            'product_id': item.product_id,
            'product_name': item.product_name,
            'category': item.category,
            'month': item.month,
            'monthly_sales': float(item.monthly_sales),
            'monthly_quantity': int(item.monthly_quantity)
        } for item in monthly_data])
        
        # Calculate month-over-month growth
        velocity_data = []
        for product_id in df['product_id'].unique():
            product_df = df[df['product_id'] == product_id].sort_values('month')
            
            if len(product_df) >= 2:
                # Calculate MoM growth rates
                product_df['sales_growth'] = product_df['monthly_sales'].pct_change() * 100
                product_df['quantity_growth'] = product_df['monthly_quantity'].pct_change() * 100
                
                # Get latest trends
                latest_growth = product_df['sales_growth'].iloc[-1] if not pd.isna(product_df['sales_growth'].iloc[-1]) else 0
                avg_growth = product_df['sales_growth'].mean()
                
                # Classification
                if avg_growth > 10:
                    momentum = 'accelerating'
                elif avg_growth > 0:
                    momentum = 'growing'
                elif avg_growth > -10:
                    momentum = 'stable'
                else:
                    momentum = 'declining'
                
                velocity_data.append({
                    'product_id': product_id,
                    'product_name': product_df['product_name'].iloc[0],
                    'category': product_df['category'].iloc[0],
                    'latest_growth_rate': round(latest_growth, 2),
                    'average_growth_rate': round(avg_growth, 2),
                    'momentum': momentum,
                    'total_sales': product_df['monthly_sales'].sum(),
                    'months_active': len(product_df)
                })
        
        # Sort by growth rate
        velocity_data.sort(key=lambda x: x['average_growth_rate'], reverse=True)
        
        # Momentum classification counts
        momentum_counts = {}
        for item in velocity_data:
            momentum = item['momentum']
            momentum_counts[momentum] = momentum_counts.get(momentum, 0) + 1
        
        # Seasonal patterns (simplified)
        seasonal_patterns = []
        if len(df) > 0:
            df['month_num'] = pd.to_datetime(df['month']).dt.month
            seasonal_data = df.groupby('month_num')['monthly_sales'].sum().to_dict()
            
            for month_num, sales in seasonal_data.items():
                seasonal_patterns.append({
                    'month': month_num,
                    'total_sales': float(sales)
                })
        
        return {
            'velocity_trends': velocity_data[:50],  # Top 50 for performance
            'momentum_classification': momentum_counts,
            'seasonal_patterns': seasonal_patterns
        }
    
    def get_cross_selling_analysis(self,
                                 start_date: Optional[datetime] = None,
                                 end_date: Optional[datetime] = None,
                                 categories: Optional[List[str]] = None,
                                 regions: Optional[List[str]] = None,
                                 segments: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Basic cross-selling analysis - products frequently bought together
        """
        # Get orders with multiple products
        subquery = self.db.query(
            Order.customer_id,
            Order.order_date,
            func.count(Order.product_id).label('product_count')
        ).group_by(Order.customer_id, Order.order_date).having(func.count(Order.product_id) > 1).subquery()
        
        # Main query for product pairs
        query = self.db.query(
            Order.customer_id,
            Order.order_date,
            Product.product_id,
            Product.product_name,
            Product.category,
            Product.sub_category
        ).join(Product, Order.product_id == Product.product_id).join(
            subquery, 
            (Order.customer_id == subquery.c.customer_id) & 
            (Order.order_date == subquery.c.order_date)
        )
        
        # Apply filters
        if start_date:
            query = query.filter(Order.order_date >= start_date)
        if end_date:
            query = query.filter(Order.order_date <= end_date)
        if categories:
            query = query.filter(Product.category.in_(categories))
        if regions or segments:
            query = query.join(Customer, Order.customer_id == Customer.customer_id)
            if regions:
                query = query.filter(Customer.region.in_(regions))
            if segments:
                query = query.filter(Customer.segment.in_(segments))
        
        orders = query.all()
        
        if not orders:
            return {
                'product_pairs': [],
                'category_affinity': [],
                'total_multi_product_orders': 0
            }
        
        # Group by customer and order date to find product combinations
        df = pd.DataFrame([{
            'customer_id': o.customer_id,
            'order_date': o.order_date,
            'product_id': o.product_id,
            'product_name': o.product_name,
            'category': o.category,
            'sub_category': o.sub_category
        } for o in orders])
        
        # Find product pairs
        product_pairs = []
        order_groups = df.groupby(['customer_id', 'order_date'])
        
        for (customer, date), group in order_groups:
            products = group['product_name'].tolist()
            categories = group['category'].tolist()
            
            # Generate pairs
            for i in range(len(products)):
                for j in range(i + 1, len(products)):
                    product_pairs.append({
                        'product_1': products[i],
                        'product_2': products[j],
                        'category_1': categories[i],
                        'category_2': categories[j]
                    })
        
        # Count pair frequency
        if product_pairs:
            pairs_df = pd.DataFrame(product_pairs)
            pair_counts = pairs_df.groupby(['product_1', 'product_2']).size().reset_index(name='frequency')
            pair_counts = pair_counts.sort_values('frequency', ascending=False)
            
            top_pairs = pair_counts.head(20).to_dict('records')
        else:
            top_pairs = []
        
        # Category affinity
        category_pairs = []
        if product_pairs:
            cat_pairs_df = pairs_df[pairs_df['category_1'] != pairs_df['category_2']]
            if not cat_pairs_df.empty:
                cat_counts = cat_pairs_df.groupby(['category_1', 'category_2']).size().reset_index(name='frequency')
                category_pairs = cat_counts.sort_values('frequency', ascending=False).head(10).to_dict('records')
        
        return {
            'product_pairs': top_pairs,
            'category_affinity': category_pairs,
            'total_multi_product_orders': len(order_groups)
        }