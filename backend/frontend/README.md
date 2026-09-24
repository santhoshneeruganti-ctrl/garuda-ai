# 🦅 Garuda AI — Frontend & Desktop Companion

This directory contains the user interface and desktop companion client for **Garuda AI**, built with **React 19**, **Vite**, and **Electron**.

---

## 🚀 Overview

The frontend offers two distinct deployment targets:
1. **Modern Web Client**: A fast, reactive single-page application (SPA) running in standard web browsers.
2. **Desktop Companion (Electron)**: A desktop application with local file system indexing, background OCR screen reading, and the **Floating Garuda** always-on-top companion widget.

---

## 📦 Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vite.dev/)
- **Desktop Runtime**: [Electron](https://www.electronjs.org/) + [Electron Forge](https://www.electronforge.io/)
- **Styling**: Vanilla CSS with Glassmorphic Dark UI + [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **OCR Engine**: [Tesseract.js](https://tesseract.projectnaptha.com/) + [Sharp](https://sharp.pixelplumbing.com/)
- **Markdown & Code**: `react-markdown`, `remark-gfm`, `react-syntax-highlighter`

---

## 💻 Available Scripts

From this directory (`backend/frontend`):

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the Vite web development server at `http://localhost:5173` |
| `npm run build` | Builds the optimized production static web bundle into `dist/` |
| `npm run electron` | Launches the Electron desktop companion with hot reloading |
| `npm start` | Runs the desktop application via Electron Forge |
| `npm run package` | Packages the desktop application for the current platform |
| `npm run make` | Generates distribution installers (Squirrel Windows exe, deb, rpm, zip) into `out/make` |
| `npm run lint` | Runs the fast Oxlint linter on the frontend codebase |

---

## 🌟 Key Desktop Features

### 1. Floating Garuda Assistant
- Located in `src/components/desktop/FloatingGaruda.jsx`.
- Can be detached to float on top of any window.
- Provides immediate prompt input, voice triggers, and quick action buttons.

### 2. Local File Indexing
- Governed in `electron.cjs`.
- Indexes local workspace documents across 30+ file types (`.pdf`, `.docx`, `.xlsx`, `.pptx`, `.py`, `.js`, etc.) for local search without sending raw file contents to the cloud.

### 3. Background OCR Worker
- Implemented in `garudaOcrWorker.cjs`.
- Runs OCR asynchronously on captured screen clips or pasted images using Tesseract.js.

---

## 🔗 Connecting to the Backend

By default, the frontend sends API requests to the FastAPI backend running at `http://127.0.0.1:8000`.  
Ensure the backend server is running:

```bash
# In the backend directory:
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
