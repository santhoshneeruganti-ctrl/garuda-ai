import { useRef, useState, useEffect, useCallback } from "react";
import axios from "axios";

import AiToolsMenu from "./chat/AiToolsMenu";
import VoiceButton from "./voice/VoiceButton";
import "../styles/input.css";

// ============================================================
// API CONFIGURATION (Vite Environment Support)
// ============================================================

import { API_BASE_URL } from "../config/api";

// ============================================================
// COMPONENT
// ============================================================

function InputBar({
  message = "",
  setMessage,
  sendMessage,
  stopGeneration,
  loading = false,
  currentChatId,
  onEnsureChatCreated,
  onPdfUploaded,
  onPdfRemoved,
  onImageUploaded,
  onImageRemoved,
  onOpenCalculator,
}) {
  // ========================================================
  // REFS
  // ========================================================

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const attachmentMenuRef = useRef(null);
  const messageInputRef = useRef(null);

  // ========================================================
  // STATE
  // ========================================================

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showAiTools, setShowAiTools] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [floatingEnabled, setFloatingEnabled] = useState(false);

  // ========================================================
  // MEMORY LEAK CLEANUP FOR PREVIEW URLS ON UNMOUNT
  // ========================================================

  useEffect(() => {
    return () => {
      selectedImages.forEach((image) => {
        if (image?.previewUrl) {
          try {
            URL.revokeObjectURL(image.previewUrl);
          } catch {}
        }
      });
    };
  }, [selectedImages]);

  // ========================================================
  // AUTO-GROW MESSAGE INPUT
  // ========================================================

  const resizeMessageInput = (textarea) => {
    if (!textarea) return;

    textarea.style.height = "auto";

    const maxHeight = 150;

    const newHeight = Math.min(
      textarea.scrollHeight,
      maxHeight
    );

    textarea.style.height = `${newHeight}px`;

    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight
        ? "auto"
        : "hidden";
  };

  // ========================================================
  // OUTSIDE CLICK HANDLER FOR ATTACHMENT MENU
  // ========================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        attachmentMenuRef.current &&
        !attachmentMenuRef.current.contains(event.target)
      ) {
        setShowAttachmentMenu(false);
      }
    };

    if (showAttachmentMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAttachmentMenu]);

  // ========================================================
  // ELECTRON INTEGRATION
  // ========================================================

  const isElectronAvailable =
    typeof window !== "undefined" && !!window.electronAPI;

  const canUseFloatingGaruda =
    !isElectronAvailable ||
    typeof window.electronAPI?.setGarudaFloating === "function";

  const toggleFloatingGaruda = async () => {
    const nextState = !floatingEnabled;

    if (!isElectronAvailable) {
      setFloatingEnabled(nextState);

      window.dispatchEvent(
        new CustomEvent("garuda-floating-toggle", {
          detail: {
            enabled: nextState,
          },
        })
      );

      return;
    }

    if (!canUseFloatingGaruda) {
      console.warn(
        "Floating Garuda is unavailable in Electron."
      );

      return;
    }

    try {
      const result =
        await window.electronAPI.setGarudaFloating(
          nextState
        );

      if (result?.success === true) {
        setFloatingEnabled(
          result.enabled ?? nextState
        );
      } else {
        console.error(
          "Floating Garuda failed:",
          result
        );
      }
    } catch (error) {
      console.error(
        "Floating Garuda error:",
        error
      );
    }
  };

  // ========================================================
  // ENSURE CHAT SESSION
  // ========================================================

  const ensureChat = async () => {
    let chatId = currentChatId;

    if (
      chatId === null ||
      chatId === undefined
    ) {
      if (
        typeof onEnsureChatCreated !==
        "function"
      ) {
        throw new Error(
          "Chat creation handler is unavailable."
        );
      }

      chatId =
        await onEnsureChatCreated();

      if (
        chatId === null ||
        chatId === undefined
      ) {
        throw new Error(
          "Chat ID was not returned."
        );
      }
    }

    return chatId;
  };

  // ========================================================
  // FILE PICKERS
  // ========================================================

  const openFilePicker = async () => {
    if (loading || uploading) return;

    try {
      await ensureChat();

      setShowAttachmentMenu(false);

      fileInputRef.current?.click();
    } catch (error) {
      console.error(
        "Unable to prepare PDF upload:",
        error
      );
    }
  };

  const openImagePicker = async () => {
    if (loading || uploading) return;

    try {
      await ensureChat();

      setShowAttachmentMenu(false);

      imageInputRef.current?.click();
    } catch (error) {
      console.error(
        "Unable to prepare image upload:",
        error
      );
    }
  };

  // ========================================================
  // IMAGE REMOVAL & UPLOAD
  // ========================================================

  const removeSelectedImage = (index) => {
    setSelectedImages((previous) => {
      const image = previous[index];

      if (
        image?.imageId !== null &&
        image?.imageId !== undefined
      ) {
        onImageRemoved?.(
          image.imageId
        );
      }

      if (image?.previewUrl) {
        try {
          URL.revokeObjectURL(
            image.previewUrl
          );
        } catch {}
      }

      return previous.filter(
        (_, i) => i !== index
      );
    });

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleImageUpload = async (
    event
  ) => {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) return;

    let uploadChatId;

    try {
      uploadChatId =
        await ensureChat();
    } catch (error) {
      console.error(
        "Chat creation failed:",
        error
      );

      event.target.value = "";

      return;
    }

    const validImageFiles =
      files.filter((file) =>
        [
          "image/jpeg",
          "image/png",
          "image/webp",
        ].includes(file.type)
      );

    if (!validImageFiles.length) {
      alert(
        "Please select JPG, PNG or WEBP images only."
      );

      event.target.value = "";

      return;
    }

    const MAX_IMAGE_SIZE =
      10 * 1024 * 1024;

    const oversizedFiles =
      validImageFiles.filter(
        (file) =>
          file.size > MAX_IMAGE_SIZE
      );

    if (oversizedFiles.length) {
      alert(
        "Each image must be less than 10 MB."
      );

      event.target.value = "";

      return;
    }

    const temporaryImages =
      validImageFiles.map((file) => ({
        file,
        imageId: null,
        previewUrl:
          URL.createObjectURL(file),
        uploading: true,
      }));

    setSelectedImages(
      (previous) => [
        ...previous,
        ...temporaryImages,
      ]
    );

    setUploading(true);

    for (const item of temporaryImages) {
      const formData =
        new FormData();

      formData.append(
        "file",
        item.file
      );

      formData.append(
        "chat_id",
        String(uploadChatId)
      );

      try {
        const response =
          await axios.post(
            `${API_BASE_URL}/image/upload`,
            formData,
            {
              timeout: 120000,
            }
          );

        const uploadSucceeded =
          response.data?.status ===
            "success" ||
          response.data?.success ===
            true;

        if (!uploadSucceeded) {
          throw new Error(
            response.data?.detail ||
              response.data?.message ||
              "Image upload failed."
          );
        }

        const imageId =
          response.data?.image_id;

        if (!imageId) {
          throw new Error(
            "Image uploaded but image ID was not returned."
          );
        }

        setSelectedImages(
          (previous) =>
            previous.map((img) =>
              img.file === item.file
                ? {
                    ...img,
                    imageId,
                    uploading: false,
                  }
                : img
            )
        );

        onImageUploaded?.({
          id: imageId,
          name: item.file.name,
          mimeType: item.file.type,
          previewUrl: item.previewUrl,
          response: response.data,
        });
      } catch (error) {
        console.error(
          "Image upload error:",
          error
        );

        setSelectedImages(
          (previous) =>
            previous.filter(
              (img) =>
                img.file !== item.file
            )
        );

        try {
          URL.revokeObjectURL(
            item.previewUrl
          );
        } catch {}

        const errorMessage =
          error?.response?.data
            ?.detail ||
          error?.response?.data
            ?.message ||
          error?.message ||
          "Unable to upload image.";

        alert(
          `${item.file.name}: ${errorMessage}`
        );
      }
    }

    setUploading(false);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  // ========================================================
  // PDF REMOVAL & UPLOAD
  // ========================================================

  const removeSelectedFile = (index) => {
    setSelectedFiles((previous) => {
      const fileToRemove =
        previous[index];

      if (
        fileToRemove?.pdfId !== null &&
        fileToRemove?.pdfId !== undefined
      ) {
        onPdfRemoved?.(
          fileToRemove.pdfId
        );
      }

      return previous.filter(
        (_, i) => i !== index
      );
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePdfUpload = async (
    event
  ) => {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) return;

    let uploadChatId;

    try {
      uploadChatId =
        await ensureChat();
    } catch (error) {
      console.error(
        "Chat creation failed:",
        error
      );

      event.target.value = "";

      return;
    }

    const validPdfFiles =
      files.filter(
        (file) =>
          file.type ===
            "application/pdf" ||
          file.name
            .toLowerCase()
            .endsWith(".pdf")
      );

    if (!validPdfFiles.length) {
      alert(
        "Please select PDF files only."
      );

      event.target.value = "";

      return;
    }

    const temporaryFiles =
      validPdfFiles.map((file) => ({
        file,
        pdfId: null,
        uploading: true,
      }));

    setSelectedFiles(
      (previous) => [
        ...previous,
        ...temporaryFiles,
      ]
    );

    setUploading(true);

    for (const file of validPdfFiles) {
      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      formData.append(
        "chat_id",
        String(uploadChatId)
      );

      try {
        const response =
          await axios.post(
            `${API_BASE_URL}/pdf/upload`,
            formData,
            {
              timeout: 120000,
            }
          );

        const uploadSucceeded =
          response.data?.status ===
            "success" ||
          response.data?.success ===
            true;

        if (!uploadSucceeded) {
          throw new Error(
            response.data?.detail ||
              response.data?.message ||
              "PDF upload failed."
          );
        }

        const pdfId =
          response.data?.pdf_id;

        if (!pdfId) {
          throw new Error(
            "PDF uploaded but PDF ID was not returned."
          );
        }

        setSelectedFiles(
          (previous) =>
            previous.map((item) =>
              item.file === file
                ? {
                    ...item,
                    pdfId,
                    uploading: false,
                  }
                : item
            )
        );

        onPdfUploaded?.({
          id: pdfId,
          name: file.name,
          response:
            response.data,
        });
      } catch (error) {
        console.error(
          "PDF upload error:",
          error
        );

        setSelectedFiles(
          (previous) =>
            previous.filter(
              (item) =>
                item.file !== file
            )
        );

        const errorMessage =
          error?.response?.data
            ?.detail ||
          error?.response?.data
            ?.message ||
          error?.message ||
          "PDF upload failed.";

        alert(
          `${file.name}: ${errorMessage}`
        );
      }
    }

    setUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ========================================================
  // CLEAR IMAGE FROM COMPOSER
  // ========================================================

  const clearSelectedImages = () => {
    setSelectedImages((previous) => {
      previous.forEach((image) => {
        if (
          image?.imageId !== null &&
          image?.imageId !== undefined
        ) {
          onImageRemoved?.(
            image.imageId
          );
        }

        if (image?.previewUrl) {
          try {
            URL.revokeObjectURL(
              image.previewUrl
            );
          } catch {}
        }
      });

      return [];
    });

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  // ========================================================
  // CLIPBOARD IMAGE / SCREENSHOT PASTE
  // ========================================================

  const handlePaste = async (event) => {
    if (loading || uploading) return;

    const items = Array.from(
      event.clipboardData?.items || []
    );

    const imageItems = items.filter(
      (item) =>
        item.kind === "file" &&
        item.type.startsWith("image/")
    );

    if (!imageItems.length) {
      return;
    }

    event.preventDefault();

    const dataTransfer = new DataTransfer();

    for (const item of imageItems) {
      const file = item.getAsFile();

      if (file) {
        const extension =
          file.type === "image/png"
            ? "png"
            : file.type === "image/jpeg"
              ? "jpg"
              : "png";

        const imageFile = new File(
          [file],
          `garuda-screenshot-${Date.now()}.${extension}`,
          {
            type: file.type,
          }
        );

        dataTransfer.items.add(imageFile);
      }
    }

    if (!dataTransfer.files.length) {
      return;
    }

    await handleImageUpload({
      target: {
        files: dataTransfer.files,
        value: "",
      },
    });
  };

  // ========================================================
  // MESSAGE SENDING & KEY EVENTS (Optimized with useCallback)
  // ========================================================

  const handleSend = useCallback(async (
    voiceText = null
  ) => {
    if (loading || uploading) return;

    const textSource =
      typeof voiceText === "string"
        ? voiceText
        : message;

    const textToSend =
      typeof textSource === "string"
        ? textSource.trim()
        : "";

    if (!textToSend) return;

    try {
      await sendMessage?.(
        textToSend,
        {
          isVoiceInput: typeof voiceText === "string",
        }
      );

      setMessage("");
      clearSelectedImages();

      if (messageInputRef.current) {
        messageInputRef.current.style.height = "auto";
        messageInputRef.current.style.overflowY = "hidden";
      }
    } catch (error) {
      console.error(
        "Garuda send error:",
        error
      );
    }
  }, [loading, uploading, message, sendMessage, setMessage]);

  const handleKeyDown = (
    event
  ) => {
    if (loading || uploading) return;

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSend();
    }
  };

  // ========================================================
  // RENDER
  // ========================================================

  return (
    <div className="input-bar">

      {/* Hidden PDF Input */}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,application/pdf"
        onChange={handlePdfUpload}
        className="hidden-file-input"
        style={{
          display: "none",
        }}
      />

      {/* Hidden Image Input */}

      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp"
        onChange={handleImageUpload}
        className="hidden-file-input"
        style={{
          display: "none",
        }}
      />

      {/* ====================================================
          COMPOSER
          ==================================================== */}

      <div className="garuda-composer">

        {/* Selected PDFs */}

        {selectedFiles.length > 0 && (
          <div className="selected-pdfs">

            {selectedFiles.map(
              (item, index) => (
                <div
                  className="selected-pdf-card"
                  key={`${item.file.name}-${index}`}
                >

                  <div className="selected-pdf-icon">
                    PDF
                  </div>

                  <div className="selected-pdf-details">

                    <div className="selected-pdf-name">
                      {item.file.name}
                    </div>

                    <div className="selected-pdf-status">
                      {item.pdfId === null
                        ? "Uploading..."
                        : "Ready"}
                    </div>

                  </div>

                  {!uploading &&
                    item.pdfId !== null && (
                      <button
                        type="button"
                        className="remove-pdf-btn"
                        onClick={() =>
                          removeSelectedFile(
                            index
                          )
                        }
                        title="Remove document"
                        aria-label="Remove document"
                      >
                        ×
                      </button>
                    )}

                </div>
              )
            )}

          </div>
        )}

        {/* Selected Images */}

        {selectedImages.length > 0 && (
          <div className="selected-images">

            {selectedImages.map(
              (item, index) => (
                <div
                  className="selected-image-card"
                  key={`${item.file.name}-${index}`}
                >

                  <div className="selected-image-preview-wrap">

                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="selected-image-preview"
                    />

                    {item.uploading && (
                      <div className="image-upload-overlay">
                        <span />
                      </div>
                    )}

                  </div>

                  <div className="selected-image-details">

                    <div className="selected-image-name">
                      {item.file.name}
                    </div>

                    <div className="selected-image-status">
                      {item.uploading
                        ? "Uploading..."
                        : "Ready"}
                    </div>

                  </div>

                  {!item.uploading && (
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() =>
                        removeSelectedImage(
                          index
                        )
                      }
                      title="Remove image"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  )}

                </div>
              )
            )}

          </div>
        )}

        {/* ==================================================
            INPUT CONTROLS ROW
            ================================================== */}

        <div className="composer-input-row">

          {/* Attachment Button & Menu */}

          <div className="attachment-wrapper" ref={attachmentMenuRef}>

            <button
              type="button"
              className={`composer-icon-btn composer-attach-btn ${
                showAttachmentMenu
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setShowAttachmentMenu(
                  (previous) =>
                    !previous
                )
              }
              disabled={
                loading ||
                uploading
              }
              title="Attach"
              aria-label="Attach files"
            >
              <span className="attach-plus">
                +
              </span>
            </button>

            {showAttachmentMenu &&
              !uploading && (
                <div className="attachment-menu">

                  {/* Document */}

                  <button
                    type="button"
                    className="attachment-menu-item"
                    onClick={
                      openFilePicker
                    }
                  >
                    <span className="attachment-menu-icon document-icon">
                      <span>PDF</span>
                    </span>

                    <span className="attachment-menu-text">
                      <strong>
                        Document
                      </strong>

                      <small>
                        PDF files
                      </small>
                    </span>
                  </button>

                  {/* Image */}

                  <button
                    type="button"
                    className="attachment-menu-item"
                    onClick={
                      openImagePicker
                    }
                  >
                    <span className="attachment-menu-icon image-icon">
                      <span>IMG</span>
                    </span>

                    <span className="attachment-menu-text">
                      <strong>
                        Image
                      </strong>

                      <small>
                        JPG • PNG • WEBP
                      </small>
                    </span>
                  </button>

                  {/* Calculator Option */}

                  <button
                    type="button"
                    className="attachment-menu-item"
                    onClick={() => {
                      setShowAttachmentMenu(false);
                      onOpenCalculator?.();
                    }}
                  >
                    <span className="attachment-menu-icon" style={{ background: "transparent", color: "inherit", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", width: "34px" }}>
                      <span>🧮</span>
                    </span>

                    <span className="attachment-menu-text">
                      <strong>
                        Calculator
                      </strong>

                      <small>
                        Open calculator tool
                      </small>
                    </span>
                  </button>

                </div>
              )}

          </div>

          {/* Voice Button */}

          <VoiceButton
            setMessage={setMessage}
            onVoiceCommand={handleSend}
          />

          {/* Floating Garuda */}

          {canUseFloatingGaruda && (
            <button
              type="button"
              className={`composer-icon-btn composer-garuda-floating-btn ${
                floatingEnabled
                  ? "garuda-floating-enabled"
                  : ""
              }`}
              onClick={
                toggleFloatingGaruda
              }
              title={
                floatingEnabled
                  ? "Turn Floating Garuda OFF"
                  : "Turn Floating Garuda ON"
              }
              aria-label={
                floatingEnabled
                  ? "Turn Floating Garuda OFF"
                  : "Turn Floating Garuda ON"
              }
            >
              🦅
            </button>
          )}

          {/* AI Tools */}

          <div className="ai-tools-wrapper">

            <button
              type="button"
              className={`composer-icon-btn composer-ai-btn ${
                showAiTools
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setShowAiTools(
                  (previous) =>
                    !previous
                )
              }
              title="AI Tools"
              aria-label="AI Tools"
            >
              ✨
            </button>

            <AiToolsMenu
              open={showAiTools}
              onClose={() =>
                setShowAiTools(
                  false
                )
              }
              onToolSelect={(prompt) => {
                setMessage(
                  prompt
                );

                setShowAiTools(
                  false
                );
              }}
            />

          </div>

          {/* Message Input with Auto-Growing */}

          <textarea
            ref={messageInputRef}
            className="composer-message-input"
            placeholder={
              uploading
                ? "Uploading attachment..."
                : "Ask Garuda anything..."
            }
            value={message}
            onChange={(event) => {
              const textarea = event.target;
              setMessage?.(textarea.value);
              resizeMessageInput(textarea);
            }}
            onPaste={handlePaste}
            onKeyDown={
              handleKeyDown
            }
            disabled={
              loading ||
              uploading
            }
            rows={1}
            autoComplete="off"
          />

          {/* ==================================================
              SEND / STOP
              ================================================== */}

          {loading ? (
            <button
              type="button"
              className="composer-send-btn composer-stop-btn"
              onClick={
                stopGeneration
              }
              title="Stop generation"
              aria-label="Stop generation"
            >
              <span className="stop-square" />
            </button>
          ) : (
            <button
              type="button"
              className="composer-send-btn"
              onClick={() =>
                handleSend()
              }
              disabled={
                uploading ||
                !(
                  typeof message ===
                    "string" &&
                  message.trim()
                )
              }
              title={
                typeof message ===
                  "string" &&
                message.trim()
                  ? "Send message"
                  : "Type a message first"
              }
              aria-label="Send message"
            >
              <span className="send-arrow">
                ↑
              </span>
            </button>
          )}

        </div>
      </div>
    </div>
  );
}

export default InputBar;