import "./PdfToolsPanel.css";

function PdfToolButton({ icon, title, description, onClick }) {
    return (
        <button
            className="pdf-tool-button"
            onClick={onClick}
        >
            <div className="pdf-tool-icon">
                {icon}
            </div>

            <div className="pdf-tool-content">
                <h4>{title}</h4>
                <p>{description}</p>
            </div>
        </button>
    );
}

export default PdfToolButton;