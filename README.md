# Vani.ai 🎙️

### AI-Powered Real-Time Speech Transcription and Translation

Vani.ai is an AI-powered system designed to make communication easier across different languages. It converts spoken audio into text and aims to provide real-time translation for audiences during presentations, meetings, lectures, and multilingual events.

## ✨ Features

- 🎤 Real-time speech transcription
- 🌐 Multilingual speech translation
- ⚡ Live communication using WebSockets
- 🗣️ Dedicated presenter interface
- 👥 Audience interface for viewing live transcripts
- 🤖 Speech processing using Speechmatics
- 💻 Exploration of offline processing with Transformers.js

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Python, FastAPI
- **Real-Time Communication:** WebSockets
- **Speech Recognition:** Speechmatics
- **Offline Processing:** Transformers.js

## 📁 Project Structure

```text
Vani.ai/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── connection.py
│   ├── processor.py
│   └── database.py
├── static/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── api.js
│   │   └── offline.js
│   ├── index.html
│   ├── dashboard.html
│   ├── presenter.html
│   └── audience.html
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```

## ⚙️ Installation

1. Clone the repository:

   ```bash
   git clone <YOUR-REPOSITORY-URL>
   cd Vani.ai
   ```

2. Create a virtual environment:

   ```bash
   python -m venv venv
   ```

3. Activate the environment.

   **Windows:**
   ```bash
   venv\Scripts\activate
   ```

   **macOS/Linux:**
   ```bash
   source venv/bin/activate
   ```

4. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

5. Configure your API credentials in a local `.env` file using `.env.example` as a template.

6. Start the FastAPI server:

   ```bash
   uvicorn app.main:app --reload
   ```

7. Open `http://127.0.0.1:8000` in your browser, provided the application is configured to serve the frontend at that route.

## 🔐 Security

- Never commit API keys, passwords, or secrets.
- Keep `.env` excluded from Git.
- Use `.env.example` for placeholder configuration values.

## 🎯 Objective

Vani.ai aims to reduce language barriers and improve accessibility by making spoken content easier to understand through real-time transcription and translation.

## 🚧 Project Status

Under development. Features and setup instructions may change as development progresses.

## 👩‍💻 Author

Developed as an AI-powered speech technology project.


*Vani.ai — Making every voice understandable.*
