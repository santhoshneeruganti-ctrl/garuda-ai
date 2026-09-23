const {
    contextBridge,
    ipcRenderer,
    clipboard,
} = require("electron");

// ======================================================
// GARUDA PRELOAD
// ======================================================

console.log("🦅 Garuda preload loaded");

// ======================================================
// EXPOSE ELECTRON API TO FRONTEND
// ======================================================

contextBridge.exposeInMainWorld("electronAPI", {
    // ==================================================
    // GARUDA TOGGLE
    // ==================================================
    toggleGaruda: () => {
        console.log("🦅 Garuda toggle request sent");
        ipcRenderer.send("toggle-garuda");
    },

    // ==================================================
    // FLOATING GARUDA ON / OFF
    // ==================================================
    setGarudaFloating: async (enabled) => {
        try {
            return await ipcRenderer.invoke("set-garuda-floating", Boolean(enabled));
        } catch (error) {
            console.error("❌ Floating Garuda IPC error:", error);
            return {
                success: false,
                enabled: false,
                error: error?.message || "Floating Garuda IPC failed",
            };
        }
    },

    // ==================================================
    // FLOATING GARUDA POSITION & DYNAMIC RESIZE
    // ==================================================
    moveFloatingGaruda: async (x, y) => {
        try {
            const nextX = Number(x);
            const nextY = Number(y);

            if (!Number.isFinite(nextX) || !Number.isFinite(nextY)) {
                return { success: false, error: "Invalid coordinates" };
            }

            return await ipcRenderer.invoke("move-floating-garuda", {
                x: Math.round(nextX),
                y: Math.round(nextY),
            });
        } catch (error) {
            console.error("❌ Floating Garuda move IPC error:", error);
            return {
                success: false,
                error: error?.message || "Unable to move Floating Garuda",
            };
        }
    },

    resizeFloatingGaruda: (width, height) => {
        return ipcRenderer.invoke("resize-floating-garuda", {
            width: Number(width),
            height: Number(height),
        });
    },

    getFloatingGarudaPosition: async () => {
        try {
            return await ipcRenderer.invoke("get-floating-garuda-position");
        } catch (error) {
            console.error("❌ Floating Garuda position IPC error:", error);
            return {
                success: false,
                error: error?.message || "Unable to get Floating Garuda position",
            };
        }
    },

    // ==================================================
    // FOLDER PICKER & SMART FOLDER APIS
    // ==================================================
    selectFolder: async () => {
        try {
            return await ipcRenderer.invoke("garuda-select-folder");
        } catch (error) {
            console.error("❌ selectFolder IPC error:", error);
            return { success: false, error: error.message };
        }
    },

    addFolder: async (folderPath) => {
        try {
            return await ipcRenderer.invoke("garuda-add-folder", folderPath);
        } catch (error) {
            console.error("❌ addFolder IPC error:", error);
            return { success: false, error: error.message };
        }
    },

    getCustomFolders: async () => {
        try {
            return await ipcRenderer.invoke("garuda-get-custom-folders");
        } catch (error) {
            return [];
        }
    },

    removeFolder: async (folderPath) => {
        try {
            return await ipcRenderer.invoke("garuda-remove-folder", folderPath);
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // ==================================================
    // FILES & SEARCH APIS
    // ==================================================
    getFiles: async () => {
        try {
            const result = await ipcRenderer.invoke("garuda-get-files");
            return Array.isArray(result) ? result : [];
        } catch (error) {
            console.error("❌ Garuda getFiles IPC error:", error);
            return [];
        }
    },

    searchTopic: async (topic) => {
        if (!topic || typeof topic !== "string") return [];
        try {
            const result = await ipcRenderer.invoke("garuda-search-topic", topic.trim());
            return Array.isArray(result) ? result : [];
        } catch (error) {
            console.error("❌ Garuda searchTopic IPC error:", error);
            return [];
        }
    },

    openFile: async (filePath) => {
        if (!filePath || typeof filePath !== "string") {
            return { success: false, message: "Invalid file path." };
        }
        try {
            return await ipcRenderer.invoke("garuda-open-file", filePath);
        } catch (error) {
            console.error("❌ Garuda openFile IPC error:", error);
            return { success: false, message: error?.message || "Unable to open file." };
        }
    },

    openExternal: (url) => {
        return ipcRenderer.invoke("open-external", url);
    },
      

    // ==================================================
    // VOLUME CONTROLS
    // ==================================================
    volumeUp: async () => {
        try {
            return await ipcRenderer.invoke("volume-up");
        } catch (error) {
            return { success: false, error: error?.message || "Volume UP failed" };
        }
    },

    volumeDown: async () => {
        try {
            return await ipcRenderer.invoke("volume-down");
        } catch (error) {
            return { success: false, error: error?.message || "Volume DOWN failed" };
        }
    },

    volumeMute: async () => {
        try {
            return await ipcRenderer.invoke("volume-mute");
        } catch (error) {
            return { success: false, error: error?.message || "Mute failed" };
        }
    },

    volumeUnmute: async () => {
        try {
            return await ipcRenderer.invoke("volume-unmute");
        } catch (error) {
            return { success: false, error: error?.message || "Unmute failed" };
        }
    },
    

    // ==================================================
    // SYSTEM APPS & FOLDERS
    // ==================================================
    openSystemApp: (appName) => ipcRenderer.invoke("open-system-app", appName),
    openSystemFolder: (folderName) => ipcRenderer.invoke("open-system-folder", folderName),

    // ==================================================
    // WRITE TO CLIPBOARD
    // ==================================================
    writeClipboard: (text) => {
        try {
            clipboard.writeText(String(text ?? ""));
            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    },
});