import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import useGarudaAssistant from "../../hooks/useGarudaAssistant";
import { executeGarudaCommand } from "../../services/garudaCommandEngine";

import "./FloatingGaruda.css";

function FloatingGaruda() {
    const isElectron =
        Boolean(window.electronAPI) ||
        navigator.userAgent.toLowerCase().includes("electron");

    const [enabled, setEnabled] = useState(false);
    const [visible, setVisible] = useState(isElectron);
    const [statusMessage, setStatusMessage] = useState("");
    const [fileOptions, setFileOptions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const [browserPosition, setBrowserPosition] = useState(() => {
        if (typeof window === "undefined") {
            return { x: 0, y: 0 };
        }

        return {
            x: Math.max(20, window.innerWidth - 120),
            y: Math.max(20, window.innerHeight - 130),
        };
    });

    const isDraggingRef = useRef(false);
    const hasMovedRef = useRef(false);

    const dragStartRef = useRef({
        mouseX: 0,
        mouseY: 0,
        garudaX: 0,
        garudaY: 0,
    });

    // ==================================================
    // DYNAMIC ELECTRON WINDOW RESIZE (EXPAND ON MODAL)
    // ==================================================
    useEffect(() => {
        if (!isElectron || !window.electronAPI?.resizeFloatingGaruda) return;

        if (fileOptions.length > 0) {
            window.electronAPI.resizeFloatingGaruda(380, 430);
        } else {
            window.electronAPI.resizeFloatingGaruda(170, 120);
        }
    }, [fileOptions, isElectron]);

    const handleDirectFileClick = useCallback(async (filePath) => {
        if (!filePath || !window.electronAPI?.openFile) return;

        setStatusMessage("Opening PDF...");
        setFileOptions([]);
        await window.electronAPI.openFile(filePath);

        setTimeout(() => {
            setStatusMessage("");
        }, 3000);
    }, []);

    const handleCommand = useCallback(async (command) => {
        if (!command || typeof command !== "string") {
            return;
        }

        const cleanCommand = command.trim();
        if (!cleanCommand) {
            return;
        }

        console.log("🦅 Floating Garuda command:", cleanCommand);
        setIsSearching(true);
        setStatusMessage("Searching...");

        try {
            const result = await executeGarudaCommand(cleanCommand);
            setIsSearching(false);

            if (result?.requiresFileSelection && Array.isArray(result?.files) && result.files.length > 0) {
                setFileOptions(result.files);
                setStatusMessage("Multiple matches found");
                return result;
            }

            setFileOptions([]);

            if (result?.garudaFileContext && result?.backendMessage) {
                setStatusMessage("Document context ready");
                if (window.electronAPI?.sendAiContext) {
                    await window.electronAPI.sendAiContext({
                        topic: result.topic || cleanCommand,
                        backendMessage: result.backendMessage,
                        userQuery: cleanCommand,
                    });
                }
                setTimeout(() => setStatusMessage(""), 3500);
                return result;
            }

            if (result?.handled) {
                console.log("✅ Garuda action:", result.message);
                setStatusMessage(result.message || "Done");
                setTimeout(() => setStatusMessage(""), 4000);
                return result;
            }

            console.log("🤖 Unknown Garuda command:", cleanCommand);
            setStatusMessage("");
            return {
                handled: false,
                message: "Unknown Garuda command.",
            };
        } catch (error) {
            setIsSearching(false);
            console.error("❌ Garuda command error:", error);
            setStatusMessage("Error");
            setFileOptions([]);
            setTimeout(() => setStatusMessage(""), 3000);
            return {
                handled: false,
                message: error?.message || "Garuda command failed.",
            };
        }
    }, []);

    useGarudaAssistant(enabled, handleCommand);

    useEffect(() => {
        if (isElectron) {
            return undefined;
        }

        const handleFloatingToggle = (event) => {
            const nextState = Boolean(event.detail?.enabled);
            setVisible(nextState);

            if (!nextState) {
                setEnabled(false);
                setFileOptions([]);
            }
        };

        window.addEventListener("garuda-floating-toggle", handleFloatingToggle);

        return () => {
            window.removeEventListener(
                "garuda-floating-toggle",
                handleFloatingToggle
            );
        };
    }, [isElectron]);

    const moveFloatingGaruda = useCallback(
        async (x, y) => {
            if (
                typeof window === "undefined" ||
                !isElectron ||
                !window.electronAPI ||
                typeof window.electronAPI.moveFloatingGaruda !== "function"
            ) {
                return;
            }

            const targetX = Number(x);
            const targetY = Number(y);

            if (!Number.isFinite(targetX) || !Number.isFinite(targetY)) {
                return;
            }

            try {
                await window.electronAPI.moveFloatingGaruda(targetX, targetY);
            } catch (error) {
                console.error("❌ Floating Garuda move failed:", error);
            }
        },
        [isElectron]
    );

    const handleMouseDown = useCallback(
        async (event) => {
            if (event.button !== 0) {
                return;
            }

            event.preventDefault();
            hasMovedRef.current = false;

            const mouseX = isElectron ? event.screenX : event.clientX;
            const mouseY = isElectron ? event.screenY : event.clientY;

            if (isElectron) {
                if (
                    !window.electronAPI ||
                    typeof window.electronAPI.getFloatingGarudaPosition !== "function"
                ) {
                    return;
                }

                try {
                    const result = await window.electronAPI.getFloatingGarudaPosition();

                    if (!result?.success || !Number.isFinite(result.x) || !Number.isFinite(result.y)) {
                        return;
                    }

                    dragStartRef.current = {
                        mouseX,
                        mouseY,
                        garudaX: result.x,
                        garudaY: result.y,
                    };

                    isDraggingRef.current = true;
                } catch (error) {
                    return;
                }
            } else {
                dragStartRef.current = {
                    mouseX,
                    mouseY,
                    garudaX: browserPosition.x,
                    garudaY: browserPosition.y,
                };

                isDraggingRef.current = true;
            }
        },
        [isElectron, browserPosition.x, browserPosition.y]
    );

    const handleMouseMove = useCallback(
        (event) => {
            if (!isDraggingRef.current) {
                return;
            }

            const start = dragStartRef.current;
            const mouseX = isElectron ? event.screenX : event.clientX;
            const mouseY = isElectron ? event.screenY : event.clientY;

            const deltaX = mouseX - start.mouseX;
            const deltaY = mouseY - start.mouseY;

            if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
                return;
            }

            hasMovedRef.current = true;

            if (isElectron) {
                const targetX = start.garudaX + deltaX;
                const targetY = start.garudaY + deltaY;
                moveFloatingGaruda(targetX, targetY);
            } else {
                const maxX = Math.max(8, window.innerWidth - 90);
                const maxY = Math.max(8, window.innerHeight - 90);

                setBrowserPosition({
                    x: Math.min(Math.max(8, start.garudaX + deltaX), maxX),
                    y: Math.min(Math.max(8, start.garudaY + deltaY), maxY),
                });
            }
        },
        [isElectron, moveFloatingGaruda]
    );

    const handleMouseUp = useCallback(() => {
        if (!isDraggingRef.current) {
            return;
        }

        isDraggingRef.current = false;

        if (!hasMovedRef.current) {
            setEnabled((previous) => !previous);
            setFileOptions([]);
        }

        hasMovedRef.current = false;
    }, []);

    useEffect(() => {
        const onMouseMove = (event) => handleMouseMove(event);
        const onMouseUp = () => handleMouseUp();

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);

        const stopDragging = () => {
            isDraggingRef.current = false;
            hasMovedRef.current = false;
        };

        window.addEventListener("blur", stopDragging);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            window.removeEventListener("blur", stopDragging);
        };
    }, [handleMouseMove, handleMouseUp]);

    useEffect(() => {
        if (isElectron) {
            return undefined;
        }

        const handleResize = () => {
            setBrowserPosition((previous) => {
                const maxX = Math.max(0, window.innerWidth - 90);
                const maxY = Math.max(0, window.innerHeight - 90);

                return {
                    x: Math.min(previous.x, maxX),
                    y: Math.min(previous.y, maxY),
                };
            });
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [isElectron]);

    if (!visible) {
        return null;
    }

    const browserStyle = isElectron
        ? undefined
        : {
              left: `${browserPosition.x}px`,
              top: `${browserPosition.y}px`,
          };

    return (
        <div className="floating-garuda-container">
            {/* MULTIPLE MATCHES SELECTION CARD MODAL */}
            {fileOptions && fileOptions.length > 0 && (
                <div
                    className="garuda-selection-modal"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <div className="garuda-modal-header">
                        <div className="garuda-header-title">
                            <span className="garuda-header-icon">🦅</span>
                            <span>I found similar topics in your files</span>
                        </div>
                        <button
                            type="button"
                            className="garuda-modal-close"
                            onClick={() => setFileOptions([])}
                        >
                            ×
                        </button>
                    </div>

                    <div className="garuda-options-list">
                        {fileOptions.map((file, index) => (
                            <button
                                key={file.path || index}
                                type="button"
                                className="garuda-file-card-btn"
                                onClick={() => handleDirectFileClick(file.path)}
                            >
                                <div className="garuda-badge-num">{file.index || index + 1}</div>
                                
                                <div className="garuda-pdf-icon-box">
                                    <span className="pdf-icon-label">PDF</span>
                                </div>

                                <div className="garuda-file-info">
                                    <span className="garuda-file-title">
                                        {file.name}
                                    </span>
                                    <span className="garuda-file-sub">
                                        {file.path}
                                    </span>
                                </div>
                                <span className="garuda-arrow-icon">›</span>
                            </button>
                        ))}
                    </div>

                    <div className="garuda-modal-footer">
                        <span>💡 Click a file to open it, or say the number</span>
                    </div>
                </div>
            )}

            {/* FLOATING GARUDA AVATAR BUTTON */}
            <div
                className={`floating-garuda-wrapper ${
                    isElectron ? "garuda-electron" : "garuda-browser"
                } ${enabled ? "garuda-active" : ""} ${
                    isDraggingRef.current ? "garuda-dragging" : ""
                } ${isSearching ? "garuda-processing" : ""}`}
                style={{ ...browserStyle, touchAction: "none" }}
                onMouseDown={handleMouseDown}
                onDragStart={(event) => event.preventDefault()}
            >
                <button
                    type="button"
                    className={
                        enabled
                            ? "floating-garuda-button active"
                            : "floating-garuda-button"
                    }
                    title={
                        statusMessage ||
                        (enabled
                            ? "Garuda Listening • Click to turn OFF • Drag to move"
                            : "Garuda OFF • Click to turn ON • Drag to move")
                    }
                    aria-label={enabled ? "Garuda ON" : "Garuda OFF"}
                    aria-pressed={enabled}
                    onClick={(event) => event.preventDefault()}
                    draggable={false}
                >
                    🦅
                </button>

                {statusMessage && !fileOptions.length && (
                    <div className="floating-garuda-status-bubble">
                        {statusMessage}
                    </div>
                )}
            </div>
        </div>
    );
}

export default FloatingGaruda;