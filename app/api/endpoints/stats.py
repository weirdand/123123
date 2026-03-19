from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from datetime import datetime

router = APIRouter()

class DashboardStats(BaseModel):
    totalViews: int
    totalWatchHours: int
    conversion: float
    totalPosts: int
    viewsChange: float
    hoursChange: float
    conversionChange: float
    postsChange: float

@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats():
    return DashboardStats(
        totalViews=15234,
        totalWatchHours=876,
        conversion=3.2,
        totalPosts=145,
        viewsChange=12.5,
        hoursChange=8.3,
        conversionChange=0.5,
        postsChange=15.2
    )

@router.get("/export")
async def export_stats(type: str = "devices"):
    # Возвращаем CSV файл
    from fastapi.responses import Response
    csv_data = "Device,Views,Status\nD01,15234,ONLINE\nD02,8765,ONLINE"
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={type}.csv"}
    )