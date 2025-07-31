from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.services.analytics import AnalyticsService
from app.api import filtered_endpoints

app = FastAPI(
    title="Retail Analytics API",
    description="Full-stack retail analytics platform with ML capabilities",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"
    "https://retail-analytics-platform.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the filtered API endpoints
app.include_router(filtered_endpoints.router, prefix="/api/filtered")


@app.get("/")
async def root():
    return {
        "message": "🚀 Retail Analytics API is running!", 
        "status": "success",
        "version": "1.0.0",
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
        "database": "connected"
    }

# Analytics Endpoints
@app.get("/api/analytics/kpis")
async def get_kpis(db: Session = Depends(get_db)):
    """Get key performance indicators"""
    try:
        analytics_service = AnalyticsService(db)
        return analytics_service.get_kpis()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/sales-trends")
async def get_sales_trends(db: Session = Depends(get_db)):
    """Get monthly sales trends"""
    try:
        analytics_service = AnalyticsService(db)
        return analytics_service.get_sales_trends()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/regional-performance")
async def get_regional_performance(db: Session = Depends(get_db)):
    """Get sales performance by region"""
    try:
        analytics_service = AnalyticsService(db)
        return analytics_service.get_regional_performance()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/category-analysis")
async def get_category_analysis(db: Session = Depends(get_db)):
    """Get product category performance"""
    try:
        analytics_service = AnalyticsService(db)
        return analytics_service.get_category_analysis()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/customer-segments")
async def get_customer_segments(db: Session = Depends(get_db)):
    """Get customer segment analysis"""
    try:
        analytics_service = AnalyticsService(db)
        return analytics_service.get_customer_segments()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/top-products")
async def get_top_products(limit: int = 10, db: Session = Depends(get_db)):
    """Get top performing products"""
    try:
        analytics_service = AnalyticsService(db)
        return analytics_service.get_top_products(limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)