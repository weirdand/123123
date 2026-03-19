from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from datetime import datetime

from app.api.endpoints import auth, devices, proxy, apk, stats
from app.api import websocket

app = FastAPI(title="Ferma Zak API", version="1.0.0")

# CORS для всего
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутеры
app.include_router(devices.router, prefix="/api/devices", tags=["devices"])
app.include_router(websocket.router, tags=["websocket"])

@app.get("/")
async def root():
    return {"message": "Ferma Zak API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "ok", "time": datetime.now().isoformat()}