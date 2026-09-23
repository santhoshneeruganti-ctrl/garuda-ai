import { useEffect, useState } from "react";

import "../styles/sidebar.css";


function Sidebar({
  chats,
  refreshChats,
  setCurrentChatId,
  clearMessages,
  onSelectChat,
  currentChatId,
  deleteChat,
  updateChatTitle,
  onOpenSettings,
  onOpenSmartFolders,

  // ======================================================
  // AUTH PROPS
  // ======================================================

  isAuthenticated = false,
  onLogin,
}) {

  const [editingId, setEditingId] =
    useState(null);

  const [editedTitle, setEditedTitle] =
    useState("");


  // ======================================================
  // LOAD CHATS
  // ======================================================

  useEffect(() => {

    // Guest users should not load
    // database chat history.

    if (!isAuthenticated) {
      return;
    }

    refreshChats();

  }, [isAuthenticated]);


  // ======================================================
  // CREATE NEW CHAT
  //
  // IMPORTANT:
  // A New Chat is temporary until the user sends the
  // first message.
  //
  // Do NOT call /new-chat here.
  // The database chat will be created by App.jsx when
  // the first real message is sent.
  // ======================================================

  function createNewChat() {

    console.log(
      "🦅 Opening temporary New Chat"
    );


    // ------------------------------------------------------
    // Reset current chat
    // ------------------------------------------------------

    setCurrentChatId(
      null
    );


    // ------------------------------------------------------
    // Clear current conversation
    // ------------------------------------------------------

    clearMessages();


    // ------------------------------------------------------
    // IMPORTANT:
    // Do NOT refresh chats here.
    //
    // There is no database chat yet.
    // ------------------------------------------------------

  }


  // ======================================================
  // SAVE CHAT RENAME
  // ======================================================

  async function saveRename(
    chatId
  ) {

    const title =
      editedTitle.trim();


    if (!title) {

      setEditingId(null);

      return;
    }


    try {

      await updateChatTitle(
        chatId,
        title
      );


      setEditingId(null);


      console.log(
        "✅ Chat renamed:",
        chatId
      );

    } catch (error) {

      console.error(
        "❌ Rename Chat Error:",
        error
      );

    }

  }


  // ======================================================
  // START RENAME
  // ======================================================

  function startRename(
    event,
    chat
  ) {

    event.stopPropagation();


    setEditingId(
      chat.id
    );


    setEditedTitle(
      chat.title || "New Chat"
    );

  }


  // ======================================================
  // CANCEL RENAME
  // ======================================================

  function cancelRename() {

    setEditingId(null);

    setEditedTitle("");

  }


  // ======================================================
  // HANDLE SETTINGS
  // ======================================================

  function handleSettings() {

    console.log(
      "⚙ Settings clicked"
    );


    // Guest user should login
    // before accessing account settings.

    if (!isAuthenticated) {

      if (onLogin) {

        onLogin();

      }

      return;
    }


    if (onOpenSettings) {

      onOpenSettings();

    }

  }


  // ======================================================
  // HANDLE GUEST LOGIN
  // ======================================================

  function handleGuestLogin() {

    if (onLogin) {

      onLogin();

    }

  }


  // ======================================================
  // RENDER
  // ======================================================

  return (

    <aside className="sidebar">


      {/* ==================================================
          LOGO
      ================================================== */}

      <div className="logo">

        <span className="logo-icon">
          🦅
        </span>

        <span className="logo-text">
          Garuda AI
        </span>

      </div>


      {/* ==================================================
          NEW CHAT
      ================================================== */}

      <button
        type="button"
        className="new-chat"
        onClick={
          createNewChat
        }
      >

        <span className="new-chat-icon">
          +
        </span>

        <span>
          New Chat
        </span>

      </button>


      {/* ==================================================
          CHAT SECTION
      ================================================== */}

      <div className="chat-section">


        <div className="chat-section-header">

          <h4>
            Chats
          </h4>

        </div>


        {/* ==================================================
            GUEST MODE
        ================================================== */}

        {!isAuthenticated ? (

          <div className="guest-chat-message">

            <div className="guest-chat-icon">
              🔒
            </div>


            <div className="guest-chat-title">
              Sign in to save your chats
            </div>


            <div className="guest-chat-description">
              Login to keep your conversations
              and access your chat history.
            </div>


            <button
              type="button"
              className="guest-login-btn"
              onClick={
                handleGuestLogin
              }
            >

              Login

            </button>

          </div>

        ) : (

          /* ==================================================
             LOGGED-IN CHAT HISTORY
          ================================================== */

          chats.length === 0 ? (

            <div className="empty-chat">

              <div className="empty-chat-icon">
                💬
              </div>

              <div className="empty-chat-title">
                No Chats Available
              </div>

              <div className="empty-chat-description">
                Start a new conversation
                with Garuda AI.
              </div>

            </div>

          ) : (

            <div className="chat-list">

              {chats.map(
                (chat) => (

                  <div
                    key={chat.id}
                    className={
                      currentChatId === chat.id
                        ? "chat-item active"
                        : "chat-item"
                    }

                    onClick={(event) => {

                      event.stopPropagation();


                      console.log(
                        "🦅 Sidebar Chat Click:",
                        chat.id
                      );


                      // ------------------------------------------------
                      // IMPORTANT:
                      // Make the clicked chat the active chat FIRST.
                      //
                      // This prevents the next message from being
                      // accidentally sent to an older chat.
                      // ------------------------------------------------

                      if (onSelectChat) {

    onSelectChat(
        chat.id
    );


                      }

                    }}
                  >


                    {/* ==================================================
                        CHAT CONTENT
                    ================================================== */}

                    <div className="chat-content">

                      {editingId === chat.id ? (

                        <input
                          type="text"
                          className="rename-input"
                          value={
                            editedTitle
                          }
                          autoFocus

                          onClick={(event) =>
                            event.stopPropagation()
                          }

                          onChange={(event) =>
                            setEditedTitle(
                              event.target.value
                            )
                          }

                          onBlur={() =>
                            saveRename(
                              chat.id
                            )
                          }

                          onKeyDown={(event) => {

                            if (
                              event.key ===
                              "Enter"
                            ) {

                              event.preventDefault();

                              saveRename(
                                chat.id
                              );

                            }


                            if (
                              event.key ===
                              "Escape"
                            ) {

                              event.preventDefault();

                              cancelRename();

                            }

                          }}
                        />

                      ) : (

                        <span className="chat-title">

                          <span className="chat-title-icon">
                            💬
                          </span>

                          <span className="chat-title-text">
                            {chat.title ||
                              "New Chat"}
                          </span>

                        </span>

                      )}

                    </div>


                    {/* ==================================================
                        CHAT ACTIONS
                    ================================================== */}

                    {editingId !== chat.id && (

                      <div
                        className="chat-actions"
                      >


                        {/* ==============================================
                            RENAME
                        ============================================== */}

                        <button
                          type="button"
                          className="rename-btn"
                          title="Rename chat"

                          onClick={(event) =>
                            startRename(
                              event,
                              chat
                            )
                          }
                        >

                          ✏️

                        </button>


                        {/* ==============================================
                            DELETE
                        ============================================== */}

                        <button
                          type="button"
                          className="delete-btn"
                          title="Delete chat"

                          onClick={(event) => {

                            event.stopPropagation();


                            deleteChat(
                              chat.id
                            );

                          }}
                        >

                          🗑

                        </button>

                      </div>

                    )}

                  </div>

                )
              )}

            </div>

          )

        )}

      </div>


      {/* ==================================================
          SIDEBAR BOTTOM
      ================================================== */}

      <div className="bottom">


        {/* ==================================================
            ACCOUNT STATUS
        ================================================== */}

        {!isAuthenticated && (

          <div className="guest-status">

            <span className="guest-status-dot" />

            <span>
              Guest Mode
            </span>

          </div>

        )}


        {/* ==================================================
            SMART FOLDERS
        ================================================== */}

        <button
          type="button"
          className="settings"
       onClick={() => {
    console.log("📁 SMART FOLDERS CLICKED");

    if (typeof onOpenSmartFolders === "function") {
        onOpenSmartFolders();
    }
}}
        >
          <span className="settings-icon">
            📁
          </span>

          <span>
            Smart Folders
          </span>
        </button>


        {/* ==================================================
            SETTINGS
        ================================================== */}

        <button
          type="button"
          className="settings"
          onClick={
            handleSettings
          }
        >

          <span className="settings-icon">
            ⚙
          </span>

          <span>
            Settings
          </span>

        </button>


      </div>

    </aside>

  );

}


export default Sidebar;