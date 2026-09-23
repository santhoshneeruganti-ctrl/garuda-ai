import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import useChat from "../../hooks/useChat";

import "./MiniQuestionBox.css";


// ======================================================
// 🧹 CLEAN TOOL-CALL OUTPUT
// ======================================================

const cleanToolCalls = (text = "") => {
  if (!text) {
    return "";
  }

  let cleaned = String(text);

  cleaned = cleaned.replace(
    /<tool_call>[\s\S]*?<\/tool_call>/gi,
    ""
  );

  cleaned = cleaned.replace(
    /<function[\s\S]*?<\/function>/gi,
    ""
  );

  cleaned = cleaned.replace(
    /<\|tool_call\|>[\s\S]*?<\|\/tool_call\|>/gi,
    ""
  );

  cleaned = cleaned.replace(
    /<\|function_call\|>[\s\S]*?<\|\/function_call\|>/gi,
    ""
  );

  return cleaned.trim();
};


function MiniQuestionBox({
  originalQuestion,
  originalAnswer,
}) {

  // ======================================================
  // CHAT SERVICE
  // ======================================================

  const {
    sendFollowUpQuestion,
  } = useChat();


  // ======================================================
  // UI STATE
  // ======================================================

  const [question, setQuestion] =
    useState("");

  const [answer, setAnswer] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [open, setOpen] =
    useState(false);


  // ======================================================
  // 🧠 TEMPORARY CONVERSATION
  // ======================================================

  const [
    miniConversation,
    setMiniConversation,
  ] = useState([]);


  // ======================================================
  // OPEN MINI CHAT
  // ======================================================

  const openMiniChat = () => {
    setOpen(true);
  };


  // ======================================================
  // CLOSE + RESET
  // ======================================================

  const closeMiniChat = () => {

    setOpen(false);

    setQuestion("");

    setAnswer("");

    setMiniConversation([]);
  };


  // ======================================================
  // SEND QUESTION
  // ======================================================

  const handleSubmit = async () => {

    const trimmedQuestion =
      question.trim();


    if (
      !trimmedQuestion ||
      loading
    ) {
      return;
    }


    setLoading(true);

    setAnswer("");


    try {

      console.log(
        "💡 Mini Question:",
        trimmedQuestion
      );


      console.log(
        "🧠 Context:",
        miniConversation
      );


      // ==================================================
      // ASK GARUDA
      // ==================================================

      const result =
        await sendFollowUpQuestion({

          originalQuestion:
            originalQuestion || "",

          originalAnswer:
            cleanToolCalls(
              originalAnswer || ""
            ),

          miniConversation:
            miniConversation,

          question:
            trimmedQuestion,
        });


      // ==================================================
      // CLEAN RESPONSE
      // ==================================================

      const finalAnswer =
        cleanToolCalls(
          result
        );


      const safeAnswer =
        finalAnswer ||
        "No answer received.";


      // ==================================================
      // SHOW ANSWER
      // ==================================================

      setAnswer(
        safeAnswer
      );


      // ==================================================
      // 🧠 SAVE ONLY TEMPORARILY
      // ==================================================

      setMiniConversation(
        (previous) => [
          ...previous,

          {
            question:
              trimmedQuestion,

            answer:
              safeAnswer,
          },
        ]
      );


      // Clear input
      setQuestion("");


    } catch (error) {

      console.error(
        "❌ Mini question error:",
        error
      );


      setAnswer(
        "❌ Unable to get an answer."
      );

    } finally {

      setLoading(false);
    }
  };


  // ======================================================
  // UI
  // ======================================================

  return (
    <div
      className={`mini-question-box ${
        open
          ? "is-open"
          : ""
      }`}
    >

      {/* ==================================================
          CLOSED STATE
      ================================================== */}

      {!open && (
        <button
          type="button"
          className="mini-question-trigger"
          onClick={
            openMiniChat
          }
          aria-label="Ask a question about this answer"
          title="Ask about this answer"
        >
          <span className="mini-question-bulb">
            💡
          </span>
        </button>
      )}


      {/* ==================================================
          OPEN STATE
      ================================================== */}

      {open && (
        <div className="mini-question-panel">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="mini-question-header">

            <div className="mini-question-title">

              <span>
                💡
              </span>

              <span>
                Ask about this answer
              </span>

            </div>


            <button
              type="button"
              className="mini-question-close"
              onClick={
                closeMiniChat
              }
              aria-label="Close mini chat"
              title="Close"
            >
              ×
            </button>

          </div>


          {/* ==================================================
              CONTEXT STATUS
          ================================================== */}

          {miniConversation.length > 0 && (
            <div className="mini-question-context">
              🧠 Conversation context active
            </div>
          )}


          {/* ==================================================
              INPUT
          ================================================== */}

          <div className="mini-question-input-row">

            <input
              type="text"
              value={question}
              onChange={(e) =>
                setQuestion(
                  e.target.value
                )
              }
              onKeyDown={(e) => {

                if (
                  e.key === "Enter"
                ) {
                  e.preventDefault();

                  handleSubmit();
                }

              }}
              placeholder="Ask a question..."
              disabled={loading}
              autoFocus
            />


            <button
              type="button"
              className="mini-question-send"
              onClick={
                handleSubmit
              }
              disabled={
                loading ||
                !question.trim()
              }
              aria-label="Send question"
            >
              {loading
                ? "•••"
                : "➤"}
            </button>

          </div>


          {/* ==================================================
              LOADING
          ================================================== */}

          {loading && (
            <div className="mini-question-loading">

              <span className="thinking-dot">
                🦅
              </span>

              <span>
                Garuda is thinking...
              </span>

            </div>
          )}


          {/* ==================================================
              ANSWER
          ================================================== */}

          {answer && (
            <div className="mini-question-answer">

              <div className="mini-answer-title">
                🦅 Garuda
              </div>


              <div className="mini-answer-text">

                <ReactMarkdown
                  remarkPlugins={[
                    remarkGfm,
                  ]}
                >
                  {answer}
                </ReactMarkdown>

              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}


export default MiniQuestionBox;