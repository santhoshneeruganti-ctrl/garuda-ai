const {
    app,
    BrowserWindow,
    ipcMain,
    shell,
    session,
    screen,
    clipboard,
    dialog,
} = require("electron");

const path = require("path");
const fs = require("fs");
const { execFile } = require("child_process");

// ======================================================
// GARUDA DESKTOP CONFIGURATION
// ======================================================

const GARUDA_PROTOCOL = "garuda";

// ======================================================
// GARUDA SEARCHABLE FILE EXTENSIONS
// ======================================================

const GARUDA_FILE_EXTENSIONS = new Set([
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".txt",
    ".md",
    ".csv",
    ".json",
    ".xml",
    ".html",
    ".css",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".py",
    ".java",
    ".c",
    ".cpp",
    ".h",
    ".hpp",
    ".cs",
    ".php",
    ".sql",
    ".rtf",
    ".log",
]);

// ======================================================
// GARUDA FILE INTELLIGENCE CONFIGURATION
// ======================================================

const GARUDA_FILE_INDEX_VERSION = 4;
const garudaFileIndex = new Map();
const garudaPdfProcessingCache = new Map();
const garudaCustomFolders = new Set();
let garudaFileIndexBuildPromise = null;

function getGarudaCustomFoldersFile() {
    return path.join(
        app.getPath("userData"),
        "garuda-custom-folders.json"
    );
}

function loadGarudaCustomFolders() {
    try {
        const filePath = getGarudaCustomFoldersFile();

        if (!fs.existsSync(filePath)) {
            return;
        }

        const saved = JSON.parse(
            fs.readFileSync(filePath, "utf8")
        );

        if (!Array.isArray(saved)) {
            return;
        }

        for (const folder of saved) {
            if (
                typeof folder === "string" &&
                fs.existsSync(folder) &&
                fs.statSync(folder).isDirectory()
            ) {
                garudaCustomFolders.add(path.resolve(folder));
            }
        }

        console.log(
            "📁 Garuda custom folders loaded:",
            [...garudaCustomFolders]
        );
    } catch (error) {
        console.error(
            "❌ Failed to load Garuda custom folders:",
            error
        );
    }
}

function saveGarudaCustomFolders() {
    try {
        const filePath = getGarudaCustomFoldersFile();

        fs.writeFileSync(
            filePath,
            JSON.stringify([...garudaCustomFolders], null, 2),
            "utf8"
        );

        console.log("💾 Garuda custom folders saved.");
    } catch (error) {
        console.error(
            "❌ Failed to save Garuda custom folders:",
            error
        );
    }
}

let garudaFileIndexReady = false;

// ======================================================
// SINGLE INSTANCE LOCK
// ======================================================

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
    console.log("🦅 Another Garuda Desktop instance is already running.");
    app.quit();
} else {
    let mainWindow = null;
    let floatingWindow = null;
    let pendingGarudaAction = null;

    function registerGarudaProtocol() {
        try {
            if (!app.isPackaged) {
                const success = app.setAsDefaultProtocolClient(
                    GARUDA_PROTOCOL,
                    process.execPath,
                    [path.resolve(process.argv[1] || __filename)]
                );
                return;
            }

            app.setAsDefaultProtocolClient(GARUDA_PROTOCOL);
        } catch (error) {
            console.error("❌ Garuda protocol registration error:", error);
        }
    }

    function getGarudaActionFromUrl(url) {
        if (!url || typeof url !== "string") return null;

        try {
            const parsedUrl = new URL(url);
            if (parsedUrl.protocol !== `${GARUDA_PROTOCOL}:`) return null;

            const host = parsedUrl.hostname.toLowerCase();
            const action = parsedUrl.pathname.replace(/^\/+/, "").toLowerCase();

            if (host !== "floating") return null;
            if (action === "on" || action === "off") return action;

            return null;
        } catch (error) {
            return null;
        }
    }

    function handleGarudaProtocolUrl(url) {
        const action = getGarudaActionFromUrl(url);
        if (!action) return;

        if (!floatingWindow || floatingWindow.isDestroyed()) {
            pendingGarudaAction = action;
            createFloatingWindow();
            return;
        }

        if (action === "on") {
            showFloatingGaruda();
        } else if (action === "off") {
            hideFloatingGaruda();
        }
    }

    app.on("second-instance", (event, commandLine) => {
        const protocolUrl = commandLine.find(
            (argument) =>
                typeof argument === "string" &&
                argument.startsWith(`${GARUDA_PROTOCOL}:`)
        );

        if (protocolUrl) {
            handleGarudaProtocolUrl(protocolUrl);
        }

        if (mainWindow && !mainWindow.isDestroyed()) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
            mainWindow.focus();
        }

        if (floatingWindow && !floatingWindow.isDestroyed()) {
            if (floatingWindow.isMinimized()) floatingWindow.restore();
        }
    });

    // ======================================================
    // WINDOWS VOLUME CONTROL
    // ======================================================

    function sendVolumeKey(keyCode) {
        return new Promise((resolve) => {
            const allowedKeys = [173, 174, 175];
            if (!allowedKeys.includes(keyCode)) {
                return resolve({ success: false, error: "Invalid volume key" });
            }

            const powershellScript =
                'Add-Type @"\n' +
                "using System;\n" +
                "using System.Runtime.InteropServices;\n" +
                "public static class GarudaVolume {\n" +
                '    [DllImport("user32.dll")]\n' +
                "    public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);\n" +
                "    public const uint KEYEVENTF_KEYUP = 0x0002;\n" +
                "    public static void PressKey(byte key) {\n" +
                "        keybd_event(key, 0, 0, UIntPtr.Zero);\n" +
                "        System.Threading.Thread.Sleep(80);\n" +
                "        keybd_event(key, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);\n" +
                "    }\n" +
                "}\n" +
                '"@\n' +
                "[GarudaVolume]::PressKey(" + keyCode + ")\n";

            execFile(
                "powershell.exe",
                ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", powershellScript],
                { windowsHide: true, timeout: 5000 },
                (error) => {
                    if (error) {
                        return resolve({ success: false, error: error.message });
                    }
                    resolve({ success: true, keyCode });
                }
            );
        });
    }

    // ======================================================
    // SEARCH ROOTS & FILE COLLECTOR
    // ======================================================

    function getGarudaSearchRoots() {
        let downloadsPath = "";
        try {
            downloadsPath = app.getPath("downloads");
        } catch {}

        const roots = [
            downloadsPath,
            "C:\\GarudaTest",
            ...garudaCustomFolders,
        ];

        return [...new Set(roots.filter(Boolean).map((folder) => path.resolve(folder)))];
    }

    function collectGarudaFiles(directory, results = [], maxFiles = 5000) {
        if (results.length >= maxFiles) return results;

        try {
            if (!fs.existsSync(directory)) return results;

            const entries = fs.readdirSync(directory, { withFileTypes: true });

            for (const entry of entries) {
                if (results.length >= maxFiles) break;

                const fullPath = path.join(directory, entry.name);

                try {
                    if (entry.isSymbolicLink()) continue;

                    if (entry.isDirectory()) {
                        collectGarudaFiles(fullPath, results, maxFiles);
                        continue;
                    }

                    if (!entry.isFile()) continue;

                    const extension = path.extname(entry.name).toLowerCase();
                    if (!GARUDA_FILE_EXTENSIONS.has(extension)) continue;

                    results.push({
                        name: entry.name,
                        path: fullPath,
                        extension,
                    });
                } catch {}
            }
        } catch {}

        return results;
    }

    // ======================================================
    // PDF EXTRACTION & OCR
    // ======================================================

    function isGarudaPdfTextUseful(text) {
        if (!text || typeof text !== "string") return false;
        const cleanedText = text
            .replace(/Scanned by CamScanner/gi, "")
            .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, "")
            .trim();
        return cleanedText.length >= 100;
    }

    async function extractGarudaPdfNativeTextOnly(filePath) {
        let parser = null;
        try {
            const { PDFParse } = require("pdf-parse");
            const buffer = fs.readFileSync(filePath);
            parser = new PDFParse({ data: buffer });
            const result = await parser.getText();
            const text = String(result?.text || "").trim();
            await parser.destroy();
            parser = null;
            return isGarudaPdfTextUseful(text) ? text : "";
        } catch (error) {
            try { if (parser) await parser.destroy(); } catch {}
            return "";
        }
    }

    async function extractGarudaPdfText(filePath) {
        let parser = null;
        let worker = null;

        try {
            const nativeText = await extractGarudaPdfNativeTextOnly(filePath);
            if (nativeText) {
                return nativeText;
            }

            console.log("🔍 Scanned/image PDF detected, starting OCR:", filePath);

            const { PDFParse } = require("pdf-parse");
            const buffer = fs.readFileSync(filePath);
            parser = new PDFParse({ data: buffer });

            const screenshots = await parser.getScreenshot({
                scale: 2,
                imageBuffer: true,
                imageDataUrl: false,
            });

            await parser.destroy();
            parser = null;

            if (!screenshots?.pages?.length) return "";

            const { createWorker } = require("tesseract.js");
            worker = await createWorker("eng");
            await worker.setParameters({
                tessedit_pageseg_mode: "6",
                preserve_interword_spaces: "1",
            });

            const pageTexts = [];
            for (let i = 0; i < screenshots.pages.length; i++) {
                const page = screenshots.pages[i];
                try {
                    const ocrResult = await worker.recognize(page.data);
                    const pageText = String(ocrResult?.data?.text || "").trim();
                    if (pageText) {
                        pageTexts.push(`\n--- PAGE ${i + 1} ---\n${pageText}`);
                    }
                } catch {}
            }

            await worker.terminate();
            worker = null;

            return pageTexts.join("\n").trim();
        } catch (error) {
            try { if (worker) await worker.terminate(); } catch {}
            try { if (parser) await parser.destroy(); } catch {}
            return "";
        }
    }

    async function processGarudaPdfOnDemand(filePath) {
        if (!filePath || typeof filePath !== "string") return null;

        if (garudaPdfProcessingCache.has(filePath)) {
            return garudaPdfProcessingCache.get(filePath);
        }

        try {
            const text = await extractGarudaPdfText(filePath);
            if (!text || !text.trim()) return null;

            const lexicalAnalysis = analyzeGarudaLexicalText(text);
            const documentStructure = analyzeGarudaDocumentStructure(text);

            const processedPdf = {
                path: filePath,
                content: text,
                lexicalAnalysis,
                documentStructure,
            };

            garudaPdfProcessingCache.set(filePath, processedPdf);
            return processedPdf;
        } catch (error) {
            return null;
        }
    }

    async function openGarudaPdf(filePath) {
        if (!filePath || typeof filePath !== "string") return false;
        try {
            showFloatingGaruda();
            const errorMessage = await shell.openPath(filePath);
            return !errorMessage;
        } catch {
            return false;
        }
    }

    async function extractGarudaDocxText(filePath) {
        try {
            const mammoth = require("mammoth");
            const buffer = fs.readFileSync(filePath);
            const result = await mammoth.extractRawText({ buffer });
            return result.value || "";
        } catch (error) {
            return "";
        }
    }

    function extractGarudaTextFile(filePath) {
        try {
            return fs.readFileSync(filePath, "utf8");
        } catch (error) {
            return "";
        }
    }

    // ======================================================
    // LEXICAL ANALYSIS & DOCUMENT STRUCTURE
    // ======================================================

    const GARUDA_LEXICAL_STOP_WORDS = new Set([
        "the", "a", "an", "and", "or", "but", "is", "are", "was", "were",
        "be", "been", "being", "to", "of", "in", "on", "for", "with",
        "from", "by", "as", "at", "this", "that", "these", "those", "it",
        "its", "into", "about", "than", "then", "can", "could", "should",
        "would", "will", "shall", "may", "might", "do", "does", "did",
        "have", "has", "had"
    ]);

    function tokenizeGarudaText(text) {
        if (!text || typeof text !== "string") return [];
        return text
            .replace(/\r\n/g, "\n")
            .replace(/[^\p{L}\p{N}\s]/gu, " ")
            .split(/\s+/)
            .map((token) => token.trim())
            .filter(Boolean);
    }

    function analyzeGarudaLexicalText(text) {
        if (!text || typeof text !== "string") {
            return { tokenCount: 0, uniqueTokenCount: 0, tokens: [], keywords: [], frequency: {} };
        }

        const tokens = tokenizeGarudaText(text);
        const frequency = {};

        for (const token of tokens) {
            const normalizedToken = token.toLowerCase();
            if (!normalizedToken) continue;
            frequency[normalizedToken] = (frequency[normalizedToken] || 0) + 1;
        }

        const keywords = Object.entries(frequency)
            .filter(([word]) => word.length >= 3 && !GARUDA_LEXICAL_STOP_WORDS.has(word))
            .sort((a, b) => (b[1] !== a[1] ? b[1] - a[1] : a[0].localeCompare(b[0])))
            .slice(0, 100)
            .map(([word, count]) => ({ word, count }));

        return {
            tokenCount: tokens.length,
            uniqueTokenCount: Object.keys(frequency).length,
            tokens,
            keywords,
            frequency,
        };
    }

    function analyzeGarudaDocumentStructure(text) {
        if (!text || typeof text !== "string") return { headings: [], sections: [] };

        const lines = text.replace(/\r\n/g, "\n").split("\n").map((line) => line.trim()).filter(Boolean);
        const headings = [];
        const sections = [];
        let currentSection = null;

        for (const line of lines) {
            const isHeading =
                line.length >= 3 &&
                line.length <= 120 &&
                (
                    /^[A-Z][A-Z\s\d:&-]{2,}$/.test(line) ||
                    /^(chapter|module|unit|section|topic)\s+\d+/i.test(line) ||
                    /^\d+(\.\d+)*[\s.)]+[A-Za-z]/.test(line)
                );

            if (isHeading) {
                headings.push({ title: line, line: lines.indexOf(line) + 1 });
                currentSection = { title: line, content: [] };
                sections.push(currentSection);
            } else if (currentSection) {
                currentSection.content.push(line);
            }
        }

        return { headings, sections };
    }

    function normalizeGarudaSearchText(text) {
        return String(text || "")
            .toLowerCase()
            .replace(/[^\p{L}\p{N}\s]/gu, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function garudaTopicMatchesText(text, topic) {
        const haystack = normalizeGarudaSearchText(text);
        const needle = normalizeGarudaSearchText(topic);
        if (!haystack || !needle) return false;
        if (haystack.includes(needle)) return true;
        const terms = needle.split(/\s+/).filter((term) => term.length >= 3);
        return terms.length > 0 && terms.every((term) => haystack.includes(term));
    }

    // ======================================================
    // TOPIC SEARCH ACROSS DOCUMENTS (ON-DEMAND ONLY)
    // ======================================================

    async function searchGarudaTopicAcrossDocuments(topic) {
        if (!topic || typeof topic !== "string") return [];

        const normalizedTopic = normalizeGarudaSearchText(topic);
        if (!normalizedTopic) return [];

        const allFiles = Array.from(garudaFileIndex.values()).filter(Boolean);
        const matches = [];

        // 1. Non-PDF matches
        for (const file of allFiles) {
            if (file.extension === ".pdf") continue;
            if (garudaTopicMatchesText(file.name, normalizedTopic)) {
                matches.push({
                    name: file.name,
                    path: file.path,
                    extension: file.extension,
                    topic,
                    content: `Document matching topic ${topic}`,
                    score: 95,
                });
            }
        }

        // 2. Scan native text on demand
        const pdfFiles = allFiles.filter((file) => file.extension === ".pdf");
        const batchSize = 6;
        const nativeMatches = [];

        for (let i = 0; i < pdfFiles.length; i += batchSize) {
            const batch = pdfFiles.slice(i, i + batchSize);
            const results = await Promise.all(
                batch.map(async (file) => ({
                    file,
                    text: await extractGarudaPdfNativeTextOnly(file.path),
                }))
            );

            for (const res of results) {
                if (res.text && garudaTopicMatchesText(res.text, normalizedTopic)) {
                    nativeMatches.push({
                        name: res.file.name,
                        path: res.file.path,
                        extension: res.file.extension,
                        topic,
                        content: res.text.slice(0, 10000),
                        score: 90,
                    });
                }
            }

            if (nativeMatches.length >= 3) break;
        }

        if (nativeMatches.length) {
            console.log(`⚡ Topic match found in ${nativeMatches.length} PDF(s).`);
            return [...matches, ...nativeMatches].slice(0, 5);
        }

        // 3. Fallback candidate OCR
        const terms = normalizedTopic.split(/\s+/).filter(Boolean);
        const candidates = pdfFiles
            .map((file) => {
                const haystack = normalizeGarudaSearchText(`${file.name} ${file.path}`);
                let score = 0;
                if (haystack.includes(normalizedTopic)) score += 85;
                for (const term of terms) {
                    if (term.length >= 3 && haystack.includes(term)) score += 15;
                }
                return { file, score };
            })
            .filter((item) => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);

        for (const candidate of candidates) {
            const processed = await processGarudaPdfOnDemand(candidate.file.path);
            if (processed && garudaTopicMatchesText(processed.content, normalizedTopic)) {
                matches.push({
                    name: candidate.file.name,
                    path: candidate.file.path,
                    extension: candidate.file.extension,
                    topic,
                    content: processed.content.slice(0, 10000),
                    score: candidate.score >= 78 ? candidate.score : 80,
                });
            }
        }

        return matches.slice(0, 5);
    }

    // ======================================================
    // LIGHTWEIGHT METADATA BUILDER
    // ======================================================

    async function buildGarudaFileIndex() {
        if (garudaFileIndexBuildPromise) return garudaFileIndexBuildPromise;

        garudaFileIndexBuildPromise = (async () => {
            console.log("📚 Garuda File Intelligence: Reading Smart Folders...");
            try {
                const roots = getGarudaSearchRoots();
                const files = [];
                for (const root of roots) collectGarudaFiles(root, files);

                garudaFileIndex.clear();

                for (const file of files) {
                    try {
                        const stats = fs.statSync(file.path);
                        garudaFileIndex.set(file.path, {
                            name: file.name,
                            path: file.path,
                            extension: file.extension,
                            size: stats.size,
                            modified: stats.mtimeMs,
                            content: "",
                            documentStructure: { headings: [], sections: [] },
                            lexicalAnalysis: { tokenCount: 0, uniqueTokenCount: 0, tokens: [], keywords: [], frequency: {} },
                            needsDocumentProcessing: true,
                        });
                    } catch {}
                }

                garudaFileIndexReady = true;
                console.log(`📊 Garuda files discovered: ${garudaFileIndex.size}`);
                console.log(`✅ Garuda Smart Folder read completed: ${garudaFileIndex.size} files.`);
                return { success: true, count: garudaFileIndex.size };
            } catch (error) {
                garudaFileIndexReady = false;
                return { success: false, count: 0, error: error.message };
            } finally {
                garudaFileIndexBuildPromise = null;
            }
        })();

        return garudaFileIndexBuildPromise;
    }

    // ======================================================
    // WATCHER
    // ======================================================

    const garudaWatchedRoots = new Set();

    function scheduleGarudaFileIndexRefresh(reason) {
        clearTimeout(scheduleGarudaFileIndexRefresh.refreshTimer);
        scheduleGarudaFileIndexRefresh.refreshTimer = setTimeout(async () => {
            try {
                garudaPdfProcessingCache.clear();
                garudaFileIndexReady = false;
                await buildGarudaFileIndex();
            } catch {}
        }, 2000);
    }

    function watchGarudaFolder(root) {
        if (!root || garudaWatchedRoots.has(root) || !fs.existsSync(root)) return;
        try {
            fs.watch(root, { recursive: true }, () => {
                scheduleGarudaFileIndexRefresh(`Change in ${root}`);
            });
            garudaWatchedRoots.add(root);
        } catch {}
    }

    function startGarudaFileIndexWatcher() {
        const roots = getGarudaSearchRoots();
        for (const root of roots) watchGarudaFolder(root);
    }

    // ======================================================
    // WINDOW CREATION
    // ======================================================

    function createMainWindow() {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.show();
            mainWindow.focus();
            return;
        }

        mainWindow = new BrowserWindow({
            width: 1280,
            height: 820,
            minWidth: 900,
            minHeight: 600,
            title: "Garuda AI",
            backgroundColor: "#111827",
            show: false,
            autoHideMenuBar: true,
            webPreferences: {
                preload: path.join(__dirname, "preload.cjs"),
                contextIsolation: true,
                nodeIntegration: false,
                devTools: !app.isPackaged,
            },
        });

        if (app.isPackaged) {
            mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));
        } else {
            mainWindow.loadURL("http://localhost:5173/");
        }

        mainWindow.once("ready-to-show", () => {
            mainWindow.show();
            mainWindow.focus();
        });

        mainWindow.on("closed", () => {
            mainWindow = null;
        });
    }

    let floatingPosition = null;
    const floatingPositionFile = path.join(app.getPath("userData"), "garuda-floating-position.json");

    function getSavedFloatingPosition() {
        try {
            if (!fs.existsSync(floatingPositionFile)) return null;
            const saved = JSON.parse(fs.readFileSync(floatingPositionFile, "utf8"));
            if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
                return saved;
            }
        } catch {}
        return null;
    }

    function saveFloatingPosition() {
        if (!floatingWindow || floatingWindow.isDestroyed()) return;
        try {
            const [x, y] = floatingWindow.getPosition();
            fs.mkdirSync(path.dirname(floatingPositionFile), { recursive: true });
            fs.writeFileSync(floatingPositionFile, JSON.stringify({ x, y }, null, 2), "utf8");
        } catch {}
    }

    function createFloatingWindow() {
        if (floatingWindow && !floatingWindow.isDestroyed()) return;

        const display = screen.getPrimaryDisplay();
        const { workArea } = display;
        const floatingWidth = 170;
        const floatingHeight = 120;

        const defaultX = Math.max(workArea.x, workArea.x + workArea.width - floatingWidth - 15);
        const defaultY = Math.max(workArea.y, workArea.y + workArea.height - floatingHeight - 115);

        const saved = getSavedFloatingPosition() || { x: defaultX, y: defaultY };

        floatingWindow = new BrowserWindow({
            width: floatingWidth,
            height: floatingHeight,
            x: saved.x,
            y: saved.y,
            frame: false,
            transparent: true,
            backgroundColor: "#00000000",
            hasShadow: false,
            resizable: false,
            movable: true,
            alwaysOnTop: true,
            skipTaskbar: true,
            show: false,
            webPreferences: {
                preload: path.join(__dirname, "preload.cjs"),
                contextIsolation: true,
                nodeIntegration: false,
                devTools: !app.isPackaged,
            },
        });

        if (app.isPackaged) {
            floatingWindow.loadFile(path.join(__dirname, "dist", "index.html"), { hash: "garuda-floating" });
        } else {
            floatingWindow.loadURL("http://localhost:5173/#garuda-floating");
        }

        floatingWindow.on("moved", saveFloatingPosition);
        floatingWindow.on("hide", saveFloatingPosition);

        floatingWindow.webContents.on("did-finish-load", async () => {
            try {
                await floatingWindow.webContents.insertCSS(`
                    html, body, #root {
                        background: transparent !important;
                        background-color: transparent !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: visible !important;
                    }
                `);
            } catch {}

            if (pendingGarudaAction === "on") showFloatingGaruda();
            else if (pendingGarudaAction === "off") hideFloatingGaruda();
            else showFloatingGaruda();
            pendingGarudaAction = null;
        });

        floatingWindow.on("closed", () => {
            floatingWindow = null;
        });
    }

    function showFloatingGaruda() {
        if (!floatingWindow || floatingWindow.isDestroyed()) return { success: false };
        if (floatingWindow.isMinimized()) floatingWindow.restore();
        floatingWindow.setAlwaysOnTop(true, "floating");
        if (!floatingWindow.isVisible()) floatingWindow.showInactive();
        return { success: true, enabled: true };
    }

    function hideFloatingGaruda() {
        if (!floatingWindow || floatingWindow.isDestroyed()) return { success: false };
        floatingWindow.hide();
        return { success: true, enabled: false };
    }

    // ======================================================
    // IPC HANDLERS
    // ======================================================

    ipcMain.handle("garuda-get-file-index", async () => {
        if (!garudaFileIndexReady) await buildGarudaFileIndex();
        return Array.from(garudaFileIndex.values());
    });

    ipcMain.handle("garuda-open-file", async (event, filePath) => {
        if (!filePath || typeof filePath !== "string") return { success: false, error: "Invalid path" };
        const resolvedPath = path.resolve(filePath);
        if (!fs.existsSync(resolvedPath)) return { success: false, error: "File not found" };

        showFloatingGaruda();
        const errorMsg = await shell.openPath(resolvedPath);
        return { success: !errorMsg, path: resolvedPath, error: errorMsg };
    });

    ipcMain.handle("garuda-search-topic", async (event, topic) => {
        if (!topic || typeof topic !== "string") return [];
        if (!garudaFileIndexReady) await buildGarudaFileIndex();
        return await searchGarudaTopicAcrossDocuments(topic.trim());
    });

    ipcMain.handle("garuda-get-files", async () => {
        if (!garudaFileIndexReady) await buildGarudaFileIndex();
        return Array.from(garudaFileIndex.values());
    });

    ipcMain.handle("garuda-send-ai-context", (event, contextData) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("garuda-received-topic-context", contextData);
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
            mainWindow.focus();
            return { success: true };
        }
        return { success: false, error: "Main window unavailable" };
    });

    ipcMain.handle("set-garuda-floating", (event, enabled) => {
        return enabled ? showFloatingGaruda() : hideFloatingGaruda();
    });

    ipcMain.handle("move-floating-garuda", async (event, positionDelta) => {
        if (!floatingWindow || floatingWindow.isDestroyed()) {
            return {
                success: false,
                error: "Floating Garuda window unavailable",
            };
        }

        try {
            const deltaX = Number(positionDelta?.x ?? positionDelta?.deltaX);
            const deltaY = Number(positionDelta?.y ?? positionDelta?.deltaY);

            if (!Number.isFinite(deltaX) || !Number.isFinite(deltaY)) {
                return {
                    success: false,
                    error: "Invalid movement coordinates",
                };
            }

            const [currentX, currentY] = floatingWindow.getPosition();
            let nextX = currentX + Math.round(deltaX);
            let nextY = currentY + Math.round(deltaY);

            const bounds = floatingWindow.getBounds();
            const centerPoint = {
                x: nextX + Math.round(bounds.width / 2),
                y: nextY + Math.round(bounds.height / 2),
            };

            const display = screen.getDisplayNearestPoint(centerPoint);
            const workArea = display.workArea;

            const minX = workArea.x;
            const minY = workArea.y;
            const maxX = workArea.x + workArea.width - bounds.width;
            const maxY = workArea.y + workArea.height - bounds.height;

            nextX = Math.min(Math.max(nextX, minX), maxX);
            nextY = Math.min(Math.max(nextY, minY), maxY);

            floatingWindow.setPosition(nextX, nextY, false);
            saveFloatingPosition();

            return {
                success: true,
                x: nextX,
                y: nextY,
            };
        } catch (error) {
            console.error("❌ Floating Garuda move error:", error);
            return {
                success: false,
                error: error?.message || "Unable to move Floating Garuda",
            };
        }
    });

    ipcMain.handle("resize-floating-garuda", async (event, { width, height }) => {
        if (!floatingWindow || floatingWindow.isDestroyed()) return { success: false };
        try {
            const targetW = Number(width);
            const targetH = Number(height);

            if (!Number.isFinite(targetW) || !Number.isFinite(targetH)) {
                return { success: false, error: "Invalid dimensions" };
            }

            const [currentX, currentY] = floatingWindow.getPosition();
            const [currentW, currentH] = floatingWindow.getSize();

            const deltaW = targetW - currentW;
            const deltaH = targetH - currentH;

            const display = screen.getDisplayNearestPoint({ x: currentX, y: currentY });
            const { workArea } = display;

            let nextX = currentX - deltaW;
            let nextY = currentY - deltaH;

            const minX = workArea.x;
            const minY = workArea.y;
            const maxX = workArea.x + workArea.width - targetW;
            const maxY = workArea.y + workArea.height - targetH;

            nextX = Math.min(Math.max(nextX, minX), maxX);
            nextY = Math.min(Math.max(nextY, minY), maxY);

            floatingWindow.setBounds({
                x: nextX,
                y: nextY,
                width: targetW,
                height: targetH,
            });

            return { success: true };
        } catch (err) {
            console.error("❌ Resize error:", err);
            return { success: false, error: err.message };
        }
    });

    ipcMain.handle("get-floating-garuda-position", async () => {
        if (!floatingWindow || floatingWindow.isDestroyed()) {
            return { success: false, error: "Window unavailable" };
        }
        const [x, y] = floatingWindow.getPosition();
        return { success: true, x, y };
    });

    ipcMain.handle("garuda-select-folder", async () => {
        const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
        if (result.canceled || !result.filePaths.length) return { success: false, canceled: true };
        return { success: true, path: result.filePaths[0] };
    });

    ipcMain.handle("garuda-add-folder", async (event, folderPath) => {
        if (!folderPath) return { success: false };
        const resolved = path.resolve(folderPath);
        garudaCustomFolders.add(resolved);
        saveGarudaCustomFolders();
        garudaFileIndexReady = false;

        await buildGarudaFileIndex();
        watchGarudaFolder(resolved);

        console.log("✅ Garuda Smart Folder is ready:", resolved);
        return { success: true, path: resolved };
    });

    // Added missing handler to fix the error completely:
    ipcMain.handle("garuda-get-custom-folders", async () => {
        try {
            return { success: true, folders: [...garudaCustomFolders] };
        } catch (error) {
            return { success: false, error: error.message, folders: [] };
        }
    });

    // Added missing handler for removing folders:
    ipcMain.handle("garuda-remove-folder", async (event, folderPath) => {
        if (!folderPath) return { success: false, error: "Invalid path" };
        const resolved = path.resolve(folderPath);
        const deleted = garudaCustomFolders.delete(resolved);
        if (deleted) {
            saveGarudaCustomFolders();
            garudaFileIndexReady = false;
            await buildGarudaFileIndex();
            console.log("🗑️ Garuda Smart Folder removed:", resolved);
            return { success: true, path: resolved };
        }
        return { success: false, error: "Folder not found in custom list" };
    });

    ipcMain.handle("volume-up", async () => sendVolumeKey(175));
    ipcMain.handle("volume-down", async () => sendVolumeKey(174));
    ipcMain.handle("volume-mute", async () => sendVolumeKey(173));
    ipcMain.handle("volume-unmute", async () => sendVolumeKey(173));

    // ======================================================
    // EXISTING OPEN EXTERNAL (DO NOT TOUCH)
    // ======================================================

    ipcMain.handle("open-external", async (event, url) => {
        await shell.openExternal(url);
        return { success: true };
    });
    

    // ======================================================
    // GARUDA TRACKED WEBSITE WINDOWS
    // ======================================================

    const garudaExternalWindows = new Map();

    ipcMain.handle(
        "open-garuda-tab",
        async (event, { target, url }) => {
            try {
                if (!target || !url) {
                    return {
                        success: false,
                        error: "Target and URL are required",
                    };
                }

                const existing =
                    garudaExternalWindows.get(target);

                if (
                    existing &&
                    !existing.isDestroyed()
                ) {
                    existing.focus();

                    return {
                        success: true,
                        alreadyOpen: true,
                    };
                }

                const browserWindow =
                    new BrowserWindow({
                        width: 1200,
                        height: 800,
                        webPreferences: {
                            contextIsolation: true,
                            nodeIntegration: false,
                        },
                    });

                garudaExternalWindows.set(
                    target,
                    browserWindow
                );

                browserWindow.on("closed", () => {
                    const current =
                        garudaExternalWindows.get(target);

                    if (current === browserWindow) {
                        garudaExternalWindows.delete(target);
                    }
                });

                await browserWindow.loadURL(url);

                console.log(
                    `🦅 Opened Garuda window: ${target}`
                );

                return {
                    success: true,
                    alreadyOpen: false,
                };

            } catch (error) {
                console.error(
                    "❌ Open Garuda tab error:",
                    error
                );

                return {
                    success: false,
                    error:
                        error?.message ||
                        "Unable to open Garuda tab",
                };
            }
        }
    );

    // ======================================================
    // CLOSE GARUDA TRACKED WEBSITE
    // ======================================================
    ipcMain.handle(
        "close-garuda-tab",
        async (event, target) => {
            try {
                const normalizedTarget =
                    String(target || "")
                        .trim()
                        .toLowerCase();

                console.log(
                    "🦅 Close request:",
                    normalizedTarget
                );

                const browserWindow =
                    garudaExternalWindows.get(
                        normalizedTarget
                    );

                if (
                    !browserWindow ||
                    browserWindow.isDestroyed()
                ) {
                    garudaExternalWindows.delete(
                        normalizedTarget
                    );

                    return {
                        success: false,
                        error:
                            `${normalizedTarget} is not currently open by Garuda`,
                    };
                }

                browserWindow.close();

                garudaExternalWindows.delete(
                    normalizedTarget
                );

                console.log(
                    `🦅 Closed Garuda window: ${normalizedTarget}`
                );

                return {
                    success: true,
                    target: normalizedTarget,
                };

            } catch (error) {
                console.error(
                    "❌ Close Garuda tab error:",
                    error
                );

                return {
                    success: false,
                    error:
                        error?.message ||
                        "Unable to close Garuda tab",
                };
            }
        }
    );

    ipcMain.handle("open-system-app", async (event, appName) => {
        const apps = {
            calculator: "calc.exe",
            notepad: "notepad.exe",
            explorer: "explorer.exe",
        };
        const executable = apps[appName];
        if (!executable) return { success: false, error: "Application not allowed" };
        execFile(executable, [], { windowsHide: false });
        return { success: true };
    });

    ipcMain.handle("open-system-folder", async (event, folderName) => {
        const folders = {
            downloads: "downloads",
            documents: "documents",
            desktop: "desktop",
            pictures: "pictures",
        };
        const folderType = folders[folderName];
        if (!folderType) return { success: false, error: "Folder not allowed" };
        await shell.openPath(app.getPath(folderType));
        return { success: true };
    });

    ipcMain.handle("write-clipboard", async (event, text) => {
        clipboard.writeText(String(text ?? ""));
        return { success: true };
    });

    // ======================================================
    // APP STARTUP
    // ======================================================

    app.whenReady().then(async () => {
        registerGarudaProtocol();
        loadGarudaCustomFolders();

        await buildGarudaFileIndex();

        startGarudaFileIndexWatcher();
        createMainWindow();
        createFloatingWindow();
    });

    app.on("window-all-closed", (event) => event.preventDefault());
    app.on("before-quit", () => {
        saveFloatingPosition();
        if (mainWindow && !mainWindow.isDestroyed()) mainWindow.destroy();
        if (floatingWindow && !floatingWindow.isDestroyed()) floatingWindow.destroy();
    });
}