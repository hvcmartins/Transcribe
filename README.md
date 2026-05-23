# 🚀 TurboScript — Free AI Audio & Video Transcription

A full TurboScribe clone that transcribes audio/video files using **OpenAI Whisper large-v3** — completely free, with your own Google Colab GPU.

![TurboScript UI](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=nextdotjs)
![Whisper](https://img.shields.io/badge/Whisper-large--v3-green?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

---

## ✨ Features

- 🎙️ **Whisper large-v3** — state-of-the-art accuracy
- 🌍 **99+ languages** with auto-detection
- 🔄 **Translation** — transcribe any language to English
- ⏱️ **Timestamps** — segment-level timing for subtitles
- 📤 **Export** — TXT, SRT (subtitles), VTT (web captions)
- 🔒 **Private** — your files go directly to your Colab or Groq, never stored
- 🆓 **Free** — uses Google Colab T4 GPU (free tier)

---

## 🏃 Quick Start

### 1. Start the Web App

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 2. Set Up the GPU Backend (choose one)

#### Option A: Google Colab (recommended — free GPU)

1. Open the notebook:
   
   **[Open `colab/turboscript_backend.ipynb` in Google Colab](https://colab.research.google.com/)**
   
   *(Upload the file from the `colab/` folder)*

2. **Runtime → Change runtime type → T4 GPU** (free)

3. **Runtime → Run all cells**

4. Copy the **ngrok URL** printed in Cell 5's output

5. In the TurboScript web app: **Settings → Colab URL → paste URL → Test → Save**

#### Option B: Groq API (instant, no setup)

1. Get a free key at [console.groq.com](https://console.groq.com)
2. In the web app: **Settings → Groq API → paste key → Save**

---

## 🗂️ Project Structure

```
turboscript/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main page UI
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles
│   │   └── api/
│   │       ├── transcribe/       # Proxies to Colab or calls Groq
│   │       └── health-check/     # Tests Colab connection
│   ├── components/
│   │   ├── Header.tsx            # Top nav + settings button
│   │   ├── UploadZone.tsx        # Drag-and-drop file upload
│   │   ├── SettingsPanel.tsx     # Backend configuration modal
│   │   ├── ProgressBar.tsx       # Transcription progress UI
│   │   └── TranscriptionResult.tsx  # Result with copy/download
│   └── lib/
│       ├── types.ts              # Shared TypeScript types
│       └── utils.ts              # SRT/VTT generators, formatters
├── colab/
│   └── turboscript_backend.ipynb # Google Colab GPU server
├── package.json
└── README.md
```

---

## 🔧 How It Works

```
Browser (Next.js UI)
      │  POST /api/transcribe
      ▼
Next.js API Route          ←─── proxies, handles CORS
      │
      ├── Colab backend ────→ faster-whisper on T4 GPU
      │   (ngrok tunnel)
      │
      └── Groq API ─────────→ whisper-large-v3-turbo (cloud)
```

The Colab notebook:
1. Installs `faster-whisper` (optimized Whisper inference)
2. Loads `whisper-large-v3` on the T4 GPU
3. Starts a **FastAPI** server on port 8000
4. Creates a **public ngrok tunnel** so your browser can reach it
5. Processes audio files sent from the web app

---

## 📦 Supported Formats

| Audio | Video |
|-------|-------|
| MP3, WAV, FLAC, OGG, M4A, AAC, WMA, OPUS | MP4, WebM, MPEG |

Max file size: **500 MB**

---

## 🌐 Languages

Auto-detects from 99 languages including English, Spanish, French, German, Portuguese, Chinese, Japanese, Korean, Arabic, Hindi, and many more.

---

## 📤 Export Formats

| Format | Use case |
|--------|----------|
| `.txt` | Plain text for documents |
| `.srt` | Subtitles for video editors (DaVinci, Premiere, etc.) |
| `.vtt` | Web captions for HTML5 `<video>` |

---

## 🛠️ Development

```bash
npm run dev     # Start dev server
npm run build   # Build for production
npm run lint    # Lint
```

### Environment Variables (optional)

Create `.env.local` if you want server-side defaults:

```env
# Not required — settings are stored in the browser
```

---

## ⚠️ Colab Session Limits

| Tier | GPU | Session Length |
|------|-----|----------------|
| Free | T4 | Up to 12 hours |
| Colab Pro | T4/V100/A100 | Up to 24 hours |

The server stays alive as long as the Colab tab is open. Just re-run the notebook and update the URL in Settings if it disconnects.

---

## 🤝 Credits

- [faster-whisper](https://github.com/SYSTRAN/faster-whisper) — efficient Whisper inference
- [OpenAI Whisper](https://github.com/openai/whisper) — the base model
- [Groq](https://groq.com) — lightning-fast inference API
- [pyngrok](https://pyngrok.readthedocs.io) — ngrok Python wrapper

---

## 📄 License

MIT
