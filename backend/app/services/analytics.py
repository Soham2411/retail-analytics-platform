from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from app.models.database import Order, Product, Customer

class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def _apply_filters(self, query, filters: dict):
        """Apply common filters to any query"""
        
        # Date range filtering
        if filters.get('start_date'):
            query = query.filter(Order.order_date >= filters['start_date'])
        if filters.get('end_date'):
            query = query.filter(Order.order_date <= filters['end_date'])
        
        # Product category filtering
        if filters.get('categories') and len(filters['categories']) > 0:
            query = query.join(Product).filter(Product.category.in_(filters['categories']))
        
        # Region filtering
        if filters.get('regions') and len(filters['regions']) > 0:
            query = query.join(Customer).filter(Customer.region.in_(filters['regions']))
        
        # Customer segment filtering
        if filters.get('customer_segments') and len(filters['customer_segments']) > 0:
            if 'new' in filters['customer_segments']:
                # Customers with first order in date range
                first_order_subquery = self.db.query(
                    func.min(Order.order_date).label('first_order')
                ).filter(Order.customer_id == Customer.customer_id).scalar_subquery()
                
                if 'new' in filters['customer_segments'] and len(filters['customer_segments']) == 1:
                    query = query.filter(first_order_subquery >= filters.get('start_date', datetime.now() - timedelta(days=30)))
            
        return query

    # ✅ ADD THESE METHODS - Main methods called by FastAPI
    def get_kpis(self, filters: dict = None) -> dict:
        """Get KPIs - called by FastAPI endpoint"""
        return self.get_kpis_filtered(filters)

    def get_sales_trends(self, filters: dict = None) -> List[dict]:
        """Get sales trends - called by FastAPI endpoint"""
        return self.get_sales_trends_filtered(filters)

    def get_regional_performance(self, filters: dict = None) -> List[dict]:
        """Get regional performance - called by FastAPI endpoint"""
        return self.get_regional_performance_filtered(filters)

    def get_category_analysis(self, filters: dict = None) -> List[dict]:
        """Get category analysis - called by FastAPI endpoint"""
        if filters is None:
            filters = {}
        
        base_query = self.db.query(
            Product.category,
            func.sum(Order.sales).label('total_sales'),
            func.count(Order.order_id).label('total_orders'),
            func.sum(Order.quantity).label('total_quantity')
        ).join(Order)

        filtered_query = self._apply_filters(base_query, filters)

        results = filtered_query.group_by(Product.category).order_by(
            func.sum(Order.sales).desc()
        ).all()

        return [
            {
                "category": result.category,
                "total_sales": float(result.total_sales),
                "total_orders": result.total_orders,
                "total_quantity": result.total_quantity
            }
            for result in results
        ]

    def get_customer_segments(self, filters: dict = None) -> List[dict]:
        """Get customer segments - called by FastAPI endpoint"""
        if filters is None:
            filters = {}
        
        # Simple segmentation based on total spend
        base_query = self.db.query(
            Customer.customer_id,
            Customer.region,
            func.sum(Order.sales).label('total_spent'),
            func.count(Order.order_id).label('order_count')
        ).join(Order)

        filtered_query = self._apply_filters(base_query, filters)

        results = filtered_query.group_by(
            Customer.customer_id, Customer.region
        ).all()

        # Categorize customers
        segments = {"high_value": 0, "medium_value": 0, "low_value": 0}
        total_customers = len(results)
        
        for result in results:
            if result.total_spent > 1000:
                segments["high_value"] += 1
            elif result.total_spent > 500:
                segments["medium_value"] += 1
            else:
                segments["low_value"] += 1

        return [
            {"segment": "High Value", "count": segments["high_value"], "percentage": round(segments["high_value"]/total_customers*100, 1) if total_customers > 0 else 0},
            {"segment": "Medium Value", "count": segments["medium_value"], "percentage": round(segments["medium_value"]/total_customers*100, 1) if total_customers > 0 else 0},
            {"segment": "Low Value", "count": segments["low_value"], "percentage": round(segments["low_value"]/total_customers*100, 1) if total_customers > 0 else 0}
        ]

    def get_top_products(self, limit: int = 10, filters: dict = None) -> List[dict]:
        """Get top products - called by FastAPI endpoint"""
        return self.get_top_products_filtered(filters, limit)

    # ✅ EXISTING FILTERED METHODS - Keep these for advanced filtering
    def get_kpis_filtered(self, filters: dict = None) -> dict:
        if filters is None:
            filters = {}
        
        # Base query
        base_query = self.db.query(Order)
        filtered_query = self._apply_filters(base_query, filters)
    
        # Calculate metrics using correct column names
        total_sales = filtered_query.with_entities(func.sum(Order.sales)).scalar() or 0
        total_orders = filtered_query.count()
    
        # Unique customers
        unique_customers = filtered_query.with_entities(
            func.count(func.distinct(Order.customer_id))
        ).scalar() or 0
    
        # Profit margin calculation using existing profit column
        total_profit = filtered_query.with_entities(func.sum(Order.profit)).scalar() or 0
        profit_margin = (total_profit / total_sales * 100) if total_sales > 0 else 0
    
        return {
            "total_sales": float(total_sales),
            "total_customers": unique_customers,
            "total_orders": total_orders,
            "avg_profit_margin": round(profit_margin, 2),
            "total_profit": float(total_profit)
        }

    def get_sales_trends_filtered(self, filters: dict = None) -> List[dict]:
        """Get sales trends with optional filtering"""
        if filters is None:
            filters = {}
        
        base_query = self.db.query(
            func.date_trunc('month', Order.order_date).label('month'),
            func.sum(Order.sales).label('sales')
        )
    
        filtered_query = self._apply_filters(base_query, filters)
    
        results = filtered_query.group_by(
            func.date_trunc('month', Order.order_date)
        ).order_by('month').all()
    
        return [
            {
                "month": result.month.strftime("%Y-%m"),
                "sales": float(result.sales)
            }
            for result in results
        ]

    def get_regional_performance_filtered(self, filters: dict = None) -> List[dict]:
        """Get regional performance with optional filtering"""
        if filters is None:
            filters = {}
        
        base_query = self.db.query(
            Customer.region,
            func.sum(Order.sales).label('sales'),
            func.count(Order.order_id).label('orders')
        ).join(Customer)
    
        filtered_query = self._apply_filters(base_query, filters)
    
        results = filtered_query.group_by(Customer.region).all()
    
        return [
            {
                "region": result.region,
                "sales": float(result.sales),
                "orders": result.orders
            }
            for result in results
        ]

    def get_filter_options(self) -> dict:
        """Get all available filter options"""
        
        # Get all product categories
        categories = self.db.query(Product.category).distinct().all()
        category_list = [cat[0] for cat in categories if cat[0]]
        
        # Get all regions
        regions = self.db.query(Customer.region).distinct().all()
        region_list = [region[0] for region in regions if region[0]]
        
        # Get date range
        date_range = self.db.query(
            func.min(Order.order_date).label('min_date'),
            func.max(Order.order_date).label('max_date')
        ).first()
        
        return {
            "categories": sorted(category_list),
            "regions": sorted(region_list),
            "date_range": {
                "min_date": date_range.min_date.isoformat() if date_range.min_date else None,
                "max_date": date_range.max_date.isoformat() if date_range.max_date else None
            },
            "customer_segments": ["new", "returning", "high_value"]
        }

    def get_top_products_filtered(self, filters: dict = None, limit: int = 10) -> List[dict]:
        """Get top products with optional filtering"""
        if filters is None:
            filters = {}
        
        base_query = self.db.query(
            Product.product_name,
            Product.category,
            func.sum(Order.quantity).label('total_quantity'),
            func.sum(Order.sales).label('total_sales')
        ).join(Order)
    
        filtered_query = self._apply_filters(base_query, filters)
    
        results = filtered_query.group_by(
            Product.product_id, Product.product_name, Product.category
        ).order_by(func.sum(Order.sales).desc()).limit(limit).all()
    
        return [
            {
                "product_name": result.product_name,
                "category": result.category,
                "total_quantity": result.total_quantity,
                "total_sales": float(result.total_sales)
            }
            for result in results
        ]