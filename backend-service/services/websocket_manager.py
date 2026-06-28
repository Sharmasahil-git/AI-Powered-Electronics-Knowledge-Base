import asyncio
import json
from typing import Dict, List
from fastapi import WebSocket


class ConnectionManager:
    """
    ===================== WEBSOCKET CONNECTION MANAGER =====================
    This class manages real-time WebSocket connections between the backend 
    and the frontend. It allows us to stream live progress updates to the 
    user's browser while their PDF is being processed in the background.

    How it works:
    1. When a user uploads a PDF, the frontend opens a WebSocket connection 
       to ws://localhost:8000/api/ws/{document_id}.
    2. This manager stores that connection, keyed by document_id.
    3. As the backend processes the PDF (text extraction, image analysis), 
       it calls broadcast_to_document() to push live updates.
    4. The frontend receives these messages and updates the UI in real-time.
    """

    def __init__(self):
        # Dictionary mapping document_id -> list of active WebSocket connections.
        # Multiple users could watch the same document's progress simultaneously.
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, document_id: int):
        """Accept a new WebSocket connection and register it under the document_id."""
        await websocket.accept()
        if document_id not in self.active_connections:
            self.active_connections[document_id] = []
        self.active_connections[document_id].append(websocket)
        print(f"[WebSocket] Client connected for document {document_id}")

    def disconnect(self, websocket: WebSocket, document_id: int):
        """Remove a WebSocket connection when the client disconnects."""
        if document_id in self.active_connections:
            self.active_connections[document_id].remove(websocket)
            if not self.active_connections[document_id]:
                del self.active_connections[document_id]
        print(f"[WebSocket] Client disconnected for document {document_id}")

    async def broadcast_to_document(self, document_id: int, message: dict):
        """
        Send a JSON message to ALL clients watching a specific document.
        Message format example:
        {
            "status": "processing_images",
            "message": "Learning diagram 3 of 53...",
            "current": 3,
            "total": 53
        }
        """
        if document_id not in self.active_connections:
            return  # No one is listening, silently skip

        # We need to track dead connections to clean up
        dead_connections = []

        for connection in self.active_connections[document_id]:
            try:
                await connection.send_json(message)
            except Exception:
                # If sending fails, the client probably disconnected
                dead_connections.append(connection)

        # Clean up dead connections
        for dead in dead_connections:
            self.active_connections[document_id].remove(dead)


# ===================== GLOBAL SINGLETON =====================
# We create a single instance that the entire app shares.
# This way, upload.py and pdf_service.py can both access the same manager.
ws_manager = ConnectionManager()
