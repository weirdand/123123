from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.api.endpoints.devices import ws_manager

router = APIRouter()

@router.websocket("/ws/devices")
async def devices_websocket(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Просто держим соединение открытым
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)