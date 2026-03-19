from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import os
import shutil
import asyncio
from datetime import datetime

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class ApkInfo(BaseModel):
    id: str
    name: str
    size: int
    uploadedAt: str

class InstallationStatus(BaseModel):
    status: str
    progress: int
    deviceStatus: Dict[str, str]

# Хранилище
apk_files = []
install_tasks = {}

@router.post("/upload")
async def upload_apk(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    # Сохраняем файл
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    apk_id = f"apk_{len(apk_files) + 1}"
    apk_info = ApkInfo(
        id=apk_id,
        name=file.filename,
        size=os.path.getsize(file_path),
        uploadedAt=datetime.now().isoformat()
    )
    apk_files.append(apk_info)
    
    return {"apkId": apk_id, "name": file.filename, "size": apk_info.size}

@router.get("/list")
async def get_apk_list():
    return apk_files

@router.post("/install")
async def install_apk(apk_id: str, device_ids: List[str]):
    task_id = f"install_{len(install_tasks) + 1}"
    
    # Создаем статус установки
    device_status = {device_id: "pending" for device_id in device_ids}
    install_tasks[task_id] = InstallationStatus(
        status="installing",
        progress=0,
        deviceStatus=device_status
    )
    
    # Запускаем фоновую симуляцию установки
    asyncio.create_task(simulate_installation(task_id, device_ids))
    
    return {"taskId": task_id}

@router.get("/status/{task_id}")
async def get_installation_status(task_id: str):
    if task_id in install_tasks:
        return install_tasks[task_id]
    raise HTTPException(status_code=404, detail="Task not found")

async def simulate_installation(task_id: str, device_ids: List[str]):
    for i in range(10):
        await asyncio.sleep(1)
        if task_id in install_tasks:
            install_tasks[task_id].progress = (i + 1) * 10
            
            # Обновляем статусы устройств
            for j, device_id in enumerate(device_ids):
                if i > j * 3:
                    install_tasks[task_id].deviceStatus[device_id] = "success" if i > 7 else "installing"
    
    if task_id in install_tasks:
        install_tasks[task_id].status = "completed"
        install_tasks[task_id].progress = 100
        for device_id in device_ids:
            install_tasks[task_id].deviceStatus[device_id] = "success"