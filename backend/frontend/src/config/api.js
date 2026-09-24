// ============================================================
// GARUDA AI - CENTRALIZED API CONFIGURATION
// Reads VITE_API_URL if set in .env / cloud deployment,
// otherwise defaults to local development server.
// ============================================================

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");
