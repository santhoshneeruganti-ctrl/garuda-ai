// ======================================================
// GARUDA COMMAND ENGINE (STRENGTHENED & OPTIMIZED)
// ======================================================

const WEBSITE_COMMANDS = {
  youtube: "https://www.youtube.com",
  google: "https://www.google.com",
  wikipedia: "https://www.wikipedia.org",
  gmail: "https://mail.google.com",
  github: "https://github.com",
  chatgpt: "https://chatgpt.com",
  whatsapp: "https://web.whatsapp.com",
};

const VOICE_ALIASES = [
  // ======================================================
  // WEBSITES
  // ======================================================

  ["you tube", "youtube"],
  ["you tub", "youtube"],
  ["u tube", "youtube"],
  ["utube", "youtube"],

  ["goo goo", "google"],
  ["googel", "google"],
  ["goggle", "google"],

  ["git hub", "github"],
  ["g mail", "gmail"],
  ["chat gpt", "chatgpt"],

  ["what's app", "whatsapp"],
  ["whats app", "whatsapp"],
  ["what s app", "whatsapp"],

  // ======================================================
  // COMMAND WORDS
  // ======================================================

  ["opun", "open"],
  ["oppen", "open"],
  ["openin", "open"],
  ["lounch", "launch"],
  ["launche", "launch"],

  ["seach", "search"],
  ["serch", "search"],
  ["sarch", "search"],
  ["fnd", "find"],

  ["plaay", "play"],
  ["playe", "play"],

  // ======================================================
  // PDF / DOCUMENT VOICE CORRECTIONS
  // ======================================================

  ["p d f", "pdf"],
  ["pee dee eff", "pdf"],
  ["pee dee f", "pdf"],
  ["pdfs", "pdf"],

  ["documentt", "document"],
  ["documant", "document"],
  ["docment", "document"],

  // ======================================================
  // TOPIC / ACADEMIC VOICE CORRECTIONS
  // ======================================================

  ["electrical analysis", "lexical analysis"],
  ["directional analysis", "lexical analysis"],
  ["direction analysis", "lexical analysis"],
  ["lectional analysis", "lexical analysis"],
  ["lexical analisis", "lexical analysis"],
  ["lexical anlysis", "lexical analysis"],
  ["lexical analaysis", "lexical analysis"],

  // ======================================================
  // EXISTING SPECIAL CORRECTIONS
  // ======================================================

  ["context dimension 3", "context dimension tree"],
  ["context dimension three", "context dimension tree"],
];

function correctVoiceTranscript(command) {
  let text = String(command || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    return "";
  }

  const sortedAliases = [...VOICE_ALIASES].sort(
    (a, b) => b[0].length - a[0].length
  );

  for (const [wrong, correct] of sortedAliases) {
    const escaped = wrong.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    text = text.replace(
      new RegExp(`\\b${escaped}\\b`, "gi"),
      correct
    );
  }

  return text
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCommand(command) {
  if (!command) return "";

  let text = String(command)
    .toLowerCase()
    .replace(/[.,!?;:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const duplicatePatterns = [
    ["volume up volume up", "volume up"],
    ["volume down volume down", "volume down"],
    ["mute mute", "mute"],
    ["unmute unmute", "unmute"],
    ["increase volume increase volume", "increase volume"],
    ["decrease volume decrease volume", "decrease volume"],
  ];

  for (const [duplicate, clean] of duplicatePatterns) {
    text = text.replace(duplicate, clean);
  }

  return text.trim();
}

// ============================================================
// SAFE ELECTRON API CHECK
// ============================================================

const electronAPI =
  typeof window !== "undefined"
    ? window.electronAPI
    : null;

async function openUrl(url) {
  try {
    if (electronAPI && electronAPI.openExternal) {
      const result = await electronAPI.openExternal(url);
      return Boolean(result?.success);
    }
    const newWindow = window.open(url, "_blank");
    return Boolean(newWindow);
  } catch (error) {
    return false;
  }
}

// ============================================================
// GARUDA OPEN TRACKING (OPEN ONLY)
// ============================================================

const garudaOpenedTargets = new Map();

function getBrowserTargetName(text) {
  const targets = [
    "youtube",
    "google",
    "gmail",
    "github",
    "chatgpt",
    "whatsapp",
    "wikipedia",
  ];

  return targets.find((target) =>
    text.includes(target)
  );
}

async function openTrackedWebsite(target) {
  const url = WEBSITE_COMMANDS[target];

  if (!url) {
    return false;
  }

  const opened = await openUrl(url);

  if (opened) {
    garudaOpenedTargets.set(target, {
      url,
      openedAt: Date.now(),
    });
  }

  return opened;
}

async function handleTrackedWebsiteCommand(text) {
  const command = normalizeCommand(text);

  const target =
    getBrowserTargetName(command);

  if (!target) {
    return null;
  }

  // ======================================================
  // DO NOT TREAT SEARCH / PLAY AS SIMPLE OPEN
  // ======================================================

  const isSearchCommand =
    command.includes("search") ||
    command.includes("find") ||
    command.includes("play");

  if (isSearchCommand) {
    return null;
  }

  // ======================================================
  // OPEN ONLY (CLOSE REMOVED)
  // ======================================================

  if (
    command.startsWith("open ") ||
    command.startsWith("launch ") ||
    command.startsWith("start ") ||
    command.startsWith("go to ") ||
    command === target
  ) {
    const opened =
      await openTrackedWebsite(target);

    return {
      handled: true,
      message: opened
        ? `Opening ${target}[cite: 1]...`
        : `I couldn't open ${target}[cite: 1].`,
    };
  }

  return null;
}

function createGoogleSearchUrl(query) {
  return "https://www.google.com/search?q=" + encodeURIComponent(query);
}

function createYouTubeSearchUrl(query) {
  return "https://www.youtube.com/results?search_query=" + encodeURIComponent(query);
}

function extractSearchQuery(text, platform) {
  let query = text;
  query = query.replace(new RegExp(`\\b${platform}\\b`, "gi"), "");
  query = query.replace(/\bsearch\s+for\b/gi, "");
  query = query.replace(/\bsearch\b/gi, "");
  query = query.replace(/\bfind\b/gi, "");
  query = query.replace(/\blook\s+for\b/gi, "");
  return query.replace(/\s+/g, " ").trim();
}

async function openSystemApp(appName) {
  try {
    if (!electronAPI?.openSystemApp) return false;
    const result = await electronAPI.openSystemApp(appName);
    return Boolean(result?.success);
  } catch {
    return false;
  }
}

async function openSystemFolder(folderName) {
  try {
    if (!electronAPI?.openSystemFolder) return false;
    const result = await electronAPI.openSystemFolder(folderName);
    return Boolean(result?.success);
  } catch {
    return false;
  }
}

async function openGarudaFile(filePath) {
  try {
    if (!electronAPI?.openFile) return false;
    try {
      if (typeof electronAPI.setGarudaFloating === "function") {
        electronAPI.setGarudaFloating(true);
      }
    } catch {}

    const result = await electronAPI.openFile(filePath);
    return Boolean(result?.success);
  } catch {
    return false;
  }
}

let pendingGarudaFileSelection = [];

function getGarudaFileSelectionIndex(text) {
  const command = normalizeCommand(text);
  const selectionMap = {
    "1": 0, "one": 0, "first": 0,
    "2": 1, "two": 1, "second": 1,
    "3": 2, "three": 2, "third": 2,
    "4": 3, "four": 3, "fourth": 3,
    "5": 4, "five": 4, "fifth": 4,
    "6": 5, "six": 5, "sixth": 5,
    "7": 6, "seven": 6, "seventh": 6,
    "8": 7, "eight": 7, "eighth": 7,
    "9": 8, "nine": 8, "ninth": 8,
    "10": 9, "ten": 9, "tenth": 9,
  };

  return Object.prototype.hasOwnProperty.call(selectionMap, command)
    ? selectionMap[command]
    : -1;
}

async function handleGarudaFileSelection(text) {
  if (!pendingGarudaFileSelection.length) return null;

  const selectionIndex = getGarudaFileSelectionIndex(text);
  if (selectionIndex === -1) return null;

  const selectedFile = pendingGarudaFileSelection[selectionIndex];
  if (!selectedFile) {
    return {
      handled: true,
      message: "That file selection is not available. Please choose one of the listed files.",
    };
  }

  pendingGarudaFileSelection = [];
  const filePath = selectedFile.path || selectedFile.filePath;

  if (!filePath) {
    return {
      handled: true,
      message: "I found that file, but its path is unavailable.",
    };
  }

  const opened = await openGarudaFile(filePath);
  return {
    handled: true,
    message: opened
      ? `Opening ${selectedFile.name}...`
      : "I found the selected file, but I couldn't open it.",
  };
}

// ======================================================
// ADVANCED PHONETIC & LEVENSHTEIN FUZZY MATCH ENGINE
// ======================================================

function cleanFileName(val) {
  return String(val || "")
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]/g, "");
}

function levenshteinDistance(s, t) {
  if (!s) return t.length;
  if (!t) return s.length;

  const prev = Array.from({ length: t.length + 1 }, (_, i) => i);
  let current = [];

  for (let i = 1; i <= s.length; i++) {
    current = [i];
    for (let j = 1; j <= t.length; j++) {
      current[j] = Math.min(
        current[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + (s[i - 1] === t[j - 1] ? 0 : 1)
      );
    }
    for (let j = 0; j <= t.length; j++) {
      prev[j] = current[j];
    }
  }
  return prev[t.length];
}

function calculateAdvancedSimilarity(queryStr, targetStr) {
  const q = cleanFileName(queryStr);
  const t = cleanFileName(targetStr);

  if (!q || !t) return 0;

  if (q === t) return 1.0;

  if (t.includes(q)) {
    return 0.85 + (q.length / t.length) * 0.14;
  }
  if (q.includes(t)) {
    return 0.85 + (t.length / q.length) * 0.14;
  }

  const dist = levenshteinDistance(q, t);
  const maxLen = Math.max(q.length, t.length);
  const score = 1 - dist / maxLen;

  if (dist <= 2 && maxLen >= 6) {
    return Math.max(score, 0.78);
  }

  return score;
}

function findBestFuzzyFile(files, searchText) {
  if (!Array.isArray(files) || !files.length || !searchText) return null;

  const STOP_WORDS = new Set([
    "open", "show", "find", "locate", "the", "my", "pdf",
    "document", "file", "about", "related", "topic", "on",
    "of", "for", "please", "can", "you", "me", "unna", "undi", "chey"
  ]);

  const cleanWords = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .map((w) => w.trim())
      .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));

  const queryWords = cleanWords(searchText);
  if (!queryWords.length) return null;

  const combinedQuery = queryWords.join("");
  let bestFile = null;
  let bestScore = 0;

  for (const file of files) {
    const rawName = file?.name || file?.filename || file?.title || "";
    if (!rawName) continue;

    const fileWords = cleanWords(rawName);
    const combinedFile = fileWords.join("");

    let score = calculateAdvancedSimilarity(combinedQuery, combinedFile);

    for (const qWord of queryWords) {
      for (const fWord of fileWords) {
        const wordScore = calculateAdvancedSimilarity(qWord, fWord);
        if (wordScore > score) {
          score = wordScore;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestFile = file;
    }
  }

  if (!bestFile || bestScore < 0.65) return null;
  return bestFile;
}

// ======================================================
// TOPIC FILE COMMAND
// ======================================================

function extractGarudaTopicFromFileCommand(text) {
  let topic = String(text || "").toLowerCase().trim();
  topic = topic
    .replace(/\bopen\s+chey\b/gi, " ")
    .replace(/\bshow\s+chey\b/gi, " ")
    .replace(/\bplease\b/gi, " ")
    .replace(/\bcan\s+you\b/gi, " ")
    .replace(/\bopen\b/gi, " ")
    .replace(/\bshow\b/gi, " ")
    .replace(/\bfind\b/gi, " ")
    .replace(/\blocate\b/gi, " ")
    .replace(/\bthe\b/gi, " ")
    .replace(/\bmy\b/gi, " ")
    .replace(/\bpdf\b/gi, " ")
    .replace(/\bdocument\b/gi, " ")
    .replace(/\bfile\b/gi, " ")
    .replace(/\btopic\b/gi, " ")
    .replace(/\babout\b/gi, " ")
    .replace(/\brelated\s+to\b/gi, " ")
    .replace(/\bcontaining\b/gi, " ")
    .replace(/\bcontains\b/gi, " ")
    .replace(/\bunna\b/gi, " ")
    .replace(/\bundi\b/gi, " ")
    .replace(/\bchey\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return topic;
}

async function handleGarudaTopicFileCommand(text) {
  try {
    if (!electronAPI?.searchTopic) {
      return { handled: true, message: "Garuda document intelligence is unavailable." };
    }

    const topic = extractGarudaTopicFromFileCommand(text);
    if (!topic) {
      return { handled: true, message: "Which topic should I search for?" };
    }

    const results = await Promise.race([
      electronAPI.searchTopic(topic),
      new Promise((resolve) => setTimeout(() => resolve([]), 30000)),
    ]);

    if (!Array.isArray(results) || results.length === 0) {
      return { handled: true, message: `I couldn't find a document containing the topic "${topic}".` };
    }

    const usableResults = results.filter((file) => {
      const ext = String(file?.extension || "").toLowerCase();
      const fn = String(file?.name || file?.filename || "").toLowerCase();
      return ext === ".pdf" || fn.endsWith(".pdf");
    });

    if (!usableResults.length) {
      return { handled: true, message: `I found results for "${topic}", but no corresponding PDF.` };
    }

    if (usableResults.length === 1) {
      const file = usableResults[0];
      const filePath = file.path || file.filePath;

      if (!filePath) return { handled: true, message: "Path unavailable." };

      pendingGarudaFileSelection = [];
      const opened = await openGarudaFile(filePath);
      return {
        handled: true,
        message: opened ? `Opening ${file.name || file.filename}...` : "Couldn't open document.",
      };
    }

    pendingGarudaFileSelection = usableResults.slice(0, 10);
    const options = pendingGarudaFileSelection
      .map((f, i) => `${i + 1}. ${f.name || f.filename}`)
      .join("\n");

    return {
      handled: true,
      requiresFileSelection: true,
      files: pendingGarudaFileSelection.map((f, i) => ({
        index: i + 1,
        name: f.name || f.filename,
        path: f.path || f.filePath,
      })),
      message: `I found multiple documents covering topic "${topic}". Which one should I open?\n${options}`,
    };
  } catch (error) {
    return { handled: true, message: "Problem searching documents." };
  }
}

// ======================================================
// FILENAME MATCHER (STRICTLY GUARDED)
// ======================================================

async function handleGarudaFileCommand(text) {
  try {
    const selectionResult = await handleGarudaFileSelection(text);
    if (selectionResult) return selectionResult;

    if (!electronAPI?.getFiles) {
      return { handled: true, message: "Garuda file system is unavailable." };
    }

    let searchText = text
      .replace(/\bopen\s+chey\b/gi, " ")
      .replace(/\bshow\s+chey\b/gi, " ")
      .replace(/\bplease\b/gi, " ")
      .replace(/\bcan\s+you\b/gi, " ")
      .replace(/\bopen\b/gi, " ")
      .replace(/\bshow\b/gi, " ")
      .replace(/\bthe\b/gi, " ")
      .replace(/\bmy\b/gi, " ")
      .replace(/\bpdf\b/gi, " ")
      .replace(/\bdocument\b/gi, " ")
      .replace(/\bfile\b/gi, " ")
      .replace(/\bchey\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

    const files = await electronAPI.getFiles();
    if (!Array.isArray(files) || files.length === 0) {
      return { handled: true, message: "I couldn't find any files in your configured folders." };
    }

    const matchedFile = findBestFuzzyFile(files, searchText);

    if (matchedFile) {
      pendingGarudaFileSelection = [];
      const opened = await openGarudaFile(matchedFile.filePath || matchedFile.path);
      return {
        handled: true,
        message: opened ? `Opening ${matchedFile.name}...` : "Couldn't open file.",
      };
    }

    return {
      handled: true,
      message: `I couldn't find any file matching "${searchText}". (Say "${searchText} topic" to search inside document contents).`,
    };
  } catch (error) {
    return { handled: true, message: "Problem opening requested file." };
  }
}

// ======================================================
// VOLUME CONTROLS
// ======================================================

async function volumeUp() {
  try {
    if (!electronAPI?.volumeUp) return false;
    const res = await electronAPI.volumeUp();
    return Boolean(res?.success);
  } catch {
    return false;
  }
}

async function volumeDown() {
  try {
    if (!electronAPI?.volumeDown) return false;
    const res = await electronAPI.volumeDown();
    return Boolean(res?.success);
  } catch {
    return false;
  }
}

async function volumeMute() {
  try {
    if (!electronAPI?.volumeMute) return false;
    const res = await electronAPI.volumeMute();
    return Boolean(res?.success);
  } catch {
    return false;
  }
}

async function volumeUnmute() {
  try {
    if (!electronAPI?.volumeUnmute) return false;
    const res = await electronAPI.volumeUnmute();
    return Boolean(res?.success);
  } catch {
    return false;
  }
}

async function handleVolumeCommand(text) {
  const command = normalizeCommand(text);

  if (command.includes("volume up") || command.includes("increase volume") || command.includes("sound penchu")) {
    const success = await volumeUp();
    return { handled: true, message: success ? "🔊 Volume increased." : "❌ Unable to increase volume." };
  }

  if (command.includes("volume down") || command.includes("decrease volume") || command.includes("sound thagginchu")) {
    const success = await volumeDown();
    return { handled: true, message: success ? "🔉 Volume decreased." : "❌ Unable to decrease volume." };
  }

  if (command.includes("unmute")) {
    const success = await volumeUnmute();
    return { handled: true, message: success ? "🔊 Volume unmuted." : "❌ Unable to unmute volume." };
  }

  if (command.includes("mute") || command.includes("silence")) {
    const success = await volumeMute();
    return { handled: true, message: success ? "🔇 Volume muted." : "❌ Unable to mute volume." };
  }

  return null;
}

// ======================================================
// MAIN COMMAND ROUTER (STRICTLY GUARDED AGAINST FALSE TRIGGERS)
// ======================================================

export async function executeGarudaCommand(command) {
  if (!command) {
    return {
      handled: false,
      message: "",
    };
  }

  let text = correctVoiceTranscript(command);
  text = normalizeCommand(text);

  const trackedWebsiteResult = await handleTrackedWebsiteCommand(text);
  if (trackedWebsiteResult) {
    return trackedWebsiteResult;
  }

  const fileSelectionResult = await handleGarudaFileSelection(text);
  if (fileSelectionResult) {
    return fileSelectionResult;
  }

  if (/\.pdf$/i.test(text.trim())) {
    const directPDFResult = await handleGarudaFileCommand(text);
    if (directPDFResult) return directPDFResult;
  }

  const volumeResult = await handleVolumeCommand(text);
  if (volumeResult) return volumeResult;

  // STRICT GUARD: Only trigger file or topic search if the user explicitly uses command verbs 
  // like "open", "show", "find", "locate" combined with file indicators. 
  // This prevents random conversational prompts from triggering local file openings.
  const hasExplicitCommandVerb = 
    text.startsWith("open ") || 
    text.startsWith("show ") || 
    text.startsWith("find ") || 
    text.startsWith("locate ") ||
    text.includes(" open ") ||
    text.includes(" show ") ||
    text.includes(" find ");

  const hasFileIndicator = 
    text.includes("pdf") || 
    text.includes("document") || 
    text.includes("file") || 
    text.includes("resume") || 
    text.includes("report") || 
    text.includes("assignment") || 
    text.includes("notes");

  const hasExplicitTopicIntent =
    (text.includes("topic") || text.includes("contains") || text.includes("containing") || text.includes("related to")) && hasFileIndicator;

  if (hasExplicitTopicIntent && hasExplicitCommandVerb) {
    return await handleGarudaTopicFileCommand(text);
  }

  const isSelectionCommand = pendingGarudaFileSelection.length > 0 && getGarudaFileSelectionIndex(text) !== -1;
  const isBarePDFCommand = text.endsWith(".pdf") || text === "pdf";
  
  const fileCommand =
    isSelectionCommand ||
    isBarePDFCommand ||
    (hasExplicitCommandVerb && hasFileIndicator);

  if (fileCommand) {
    return await handleGarudaFileCommand(text);
  }

  const timeCommands = ["what is the time", "what time is it", "current time", "time now"];
  if (timeCommands.some((c) => text.includes(c))) {
    const time = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    return { handled: true, message: `The current time is ${time}.` };
  }

  if (text.includes("youtube") && (text.includes("search") || text.includes("find") || text.includes("play"))) {
    const query = extractSearchQuery(text, "youtube");
    if (!query) return { handled: true, message: "What should I search for on YouTube?" };
    return { handled: true, message: `Searching YouTube for ${query}...` };
  }

  if (text.includes("google") && (text.includes("search") || text.includes("find"))) {
    const query = extractSearchQuery(text, "google");
    if (!query) return { handled: true, message: "What should I search for on Google?" };
    return { handled: true, message: `Searching Google for ${query}...` };
  }

  for (const site of Object.keys(WEBSITE_COMMANDS)) {
    if (text === site || text === `open ${site}`) {
      const opened = await openUrl(WEBSITE_COMMANDS[site]);
      const cap = site.charAt(0).toUpperCase() + site.slice(1);
      return { handled: true, message: opened ? `Opening ${cap}...` : `I couldn't open ${cap}.` };
    }
  }

  if (text === "calculator" || text === "open calculator" || text === "calc") {
    const opened = await openSystemApp("calculator");
    return { handled: true, message: opened ? "Opening Calculator..." : "I couldn't open Calculator." };
  }
  if (text === "notepad" || text === "open notepad") {
    const opened = await openSystemApp("notepad");
    return { handled: true, message: opened ? "Opening Notepad..." : "I couldn't open Notepad." };
  }
  if (text === "file explorer" || text === "open file explorer") {
    const opened = await openSystemApp("explorer");
    return { handled: true, message: opened ? "Opening File Explorer..." : "I couldn't open File Explorer." };
  }

  return { handled: false, message: "" };
}