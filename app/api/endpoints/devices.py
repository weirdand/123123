from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
import asyncio
import subprocess
import re
from datetime import datetime
import json

router = APIRouter()

# Модели данных
class Device(BaseModel):
    id: str
    status: str  # 'ONLINE' | 'OFF' | 'IDLE' | 'BUSY'
    fps: int
    task: Optional[str] = None
    username: Optional[str] = None
    views: Optional[int] = None
    ip: Optional[str] = None
    usbPort: Optional[int] = None
    proxyId: Optional[str] = None
    lastSeen: str
    model: Optional[str] = None
    battery: Optional[int] = None
    temperature: Optional[float] = None

class DevicesResponse(BaseModel):
    data: List[Device]
    total: int

# Класс для работы с ADB
class RealADBManager:
    def __init__(self):
        self.devices_cache: Dict[str, Device] = {}
        self.last_update = None
        self._lock = asyncio.Lock()
    
    async def get_devices(self) -> List[Device]:
        """Получение реальных устройств через ADB"""
        async with self._lock:
            try:
                # Получаем список устройств
                proc = await asyncio.create_subprocess_shell(
                    'adb devices',
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                stdout, stderr = await proc.communicate()
                
                if stderr:
                    print(f"ADB error: {stderr.decode()}")
                
                devices = []
                lines = stdout.decode().split('\n')[1:-1]
                
                for line in lines:
                    if 'device' in line and 'offline' not in line:
                        device_id = line.split('\t')[0]
                        
                        # Получаем детальную информацию об устройстве
                        device_info = await self._get_device_info(device_id)
                        
                        device = Device(
                            id=device_id,
                            status='ONLINE',
                            fps=await self._get_device_fps(device_id),
                            task=await self._get_current_task(device_id),
                            username=device_info.get('username', f'device_{device_id[-4:]}'),
                            views=device_info.get('views', 0),
                            model=device_info.get('model', 'Unknown'),
                            battery=device_info.get('battery', 100),
                            temperature=device_info.get('temp', 36.5),
                            lastSeen=datetime.now().isoformat()
                        )
                        
                        devices.append(device)
                        self.devices_cache[device_id] = device
                
                self.last_update = datetime.now()
                return devices
                
            except Exception as e:
                print(f"Error getting devices: {e}")
                return []
    
    async def _get_device_info(self, device_id: str) -> dict:
        """Получение информации об устройстве"""
        info = {}
        
        # Получаем модель устройства
        try:
            proc = await asyncio.create_subprocess_shell(
                f'adb -s {device_id} shell getprop ro.product.model',
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, _ = await proc.communicate()
            info['model'] = stdout.decode().strip()
        except:
            info['model'] = 'Unknown'
        
        # Получаем уровень батареи
        try:
            proc = await asyncio.create_subprocess_shell(
                f'adb -s {device_id} shell dumpsys battery | grep level',
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, _ = await proc.communicate()
            match = re.search(r'level: (\d+)', stdout.decode())
            info['battery'] = int(match.group(1)) if match else 100
        except:
            info['battery'] = 100
        
        # Получаем температуру
        try:
            proc = await asyncio.create_subprocess_shell(
                f'adb -s {device_id} shell dumpsys battery | grep temperature',
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, _ = await proc.communicate()
            match = re.search(r'temperature: (\d+)', stdout.decode())
            info['temp'] = int(match.group(1)) / 10 if match else 36.5
        except:
            info['temp'] = 36.5
        
        return info
    
    async def _get_device_fps(self, device_id: str) -> int:
        """Получение FPS устройства (симуляция)"""
        # В реальности нужно через dumpsys gfxinfo
        return 60
    
    async def _get_current_task(self, device_id: str) -> str:
        """Получение текущей задачи на устройстве"""
        try:
            proc = await asyncio.create_subprocess_shell(
                f'adb -s {device_id} shell dumpsys activity activities | grep mResumedActivity',
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, _ = await proc.communicate()
            output = stdout.decode()
            
            if 'com.instagram' in output:
                return 'SCROLL'
            elif 'com.zhiliaoapp.musically' in output or 'com.ss.android.ugc.trill' in output:
                return 'SCROLL'
            elif 'com.google.android.apps.photos' in output:
                return 'POST'
            else:
                return 'IDLE'
        except:
            return 'IDLE'

# Создаем экземпляр менеджера
adb_manager = RealADBManager()

# WebSocket менеджер для реального времени
class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self._broadcast_task = None
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        
        # Запускаем фоновую задачу для рассылки обновлений
        if self._broadcast_task is None or self._broadcast_task.done():
            self._broadcast_task = asyncio.create_task(self._broadcast_loop())
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        
        # Если нет подключений, останавливаем рассылку
        if not self.active_connections and self._broadcast_task:
            self._broadcast_task.cancel()
            self._broadcast_task = None
    
    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass
    
    async def _broadcast_loop(self):
        """Цикл рассылки обновлений каждые 2 секунды"""
        while True:
            try:
                if self.active_connections:
                    # Получаем актуальные устройства
                    devices = await adb_manager.get_devices()
                    
                    # Отправляем обновление
                    await self.broadcast({
                        "type": "devices_update",
                        "data": [device.dict() for device in devices],
                        "timestamp": datetime.now().isoformat()
                    })
                
                await asyncio.sleep(2)  # Обновление каждые 2 секунды
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"Broadcast error: {e}")
                await asyncio.sleep(5)

ws_manager = WebSocketManager()

# Эндпоинты API
@router.get("/", response_model=DevicesResponse)
async def get_devices(page: int = 1, limit: int = 10, search: str = "", status: str = ""):
    """Получение списка устройств с пагинацией"""
    devices = await adb_manager.get_devices()
    
    # Фильтрация
    if search:
        devices = [d for d in devices if search.lower() in (d.username or '').lower() or search in d.id]
    if status:
        devices = [d for d in devices if d.status == status]
    
    # Пагинация
    start = (page - 1) * limit
    end = start + limit
    
    return DevicesResponse(
        data=devices[start:end],
        total=len(devices)
    )

@router.get("/all", response_model=List[Device])
async def get_all_devices():
    """Получение всех устройств без пагинации"""
    return await adb_manager.get_devices()

@router.get("/{device_id}", response_model=Device)
async def get_device(device_id: str):
    """Получение конкретного устройства"""
    devices = await adb_manager.get_devices()
    for device in devices:
        if device.id == device_id:
            return device
    raise HTTPException(status_code=404, detail="Device not found")

@router.post("/scan")
async def scan_network():
    """Сканирование сети для поиска устройств"""
    # Просто запускаем adb kill-server и adb start-server
    try:
        proc = await asyncio.create_subprocess_shell(
            'adb kill-server && adb start-server',
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        await proc.communicate()
        
        devices = await adb_manager.get_devices()
        return {"devices": devices, "message": f"Found {len(devices)} devices"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reboot/{device_id}")
async def reboot_device(device_id: str):
    """Перезагрузка конкретного устройства"""
    try:
        proc = await asyncio.create_subprocess_shell(
            f'adb -s {device_id} reboot',
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        await proc.communicate()
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/reboot/all")
async def reboot_all():
    """Перезагрузка всех устройств"""
    devices = await adb_manager.get_devices()
    results = {}
    
    for device in devices:
        try:
            proc = await asyncio.create_subprocess_shell(
                f'adb -s {device.id} reboot',
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            await proc.communicate()
            results[device.id] = True
        except:
            results[device.id] = False
    
    return {"success": True, "results": results}

@router.post("/assign-task/{device_id}")
async def assign_task(device_id: str, task: str):
    """Назначение задачи на устройство"""
    # В реальности тут запуск скрипта
    return {"success": True, "message": f"Task {task} assigned to {device_id}"}

@router.get("/by-port/{port_range}")
async def get_devices_by_port(port_range: str):
    """Получение устройств по диапазону портов USB"""
    devices = await adb_manager.get_devices()
    # Здесь можно добавить логику маппинга портов
    return devices

# WebSocket эндпоинт
@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Ждем сообщения от клиента (пинг и т.д.)
            data = await websocket.receive_text()
            # Можно обрабатывать входящие сообщения
    except WebSocketDisconnect:
          ws_manager.disconnect(websocket)