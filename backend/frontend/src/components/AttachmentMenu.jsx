import { useEffect, useRef } from "react";
import "../styles/attachment-menu.css";

function AttachmentMenu({ onAction, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose?.();
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [onClose]);

  const actions = [
    { icon: "📝", title: "Summarize", action: "summary" },
    { icon: "📚", title: "Study Notes", action: "notes" },
    { icon: "🧠", title: "Flashcards", action: "flashcards" },
    { icon: "❓", title: "Quiz (MCQs)", action: "quiz" },
    { icon: "💼", title: "Interview Q&A", action: "interview" },
    { icon: "📊", title: "Mind Map", action: "mindmap" },
    { icon: "📋", title: "Cheat Sheet", action: "cheatsheet" },
    { icon: "⭐", title: "Key Topics", action: "keytopics" },
  ];

  return (
    <div ref={menuRef} className="attachment-menu">
      <div className="menu-header">✨ Smart PDF Tools</div>
      <div className="attachment-menu-scroll">
        {actions.map((item) => (
          <button
            key={item.action}
            type="button"
            className="attachment-menu-item"
            onClick={() => {
              onAction(item.action);
              onClose?.();
            }}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-title">{item.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default AttachmentMenu;