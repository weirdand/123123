from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List
import asyncio
from datetime import datetime
import traceback

router = APIRouter()

class Device(BaseModel):
    id: str
    online: bool
    task: str
    model: str
    battery: int
    username: str
    lastSeen: str

@router.get("/all", response_model=List[Device])
async def get_all_devices():
    print("="*50)
    print("ЗАПРОС НА /api/devices/all")
    
    try:
        # 1. Проверяем что adb существует
        import shutil
        adb_path = shutil.which('adb')
        print(f"ADB найден по пути: {adb_path}")
        
        # 2. Запускаем adb devices
        print("Запускаем adb devices...")
        proc = await asyncio.create_subprocess_shell(
            'adb devices',
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            shell=True
        )
        
        stdout, stderr = await proc.communicate()
        
        print(f"RETURN CODE: {proc.returncode}")
        
        if stderr:
            stderr_str = stderr.decode('utf-8', errors='ignore')
            print(f"STDERR: {stderr_str}")
        
        if stdout:
            stdout_str = stdout.decode('utf-8', errors='ignore')
            print(f"STDOUT: {stdout_str}")
            
            devices = []
            lines = stdout_str.split('\n')
            
            device_num = 1
            for line in lines:
                line = line.strip()
                print(f"Обрабатываем строку: '{line}'")
                
                if line and 'device' in line and 'List' not in line:
                    parts = line.split('\t')
                    if len(parts) >= 2 and parts[1] == 'device':
                        real_id = parts[0]
                        print(f"НАЙДЕН ТЕЛЕФОН: {real_id}")
                        
                        device = Device(
                            id=f"D{device_num:02d}",
                            online=True,
                            task="IDLE",
                            model="Android Device",
                            battery=100,
                            username=f"device_{real_id[-4:]}",
                            lastSeen=datetime.now().isoformat()
                        )
                        devices.append(device)
                        device_num += 1
            
            print(f"ВОЗВРАЩАЮ {len(devices)} УСТРОЙСТВ")
            print("="*50)
            return devices
        else:
            print("STDOUT пустой")
            return []
            
    except Exception as e:
        print(f"!! КРИТИЧЕСКАЯ ОШИБКА !!")
        print(f"Тип ошибки: {type(e)}")
        print(f"Ошибка: {str(e)}")
        print("Трассировка:")
        traceback.print_exc()
        print("="*50)
        return []

@router.get("/test")
async def test():
    return {"status": "ok", "time": datetime.now().isoformat()}

@router.get("/check")
async def check():
    """Проверка ADB"""
    try:
        import shutil
        adb_path = shutil.which('adb')
        
        proc = await asyncio.create_subprocess_shell(
            'adb version',
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await proc.communicate()
        
        return {
            "adb_found": adb_path is not None,
            "adb_path": str(adb_path),
            "adb_version": stdout.decode() if stdout else None,
            "adb_error": stderr.decode() if stderr else None
        }
    except Exception as e:
        return {"error": str(e)}