import React, { useRef, useEffect } from "react";

import {
    motion,
    AnimatePresence,
} from "framer-motion";

import {
    PDF_TOOL_PROMPTS,
} from "../../utils/pdfToolPrompts";

import "./AiToolsMenu.css";


function AiToolsMenu({
    open,
    onClose,
    onToolSelect,
}) {

    // ======================================================
    // REF FOR OUTSIDE CLICK HANDLING
    // ======================================================
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                onClose?.();
            }
        };

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open, onClose]);

    // ======================================================
    // PDF AI TOOLS
    // ======================================================

    const tools = [

        {
            id: "summarize",

            icon: "📝",

            title: "Summarize",

            description:
                "Create a concise summary",

            prompt:
                PDF_TOOL_PROMPTS.summarize,

            x: -170,

            y: 0,
        },


        {
            id: "notes",

            icon: "📚",

            title: "Notes",

            description:
                "Generate detailed study notes",

            prompt:
                PDF_TOOL_PROMPTS.notes,

            x: -110,

            y: -110,
        },


        {
            id: "flashcards",

            icon: "🧠",

            title: "Flashcards",

            description:
                "Generate flashcards for quick revision",

            prompt:
                PDF_TOOL_PROMPTS.flashcards,

            x: 0,

            y: -170,
        },


        {
            id: "quiz",

            icon: "❓",

            title: "Quiz",

            description:
                "Generate practice quiz questions",

            prompt:
                PDF_TOOL_PROMPTS.quiz,

            x: 110,

            y: -110,
        },


        {
            id: "interview",

            icon: "💼",

            title: "Interview",

            description:
                "Generate interview preparation questions",

            prompt:
                PDF_TOOL_PROMPTS.interview,

            x: 170,

            y: 0,
        },


        {
            id: "mindmap",

            icon: "🗺️",

            title: "Mind Map",

            description:
                "Create a visual mind map breakdown",

            prompt:
                PDF_TOOL_PROMPTS.mindmap,

            x: 110,

            y: 110,
        },


        {
            id: "cheatsheet",

            icon: "📋",

            title: "Cheat Sheet",

            description:
                "Create a quick reference sheet",

            prompt:
                PDF_TOOL_PROMPTS.cheatsheet,

            x: 0,

            y: 170,
        },


        {
            id: "keytopics",

            icon: "⭐",

            title: "Key Topics",

            description:
                "List important topics and concepts",

            prompt:
                PDF_TOOL_PROMPTS.keytopics,

            x: -110,

            y: 110,
        },

    ];


    // ======================================================
    // TOOL CLICK
    // ======================================================

    const handleToolSelect = (
        tool
    ) => {

        if (
            !tool?.prompt
        ) {

            console.warn(
                "⚠️ PDF tool has no prompt:",
                tool?.id
            );

            return;
        }


        console.log(
            "🦅 PDF AI Tool selected:",
            tool.title
        );


        console.log(
            "📝 PDF prompt:",
            tool.prompt
        );


        // --------------------------------------------------
        // Send prompt to InputBar
        // --------------------------------------------------

        onToolSelect?.(
            tool.prompt
        );


        // --------------------------------------------------
        // Close radial menu
        // --------------------------------------------------

        onClose?.();

    };


    // ======================================================
    // RENDER
    // ======================================================

    return (

        <AnimatePresence>

            {open && (

                <div ref={menuRef} style={{ position: "absolute", display: "inline-block" }}>
                {/* ==================================================
                    BACKGROUND OVERLAY
                ================================================== */}

                <motion.div

                    className="ai-tools-overlay"

                    initial={{
                        opacity: 0,
                    }}

                    animate={{
                        opacity: 1,
                    }}

                    exit={{
                        opacity: 0,
                    }}

                    transition={{
                        duration: 0.2,
                    }}

                    onClick={
                        onClose
                    }

                    aria-hidden="true"

                />


                {/* ==================================================
                    RADIAL MENU
                ================================================== */}

                <motion.div

                    className="ai-tools-menu"

                    role="menu"

                    aria-label="Garuda AI PDF tools"

                    initial={{
                        scale: 0.75,
                        opacity: 0,
                    }}

                    animate={{
                        scale: 1,
                        opacity: 1,
                    }}

                    exit={{
                        scale: 0.75,
                        opacity: 0,
                    }}

                    transition={{
                        duration: 0.25,
                        ease: "easeOut",
                    }}

                >

                    {tools.map(
                        (
                            tool,
                            index
                        ) => (

                            <motion.button

                                key={
                                    tool.id
                                }

                                type="button"

                                className="ai-tool-button"

                                role="menuitem"

                                title={
                                    tool.description
                                }

                                aria-label={
                                    `${tool.title}: ${tool.description}`
                                }

                                style={{
                                    left:
                                        `calc(50% + ${tool.x}px)`,

                                    top:
                                        `calc(50% + ${tool.y}px)`,
                                }}

                                initial={{
                                    scale: 0,
                                    opacity: 0,
                                }}

                                animate={{
                                    scale: 1,
                                    opacity: 1,
                                }}

                                exit={{
                                    scale: 0,
                                    opacity: 0,
                                }}

                                transition={{
                                    delay:
                                        index * 0.035,

                                    duration:
                                        0.2,

                                    ease:
                                        "easeOut",
                                }}

                                onClick={() =>
                                    handleToolSelect(
                                        tool
                                    )
                                }

                            >

                                {/* ==================================================
                                    ICON
                                ================================================== */}

                                <div
                                    className="ai-tool-icon"
                                    aria-hidden="true"
                                >
                                    {
                                        tool.icon
                                    }
                                </div>


                                {/* ==================================================
                                    TITLE
                                ================================================== */}

                                <div className="ai-tool-title">

                                    {
                                        tool.title
                                    }

                                </div>

                            </motion.button>

                        )
                    )}

                </motion.div>

                </div>

            )}

        </AnimatePresence>

    );

}


export default AiToolsMenu;