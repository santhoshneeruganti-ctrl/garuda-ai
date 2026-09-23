import PdfToolCard from "./PdfToolCard";
import PdfToolButton from "./PdfToolButton";
import "./PdfToolsPanel.css";

function PdfToolsPanel({
    currentChatId,
    onSummarize,
    onCompare,
    onAction
}) {

    const tools = [
        {
            icon: "⚖️",
            title: "Compare PDFs",
            description: "Compare attached documents",
            onClick: onCompare
        },

        {
            icon: "📝",
            title: "Summarize",
            description: "Generate a concise summary",
            onClick: onSummarize
        },

        {
            icon: "📚",
            title: "Notes",
            description: "Generate study notes",
            onClick: () => onAction?.("notes")
        },

        {
            icon: "🧠",
            title: "Flashcards",
            description: "Create flashcards",
            onClick: () => onAction?.("flashcards")
        },

        {
            icon: "❓",
            title: "Quiz",
            description: "Generate quiz questions",
            onClick: () => onAction?.("quiz")
        },

        {
            icon: "💼",
            title: "Interview",
            description: "Interview preparation",
            onClick: () => onAction?.("interview")
        },

        {
            icon: "📊",
            title: "Mind Map",
            description: "Visual topic breakdown",
            onClick: () => onAction?.("mindmap")
        },

        {
            icon: "📋",
            title: "Cheat Sheet",
            description: "Quick revision",
            onClick: () => onAction?.("cheat_sheet")
        },

        {
            icon: "⭐",
            title: "Key Topics",
            description: "Important concepts",
            onClick: () => onAction?.("key_topics")
        }
    ];

    return (
        <PdfToolCard>

            <h2 className="pdf-tools-title">
                ✨ Smart PDF Studio
            </h2>

            <p className="pdf-tools-subtitle">
                Choose an AI tool for your PDF
            </p>

            <div className="pdf-tools-grid">

                {tools.map((tool) => (
                    <PdfToolButton
                        key={tool.title}
                        icon={tool.icon}
                        title={tool.title}
                        description={tool.description}
                        onClick={tool.onClick}
                    />
                ))}

            </div>

        </PdfToolCard>
    );
}

export default PdfToolsPanel;