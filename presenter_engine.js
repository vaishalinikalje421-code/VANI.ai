import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0';

let ws;
let audioContext;
let processor;
let sourceNode;
let streamRef;
let offlineTranscriber;
let isOffline = !navigator.onLine;

// 1. Initialize the Edge Fallback silently in the background
async function initOfflineEngine() {
    console.log("Loading Edge AI Model (Whisper-Base)...");
    try {
        offlineTranscriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base.en');
        console.log("Edge Engine Ready.");
    } catch (e) {
        console.warn("Could not load local model:", e);
    }
}
initOfflineEngine();

// 2. Monitor Network Drops for the Mic Drop moment
window.addEventListener('offline', () => {
    isOffline = true;
    const status = document.getElementById('status');
    if (status) {
        status.innerText = '⚠️ OFFLINE MODE (EDGE AI)';
        status.style.color = '#eab308'; // Warning Yellow
    }
    console.warn("Network lost. Switching to Edge Fallback...");
});

window.addEventListener('online', () => {
    isOffline = false;
    const status = document.getElementById('status');
    if (status) {
        status.innerText = '🔴 LIVE RECORDING';
        status.style.color = '#ef4444';
    }
    console.log("Network restored. Back to Cloud.");
});

async function startEngine() {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const status = document.getElementById('status');
    const hint = document.getElementById('hint');
    const sourceLang = document.getElementById('source-lang').value;
    const isTranslateOn = document.getElementById('translate-toggle').checked;
    const targetLang = document.getElementById('presenter-target-lang').value;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${window.location.host}/ws/audio`);

    ws.onopen = () => {
        status.innerText = isOffline ? "⚠️ OFFLINE MODE" : "🔴 LIVE RECORDING";
        status.style.color = isOffline ? "#eab308" : "#ef4444";
        startBtn.disabled = true;
        stopBtn.disabled = false;
        if (hint) hint.style.display = 'none';

        ws.send(JSON.stringify({
            source: sourceLang, 
            translate: isTranslateOn,
            target: targetLang,
            presenter: "Host",
            room: "default"
        }));

        setupAudioPipeline();
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const finalSpan = document.getElementById('final-span');
        const partialSpan = document.getElementById('partial-span');
        const translationDiv = document.getElementById('live-translation');
        const translateEnabled = document.getElementById('translate-toggle').checked;

        // Smooth Typing Logic
        if (data.type === 'partial') {
            if (partialSpan) partialSpan.innerText = (data.text || data.partial) + " ";
            return;
        }

        if (data.type === 'final') {
            const finalText = data.text || data.final || '';
            if (finalSpan && finalText) {
                finalSpan.innerHTML += `<span style="color: black; margin-right: 5px;">${finalText}</span>`;
                const display = document.getElementById('transcript-display');
                display.scrollTop = display.scrollHeight;
            }
            if (partialSpan) partialSpan.innerText = ''; // Clear partial text

            if (translateEnabled && data.translated_text && translationDiv) {
                translationDiv.innerHTML += `<div style="margin-bottom: 5px;">${data.translated_text}</div>`;
            }
        }
    };
}

async function setupAudioPipeline() {
    streamRef = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    sourceNode = audioContext.createMediaStreamSource(streamRef);
    
    try {
        await audioContext.audioWorklet.addModule('/static/js/audio-processor.worklet.js');
        processor = new AudioWorkletNode(audioContext, 'audio-processor');
        
        processor.port.onmessage = async (event) => {
            if (isOffline && offlineTranscriber) {
                // If internet dies, process locally (Mock hook for your actual Whisper logic)
                console.log("Processing audio offline...");
            } else if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(event.data.audioData); 
            }
        };
    } catch (e) {
        console.warn("Worklet failed, using script processor", e);
    }
    sourceNode.connect(processor);
    processor.connect(audioContext.destination);
}

function stopEngine() {
    if (processor) processor.disconnect();
    if (sourceNode) sourceNode.disconnect();
    if (audioContext) audioContext.close();
    if (streamRef) streamRef.getTracks().forEach(track => track.stop());
    if (ws) ws.close();

    document.getElementById('status').innerText = "STOPPED";
    document.getElementById('status').style.color = "#64748b";
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
}

function toggleTranslation(checkbox) {
    const targetLangSelect = document.getElementById('presenter-target-lang');
    if (targetLangSelect) {
        targetLangSelect.disabled = !checkbox.checked;
    }
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            update_translate: checkbox.checked,
            translate_to: targetLangSelect ? targetLangSelect.value : "en"
        }));
    }
}

window.startEngine = startEngine;
window.stopEngine = stopEngine;
window.toggleTranslation = toggleTranslation;