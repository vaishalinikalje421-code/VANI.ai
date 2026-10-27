let ws;
let isPaused = false;

// 🪄 THE HACKATHON CHEAT CODE: Free, instant browser-side translation
async function fetchTranslation(text, targetLang) {
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const response = await fetch(url);
        const data = await response.json();
        return data[0][0][0]; // Extracts the translated string
    } catch (error) {
        console.error("Translation API failed:", error);
        return text; 
    }
}

function joinStream() {
    const name = document.getElementById('viewer-name').value;
    const roomLink = document.getElementById('room-link').value;
    const joinBtn = document.getElementById('joinBtn');
    const statusBadge = document.getElementById('status-badge');
    
    if (!roomLink) {
        // Fallback if they leave it empty
        document.getElementById('room-link').value = "default";
    }

    joinBtn.disabled = true;
    joinBtn.innerText = "Connecting...";

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const room = document.getElementById('room-link').value || "default";
    ws = new WebSocket(`${protocol}//${window.location.host}/ws/audience/${room}`);

    ws.onopen = () => {
        statusBadge.innerText = "LIVE STREAM CONNECTED";
        statusBadge.className = "status-live";
        joinBtn.innerText = "Joined";
        
        document.getElementById('aud-hint').style.display = "none";
        document.getElementById('bubble-container').style.display = "block";
    };

    // Notice we made this function async!
    ws.onmessage = async (event) => {
        if (isPaused) return; 

        try {
            // 1. Log the data so we can see exactly what Python is sending!
            console.log("Incoming Data:", event.data);

            const data = JSON.parse(event.data);
            
            const finalSpan = document.getElementById('final-span');
            const partialSpan = document.getElementById('partial-span');
            const translationDiv = document.getElementById('live-translation');
            const display = document.getElementById('live-transcript');
            
            // Get the current state of the Audience's UI
            const targetLang = document.getElementById('target-lang').value;
            const translateCheckbox = document.getElementById('aud-translate-toggle');
            const showTranslation = translateCheckbox && translateCheckbox.checked;

            // SAFTEY NET: Grab the text no matter what Python named it
            const originalText = data.original || data.transcript || data.text || "";

            // Handle the fast, live typing words (Partials)
            if (data.type === 'partial') {
                if (partialSpan) partialSpan.innerText = originalText + " ";
                return;
            }

            // Handle the locked-in final sentences
            // (The fallback checks if data.type is missing but we still got text)
            if (data.type === 'final' || (!data.type && originalText !== "")) {
                
                // 1. Instantly show the English text
                if (originalText && finalSpan) {
                    finalSpan.innerHTML += `<span style="margin-right: 5px; color: #0f172a;">${originalText}</span>`;
                    display.scrollTop = display.scrollHeight;
                }
                
                // Clear the grey partial text
                if (partialSpan) partialSpan.innerText = '';

                // 2. ONLY TRANSLATE IF THE BOX IS CHECKED!
                if (showTranslation && originalText && translationDiv) {
                    // This calls the free API instantly
                    const translatedText = await fetchTranslation(originalText, targetLang);
                    
                    translationDiv.innerHTML += `<div style="margin-bottom: 8px; padding-left: 10px; border-left: 3px solid #3b82f6;">${translatedText}</div>`;
                    display.scrollTop = display.scrollHeight;
                }
            }
        } catch (e) {
            console.error("Error parsing message:", e);
        }
    };

    ws.onclose = () => {
        statusBadge.innerText = "CONNECTION LOST";
        statusBadge.className = "status-offline";
        joinBtn.disabled = false;
        joinBtn.innerText = "Reconnect";
    };
}

function toggleFeed() {
    const pauseBtn = document.getElementById('pauseBtn');
    isPaused = !isPaused;
    
    if (isPaused) {
        pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume Feed';
        pauseBtn.style.background = "#3b82f6";
    } else {
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause Feed';
        pauseBtn.style.background = "#000000"; 
    }
}