# 📋 Garuda AI — System Requirements Specification (SRS)

Comprehensive functional, non-functional, and environmental specifications for the **Garuda AI** platform.

---

## 1. Introduction & Purpose

Garuda AI is a cross-platform intelligent assistant designed to unite cloud generative models, document RAG, real-time web retrieval, multimodal vision, voice synthesis, and desktop automation into a coherent system.

---

## 2. Functional Requirements (FR)

### 2.1 Authentication & Security (FR-AUTH)
- **FR-AUTH-1**: The system must allow users to register with a unique username, unique email address, and secure password.
- **FR-AUTH-2**: Passwords must be hashed using `bcrypt` before persistence in SQLite.
- **FR-AUTH-3**: The system must authenticate users and issue signed JSON Web Tokens (JWT) for session management.
- **FR-AUTH-4**: The system must support self-service password recovery via 6-digit numeric OTP dispatched via SMTP email.
- **FR-AUTH-5**: OTP codes must expire within 10 minutes of generation and become invalid after successful verification.

### 2.2 Chat & Generative Reasoning (FR-CHAT)
- **FR-CHAT-1**: The system must provide synchronous and real-time streaming chat completions.
- **FR-CHAT-2**: The system must persist conversation sessions (chats) and message logs.
- **FR-CHAT-3**: Users must be able to create new chats, retrieve past conversations, update chat titles, and delete chats.
- **FR-CHAT-4**: The system must allow users to regenerate the latest assistant response.
- **FR-CHAT-5**: The system must allow users to edit previous messages and stream updated subsequent responses.
- **FR-CHAT-6**: The context manager must automatically prune message history to the most recent 12 turns to prevent context window saturation.

### 2.3 Document Intelligence & RAG (FR-RAG)
- **FR-RAG-1**: Users must be able to upload PDF documents up to 50MB.
- **FR-RAG-2**: The system must extract textual content page-by-page using `PyMuPDF`.
- **FR-RAG-3**: Document text must be split into overlapping semantic chunks.
- **FR-RAG-4**: The system must generate dense vector embeddings for chunks using `all-MiniLM-L6-v2`.
- **FR-RAG-5**: Queries referencing uploaded PDFs must retrieve top-K relevant chunks via cosine similarity and augment LLM prompt context.
- **FR-RAG-6**: The system must generate structured inline citations referencing source pages and sections.
- **FR-RAG-7**: The system must support automated PDF summarization and multi-document comparative analysis.

### 2.4 Live Web Search & Caching (FR-WEB)
- **FR-WEB-1**: An intelligent classifier must detect when a user query requires real-time web data.
- **FR-WEB-2**: When detected, the system must rewrite queries for optimal search engine performance.
- **FR-WEB-3**: Real-time queries must be dispatched to Tavily AI.
- **FR-WEB-4**: The system must maintain an in-database search cache to avoid duplicate API calls for identical or near-identical queries.

### 2.5 Vision & Multimodal Image Processing (FR-VIS)
- **FR-VIS-1**: The system must accept user image uploads in JPEG, PNG, and WebP formats.
- **FR-VIS-2**: Single image upload size must be restricted to a maximum of 5MB.
- **FR-VIS-3**: The system must serialize images to base64 and route them to multimodal vision LLMs for analysis.
- **FR-VIS-4**: The desktop client must support screen region clipping and background OCR text extraction using Tesseract.js.

### 2.6 Voice & Audio Processing (FR-VOX)
- **FR-VOX-1**: The system must provide server-side Text-to-Speech (TTS) utilizing `pyttsx3` with temporary audio stream generation.
- **FR-VOX-2**: The system must optionally support local speech transcription via `faster-whisper` when explicitly enabled via configuration.

### 2.7 Desktop Companion (FR-DSK)
- **FR-DSK-1**: The system must support execution as an Electron desktop application on Windows, macOS, and Linux.
- **FR-DSK-2**: The desktop application must provide a "Floating Garuda" widget that remains always-on-top with toggleable visibility.
- **FR-DSK-3**: The desktop engine must index local files across common development and office extensions (`.pdf`, `.docx`, `.xlsx`, `.pptx`, `.py`, `.js`, etc.).
- **FR-DSK-4**: The desktop application must support system tray minimization and custom URL protocol handling (`garuda://`).

---

## 3. Non-Functional Requirements (NFR)

### 3.1 Performance & Latency (NFR-PERF)
- **NFR-PERF-1**: Initial token stream response from LLM must begin within 1.5 seconds under standard network conditions.
- **NFR-PERF-2**: Document chunking and embedding generation for a standard 20-page document must complete within 5 seconds on CPU.
- **NFR-PERF-3**: Database queries for chat history and message logs must return in under 50ms.

### 3.2 Resource & Memory Efficiency (NFR-RES)
- **NFR-RES-1**: The backend server must be capable of starting up and operating within a 512MB RAM ceiling (e.g. Render Free Tier).
- **NFR-RES-2**: Machine learning models (`SentenceTransformer`, `Whisper`) must not load during server boot; they must load lazily upon first invocation.

### 3.3 Security & Data Protection (NFR-SEC)
- **NFR-SEC-1**: All API endpoints handling user-specific data must require valid JWT authorization in the HTTP header.
- **NFR-SEC-2**: File uploads must undergo path sanitization to prevent path traversal attacks (`../`).
- **NFR-SEC-3**: All secrets and API credentials must be managed strictly through environment variables and never checked into source control.

### 3.4 Reliability & Fault Tolerance (NFR-REL)
- **NFR-REL-1**: SQLite must operate in Write-Ahead Logging (WAL) mode to prevent database locks during simultaneous read/write operations.
- **NFR-REL-2**: When an LLM provider encounters a transient failure or rate limit, the system must retry or fall back to an alternate configured provider.

### 3.5 Usability & Interface Design (NFR-UX)
- **NFR-UX-1**: The UI must follow modern glassmorphic dark-mode aesthetics with high color contrast.
- **NFR-UX-2**: Code snippets must be rendered with syntax highlighting, language badges, and a one-click copy button.
- **NFR-UX-3**: Interactive UI elements must provide clear loading states and error feedback.

---

## 4. Environment & Dependency Matrix

| Category | Specification |
| :--- | :--- |
| **Backend Runtime** | Python 3.10, 3.11, or 3.12 |
| **Frontend Runtime** | Node.js 18.x or 20.x LTS |
| **Package Managers** | `pip` (Python), `npm` (Node) |
| **Operating Systems** | Windows 10/11, Ubuntu 20.04+, macOS Ventura+ |
| **Database** | SQLite 3.35+ |

---

*Garuda AI Requirements Specification — Version 1.0.0*