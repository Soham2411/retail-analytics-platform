# backend/app/services/executive_summary.py
from sqlalchemy.orm import Session
from typing import Dict, List, Any, Optional
import pandas as pd
from datetime import datetime, timedelta
import numpy as np

class ExecutiveSummaryService:
    
    @staticmethod
    def generate_executive_summary(
        db: Session,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Generate comprehensive executive summary with automated insights"""
        
        # Get current period data
        current_data = ExecutiveSummaryService._get_period_data(db, start_date, end_date)
        
        # Get previous period for comparison (same length)
        if start_date and end_date:
            period_length = (end_date - start_date).days
            prev_end = start_date - timedelta(days=1)
            prev_start = prev_end - timedelta(days=period_length)
            previous_data = ExecutiveSummaryService._get_period_data(db, prev_start, prev_end)
        else:
            # Default to last 30 days comparison
            end_date = datetime.now()
            start_date = end_date - timedelta(days=30)
            prev_start = start_date - timedelta(days=30)
            previous_data = ExecutiveSummaryService._get_period_data(db, prev_start, start_date)
        
        # Generate insights
        insights = ExecutiveSummaryService._generate_insights(current_data, previous_data)
        
        # Generate recommendations
        recommendations = ExecutiveSummaryService._generate_recommendations(current_data, previous_data)
        
        # Key alerts
        alerts = ExecutiveSummaryService._generate_alerts(current_data, previous_data)
        
        return {
            'period': {
                'start_date': start_date.strftime('%Y-%m-%d') if start_date else None,
                'end_date': end_date.strftime('%Y-%m-%d') if end_date else None,
                'days': (end_date - start_date).days if start_date and end_date else 30
            },
            'executive_summary': insights['executive_summary'],
            'key_insights': insights['key_insights'],
            'performance_metrics': current_data,
            'previous_metrics': previous_data,
            'growth_metrics': insights['growth_metrics'],
            'recommendations': recommendations,
            'alerts': alerts,
            'generated_at': datetime.now().isoformat()
        }
    
    @staticmethod
    def _get_period_data(
        db: Session, 
        start_date: Optional[datetime] = None, 
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Get comprehensive business metrics for a period"""
        
        # Base query with filters
        base_query = """
        SELECT 
            COUNT(DISTINCT o.order_id) as total_orders,
            COUNT(DISTINCT o.customer_id) as unique_customers,
            SUM(o.quantity * p.price) as total_revenue,
            AVG(o.quantity * p.price) as avg_order_value,
            SUM(o.quantity) as total_units,
            COUNT(DISTINCT p.product_id) as unique_products_sold,
            COUNT(DISTINCT o.region) as active_regions
        FROM orders o
        JOIN products p ON o.product_id = p.product_id
        WHERE 1=1
        """
        
        params = []
        if start_date:
            base_query += " AND o.order_date >= %s"
            params.append(start_date)
        if end_date:
            base_query += " AND o.order_date <= %s"
            params.append(end_date)
        
        # Execute main metrics query
        main_metrics = pd.read_sql(base_query, db.bind, params=params).iloc[0].to_dict()
        
        # Regional breakdown
        regional_query = base_query.replace(
            "COUNT(DISTINCT o.region) as active_regions",
            "o.region, SUM(o.quantity * p.price) as revenue"
        ) + " GROUP BY o.region ORDER BY revenue DESC"
        
        regional_data = pd.read_sql(regional_query, db.bind, params=params)
        
        # Category breakdown
        category_query = base_query.replace(
            "COUNT(DISTINCT o.region) as active_regions",
            "p.category, SUM(o.quantity * p.price) as revenue, SUM(o.quantity) as units"
        ) + " GROUP BY p.category ORDER BY revenue DESC"
        
        category_data = pd.read_sql(category_query, db.bind, params=params)
        
        # Customer segment analysis
        customer_query = """
        SELECT 
            CASE 
                WHEN customer_revenue <= %s THEN 'Low Value'
                WHEN customer_revenue <= %s THEN 'Medium Value'
                ELSE 'High Value'
            END as segment,
            COUNT(*) as customer_count,
            SUM(customer_revenue) as segment_revenue
        FROM (
            SELECT 
                o.customer_id,
                SUM(o.quantity * p.price) as customer_revenue
            FROM orders o
            JOIN products p ON o.product_id = p.product_id
            WHERE 1=1
        """
        
        if start_date:
            customer_query += " AND o.order_date >= %s"
        if end_date:
            customer_query += " AND o.order_date <= %s"
            
        customer_query += """
            GROUP BY o.customer_id
        ) customer_totals
        GROUP BY segment
        ORDER BY segment_revenue DESC
        """
        
        # Calculate thresholds (33rd and 67th percentiles)
        revenue_query = """
        SELECT SUM(o.quantity * p.price) as customer_revenue
        FROM orders o
        JOIN products p ON o.product_id = p.product_id
        WHERE 1=1
        """
        
        if start_date:
            revenue_query += " AND o.order_date >= %s"
        if end_date:
            revenue_query += " AND o.order_date <= %s"
            
        revenue_query += " GROUP BY o.customer_id"
        
        customer_revenues = pd.read_sql(revenue_query, db.bind, params=params)['customer_revenue']
        low_threshold = customer_revenues.quantile(0.33)
        high_threshold = customer_revenues.quantile(0.67)
        
        customer_params = [low_threshold, high_threshold] + params
        customer_segments = pd.read_sql(customer_query, db.bind, customer_params)
        
        return {
            'total_orders': int(main_metrics['total_orders']),
            'unique_customers': int(main_metrics['unique_customers']),
            'total_revenue': float(main_metrics['total_revenue']),
            'avg_order_value': float(main_metrics['avg_order_value']),
            'total_units': int(main_metrics['total_units']),
            'unique_products_sold': int(main_metrics['unique_products_sold']),
            'active_regions': int(main_metrics['active_regions']),
            'regional_breakdown': regional_data.to_dict('records'),
            'category_breakdown': category_data.to_dict('records'),
            'customer_segments': customer_segments.to_dict('records')
        }
    
    @staticmethod
    def _generate_insights(current_data: Dict, previous_data: Dict) -> Dict[str, Any]:
        """Generate natural language insights from data comparison"""
        
        # Calculate growth metrics
        growth_metrics = {}
        for key in ['total_revenue', 'total_orders', 'unique_customers', 'avg_order_value']:
            current_val = current_data[key]
            previous_val = previous_data[key]
            if previous_val > 0:
                growth = ((current_val - previous_val) / previous_val) * 100
                growth_metrics[key] = {
                    'current': current_val,
                    'previous': previous_val,
                    'growth_rate': round(growth, 2),
                    'growth_direction': 'up' if growth > 0 else 'down' if growth < 0 else 'flat'
                }
        
        # Generate executive summary
        revenue_growth = growth_metrics['total_revenue']['growth_rate']
        order_growth = growth_metrics['total_orders']['growth_rate']
        customer_growth = growth_metrics['unique_customers']['growth_rate']
        
        if revenue_growth > 10:
            revenue_trend = "strong growth"
        elif revenue_growth > 0:
            revenue_trend = "positive growth"
        elif revenue_growth > -5:
            revenue_trend = "slight decline"
        else:
            revenue_trend = "significant decline"
        
        executive_summary = f"""
        Business performance shows {revenue_trend} with revenue {'increasing' if revenue_growth > 0 else 'decreasing'} 
        by {abs(revenue_growth):.1f}% compared to the previous period. 
        
        {'Customer acquisition is strong' if customer_growth > 5 else 'Customer growth is moderate' if customer_growth > 0 else 'Customer retention needs attention'} 
        with {abs(customer_growth):.1f}% {'growth' if customer_growth > 0 else 'decline'} in unique customers.
        
        {'Order volume is trending upward' if order_growth > 0 else 'Order volume requires attention'}, 
        {'indicating healthy market demand' if order_growth > 5 else 'suggesting stable demand' if order_growth > 0 else 'suggesting market challenges'}.
        """
        
        # Key insights
        key_insights = []
        
        # Revenue insights
        if revenue_growth > 15:
            key_insights.append({
                'type': 'positive',
                'title': 'Exceptional Revenue Growth',
                'description': f'Revenue increased by {revenue_growth:.1f}%, significantly outperforming typical growth rates.',
                'impact': 'high'
            })
        elif revenue_growth < -10:
            key_insights.append({
                'type': 'negative',
                'title': 'Revenue Decline Alert',
                'description': f'Revenue decreased by {abs(revenue_growth):.1f}%, requiring immediate attention.',
                'impact': 'high'
            })
        
        # Customer insights
        if customer_growth > 20:
            key_insights.append({
                'type': 'positive',
                'title': 'Strong Customer Acquisition',
                'description': f'New customer growth of {customer_growth:.1f}% indicates effective marketing and product-market fit.',
                'impact': 'medium'
            })
        
        # AOV insights
        aov_growth = growth_metrics['avg_order_value']['growth_rate']
        if aov_growth > 10:
            key_insights.append({
                'type': 'positive',
                'title': 'Increasing Average Order Value',
                'description': f'AOV increased by {aov_growth:.1f}%, suggesting successful upselling or premium product adoption.',
                'impact': 'medium'
            })
        
        return {
            'executive_summary': executive_summary.strip(),
            'key_insights': key_insights,
            'growth_metrics': growth_metrics
        }
    
    @staticmethod
    def _generate_recommendations(current_data: Dict, previous_data: Dict) -> List[Dict[str, Any]]:
        """Generate actionable business recommendations"""
        
        recommendations = []
        
        # Revenue recommendations
        revenue_growth = ((current_data['total_revenue'] - previous_data['total_revenue']) / previous_data['total_revenue']) * 100
        
        if revenue_growth < 0:
            recommendations.append({
                'priority': 'high',
                'category': 'Revenue Recovery',
                'title': 'Implement Revenue Recovery Strategy',
                'description': 'Focus on customer retention, promotional campaigns, and product bundling to reverse revenue decline.',
                'actions': [
                    'Launch targeted retention campaigns for high-value customers',
                    'Introduce limited-time promotional offers',
                    'Analyze and address product or service quality issues'
                ]
            })
        
        # Regional recommendations
        regional_data = current_data['regional_breakdown']
        if len(regional_data) > 1:
            top_region = regional_data[0]
            bottom_region = regional_data[-1]
            
            if top_region['revenue'] > bottom_region['revenue'] * 3:
                recommendations.append({
                    'priority': 'medium',
                    'category': 'Regional Expansion',
                    'title': 'Replicate Success in Underperforming Regions',
                    'description': f'Apply successful strategies from {top_region["region"]} to boost performance in {bottom_region["region"]}.',
                    'actions': [
                        f'Analyze marketing and sales strategies in {top_region["region"]}',
                        f'Increase marketing investment in {bottom_region["region"]}',
                        'Consider regional product preferences and customization'
                    ]
                })
        
        # Customer segment recommendations
        customer_segments = current_data['customer_segments']
        high_value_customers = next((seg for seg in customer_segments if seg['segment'] == 'High Value'), None)
        
        if high_value_customers and high_value_customers['customer_count'] < current_data['unique_customers'] * 0.2:
            recommendations.append({
                'priority': 'high',
                'category': 'Customer Development',
                'title': 'Expand High-Value Customer Base',
                'description': 'Only a small percentage of customers are high-value. Focus on customer lifetime value improvement.',
                'actions': [
                    'Develop VIP customer program with exclusive benefits',
                    'Implement personalized product recommendations',
                    'Create loyalty rewards for repeat purchases'
                ]
            })
        
        # AOV recommendations
        aov_growth = ((current_data['avg_order_value'] - previous_data['avg_order_value']) / previous_data['avg_order_value']) * 100
        
        if aov_growth < 5:
            recommendations.append({
                'priority': 'medium',
                'category': 'Revenue Optimization',
                'title': 'Increase Average Order Value',
                'description': 'AOV growth is below target. Implement strategies to encourage larger purchases.',
                'actions': [
                    'Introduce product bundles and cross-selling',
                    'Implement free shipping thresholds',
                    'Offer volume discounts for bulk purchases'
                ]
            })
        
        # Category performance recommendations
        category_data = current_data['category_breakdown']
        if len(category_data) > 1:
            total_revenue = sum(cat['revenue'] for cat in category_data)
            underperforming_categories = [cat for cat in category_data if cat['revenue'] < total_revenue * 0.1]
            
            if underperforming_categories:
                recommendations.append({
                    'priority': 'low',
                    'category': 'Product Strategy',
                    'title': 'Optimize Underperforming Product Categories',
                    'description': f'Several categories are underperforming: {", ".join([cat["category"] for cat in underperforming_categories[:3]])}.',
                    'actions': [
                        'Review product pricing and positioning',
                        'Enhance marketing for underperforming categories',
                        'Consider product line optimization or discontinuation'
                    ]
                })
        
        return recommendations
    
    @staticmethod
    def _generate_alerts(current_data: Dict, previous_data: Dict) -> List[Dict[str, Any]]:
        """Generate important alerts and warnings"""
        
        alerts = []
        
        # Revenue decline alert
        revenue_decline = ((previous_data['total_revenue'] - current_data['total_revenue']) / previous_data['total_revenue']) * 100
        if revenue_decline > 15:
            alerts.append({
                'severity': 'critical',
                'type': 'revenue',
                'title': 'Significant Revenue Decline',
                'message': f'Revenue has dropped by {revenue_decline:.1f}% compared to the previous period.',
                'action_required': True
            })
        elif revenue_decline > 5:
            alerts.append({
                'severity': 'warning',
                'type': 'revenue',
                'title': 'Revenue Decline Detected',
                'message': f'Revenue has decreased by {revenue_decline:.1f}%. Monitor trends closely.',
                'action_required': False
            })
        
        # Customer retention alert
        customer_decline = ((previous_data['unique_customers'] - current_data['unique_customers']) / previous_data['unique_customers']) * 100
        if customer_decline > 10:
            alerts.append({
                'severity': 'warning',
                'type': 'customers',
                'title': 'Customer Base Decline',
                'message': f'Unique customers decreased by {customer_decline:.1f}%. Review retention strategies.',
                'action_required': True
            })
        
        # Order volume alert
        order_decline = ((previous_data['total_orders'] - current_data['total_orders']) / previous_data['total_orders']) * 100
        if order_decline > 20:
            alerts.append({
                'severity': 'critical',
                'type': 'orders',
                'title': 'Significant Order Volume Drop',
                'message': f'Order volume decreased by {order_decline:.1f}%. Immediate investigation required.',
                'action_required': True
            })
        
        # Regional concentration risk
        regional_data = current_data['regional_breakdown']
        if regional_data:
            total_revenue = sum(reg['revenue'] for reg in regional_data)
            top_region_share = (regional_data[0]['revenue'] / total_revenue) * 100
            
            if top_region_share > 60:
                alerts.append({
                    'severity': 'info',
                    'type': 'risk',
                    'title': 'High Regional Concentration',
                    'message': f'{regional_data[0]["region"]} accounts for {top_region_share:.1f}% of revenue. Consider diversification.',
                    'action_required': False
                })
        
        # Category concentration risk
        category_data = current_data['category_breakdown']
        if category_data:
            total_revenue = sum(cat['revenue'] for cat in category_data)
            top_category_share = (category_data[0]['revenue'] / total_revenue) * 100
            
            if top_category_share > 70:
                alerts.append({
                    'severity': 'info',
                    'type': 'risk',
                    'title': 'High Category Concentration',
                    'message': f'{category_data[0]["category"]} accounts for {top_category_share:.1f}% of revenue. Monitor market risks.',
                    'action_required': False
                })
        
        return alerts
    
    @staticmethod
    def generate_quarterly_report(db: Session, quarter: int, year: int) -> Dict[str, Any]:
        """Generate comprehensive quarterly business report"""
        
        # Calculate quarter dates
        quarter_starts = {
            1: datetime(year, 1, 1),
            2: datetime(year, 4, 1),
            3: datetime(year, 7, 1),
            4: datetime(year, 10, 1)
        }
        
        quarter_ends = {
            1: datetime(year, 3, 31),
            2: datetime(year, 6, 30),
            3: datetime(year, 9, 30),
            4: datetime(year, 12, 31)
        }
        
        start_date = quarter_starts[quarter]
        end_date = quarter_ends[quarter]
        
        # Get current quarter summary
        current_summary = ExecutiveSummaryService.generate_executive_summary(
            db, start_date, end_date
        )
        
        # Get previous quarter for comparison
        if quarter == 1:
            prev_quarter = 4
            prev_year = year - 1
        else:
            prev_quarter = quarter - 1
            prev_year = year
        
        prev_start = quarter_starts[prev_quarter].replace(year=prev_year)
        prev_end = quarter_ends[prev_quarter].replace(year=prev_year)
        
        previous_summary = ExecutiveSummaryService.generate_executive_summary(
            db, prev_start, prev_end
        )
        
        # Generate quarterly insights
        quarterly_insights = {
            'quarter_summary': f"Q{quarter} {year} Performance Summary",
            'quarter_highlights': ExecutiveSummaryService._generate_quarterly_highlights(
                current_summary, previous_summary
            ),
            'year_over_year': ExecutiveSummaryService._get_year_over_year_comparison(
                db, quarter, year
            )
        }
        
        return {
            **current_summary,
            'quarterly_insights': quarterly_insights,
            'report_type': 'quarterly',
            'quarter': quarter,
            'year': year
        }
    
    @staticmethod
    def _generate_quarterly_highlights(current: Dict, previous: Dict) -> List[str]:
        """Generate quarterly performance highlights"""
        
        highlights = []
        
        current_revenue = current['performance_metrics']['total_revenue']
        previous_revenue = previous['performance_metrics']['total_revenue']
        revenue_growth = ((current_revenue - previous_revenue) / previous_revenue) * 100
        
        if revenue_growth > 0:
            highlights.append(f"Revenue increased by {revenue_growth:.1f}% quarter-over-quarter")
        else:
            highlights.append(f"Revenue declined by {abs(revenue_growth):.1f}% quarter-over-quarter")
        
        current_customers = current['performance_metrics']['unique_customers']
        previous_customers = previous['performance_metrics']['unique_customers']
        customer_growth = ((current_customers - previous_customers) / previous_customers) * 100
        
        highlights.append(f"Customer base {'grew' if customer_growth > 0 else 'declined'} by {abs(customer_growth):.1f}%")
        
        # Add top performing region
        top_region = current['performance_metrics']['regional_breakdown'][0]
        highlights.append(f"{top_region['region']} was the top performing region with ${top_region['revenue']:,.0f} in revenue")
        
        return highlights
    
    @staticmethod
    def _get_year_over_year_comparison(db: Session, quarter: int, year: int) -> Dict[str, Any]:
        """Get year-over-year comparison for the same quarter"""
        
        # Get current quarter data
        current_start = datetime(year, (quarter-1)*3 + 1, 1)
        current_end = datetime(year, quarter*3, 28)  # Simplified end date
        
        # Get same quarter previous year
        prev_start = datetime(year-1, (quarter-1)*3 + 1, 1)
        prev_end = datetime(year-1, quarter*3, 28)
        
        current_data = ExecutiveSummaryService._get_period_data(db, current_start, current_end)
        previous_data = ExecutiveSummaryService._get_period_data(db, prev_start, prev_end)
        
        # Calculate YoY growth
        yoy_metrics = {}
        for key in ['total_revenue', 'total_orders', 'unique_customers']:
            current_val = current_data[key]
            previous_val = previous_data[key]
            if previous_val > 0:
                growth = ((current_val - previous_val) / previous_val) * 100
                yoy_metrics[key] = {
                    'current': current_val,
                    'previous': previous_val,
                    'growth_rate': round(growth, 2)
                }
        
        return {
            'comparison_period': f"Q{quarter} {year-1}",
            'metrics': yoy_metrics
        }