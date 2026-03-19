from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.api.endpoints import auth, devices, scripts, proxy, apk, stats
from app.api import websocket

app = FastAPI(title="Ferma Zak API", version="1.0.0")

# CORS для фронта
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутеры
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(devices.router, prefix="/api/devices", tags=["devices"])
app.include_router(scripts.router, prefix="/api/scripts", tags=["scripts"])
app.include_router(proxy.router, prefix="/api/proxy", tags=["proxy"])
app.include_router(apk.router, prefix="/api/apk", tags=["apk"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])
app.include_router(websocket.router, tags=["websocket"])

# Создаем папки для загрузок
os.makedirs("uploads", exist_ok=True)
os.makedirs("scripts", exist_ok=True)

@app.get("/")
async def root():
    return {"message": "Ferma Zak API is running", "status": "ok"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}