import asyncio
import websockets
import json
import wave
import sys

async def simulate_frontend():
    uri = "ws://localhost:8000/ws/audio"
    audio_file = "test.wav" # We will use a real audio file here
    
    try:
        async with websockets.connect(uri) as ws:
            print("🔗 Connected to FastAPI Backend")
            
            # Send the Config Handshake
            config = {"source": "en", "target": "hi", "glossary": ["Vani.ai"]}
            await ws.send(json.dumps(config))
            print("✅ Configuration Sent")

            try:
                # Open and stream the real audio file
                with wave.open(audio_file, 'rb') as wf:
                    print(f"🎵 Streaming {audio_file}...")
                    data = wf.readframes(4096)
                    while data:
                        await ws.send(data)
                        await asyncio.sleep(0.1) # Simulate real-time speaking speed
                        data = wf.readframes(4096)
            except FileNotFoundError:
                print(f"❌ ERROR: Please place a file named '{audio_file}' in this folder.")
                return

            print("✅ Audio stream finished. Waiting 5 seconds for final translations...")
            await asyncio.sleep(5) 
            
    except ConnectionRefusedError:
        print("❌ Error: Is your FastAPI server running?")

if __name__ == "__main__":
    asyncio.run(simulate_frontend())