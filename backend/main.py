from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.services.analytics import AnalyticsService

app = FastAPI(
    title="Retail Analytics API",
    description="Full-stack retail analytics platform with CSV data",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://retail-analytics-platform.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize analytics service once (no database needed)
analytics_service = AnalyticsService()

@app.get("/")
async def root():
    return {
        "message": "🚀 Retail Analytics API is running!", 
        "status": "success",
        "version": "1.0.0",
        "data_source": "CSV file",
        "endpoints": {
            "analytics": "/docs",
            "kpis": "/api/analytics/kpis",
            "trends": "/api/analytics/sales-trends",
            "regions": "/api/analytics/regional-performance"
        }
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy", 
        "service": "retail-analytics-api",
        "data_source": "CSV loaded successfully"
    }

# Analytics Endpoints (no database dependency)
@app.get("/api/analytics/kpis")
async def get_kpis():
    """Get key performance indicators"""
    try:
        return analytics_service.get_kpis()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/sales-trends")
async def get_sales_trends():
    """Get monthly sales trends"""
    try:
        return analytics_service.get_sales_trends()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/regional-performance")
async def get_regional_performance():
    """Get sales performance by region"""
    try:
        return analytics_service.get_regional_performance()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/category-analysis")
async def get_category_analysis():
    """Get product category performance"""
    try:
        return analytics_service.get_category_analysis()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/customer-segments")
async def get_customer_segments():
    """Get customer segment analysis"""
    try:
        return analytics_service.get_customer_segments()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/top-products")
async def get_top_products(limit: int = 10):
    """Get top performing products"""
    try:
        return analytics_service.get_top_products(limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)