import React, {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    Copy,
    Check,
} from "lucide-react";

import {
    Prism as SyntaxHighlighter,
} from "react-syntax-highlighter";

import {
    oneDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";


// ======================================================
// CODE BLOCK
// ======================================================

function CodeBlock({
    language,
    children,
}) {

    const [copied, setCopied] = useState(false);

    const copyTimerRef = useRef(null);


    // ==================================================
    // CLEAN CODE
    // ==================================================

    const codeText = useMemo(() => {

        return String(
            children ?? ""
        ).replace(
            /\n$/,
            ""
        );

    }, [children]);


    // ==================================================
    // SAFE LANGUAGE
    // ==================================================

    const safeLanguage = useMemo(() => {

        return (
            language ||
            "text"
        ).toLowerCase();

    }, [language]);


    // ==================================================
    // COPY CODE
    // ==================================================

    const copyCode = useCallback(
        async () => {

            try {

                // --------------------------------------
                // ELECTRON
                // --------------------------------------

                if (
                    window.electronAPI &&
                    typeof window.electronAPI.writeClipboard ===
                        "function"
                ) {

                    await window.electronAPI.writeClipboard(
                        codeText
                    );

                }

                // --------------------------------------
                // BROWSER
                // --------------------------------------

                else if (
                    navigator.clipboard &&
                    typeof navigator.clipboard.writeText ===
                        "function"
                ) {

                    await navigator.clipboard.writeText(
                        codeText
                    );

                }

                // --------------------------------------
                // OLD BROWSER FALLBACK
                // --------------------------------------

                else {

                    const textarea =
                        document.createElement(
                            "textarea"
                        );

                    textarea.value =
                        codeText;

                    textarea.style.position =
                        "fixed";

                    textarea.style.opacity =
                        "0";

                    document.body.appendChild(
                        textarea
                    );

                    textarea.focus();

                    textarea.select();

                    const successful =
                        document.execCommand(
                            "copy"
                        );

                    document.body.removeChild(
                        textarea
                    );

                    if (!successful) {
                        throw new Error(
                            "Clipboard copy failed."
                        );
                    }
                }


                // --------------------------------------
                // SUCCESS
                // --------------------------------------

                console.log(
                    "📋 Code copied successfully"
                );

                setCopied(true);


                // Clear previous timer

                if (
                    copyTimerRef.current
                ) {

                    clearTimeout(
                        copyTimerRef.current
                    );
                }


                // Reset after 2 seconds

                copyTimerRef.current =
                    setTimeout(() => {

                        setCopied(false);

                        copyTimerRef.current =
                            null;

                    }, 2000);

            } catch (error) {

                console.error(
                    "❌ Code copy failed:",
                    error
                );

                setCopied(false);
            }

        },
        [codeText]
    );


    // ==================================================
    // CLEAN TIMER
    // ==================================================

    useEffect(() => {

        return () => {

            if (
                copyTimerRef.current
            ) {

                clearTimeout(
                    copyTimerRef.current
                );

                copyTimerRef.current =
                    null;
            }

        };

    }, []);


    // ==================================================
    // RENDER
    // ==================================================

    return (

        <div
            style={{
                position: "relative",
                margin: "18px 0",
                maxWidth: "100%",
                overflow: "hidden",
            }}
        >

            {/* =========================================
                CODE HEADER
            ========================================= */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",

                    background: "#111827",

                    color: "#D1D5DB",

                    padding: "10px 14px",

                    borderTopLeftRadius: "10px",
                    borderTopRightRadius: "10px",

                    borderBottom:
                        "1px solid #374151",

                    fontSize: "14px",

                    fontWeight: "600",
                }}
            >

                {/* LANGUAGE */}

                <span>
                    {safeLanguage.toUpperCase()}
                </span>


                {/* COPY */}

                <button
                    type="button"

                    onClick={copyCode}

                    aria-label={
                        copied
                            ? "Code copied"
                            : "Copy code"
                    }

                    title={
                        copied
                            ? "Copied"
                            : "Copy code"
                    }

                    style={{
                        display: "flex",

                        alignItems: "center",

                        gap: "6px",

                        border: "none",

                        background: "transparent",

                        color: "#D1D5DB",

                        cursor: "pointer",

                        fontSize: "13px",

                        padding: "4px 6px",

                        borderRadius: "6px",
                    }}
                >

                    {copied ? (

                        <>
                            <Check size={16} />
                            Copied
                        </>

                    ) : (

                        <>
                            <Copy size={16} />
                            Copy
                        </>

                    )}

                </button>

            </div>


            {/* =========================================
                CODE
            ========================================= */}

            <div
                style={{
                    maxWidth: "100%",
                    overflowX: "auto",
                }}
            >

                <SyntaxHighlighter
                    language={safeLanguage}

                    style={oneDark}

                    customStyle={{
                        margin: 0,

                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0,

                        borderBottomLeftRadius:
                            "10px",

                        borderBottomRightRadius:
                            "10px",

                        padding: "18px",

                        fontSize: "15px",

                        lineHeight: "1.6",

                        minWidth: "fit-content",

                        boxSizing: "border-box",
                    }}

                    wrapLongLines={false}

                    PreTag="pre"
                >
                    {codeText}
                </SyntaxHighlighter>

            </div>

        </div>
    );
}


// ======================================================
// MEMO
// ======================================================

export default memo(CodeBlock);