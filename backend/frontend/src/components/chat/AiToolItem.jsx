import "./AiToolItem.css";

function AiToolItem({ icon, title, onClick, style }) {
    return (
        <button
            className="ai-tool-item"
            style={style}
            onClick={onClick}
        >
            <div className="ai-tool-icon">
                {icon}
            </div>

            <span className="ai-tool-title">
                {title}
            </span>
        </button>
    );
}

export default AiToolItem;