from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
import asyncio

router = APIRouter()

class Proxy(BaseModel):
    id: str
    ip: str
    port: int
    username: Optional[str] = None
    password: Optional[str] = None
    status: str  # 'online' | 'offline' | 'checking'
    deviceId: Optional[str] = None
    country: Optional[str] = None
    speed: Optional[int] = None

# Мок-данные
MOCK_PROXIES = [
    Proxy(id="p1", ip="192.168.1.101", port=8080, status="online", country="US", speed=120),
    Proxy(id="p2", ip="192.168.1.102", port=8080, status="online", country="DE", speed=150),
    Proxy(id="p3", ip="192.168.1.103", port=8080, status="offline", country="RU", speed=None),
]

@router.get("/", response_model=List[Proxy])
async def get_all_proxies():
    return MOCK_PROXIES

@router.post("/import")
async def import_proxies(proxies_text: str):
    lines = proxies_text.strip().split('\n')
    imported = 0
    errors = []
    
    for line in lines:
        try:
            if ':' in line:
                ip, port = line.strip().split(':')
                MOCK_PROXIES.append(Proxy(
                    id=f"p{len(MOCK_PROXIES)+1}",
                    ip=ip,
                    port=int(port),
                    status="checking"
                ))
                imported += 1
        except:
            errors.append(f"Invalid format: {line}")
    
    return {"imported": imported, "errors": errors}

@router.post("/check/{proxy_id}")
async def check_proxy(proxy_id: str):
    # Симуляция проверки
    await asyncio.sleep(1)
    return {"status": "online", "speed": 100 + len(proxy_id)}

@router.post("/check/all")
async def check_all_proxies():
    results = {}
    for proxy in MOCK_PROXIES:
        results[proxy.id] = "online" if proxy.status == "online" else "offline"
    return {"results": results}

@router.post("/assign")
async def assign_proxy_to_device(proxy_id: str, device_id: str):
    for proxy in MOCK_PROXIES:
        if proxy.id == proxy_id:
            proxy.deviceId = device_id
            return proxy
    raise HTTPException(status_code=404, detail="Proxy not found")

@router.post("/add")
async def add_proxy(proxy: Proxy):
    new_proxy = proxy.copy()
    new_proxy.id = f"p{len(MOCK_PROXIES)+1}"
    new_proxy.status = "checking"
    MOCK_PROXIES.append(new_proxy)
    return new_proxy

@router.delete("/{proxy_id}")
async def delete_proxy(proxy_id: str):
    global MOCK_PROXIES
    MOCK_PROXIES = [p for p in MOCK_PROXIES if p.id != proxy_id]
    return {"success": True}

@router.post("/rotate/{device_id}")
async def rotate_proxy(device_id: str):
    # Находим свободный прокси
    for proxy in MOCK_PROXIES:
        if proxy.deviceId is None and proxy.status == "online":
            proxy.deviceId = device_id
            return {"newProxy": proxy}
    raise HTTPException(status_code=404, detail="No available proxies")