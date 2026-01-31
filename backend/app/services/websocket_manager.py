from typing import Dict, List
from fastapi import WebSocket
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, device_id: str):
        await websocket.accept()
        if device_id not in self.active_connections:
            self.active_connections[device_id] = []
        self.active_connections[device_id].append(websocket)
        logger.info(f"Device {device_id} connected. Total connections: {len(self.active_connections[device_id])}")

    def disconnect(self, websocket: WebSocket, device_id: str):
        if device_id in self.active_connections:
            self.active_connections[device_id].remove(websocket)
            if not self.active_connections[device_id]:
                del self.active_connections[device_id]
            logger.info(f"Device {device_id} disconnected. Remaining connections: {len(self.active_connections.get(device_id, []))}")

    async def broadcast(self, message: dict, device_id: str):
        if device_id in self.active_connections:
            dead_connections = []
            for connection in self.active_connections[device_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending message to {device_id}: {e}")
                    dead_connections.append(connection)

            for connection in dead_connections:
                self.disconnect(connection, device_id)

manager = ConnectionManager()