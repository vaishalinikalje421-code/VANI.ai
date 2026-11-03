import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from app.connection import manager
from app.processor import AudioPipeline

load_dotenv()
app = FastAPI()

# Mount frontend files (for your teammate)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.websocket("/ws/audio")
async def audio_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("🎤 Presenter Connected")
    
    try:
        # Catch the initial handshake from the frontend
        config_msg = await websocket.receive_text()
        config = json.loads(config_msg)
        
        # Initialize the AI Engine
        pipeline = AudioPipeline(
            source_lang=config.get("source", "en"),
            target_lang=config.get("target", "hi"),
            glossary=config.get("glossary", []),
            room=config.get("room", "default"),  # Get room ID from config
            manager=manager  # Pass manager to pipeline
        )
        print(f"⚙️ Active Session: {pipeline.source_lang} -> {pipeline.target_lang}")
        print(f"📚 Glossary loaded: {pipeline.glossary}")
        print(f"🎪 Streaming to room: {pipeline.room}")
        
        # Start processing the stream
        await pipeline.process_stream(websocket)
        
    except WebSocketDisconnect:
        print("⚠️ Presenter Disconnected")
    except Exception as e:
        print(f"❌ Pipeline error: {e}")

@app.websocket("/ws/audience/{room}")
async def audience_endpoint(websocket: WebSocket, room: str):
    await manager.connect(room, websocket)
    try:
        while True:
            await websocket.receive_text() # Keep-alive
    except WebSocketDisconnect:
        manager.disconnect(room, websocket)