from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncio
import os

router = APIRouter()

class ScriptParameter(BaseModel):
    name: str
    type: str
    label: str
    required: bool
    min: Optional[float] = None
    max: Optional[float] = None
    defaultValue: Optional[Any] = None

class Script(BaseModel):
    id: str
    name: str
    description: str
    type: str  # 'free' | 'paid'
    price: Optional[float] = None
    priceMonthly: Optional[float] = None
    category: str  # 'warming' | 'boosting' | 'posting' | 'engagement'
    parameters: List[ScriptParameter] = []

class Task(BaseModel):
    id: str
    scriptId: str
    scriptName: str
    deviceIds: List[str]
    status: str  # 'pending' | 'running' | 'completed' | 'failed' | 'stopped'
    progress: int
    startedAt: str
    completedAt: Optional[str] = None
    result: Optional[Dict] = None
    error: Optional[str] = None

# Мок-данные
MOCK_SCRIPTS = [
    Script(
        id="1",
        name="auto_like.py",
        description="Massive liking by hashtags",
        type="free",
        category="engagement",
        parameters=[
            ScriptParameter(name="hashtag", type="hashtag", label="Hashtag to like", required=True),
            ScriptParameter(name="likes_count", type="number", label="Number of likes", required=True, min=1, max=100, defaultValue=10)
        ]
    ),
    Script(
        id="2",
        name="MassFollow Engine",
        description="Auto-follow targeted users",
        type="paid",
        priceMonthly=19,
        category="engagement",
        parameters=[
            ScriptParameter(name="target_hashtag", type="hashtag", label="Target hashtag", required=True),
            ScriptParameter(name="follow_limit", type="number", label="Follow limit", required=True, min=1, max=50, defaultValue=20)
        ]
    ),
    Script(
        id="3",
        name="ContentBot AI",
        description="AI-powered content creation",
        type="paid",
        priceMonthly=39,
        category="posting",
        parameters=[
            ScriptParameter(name="topic", type="string", label="Content topic", required=True),
            ScriptParameter(name="length", type="number", label="Content length", required=True, min=50, max=500, defaultValue=200)
        ]
    )
]

MOCK_TASKS: List[Task] = []

@router.get("/", response_model=List[Script])
async def get_available_scripts():
    return MOCK_SCRIPTS

@router.get("/purchased", response_model=List[Script])
async def get_purchased_scripts():
    # Для демо возвращаем все бесплатные
    return [s for s in MOCK_SCRIPTS if s.type == "free"]

@router.get("/{script_id}", response_model=Script)
async def get_script_by_id(script_id: str):
    for script in MOCK_SCRIPTS:
        if script.id == script_id:
            return script
    raise HTTPException(status_code=404, detail="Script not found")

@router.post("/{script_id}/run")
async def run_script(script_id: str, device_ids: List[str], parameters: Dict[str, Any] = {}):
    script = next((s for s in MOCK_SCRIPTS if s.id == script_id), None)
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")
    
    task_id = f"task_{len(MOCK_TASKS) + 1}"
    task = Task(
        id=task_id,
        scriptId=script_id,
        scriptName=script.name,
        deviceIds=device_ids,
        status="running",
        progress=0,
        startedAt=asyncio.get_event_loop().time().__str__()
    )
    MOCK_TASKS.append(task)
    
    # Запускаем фоновую задачу
    asyncio.create_task(simulate_task_progress(task_id))
    
    return {"taskId": task_id}

@router.post("/{task_id}/stop")
async def stop_script(task_id: str):
    for task in MOCK_TASKS:
        if task.id == task_id:
            task.status = "stopped"
            return {"success": True}
    return {"success": False}

@router.get("/logs/{script_id}")
async def get_script_logs(script_id: str, limit: int = 100):
    return {"logs": [f"[INFO] Script {script_id} started", "[INFO] Processing...", "[INFO] Completed"]}

@router.get("/task/{task_id}", response_model=Task)
async def get_task_status(task_id: str):
    for task in MOCK_TASKS:
        if task.id == task_id:
            return task
    raise HTTPException(status_code=404, detail="Task not found")

@router.get("/tasks/all", response_model=List[Task])
async def get_all_tasks():
    return MOCK_TASKS

# Специализированные функции для скриптов
@router.post("/warming/run")
async def run_warming(params: dict):
    return await run_script("1", params.get("deviceIds", []), params)

@router.post("/boosting/run")
async def run_boosting(params: dict):
    return await run_script("2", params.get("deviceIds", []), params)

@router.post("/posting/run")
async def run_mass_posting(params: dict):
    return await run_script("3", params.get("deviceIds", []), params)

async def simulate_task_progress(task_id: str):
    """Симуляция выполнения задачи"""
    for i in range(10):
        await asyncio.sleep(2)
        for task in MOCK_TASKS:
            if task.id == task_id:
                task.progress = (i + 1) * 10
                if task.progress >= 100:
                    task.status = "completed"
                break