from datetime import datetime, date, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.services.analytics import AnalyticsService
from pydantic import BaseModel
from app.services.customer_analytics import CustomerAnalyticsService
from app.services.product_analytics import ProductAnalyticsService
from app.services.geographic_analytics import GeographicAnalyticsService
from app.services.executive_summary import ExecutiveSummaryService
from app.services.forecasting import ForecastingService

router = APIRouter()

class FilterParams(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    categories: Optional[List[str]] = None
    regions: Optional[List[str]] = None
    customer_segments: Optional[List[str]] = None

def parse_filters(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    categories: Optional[str] = Query(None, description="Comma-separated product categories"),
    regions: Optional[str] = Query(None, description="Comma-separated regions"),
    customer_segments: Optional[str] = Query(None, description="Comma-separated customer segments")
) -> dict:
    """Parse query parameters into filter dictionary"""
    filters = {}
    
    if start_date:
        try:
            filters['start_date'] = datetime.strptime(start_date, '%Y-%m-%d').date()
        except ValueError:
            pass
    
    if end_date:
        try:
            filters['end_date'] = datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            pass
    
    if categories:
        filters['categories'] = [cat.strip() for cat in categories.split(',') if cat.strip()]
    
    if regions:
        filters['regions'] = [region.strip() for region in regions.split(',') if region.strip()]
    
    if customer_segments:
        filters['customer_segments'] = [seg.strip() for seg in customer_segments.split(',') if seg.strip()]
    
    return filters

@router.get("/kpis")
async def get_kpis(
    filters: dict = Depends(parse_filters),
    db: Session = Depends(get_db)
):
    """Get KPIs with optional filtering"""
    service = AnalyticsService(db)
    return service.get_kpis_filtered(filters)

@router.get("/sales-trends")
async def get_sales_trends(
    filters: dict = Depends(parse_filters),
    db: Session = Depends(get_db)
):
    """Get sales trends with optional filtering"""
    service = AnalyticsService(db)
    return service.get_sales_trends_filtered(filters)

@router.get("/regional-performance")
async def get_regional_performance(
    filters: dict = Depends(parse_filters),
    db: Session = Depends(get_db)
):
    """Get regional performance with optional filtering"""
    service = AnalyticsService(db)
    return service.get_regional_performance_filtered(filters)

@router.get("/top-products")
async def get_top_products(
    filters: dict = Depends(parse_filters),
    limit: int = Query(10, description="Number of top products to return"),
    db: Session = Depends(get_db)
):
    """Get top products with optional filtering"""
    service = AnalyticsService(db)
    return service.get_top_products_filtered(filters, limit)

@router.get("/filter-options")
async def get_filter_options(db: Session = Depends(get_db)):
    """Get all available filter options"""
    service = AnalyticsService(db)
    return service.get_filter_options()

@router.get("/date-presets")
async def get_date_presets():
    """Get common date range presets"""
    today = date.today()
    
    return {
        "last_7_days": {
            "start_date": (today - timedelta(days=7)).isoformat(),
            "end_date": today.isoformat(),
            "label": "Last 7 Days"
        },
        "last_30_days": {
            "start_date": (today - timedelta(days=30)).isoformat(),
            "end_date": today.isoformat(),
            "label": "Last 30 Days"
        },
        "last_90_days": {
            "start_date": (today - timedelta(days=90)).isoformat(),
            "end_date": today.isoformat(),
            "label": "Last 90 Days"
        },
        "current_year": {
            "start_date": date(today.year, 1, 1).isoformat(),
            "end_date": today.isoformat(),
            "label": "Current Year"
        },
        "last_year": {
            "start_date": date(today.year - 1, 1, 1).isoformat(),
            "end_date": date(today.year - 1, 12, 31).isoformat(),
            "label": "Last Year"
        }
    }

@router.post("/analytics/filtered")
async def get_filtered_analytics(
    filter_params: FilterParams,
    db: Session = Depends(get_db)
):
    """Get all analytics data with complex filtering via POST"""
    service = AnalyticsService(db)
    
    # Convert Pydantic model to dict
    filters = filter_params.dict(exclude_none=True)
    
    return {
        "kpis": service.get_kpis_filtered(filters),
        "sales_trends": service.get_sales_trends_filtered(filters),
        "regional_performance": service.get_regional_performance_filtered(filters),
        "top_products": service.get_top_products_filtered(filters, 5)
    }

@router.get("/customer-analytics/rfm")
async def get_rfm_analysis(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    regions: Optional[str] = None,
    segments: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get RFM (Recency, Frequency, Monetary) analysis for customer segmentation"""
    try:
        # Parse filters
        filters = {}
        if start_date and end_date:
            filters['start_date'] = datetime.strptime(start_date, '%Y-%m-%d').date()
            filters['end_date'] = datetime.strptime(end_date, '%Y-%m-%d').date()
        if regions:
            filters['regions'] = regions.split(',')
        if segments:
            filters['segments'] = segments.split(',')
        
        # Get RFM analysis
        service = CustomerAnalyticsService(db)
        result = service.calculate_rfm_analysis(filters)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating RFM analysis: {str(e)}")

@router.get("/customer-analytics/clv")
async def get_customer_lifetime_value(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    regions: Optional[str] = None,
    segments: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get Customer Lifetime Value analysis"""
    try:
        # Parse filters
        filters = {}
        if start_date and end_date:
            filters['start_date'] = datetime.strptime(start_date, '%Y-%m-%d').date()
            filters['end_date'] = datetime.strptime(end_date, '%Y-%m-%d').date()
        if regions:
            filters['regions'] = regions.split(',')
        if segments:
            filters['segments'] = segments.split(',')
        
        # Get CLV analysis
        service = CustomerAnalyticsService(db)
        result = service.get_customer_lifetime_value(filters)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating CLV: {str(e)}")

@router.get("/customer-analytics/cohort")
async def get_cohort_analysis(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get cohort retention analysis"""
    try:
        # This will be our next implementation
        return {"message": "Cohort analysis endpoint - coming next!"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in cohort analysis: {str(e)}")
    
@router.get("/product-analytics/abc-analysis")
async def get_abc_analysis(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    categories: Optional[str] = Query(None),
    regions: Optional[str] = Query(None),
    customer_segments: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get ABC Analysis for products"""
    try:
        # Parse dates if provided
        parsed_start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00')) if start_date else None
        parsed_end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00')) if end_date else None
        
        # Parse comma-separated values
        category_list = categories.split(',') if categories else []
        region_list = regions.split(',') if regions else []
        segment_list = customer_segments.split(',') if customer_segments else []
        
        service = ProductAnalyticsService(db)
        result = service.get_abc_analysis(
            start_date=parsed_start_date,
            end_date=parsed_end_date,
            categories=category_list,
            regions=region_list,
            segments=segment_list
        )
        
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/product-analytics/profitability-matrix")
async def get_profitability_matrix(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    categories: Optional[str] = Query(None),
    regions: Optional[str] = Query(None),
    customer_segments: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get Product Profitability Matrix"""
    try:
        # Parse dates if provided
        parsed_start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00')) if start_date else None
        parsed_end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00')) if end_date else None
        
        # Parse comma-separated values
        category_list = categories.split(',') if categories else []
        region_list = regions.split(',') if regions else []
        segment_list = customer_segments.split(',') if customer_segments else []
        
        service = ProductAnalyticsService(db)
        result = service.get_profitability_matrix(
            start_date=parsed_start_date,
            end_date=parsed_end_date,
            categories=category_list,
            regions=region_list,
            segments=segment_list
        )
        
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/product-analytics/sales-velocity")
async def get_sales_velocity(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    categories: Optional[str] = Query(None),
    regions: Optional[str] = Query(None),
    customer_segments: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get Sales Velocity Analysis"""
    try:
        # Parse dates if provided
        parsed_start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00')) if start_date else None
        parsed_end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00')) if end_date else None
        
        # Parse comma-separated values
        category_list = categories.split(',') if categories else []
        region_list = regions.split(',') if regions else []
        segment_list = customer_segments.split(',') if customer_segments else []
        
        service = ProductAnalyticsService(db)
        result = service.get_sales_velocity_analysis(
            start_date=parsed_start_date,
            end_date=parsed_end_date,
            categories=category_list,
            regions=region_list,
            segments=segment_list
        )
        
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/product-analytics/cross-selling")
async def get_cross_selling_analysis(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    categories: Optional[str] = Query(None),
    regions: Optional[str] = Query(None),
    customer_segments: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get Cross-selling Analysis"""
    try:
        # Parse dates if provided
        parsed_start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00')) if start_date else None
        parsed_end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00')) if end_date else None
        
        # Parse comma-separated values
        category_list = categories.split(',') if categories else []
        region_list = regions.split(',') if regions else []
        segment_list = customer_segments.split(',') if customer_segments else []
        
        service = ProductAnalyticsService(db)
        result = service.get_cross_selling_analysis(
            start_date=parsed_start_date,
            end_date=parsed_end_date,
            categories=category_list,
            regions=region_list,
            segments=segment_list
        )
        
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/api/analytics/geographic/regions")
async def get_regional_sales(
    db: Session = Depends(get_db),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    category: Optional[str] = Query(None)
):
    """Get sales data aggregated by region"""
    try:
        # Parse dates if provided
        parsed_start = datetime.strptime(start_date, "%Y-%m-%d") if start_date else None
        parsed_end = datetime.strptime(end_date, "%Y-%m-%d") if start_date else None
        
        result = GeographicAnalyticsService.get_sales_by_region(
            db, parsed_start, parsed_end, category
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/analytics/geographic/states")
async def get_state_sales(
    db: Session = Depends(get_db),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    category: Optional[str] = Query(None)
):
    """Get sales data by state for heatmap visualization"""
    try:
        parsed_start = datetime.strptime(start_date, "%Y-%m-%d") if start_date else None
        parsed_end = datetime.strptime(end_date, "%Y-%m-%d") if start_date else None
        
        result = GeographicAnalyticsService.get_sales_by_state(
            db, parsed_start, parsed_end, category
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/analytics/geographic/trends")
async def get_geographic_trends(
    db: Session = Depends(get_db),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Get geographic trends over time"""
    try:
        parsed_start = datetime.strptime(start_date, "%Y-%m-%d") if start_date else None
        parsed_end = datetime.strptime(end_date, "%Y-%m-%d") if start_date else None
        
        result = GeographicAnalyticsService.get_geographic_trends(
            db, parsed_start, parsed_end
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/analytics/geographic/comparison")
async def get_regional_comparison(
    db: Session = Depends(get_db),
    metric: str = Query("revenue", regex="^(revenue|orders|customers|aov)$"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Compare regions across different metrics"""
    try:
        parsed_start = datetime.strptime(start_date, "%Y-%m-%d") if start_date else None
        parsed_end = datetime.strptime(end_date, "%Y-%m-%d") if start_date else None
        
        result = GeographicAnalyticsService.get_regional_comparison(
            db, metric, parsed_start, parsed_end
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/api/analytics/executive-summary")
async def get_executive_summary(
    db: Session = Depends(get_db),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Generate executive summary with automated insights"""
    try:
        parsed_start = datetime.strptime(start_date, "%Y-%m-%d") if start_date else None
        parsed_end = datetime.strptime(end_date, "%Y-%m-%d") if end_date else None
        
        result = ExecutiveSummaryService.generate_executive_summary(
            db, parsed_start, parsed_end
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/analytics/quarterly-report")
async def get_quarterly_report(
    db: Session = Depends(get_db),
    quarter: int = Query(..., ge=1, le=4),
    year: int = Query(..., ge=2020, le=2030)
):
    """Generate comprehensive quarterly business report"""
    try:
        result = ExecutiveSummaryService.generate_quarterly_report(db, quarter, year)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/analytics/business-insights")
async def get_business_insights(
    db: Session = Depends(get_db),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    format: str = Query("json", regex="^(json|summary)$")
):
    """Get business insights in different formats"""
    try:
        parsed_start = datetime.strptime(start_date, "%Y-%m-%d") if start_date else None
        parsed_end = datetime.strptime(end_date, "%Y-%m-%d") if end_date else None
        
        summary = ExecutiveSummaryService.generate_executive_summary(
            db, parsed_start, parsed_end
        )
        
        if format == "summary":
            # Return condensed version for quick consumption
            return {
                'executive_summary': summary['executive_summary'],
                'key_metrics': {
                    'revenue': summary['performance_metrics']['total_revenue'],
                    'orders': summary['performance_metrics']['total_orders'],
                    'customers': summary['performance_metrics']['unique_customers'],
                    'aov': summary['performance_metrics']['avg_order_value']
                },
                'top_insights': summary['key_insights'][:3],
                'priority_recommendations': [r for r in summary['recommendations'] if r['priority'] == 'high'],
                'critical_alerts': [a for a in summary['alerts'] if a['severity'] == 'critical']
            }
        
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/api/analytics/forecast/sales")
async def get_sales_forecast(
    db: Session = Depends(get_db),
    forecast_periods: int = Query(12, ge=1, le=36),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Generate sales forecast using time series analysis"""
    try:
        parsed_start = datetime.strptime(start_date, "%Y-%m-%d") if start_date else None
        parsed_end = datetime.strptime(end_date, "%Y-%m-%d") if end_date else None
        
        result = ForecastingService.generate_sales_forecast(
            db, forecast_periods, parsed_start, parsed_end
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/analytics/forecast/regional")
async def get_regional_forecast(
    db: Session = Depends(get_db),
    forecast_periods: int = Query(6, ge=1, le=24),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Generate forecasts by region"""
    try:
        parsed_start = datetime.strptime(start_date, "%Y-%m-%d") if start_date else None
        parsed_end = datetime.strptime(end_date, "%Y-%m-%d") if end_date else None
        
        result = ForecastingService.get_forecast_by_region(
            db, forecast_periods, parsed_start, parsed_end
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/analytics/forecast/accuracy")
async def get_forecast_accuracy(
    db: Session = Depends(get_db),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Get forecast accuracy metrics and model performance"""
    try:
        parsed_start = datetime.strptime(start_date, "%Y-%m-%d") if start_date else None
        parsed_end = datetime.strptime(end_date, "%Y-%m-%d") if end_date else None
        
        # Generate forecast to get accuracy metrics
        result = ForecastingService.generate_sales_forecast(
            db, 3, parsed_start, parsed_end  # Short forecast for accuracy testing
        )
        
        return {
            'accuracy_metrics': result.get('accuracy_metrics', {}),
            'model_info': result.get('model_info', {}),
            'data_quality': {
                'historical_periods': len(result.get('historical_data', [])),
                'data_completeness': 'good' if len(result.get('historical_data', [])) >= 12 else 'limited',
                'recommendation': 'More historical data will improve forecast accuracy' if len(result.get('historical_data', [])) < 12 else 'Sufficient data for reliable forecasting'
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))