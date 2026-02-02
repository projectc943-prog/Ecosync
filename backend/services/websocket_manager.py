import asyncio
from typing import Dict, Set
from fastapi import WebSocket
from fastapi.websockets import WebSocketDisconnect
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.user_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, device_id: str, user=None):
        await websocket.accept()
        if device_id not in self.active_connections:
            self.active_connections[device_id] = set()
        self.active_connections[device_id].add(websocket)

        if user:
            if user.email not in self.user_connections:
                self.user_connections[user.email] = set()
            self.user_connections[user.email].add(websocket)

        logger.info(f"WebSocket connection established for device {device_id}")

    def disconnect(self, websocket: WebSocket, device_id: str):
        if device_id in self.active_connections:
            self.active_connections[device_id].discard(websocket)
            if not self.active_connections[device_id]:
                del self.active_connections[device_id]

        # Remove from user connections if present
        for user_email, connections in self.user_connections.items():
            if websocket in connections:
                connections.discard(websocket)
                if not connections:
                    del self.user_connections[user_email]
                break

        logger.info(f"WebSocket connection closed for device {device_id}")

    async def broadcast(self, message: dict, device_id: str):
        if device_id not in self.active_connections:
            logger.warning(f"No active connections for device {device_id}")
            return

        dead_connections = set()
        for connection in self.active_connections[device_id]:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to connection: {e}")
                dead_connections.add(connection)

        # Clean up dead connections
        for connection in dead_connections:
            for device, connections in self.active_connections.items():
                if connection in connections:
                    connections.discard(connection)
                    if not connections:
                        del self.active_connections[device]
                    break

# Global instance
manager = ConnectionManager()