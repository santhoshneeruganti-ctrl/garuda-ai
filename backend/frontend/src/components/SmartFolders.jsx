import { useEffect, useState, useMemo } from "react";
import "../styles/smartFolders.css";

const STORAGE_KEY = "garuda_smart_custom_folders";

function SmartFolders({ onBack }) {
  const [customFolders, setCustomFolders] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [addingFolder, setAddingFolder] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [reindexingFolder, setReindexingFolder] = useState("");
  const [removingFolder, setRemovingFolder] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // ==================================================
  // LOAD SAVED FOLDERS & LIVE FILE INDEX
  // ==================================================
  useEffect(() => {
    async function initData() {
      // 1. Initial LocalStorage load
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setCustomFolders(parsed);
          }
        } catch {
          console.warn("⚠️ Could not load Smart Folders from local cache.");
        }
      }

      // 2. Fetch live data from Electron backend
      try {
        if (window.electronAPI) {
          const promises = [];
          if (typeof window.electronAPI.getCustomFolders === "function") {
            promises.push(window.electronAPI.getCustomFolders());
          } else {
            promises.push(Promise.resolve(null));
          }

          if (typeof window.electronAPI.getFiles === "function") {
            promises.push(window.electronAPI.getFiles());
          } else {
            promises.push(Promise.resolve([]));
          }

          const [nativeFolders, files] = await Promise.all(promises);

          if (Array.isArray(nativeFolders) && nativeFolders.length > 0) {
            setCustomFolders(nativeFolders);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(nativeFolders));
          }

          if (Array.isArray(files)) {
            setAllFiles(files);
          }
        }
      } catch (err) {
        console.error("❌ Failed to sync Smart Folders metadata:", err);
      } finally {
        setIsLoading(false);
      }
    }

    initData();
  }, []);

  function showMessage(text, type = "info") {
    setMessage(text);
    setMessageType(type);

    window.clearTimeout(showMessage.timer);

    showMessage.timer = window.setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 4200);
  }

  // ==================================================
  // DYNAMIC METRICS CALCULATION (PDFs vs Total)
  // ==================================================
  const folderMetrics = useMemo(() => {
    const metricsMap = {};
    for (const folder of customFolders) {
      const folderPathLower = String(folder).toLowerCase();
      const matchingFiles = allFiles.filter((f) => {
        const p = String(f.path || f.filePath || "").toLowerCase();
        return p.startsWith(folderPathLower);
      });

      const pdfCount = matchingFiles.filter((f) => {
        const ext = String(f.extension || "").toLowerCase();
        const fn = String(f.name || f.filename || "").toLowerCase();
        return ext === ".pdf" || fn.endsWith(".pdf");
      }).length;

      metricsMap[folder] = {
        total: matchingFiles.length,
        pdfs: pdfCount,
      };
    }
    return metricsMap;
  }, [customFolders, allFiles]);

  // ==================================================
  // ADD FOLDER (WITH DUPLICATE PREVENTION)
  // ==================================================
  async function handleAddFolder() {
    if (
      !window.electronAPI ||
      typeof window.electronAPI.selectFolder !== "function" ||
      typeof window.electronAPI.addFolder !== "function"
    ) {
      showMessage(
        "Open Garuda as the desktop app to choose a folder.",
        "error"
      );
      return;
    }

    try {
      setAddingFolder(true);
      setMessage("");
      setMessageType("");

      console.log("📁 Opening Garuda folder picker...");

      const selected = await window.electronAPI.selectFolder();

      if (
        !selected ||
        selected.canceled ||
        !selected.success ||
        !selected.path
      ) {
        setAddingFolder(false);
        return;
      }

      const folderPath = selected.path;
      console.log("📁 User selected folder:", folderPath);

      const alreadyAdded = customFolders.some(
        (folder) =>
          String(folder).toLowerCase() === String(folderPath).toLowerCase()
      );

      if (alreadyAdded) {
        showMessage(
          "This folder is already connected to Garuda.",
          "info"
        );
        return;
      }

      console.log("🦅 Adding folder directly to Garuda...");

      const result = await window.electronAPI.addFolder(folderPath);
      console.log("📁 Garuda add folder result:", result);

      if (!result || !result.success) {
        showMessage(
          result?.error || "Garuda could not add this folder.",
          "error"
        );
        return;
      }

      const addedPath = result.path || folderPath;
      const updatedFolders = [...customFolders, addedPath];

      setCustomFolders(updatedFolders);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFolders));

      // Refresh files list
      if (typeof window.electronAPI.getFiles === "function") {
        const freshFiles = await window.electronAPI.getFiles();
        if (Array.isArray(freshFiles)) setAllFiles(freshFiles);
      }

      showMessage(
        "Folder connected. Garuda is now indexing its supported files.",
        "success"
      );

      console.log("✅ Folder added successfully:", addedPath);
    } catch (error) {
      console.error("❌ Smart Folder error:", error);
      showMessage(
        error?.message || "Could not add the folder.",
        "error"
      );
    } finally {
      setAddingFolder(false);
    }
  }

  // ==================================================
  // RE-INDEX INDIVIDUAL FOLDER
  // ==================================================
  async function handleReindexFolder(folderPath) {
    if (
      !window.electronAPI ||
      typeof window.electronAPI.addFolder !== "function"
    ) {
      return;
    }

    try {
      setReindexingFolder(folderPath);
      await window.electronAPI.addFolder(folderPath);

      if (typeof window.electronAPI.getFiles === "function") {
        const freshFiles = await window.electronAPI.getFiles();
        if (Array.isArray(freshFiles)) setAllFiles(freshFiles);
      }

      showMessage(`Re-indexed ${getFolderName(folderPath)} successfully.`, "success");
    } catch {
      showMessage("Failed to re-index folder.", "error");
    } finally {
      setReindexingFolder("");
    }
  }

  // ==================================================
  // REMOVE FOLDER
  // ==================================================
  async function handleRemoveFolder(folderPath) {
    setRemovingFolder(folderPath);

    window.setTimeout(async () => {
      const updatedFolders = customFolders.filter(
        (folder) => folder !== folderPath
      );

      setCustomFolders(updatedFolders);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFolders));

      // Sync removal to native backend if supported
      if (
        window.electronAPI &&
        typeof window.electronAPI.removeFolder === "function"
      ) {
        try {
          await window.electronAPI.removeFolder(folderPath);
        } catch {}
      }

      setRemovingFolder("");
      showMessage(
        "Folder removed from the Smart Folders list.",
        "info"
      );

      console.log("🗑️ Smart Folder removed:", folderPath);
    }, 240);
  }

  function getFolderName(folderPath) {
    return (
      String(folderPath)
        .split(/[\\/]/)
        .filter(Boolean)
        .pop() || "Folder"
    );
  }

  // Filter folders based on user search input
  const filteredFolders = useMemo(() => {
    if (!searchQuery.trim()) return customFolders;
    const query = searchQuery.toLowerCase();
    return customFolders.filter(
      (f) =>
        String(f).toLowerCase().includes(query) ||
        getFolderName(f).toLowerCase().includes(query)
    );
  }, [customFolders, searchQuery]);

  return (
    <div className="smart-folders-page">
      <div className="smart-folders-orb orb-one" />
      <div className="smart-folders-orb orb-two" />

      <div className="smart-folders-content">
        {/* HEADER */}
        <div className="smart-folders-header">
          <button
            type="button"
            className="smart-folders-back"
            onClick={onBack}
            aria-label="Back to chat"
          >
            <span>←</span>
          </button>

          <div className="smart-title-wrap">
            <div className="smart-title-icon">
              <span>📁</span>
            </div>

            <div>
              <div className="smart-eyebrow">GARUDA FILE INTELLIGENCE</div>
              <h1>Smart Folders</h1>
              <p>Give Garuda access to the folders you want it to understand.</p>
            </div>
          </div>
        </div>

        {/* HERO BANNER CARD */}
        <div className="smart-hero-card">
          <div className="smart-hero-glow" />

          <div className="smart-hero-left">
            <div className="garuda-intelligence-icon">
              <span>🦅</span>
              <i />
            </div>

            <div className="smart-hero-copy">
              <div className="smart-live-badge">
                <span className="live-dot" />
                FILE INTELLIGENCE ACTIVE
              </div>

              <h2>
                Let Garuda know
                <br />
                where your files live.
              </h2>

              <p>
                Connect a folder once. Garuda continuously monitors supported
                files inside it and makes them instantly searchable by filename
                or topic.
              </p>

              <div className="smart-flow">
                <div className="flow-step">
                  <span>1</span> Choose
                </div>
                <div className="flow-line" />
                <div className="flow-step">
                  <span>2</span> Auto Index
                </div>
                <div className="flow-line" />
                <div className="flow-step">
                  <span>3</span> Ask Garuda
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            className={
              addingFolder
                ? "smart-add-folder-btn adding"
                : "smart-add-folder-btn"
            }
            onClick={handleAddFolder}
            disabled={addingFolder}
          >
            <span className="add-folder-icon">
              {addingFolder ? "◌" : "+"}
            </span>
            <span>
              {addingFolder ? "Connecting..." : "Add Folder"}
            </span>
            {!addingFolder && <span className="add-folder-arrow">→</span>}
          </button>
        </div>

        {/* STATUS NOTIFICATION */}
        {message && (
          <div className={`smart-folder-message ${messageType}`}>
            <span className="message-icon">
              {messageType === "success"
                ? "✓"
                : messageType === "error"
                ? "!"
                : "i"}
            </span>
            <p>{message}</p>
            <button
              type="button"
              onClick={() => {
                setMessage("");
                setMessageType("");
              }}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        {/* CONTROLS: SEARCH BAR & STATS PILLS */}
        <div className="smart-section-controls">
          <div className="smart-search-bar">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search connected folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="folder-stats-pills">
            <div className="stat-pill">
              Folders: <strong>{customFolders.length}</strong>
            </div>
            <div className="stat-pill">
              Files: <strong>{allFiles.length}</strong>
            </div>
          </div>
        </div>

        {/* SECTION HEADING */}
        <div className="smart-section-heading">
          <div>
            <div className="section-kicker">YOUR LIBRARY</div>
            <h2>Connected Folders</h2>
          </div>

          <div className="folder-count">
            <strong>{filteredFolders.length}</strong>
            <span>
              {filteredFolders.length === 1 ? "folder" : "folders"}
            </span>
          </div>
        </div>

        {/* FOLDER LIST / SKELETON / EMPTY STATE */}
        {isLoading ? (
          <div className="smart-folder-list">
            <div className="folder-skeleton-item" />
            <div className="folder-skeleton-item" />
          </div>
        ) : customFolders.length === 0 ? (
          <div className="smart-empty-state">
            <div className="empty-icon-ring">📂</div>
            <h3>Your Garuda library is waiting</h3>
            <p>
              Add a folder from your computer and Garuda will start building
              its searchable file intelligence.
            </p>
            <button
              type="button"
              className="empty-add-btn"
              onClick={handleAddFolder}
              disabled={addingFolder}
            >
              {addingFolder ? "Connecting..." : "+ Add your first folder"}
            </button>
          </div>
        ) : (
          <div className="smart-folder-list">
            {filteredFolders.map((folderPath, index) => {
              const folderName = getFolderName(folderPath);
              const isRemoving = removingFolder === folderPath;
              const isReindexing = reindexingFolder === folderPath;
              const metrics = folderMetrics[folderPath] || { total: 0, pdfs: 0 };

              return (
                <div
                  className={`smart-folder-item ${isRemoving ? "removing" : ""}`}
                  key={folderPath}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="smart-folder-info">
                    <div className="smart-folder-icon-wrap">
                      <div className="smart-folder-icon">📂</div>
                      <span className="folder-online-dot" />
                    </div>

                    <div className="smart-folder-details">
                      <div className="folder-name-row">
                        <h3>{folderName}</h3>
                        <span className="folder-tag-pill">Indexed</span>
                      </div>

                      <p
                        className="smart-custom-folder-path"
                        title={folderPath}
                      >
                        {folderPath}
                      </p>
                    </div>
                  </div>

                  {/* METRIC BADGES (PDF vs Total) */}
                  <div className="folder-metrics">
                    <div className="metric-badge">
                      <span className="metric-num">{metrics.pdfs}</span>
                      <span className="metric-label">PDFs</span>
                    </div>

                    <div className="metric-badge">
                      <span className="metric-num">{metrics.total}</span>
                      <span className="metric-label">Files</span>
                    </div>

                    <div className="folder-index-status">
                      <span className="index-pulse" />
                      <span>Ready</span>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="smart-folder-actions">
                    <button
                      type="button"
                      className={`folder-action-btn reindex ${
                        isReindexing ? "spinning" : ""
                      }`}
                      onClick={() => handleReindexFolder(folderPath)}
                      disabled={isReindexing}
                      title="Re-index this folder"
                      aria-label={`Re-index ${folderName}`}
                    >
                      <span>🔄</span>
                    </button>

                    <button
                      type="button"
                      className="folder-action-btn remove"
                      onClick={() => handleRemoveFolder(folderPath)}
                      disabled={isRemoving}
                      aria-label={`Remove ${folderName}`}
                      title="Remove folder"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* FOOTER POLISH */}
        <div className="smart-footer-card">
          <div className="footer-icon">💡</div>
          <div>
            <h3>How Smart Folders work</h3>
            <p>
              Garuda keeps the selected folders connected to its local File
              Intelligence system. Supported files are scanned and indexed
              so you can ask Garuda about their contents without cloud exposure.
            </p>
          </div>
          <div className="footer-status">
            <span />
            Local
          </div>
        </div>
      </div>
    </div>
  );
}

export default SmartFolders;