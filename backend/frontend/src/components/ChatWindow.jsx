import React, {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import CodeBlock from "./CodeBlock";
import MiniQuestionBox from "./chat/MiniQuestionBox";
import { API_BASE_URL } from "../config/api";

import "../styles/chat.css";

// ======================================================
// 🧩 INTERACTIVE SOURCE CITATION BADGE
// ======================================================

const SourceCitationBadge = memo(function SourceCitationBadge({ sourceText }) {
  const handleClick = useCallback(() => {
    const match = /\[Source:\s*([^\]\(\)]+?)(?:\s*\([^\)]+\))?\]/i.exec(sourceText);
    const fileName = match ? match[1].trim() : sourceText;

    if (window.electronAPI?.openFile) {
      window.electronAPI.openFile(fileName);
    } else {
      console.log("📄 Source document reference:", fileName);
    }
  }, [sourceText]);

  const label = sourceText.replace(/^\[Source:\s*/i, "").replace(/\]$/, "");

  return (
    <span
      className="inline-citation-badge"
      onClick={handleClick}
      title={`Open referenced source: ${label}`}
    >
      <span className="citation-icon">📌</span>
      <span className="citation-text">{label}</span>
    </span>
  );
});

// ======================================================
// 🧩 MEMOIZED CODE RENDERER
// ======================================================

const MarkdownCode = memo(function MarkdownCode({
  className,
  children,
  ...props
}) {
  const match = /language-(\w+)/.exec(className || "");

  if (match) {
    return (
      <CodeBlock language={match[1]}>
        {String(children).replace(/\n$/, "")}
      </CodeBlock>
    );
  }

  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
});

// ======================================================
// 🧩 MEMOIZED MARKDOWN WITH CITATION PARSER
// ======================================================

const MarkdownResponse = memo(function MarkdownResponse({ text }) {
  if (!text?.trim()) {
    return null;
  }

  const renderTextWithCitations = useMemo(() => {
    const citationRegex = /(\[Source:\s*[^\]]+\])/gi;
    if (!citationRegex.test(text)) {
      return (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{ code: MarkdownCode }}
        >
          {text}
        </ReactMarkdown>
      );
    }

    const parts = text.split(citationRegex);
    return (
      <div className="garuda-markdown-stream">
        {parts.map((part, index) => {
          if (part.startsWith("[Source:") && part.endsWith("]")) {
            return <SourceCitationBadge key={index} sourceText={part} />;
          }
          return (
            <ReactMarkdown
              key={index}
              remarkPlugins={[remarkGfm]}
              components={{ code: MarkdownCode }}
            >
              {part}
            </ReactMarkdown>
          );
        })}
      </div>
    );
  }, [text]);

  return renderTextWithCitations;
});

// ======================================================
// 🧩 PDF ATTACHMENT CHIPS
// ======================================================

const PdfAttachments = memo(function PdfAttachments({ pdfs = [] }) {
  if (!Array.isArray(pdfs) || pdfs.length === 0) {
    return null;
  }

  return (
    <div className="message-pdf-attachments">
      {pdfs.map((pdf) => (
        <div
          key={pdf.id}
          className="message-pdf-chip"
          title={pdf.name || pdf.file_name}
        >
          <span className="message-pdf-icon">📄</span>
          <span className="message-pdf-name">{pdf.name || pdf.file_name}</span>
        </div>
      ))}
    </div>
  );
});

// ======================================================
// 🧩 IMAGE ATTACHMENTS
// ======================================================

const ImageAttachments = memo(function ImageAttachments({ images = [] }) {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!Array.isArray(images) || images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="message-image-attachments">
        {images.map((image, index) => {
          const imageId = image.id || image.image_id;
          if (!imageId) return null;

          const imageUrl =
            image.url || `${API_BASE_URL}/image/view/${imageId}`;

          return (
            <button
              key={imageId || index}
              type="button"
              className="message-image-button"
              onClick={() => setSelectedImage(imageUrl)}
              title="Open image"
            >
              <img
                src={imageUrl}
                alt={image.name || "Uploaded image"}
                className="message-uploaded-image"
              />
            </button>
          );
        })}
      </div>

      {selectedImage && (
        <div
          className="image-viewer-overlay"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            className="image-viewer-close"
            onClick={() => setSelectedImage(null)}
            aria-label="Close image"
          >
            ✕
          </button>
          <div
            className="image-viewer-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Full size uploaded image"
              className="image-viewer-image"
            />
          </div>
        </div>
      )}
    </>
  );
});

// ======================================================
// 🧩 GARUDA MESSAGE
// ======================================================

const GarudaMessage = memo(function GarudaMessage({
  message,
  originalQuestion,
  pdfAttachments,
  isLastMessage,
  loading,
  currentChatId,
  onRegenerate,
  onCopy,
}) {
 const hasResponse = Boolean(message.text?.trim());

const hasPdf =
  Array.isArray(pdfAttachments) &&
  pdfAttachments.length > 0;

const showThinking =
  loading &&
  isLastMessage &&
  !hasResponse;

  return (
    <div className="garuda-response-content">
      <PdfAttachments pdfs={pdfAttachments} />

     {showThinking && (
  <div className="garuda-thinking">
    <span className="garuda-thinking-eagle">🦅</span>

    <span className="garuda-thinking-text">
      {hasPdf
        ? "Garuda is analyzing documents..."
        : "Garuda is thinking..."}
    </span>
  </div>
)}

      <MarkdownResponse text={message.text} />

      {message.text?.trim() && !loading && (
        <MiniQuestionBox
          originalQuestion={originalQuestion}
          originalAnswer={message.text}
          currentChatId={currentChatId}
        />
      )}

      {isLastMessage && !loading && message.text?.trim() && (
        <div className="message-actions">
          <button
            type="button"
            className="action-btn"
            title="Copy response"
            onClick={() => onCopy(message.text)}
          >
            📋
          </button>
          <button type="button" className="action-btn" title="Like response">
            👍
          </button>
          <button type="button" className="action-btn" title="Dislike response">
            👎
          </button>
          <button
            type="button"
            className="action-btn"
            title="Regenerate"
            onClick={onRegenerate}
          >
            🔄
          </button>
        </div>
      )}
    </div>
  );
});

// ======================================================
// 🧩 CHAT WINDOW
// ======================================================

function ChatWindow({
  messages,
  loading,
  currentChatId,
  onRegenerate,
  onCopy,
  onEdit,
}) {
  const bottomRef = useRef(null);
  const chatWindowRef = useRef(null);

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  const userHasScrolledRef = useRef(false);
  const scrollFrameRef = useRef(null);

  const isNearBottom = useCallback(() => {
    const container = chatWindowRef.current;
    if (!container) return true;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    return distanceFromBottom <= 120;
  }, []);

  const handleScroll = useCallback(() => {
    const container = chatWindowRef.current;
    if (!container) return;
    userHasScrolledRef.current = !isNearBottom();
  }, [isNearBottom]);

  const scrollToBottom = useCallback(() => {
    const container = chatWindowRef.current;
    if (!container) return;

    const isElectron =
      typeof window !== "undefined" && Boolean(window.electronAPI);
    if (isElectron) {
      container.style.scrollBehavior = "auto";
    }

    container.scrollTop = container.scrollHeight;
  }, []);

  useEffect(() => {
    if (!messages.length || userHasScrolledRef.current) return;

    if (scrollFrameRef.current !== null) {
      cancelAnimationFrame(scrollFrameRef.current);
    }

    scrollFrameRef.current = requestAnimationFrame(() => {
      scrollFrameRef.current = null;
      if (!userHasScrolledRef.current) {
        scrollToBottom();
      }
    });

    return () => {
      if (scrollFrameRef.current !== null) {
        cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }
    };
  }, [messages, scrollToBottom]);

  useEffect(() => {
    userHasScrolledRef.current = false;
    if (scrollFrameRef.current !== null) {
      cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = null;
    }

    const frame = requestAnimationFrame(() => {
      scrollToBottom();
    });

    return () => cancelAnimationFrame(frame);
  }, [currentChatId, scrollToBottom]);

  const startEditing = useCallback((msg, index) => {
    const messageId = msg.id !== undefined ? msg.id : index;
    setEditingMessageId(messageId);
    setEditText(msg.text || "");
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingMessageId(null);
    setEditText("");
  }, []);

  const handleSaveEdit = useCallback(
    (targetId) => {
      if (!editText.trim()) return;
      onEdit(targetId, editText);
      setEditingMessageId(null);
      setEditText("");
    },
    [editText, onEdit]
  );

  const handleCopyUserMessage = useCallback(
    async (messageText, messageId) => {
      const textToCopy = typeof messageText === "string" ? messageText : "";
      if (!textToCopy.trim()) return;

      let copied = false;
      try {
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        copied = document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch {}

      if (!copied && navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(textToCopy);
          copied = true;
        } catch {}
      }

      if (copied) {
        setCopiedMessageId(messageId);
        window.setTimeout(() => {
          setCopiedMessageId((curr) => (curr === messageId ? null : curr));
        }, 1800);
      }
    },
    []
  );

  // EMPTY CHAT WELCOME VIEW (REMOVED DUPLICATE PdfToolsPanel)
  if (!messages || messages.length === 0) {
    return (
      <div className="chat-window" ref={chatWindowRef}>
        <div className="welcome">
          <h2>🦅 Welcome to Garuda AI</h2>
          <p>
            Ask me anything across all your connected PDF documents, notes,
            or study material.
          </p>
        </div>
        <div ref={bottomRef} />
      </div>
    );
  }

  return (
    <div
      className="chat-window"
      ref={chatWindowRef}
      onScroll={handleScroll}
    >
      {messages.map((msg, index) => {
        const isGaruda = msg.sender === "garuda";
        const isLastMessage = index === messages.length - 1;
        const currentMsgIdentifier = msg.id !== undefined ? msg.id : index;
        const isEditingThis = editingMessageId === currentMsgIdentifier;

        const responsePdfAttachments =
          isGaruda &&
          index > 0 &&
          Array.isArray(messages[index - 1]?.uploaded_pdfs)
            ? messages[index - 1].uploaded_pdfs
            : [];

        return (
          <div
            key={currentMsgIdentifier}
            className={`message ${isGaruda ? "garuda" : "user"}`}
          >
            {isGaruda ? (
              <GarudaMessage
                message={msg}
                originalQuestion={messages[index - 1]?.text || ""}
                pdfAttachments={responsePdfAttachments}
                isLastMessage={isLastMessage}
                loading={loading}
                currentChatId={currentChatId}
                onRegenerate={onRegenerate}
                onCopy={onCopy}
              />
            ) : (
              <div className="user-message-container">
                {isEditingThis ? (
                  <div className="edit-box">
                    <textarea
                      className="edit-textarea"
                      value={editText}
                      onChange={(event) => setEditText(event.target.value)}
                      rows={3}
                    />
                    <div className="edit-actions">
                      <button
                        type="button"
                        className="save-btn"
                        onClick={() => handleSaveEdit(currentMsgIdentifier)}
                        disabled={loading}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={cancelEditing}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="user-message-content">
                    <ImageAttachments images={msg.uploaded_images} />
                    <div className="user-question-bubble">
                      <PdfAttachments pdfs={msg.uploaded_pdfs} />
                      <div className="user-question-text">{msg.text}</div>

                      {!loading && (
                        <div className="user-message-actions">
                          <button
                            type="button"
                            className="action-btn edit-icon-btn"
                            title="Edit prompt"
                            onClick={() => startEditing(msg, index)}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="action-btn copy-user-message-btn"
                            title={
                              copiedMessageId === currentMsgIdentifier
                                ? "Copied"
                                : "Copy message"
                            }
                            onClick={() =>
                              handleCopyUserMessage(
                                msg.text,
                                currentMsgIdentifier
                              )
                            }
                          >
                            {copiedMessageId === currentMsgIdentifier
                              ? "✓"
                              : "📋"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

export default ChatWindow;