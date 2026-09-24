import {
  useState,
  useEffect,
  useRef,
} from "react";

import axios from "axios";

import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import InputBar from "./components/InputBar";
import FloatingGaruda from "./components/desktop/FloatingGaruda";
import Settings from "./components/Settings";
import Profile from "./components/Profile";
import SmartFolders from "./components/SmartFolders";
import Calculator from "./components/Calculator/Calculator";

import Login from "./auth/Login";
import Register from "./auth/Register";
import Header from "./components/Header";

import {
  executeGarudaCommand,
} from "./services/garudaCommandEngine";
import { API_BASE_URL } from "./config/api";

import "./styles/layout.css";


// ======================================================
// APP
// ======================================================

function App() {

  // ======================================================
  // ELECTRON FLOATING GARUDA MODE
  // ======================================================

  const isFloatingGaruda =
    window.location.hash === "#garuda-floating";


  // ======================================================
  // FLOATING WINDOW BODY RESET
  // ======================================================

  useEffect(() => {

    if (!isFloatingGaruda) {
      return undefined;
    }


    const html =
      document.documentElement;

    const body =
      document.body;


    const previousHtmlBackground =
      html.style.background;

    const previousBodyBackground =
      body.style.background;

    const previousBodyMargin =
      body.style.margin;

    const previousBodyOverflow =
      body.style.overflow;


    html.style.background =
      "transparent";

    body.style.background =
      "transparent";

    body.style.margin =
      "0";

    body.style.overflow =
      "hidden";


    return () => {

      html.style.background =
        previousHtmlBackground;

      body.style.background =
        previousBodyBackground;

      body.style.margin =
        previousBodyMargin;

      body.style.overflow =
        previousBodyOverflow;

    };

  }, [
    isFloatingGaruda,
  ]);


  // ======================================================
  // AUTHENTICATION STATE
  // ======================================================

  const [
    isAuthenticated,
    setIsAuthenticated,
  ] = useState(() => {

    return Boolean(
      localStorage.getItem(
        "garuda_access_token"
      )
    );

  });


  const [
    username,
    setUsername,
  ] = useState(() => {

    return (
      localStorage.getItem(
        "garuda_username"
      ) || ""
    );

  });


  const [
    showLogin,
    setShowLogin,
  ] = useState(false);


  const [
    showRegister,
    setShowRegister,
  ] = useState(false);


  // ======================================================
  // CHAT STATE
  // ======================================================

  const [
    message,
    setMessage,
  ] = useState("");


  const [
    messages,
    setMessages,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(false);

  // ======================================================
  // 🧮 CALCULATOR STATE
  // ======================================================
  const [calculatorOpen, setCalculatorOpen] = useState(false);


  const [
    currentChatId,
    setCurrentChatId,
  ] = useState(null);


  const [
    chats,
    setChats,
  ] = useState([]);


  // ======================================================
  // SETTINGS & PROFILE & SMART FOLDERS
  // ======================================================

  const [
    showSettings,
    setShowSettings,
  ] = useState(false);


  const [
    showProfile,
    setShowProfile,
  ] = useState(false);

  const [
    showSmartFolders,
    setShowSmartFolders,
  ] = useState(false);


  // ======================================================
  // ACTIVE PDFS
  // ======================================================

  const [
    uploadedPdfs,
    setUploadedPdfs,
  ] = useState([]);

  // ======================================================
  // ACTIVE IMAGES
  // ======================================================

  const [
    uploadedImages,
    setUploadedImages,
  ] = useState([]);


  // ======================================================
  // STREAM CONTROLLER
  // ======================================================

  const controllerRef =
    useRef(null);

  const skipNextConversationLoadRef =
    useRef(false);


  // ======================================================
  // LOGIN SUCCESS
  // ======================================================

  function handleLoginSuccess(
    data
  ) {

    const token =
      data?.access_token ||
      data?.token;


    if (!token) {

      console.error(
        "❌ Login succeeded but no access token was returned."
      );

      return;

    }


    localStorage.setItem(
      "garuda_access_token",
      token
    );


    const loggedInUsername =
      data?.username ||
      data?.user?.username ||
      localStorage.getItem(
        "garuda_username"
      ) ||
      "User";


    localStorage.setItem(
      "garuda_username",
      loggedInUsername
    );


    axios.defaults.headers.common.Authorization =
      `Bearer ${token}`;


    setUsername(
      loggedInUsername
    );

    setIsAuthenticated(
      true
    );

    setShowLogin(
      false
    );

    setShowRegister(
      false
    );

    setShowSettings(
      false
    );

    setShowProfile(
      false
    );

    setShowSmartFolders(
      false
    );


    setCurrentChatId(
      null
    );

    setMessages(
      []
    );

    setUploadedPdfs(
      []
    );

    setUploadedImages(
      []
    );


    console.log(
      "🦅 Garuda Login Successful"
    );

  }


  // ======================================================
  // LOGOUT
  // ======================================================

  function handleLogout() {

    console.log(
      "🦅 Garuda Logout"
    );


    localStorage.removeItem(
      "garuda_access_token"
    );

    localStorage.removeItem(
      "garuda_username"
    );


    delete axios
      .defaults
      .headers
      .common
      .Authorization;


    setUsername(
      ""
    );

    setIsAuthenticated(
      false
    );

    setShowLogin(
      false
    );

    setShowRegister(
      false
    );

    setShowSettings(
      false
    );

    setShowProfile(
      false
    );

    setShowSmartFolders(
      false
    );


    setMessages(
      []
    );

    setChats(
      []
    );

    setCurrentChatId(
      null
    );

    setUploadedPdfs(
      []
    );

    setUploadedImages(
      []
    );


    if (
      controllerRef.current
    ) {

      controllerRef.current.abort();

      controllerRef.current =
        null;

    }


    console.log(
      "✅ Garuda Logout Successful"
    );

  }


  // ======================================================
  // AUTH HEADER + CHAT STARTUP
  // ======================================================

  useEffect(() => {

    const token =
      localStorage.getItem(
        "garuda_access_token"
      );


    if (token) {

      axios
        .defaults
        .headers
        .common
        .Authorization =
        `Bearer ${token}`;

    } else {

      delete axios
        .defaults
        .headers
        .common
        .Authorization;

    }


    if (!isAuthenticated) {

      return;

    }


    setCurrentChatId(
      null
    );

    setMessages(
      []
    );

    setUploadedPdfs(
      []
    );

    setUploadedImages(
      []
    );

    setLoading(
      false
    );


    refreshChats();

  }, [
    isAuthenticated,
  ]);


  // ======================================================
  // CREATE FRESH CHAT
  // ======================================================

  function initializeFreshChat() {

    console.log(
      "🦅 Opening temporary New Chat"
    );


    setCurrentChatId(
      null
    );

    setMessages(
      []
    );

    setUploadedPdfs(
      []
    );

    setUploadedImages(
      []
    );

    setLoading(
      false
    );

  }


  // ======================================================
  // LOAD CHAT LIST
  // ======================================================

  async function refreshChats() {

    if (!isAuthenticated) {

      setChats(
        []
      );

      return [];

    }


    try {

      const response =
        await axios.get(
          `${API_BASE_URL}/chats`
        );


      const chatList =
        Array.isArray(
          response?.data?.chats
        )
          ? response.data.chats
          : [];


      setChats(
        chatList
      );


      return chatList;


    } catch (error) {

      console.error(
        "❌ Failed to load chats:",
        error
      );


      return [];

    }

  }


  // ======================================================
  // LOAD CURRENT CHAT
  // ======================================================

  useEffect(() => {

    if (!isAuthenticated) {

      return;

    }


    if (
      currentChatId === null ||
      currentChatId === undefined
    ) {

      clearMessages();

      return;

    }


    if (
      skipNextConversationLoadRef.current
    ) {

      skipNextConversationLoadRef.current =
        false;

      return;

    }


    loadConversation(
      currentChatId
    );


    setUploadedPdfs(
      []
    );

    setUploadedImages(
      []
    );

  }, [
    currentChatId,
  ]);


  // ======================================================
  // CLEAR MESSAGES
  // ======================================================

  function clearMessages() {

    setMessages(
      []
    );

    setUploadedPdfs(
      []
    );

    setUploadedImages(
      []
    );

  }


  // ======================================================
  // SMART FOLDERS
  // ======================================================

  function openSmartFolders() {

    console.log(
      "📁 Opening Garuda Smart Folders"
    );

    setShowSettings(false);
    setShowProfile(false);
    setShowSmartFolders(true);

  }


  function closeSmartFolders() {

    console.log(
      "↩ Returning to Garuda Chat"
    );

    setShowSmartFolders(false);

  }


  // ======================================================
  // SETTINGS
  // ======================================================

  function openSettings() {

    console.log(
      "⚙ Opening Garuda Settings"
    );


    setShowProfile(
      false
    );

    setShowSmartFolders(
      false
    );

    setShowSettings(
      true
    );

  }


  function closeSettings() {

    console.log(
      "↩ Returning to Garuda Chat"
    );


    setShowSettings(
      false
    );

  }


  // ======================================================
  // PROFILE
  // ======================================================

  function openProfile() {

    console.log(
      "👤 Opening Garuda Profile"
    );


    setShowSettings(
      false
    );

    setShowSmartFolders(
      false
    );

    setShowProfile(
      true
    );

  }


  function closeProfile() {

    console.log(
      "↩ Returning to Settings"
    );


    setShowProfile(
      false
    );

    setShowSettings(
      true
    );

  }


  // ======================================================
  // UPDATE CHAT TITLE
  // ======================================================

  async function updateChatTitle(
    chatId,
    title
  ) {

    try {

      await axios.put(
        `${API_BASE_URL}/chat/${chatId}/title`,
        {
          title,
        }
      );


      await refreshChats();


    } catch (error) {

      console.error(
        "❌ Failed to update chat title:",
        error
      );

    }

  }


  // ======================================================
  // DELETE CHAT
  // ======================================================

  async function deleteChat(
    chatId
  ) {

    if (
      !window.confirm(
        "Are you sure you want to delete this chat?"
      )
    ) {

      return;

    }


    try {

      await axios.delete(
        `${API_BASE_URL}/chat/${chatId}`
      );


      await refreshChats();


      if (
        chatId ===
        currentChatId
      ) {

        clearMessages();

        setCurrentChatId(
          null
        );

      }


    } catch (error) {

      console.error(
        "❌ Failed to delete chat:",
        error
      );

    }

  }


  // ======================================================
  // LOAD CONVERSATION
  // ======================================================

  async function loadConversation(
    chatId
  ) {

    if (
      chatId === null ||
      chatId === undefined
    ) {

      return;

    }


    if (
      String(currentChatId) !==
      String(chatId)
    ) {

      skipNextConversationLoadRef.current =
        true;

      setCurrentChatId(
        chatId
      );

    }


    try {

      const response =
        await axios.get(
          `${API_BASE_URL}/chat/${chatId}`
        );


      const loadedMessages =
        (
          response?.data?.messages ||
          []
        ).map(
          (msg) => {

            return {

              id:
                msg.id,

              sender:
                msg.sender,

              text:
                msg.message,

              uploaded_pdfs:
                Array.isArray(
                  msg.uploaded_pdfs
                )
                  ? msg.uploaded_pdfs
                  : [],

              uploaded_images:
                Array.isArray(
                  msg.uploaded_images
                )
                  ? msg.uploaded_images.map(
                      (image) => {

                        const imageId =
                          image?.id ||
                          image?.image_id;

                        return {
                          ...image,

                          id:
                            imageId,

                          url:
                            image?.url ||
                            (
                              imageId
                                ? `${API_BASE_URL}/image/view/${imageId}`
                                : ""
                            ),

                          name:
                            image?.name ||
                            image?.file_name ||
                            "Uploaded image",
                        };

                      }
                    )
                  : [],

            };

          }
        );


      setMessages(
        loadedMessages
      );


    } catch (error) {

      console.error(
        "❌ Failed to load conversation:",
        error
      );

    }

  }


  // ======================================================
  // COPY RESPONSE
  // ======================================================

  const copyResponse =
    async (
      text
    ) => {

      try {

        if (
          window.electronAPI?.writeClipboard
        ) {

          await window.electronAPI.writeClipboard(
            text
          );

        } else {

          await navigator.clipboard.writeText(
            text
          );

        }

      } catch (error) {

        console.error(
          "❌ Copy failed:",
          error
        );

      }

    };


  // ======================================================
  // PDF UPLOAD
  // ======================================================

  const handlePdfUploaded =
    (pdfData) => {

      if (!pdfData) {

        return;

      }


      setUploadedPdfs(
        (previous) => {

          const exists =
            previous.some(
              (pdf) =>
                pdf.id ===
                pdfData.id
            );


          if (exists) {

            return previous;

          }


          return [

            ...previous,

            {

              id:
                pdfData.id,

              name:
                pdfData.name ||
                pdfData.file_name ||
                "Unnamed PDF",

            },

          ];

        }
      );

    };


  // ======================================================
  // REMOVE PDF
  // ======================================================

  const removePdf =
    (pdfId) => {

      setUploadedPdfs(
        (previous) =>
          previous.filter(
            (pdf) =>
              pdf.id !==
              pdfId
          )
      );

    };


  // ======================================================
  // IMAGE UPLOAD
  // ======================================================

  const handleImageUploaded =
    (imageData) => {

      if (!imageData) {

        return;

      }


      setUploadedImages(
        (previous) => {

          const exists =
            previous.some(
              (image) =>
                String(image.id) ===
                String(imageData.id)
            );


          if (exists) {

            return previous;

          }


          return [
            ...previous,

            {
              id:
                imageData.id,

              name:
                imageData.name ||
                imageData.file_name ||
                "Unnamed image",

              mimeType:
                imageData.mimeType ||
                imageData.mime_type ||
                "",

              previewUrl:
                imageData.previewUrl ||
                "",
            },
          ];

        }
      );

    };


  // ======================================================
  // REMOVE IMAGE
  // ======================================================

  const removeImage =
    (imageId) => {

      setUploadedImages(
        (previous) =>
          previous.filter(
            (image) =>
              String(image.id) !==
              String(imageId)
          )
      );

    };


  // ======================================================
  // PDF ACTIONS
  // ======================================================

  const handlePdfAction =
    (action) => {

      switch (
        action
      ) {

        case "summary":

          setMessage(
            "Summarize the attached PDF document."
          );

          break;


        case "notes":

          setMessage(
            "Generate comprehensive study notes from the PDF."
          );

          break;


        case "flashcards":

          setMessage(
            "Create flashcards covering key concepts in the PDF."
          );

          break;


        case "quiz":

          setMessage(
            "Generate 10 multiple-choice quiz questions with answers."
          );

          break;


        case "interview":

          setMessage(
            "Generate potential interview questions based on this document."
          );

          break;


        case "mindmap":

          setMessage(
            "Provide a visual mind-map structure for this PDF content."
          );

          break;


        case "cheatsheet":

          setMessage(
            "Create a quick revision cheat sheet from this document."
          );

          break;


        case "keytopics":

          setMessage(
            "Extract and explain the key topics from this PDF."
          );

          break;


        default:

          return;

      }

    };


  // ======================================================
  // SEND MESSAGE
  // ======================================================

  const sendMessage = async (messageText = null) => {

    const currentMessage = (
      typeof messageText === "string"
        ? messageText
        : message
    ).trim();


    if (!currentMessage) {
      return;
    }


    if (loading) {
      return;
    }

    // ====================================================
    // GARUDA DESKTOP COMMAND HANDLER
    // ====================================================

    let backendMessage = currentMessage;

    console.log(
      "🧪 Checking Garuda command:",
      currentMessage
    );

    try {
      const commandResult =
        await executeGarudaCommand(currentMessage);

      console.log(
        "🧪 Garuda command result:",
        commandResult
      );

      if (
        commandResult &&
        commandResult.handled === true
      ) {
        console.log(
          "✅ Garuda command handled successfully."
        );

        return;
      }

      if (
        commandResult?.garudaFileContext &&
        typeof commandResult.backendMessage === "string" &&
        commandResult.backendMessage.trim()
      ) {
        backendMessage = commandResult.backendMessage;
        console.log("📚 Smart Folder context attached to normal AI request.");
      }

    } catch (commandError) {

      console.error(
        "❌ Garuda command execution failed:",
        commandError
      );

    }


    let chatId =
      currentChatId;


    if (
      chatId === null ||
      chatId === undefined
    ) {

      try {

        console.log(
          "🦅 First message detected. Creating permanent chat..."
        );


        const createResponse =
          await axios.post(
            `${API_BASE_URL}/new-chat`,
            {
              title:
                "New Chat",
            }
          );


        const createdChatId =
          createResponse?.data?.chat_id ??
          createResponse?.data?.id ??
          createResponse?.data?.chat?.id ??
          createResponse?.data?.new_chat_id;


        if (
          createdChatId === null ||
          createdChatId === undefined
        ) {

          throw new Error(
            "New chat ID was not returned by backend."
          );

        }


        chatId =
          createdChatId;


        skipNextConversationLoadRef.current =
          true;

        setCurrentChatId(
          createdChatId
        );


        console.log(
          "✅ Permanent chat created:",
          createdChatId
        );

      } catch (createError) {

        console.error(
          "❌ Failed to create chat for first message:",
          createError
        );


        setLoading(
          false
        );


        return;

      }

    }


    if (
      chatId === null ||
      chatId === undefined
    ) {

      console.error(
        "❌ Cannot send message: active chat ID is missing."
      );

      setLoading(false);

      return;

    }


    const tempUserId =
      Date.now();


    if (
      String(currentChatId) !==
      String(chatId)
    ) {

      setCurrentChatId(
        chatId
      );

    }


    const messagePdfs =
      Array.isArray(uploadedPdfs)
        ? uploadedPdfs.map(
            (pdf) => ({
              id:
                pdf.id,

              name:
                pdf.name ||
                pdf.file_name ||
                "Unnamed PDF",
            })
          )
        : [];


    const messageImages =
      Array.isArray(uploadedImages)
        ? uploadedImages.map(
            (image) => ({
              id:
                image.id,

              name:
                image.name ||
                image.file_name ||
                "Unnamed image",

              mimeType:
                image.mimeType ||
                image.mime_type ||
                "",
            })
          )
        : [];


    console.log(
      "🦅 Sending message:",
      currentMessage
    );


    console.log(
      "📄 PDFs attached:",
      messagePdfs
    );


    console.log(
      "🖼️ Images attached:",
      messageImages
    );


    setMessages(
      (previous) => [
        ...previous,

        {
          id:
            tempUserId,

          sender:
            "user",

          text:
            currentMessage,

          uploaded_pdfs:
            messagePdfs,

          uploaded_images:
            messageImages,
        },

        {
          id:
            tempUserId + 1,

          sender:
            "garuda",

          text:
            "",
        },
      ]
    );


    setMessage("");
    setLoading(true);


    const controller =
      new AbortController();


    controllerRef.current =
      controller;


    try {

      const currentChat =
        chats.find(
          (chat) =>
            String(chat.id) ===
            String(chatId)
        );


      if (
        !currentChat ||
        currentChat?.title ===
        "New Chat"
      ) {

        let newTitle =
          currentMessage;


        if (
          newTitle.length >
          40
        ) {

          newTitle =
            newTitle.substring(
              0,
              40
            ) + "...";
        }


        try {

          await updateChatTitle(
            chatId,
            newTitle
          );

        } catch (titleError) {

          console.warn(
            "⚠️ Could not update chat title:",
            titleError
          );

        }

      }


      const response =
        await fetch(
          `${API_BASE_URL}/chat/stream`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            signal:
              controller.signal,

            body:
              JSON.stringify({
                chat_id:
                  chatId,

                message:
                  backendMessage,

                uploaded_pdfs:
                  messagePdfs,

                uploaded_images:
                  messageImages,
              }),
          }
        );


      if (
        !response.ok
      ) {

        let errorMessage =
          `Chat request failed: ${response.status}`;


        try {

          const errorText =
            await response.text();


          if (
            errorText
          ) {

            console.error(
              "❌ Backend error:",
              errorText
            );

          }

        } catch (readError) {

          console.warn(
            "⚠️ Could not read backend error:",
            readError
          );

        }


        throw new Error(
          errorMessage
        );

      }


      if (
        !response.body
      ) {

        throw new Error(
          "Garuda backend returned no streaming response."
        );

      }


      const reader =
        response.body.getReader();


      const decoder =
        new TextDecoder(
          "utf-8"
        );


      while (true) {

        const {
          done,
          value,
        } =
          await reader.read();


        if (
          done
        ) {

          break;

        }


        const chunk =
          decoder.decode(
            value,
            {
              stream:
                true,
            }
          );


        if (
          !chunk
        ) {

          continue;

        }


        setMessages(
          (previous) => {

            if (
              previous.length ===
              0
            ) {

              return previous;

            }


            const updated =
              [
                ...previous,
              ];


            const lastIndex =
              updated.length -
              1;


            const lastMessage =
              updated[
                lastIndex
              ];


            if (
              !lastMessage ||
              lastMessage.sender !==
                "garuda"
            ) {

              return updated;

            }


            updated[
              lastIndex
            ] = {

              ...lastMessage,

              text:
                (
                  lastMessage.text ||
                  ""
                ) + chunk,

            };


            return updated;

          }
        );

      }


      const finalChunk =
        decoder.decode();


      if (
        finalChunk
      ) {

        setMessages(
          (previous) => {

            if (
              previous.length ===
              0
            ) {

              return previous;

            }


            const updated =
              [
                ...previous,
              ];


            const lastIndex =
              updated.length -
              1;


            const lastMessage =
              updated[
                lastIndex
              ];


            if (
              !lastMessage ||
              lastMessage.sender !==
                "garuda"
            ) {

              return updated;

            }


            updated[
              lastIndex
            ] = {

              ...lastMessage,

              text:
                (
                  lastMessage.text ||
                  ""
                ) + finalChunk,

            };


            return updated;

          }
        );

      }


      setUploadedPdfs([]);

      setUploadedImages([]);


      try {

        await loadConversation(
          chatId
        );

      } catch (conversationError) {

        console.warn(
          "⚠️ Could not refresh conversation:",
          conversationError
        );

      }


      try {

        await refreshChats();

      } catch (refreshError) {

        console.warn(
          "⚠️ Could not refresh chats:",
          refreshError
        );

      }


      console.log(
        "✅ Garuda response completed."
      );


    } catch (error) {

      if (
        error?.name ===
        "AbortError"
      ) {

        console.log(
          "🛑 Garuda generation stopped by user."
        );

        return;
      }


      console.error(
        "❌ Garuda chat error:",
        error
      );


      setMessages(
        (previous) => {

          if (
            previous.length ===
            0
          ) {

            return previous;

          }


          const updated =
            [
              ...previous,
            ];


          const lastIndex =
            updated.length -
            1;


          const lastMessage =
            updated[
              lastIndex
            ];


          if (
            !lastMessage ||
            lastMessage.sender !==
              "garuda"
          ) {

            return updated;

          }


          updated[
            lastIndex
          ] = {

            ...lastMessage,

            text:
              "❌ Unable to connect to Garuda backend. Please try again.",

          };


          return updated;

        }
      );


    } finally {

      if (
        controllerRef.current ===
        controller
      ) {

        controllerRef.current =
          null;

      }


      setLoading(false);

    }

  };

  // ======================================================
  // REGENERATE RESPONSE
  // ======================================================

  const regenerateResponse =
    async () => {

      if (
        loading ||
        !currentChatId
      ) {

        return;

      }


      let garudaIndex =
        -1;


      for (
        let index =
          messages.length -
          1;
        index >= 0;
        index--
      ) {

        if (
          messages[index]
            .sender ===
          "garuda"
        ) {

          garudaIndex =
            index;

          break;

        }

      }


      if (
        garudaIndex ===
        -1
      ) {

        console.warn(
          "⚠️ No Garuda response found."
        );

        return;

      }


      const userIndex =
        garudaIndex -
        1;


      if (
        userIndex < 0 ||
        messages[userIndex]?.sender !==
          "user"
      ) {

        console.warn(
          "⚠️ User question not found."
        );

        return;

      }


      setLoading(
        true
      );


      setMessages(
        (previous) => {

          const updated =
            [
              ...previous,
            ];


          if (
            updated[
              garudaIndex
            ]
          ) {

            updated[
              garudaIndex
            ] = {

              ...updated[
                garudaIndex
              ],

              text:
                "",

            };

          }


          return updated;

        }
      );


      try {

        const controller =
          new AbortController();


        controllerRef.current =
          controller;


        const response =
          await fetch(
            `${API_BASE_URL}/chat/regenerate`,
            {

              method:
                "POST",

              headers: {

                "Content-Type":
                  "application/json",

              },

              signal:
                controller.signal,

              body:
                JSON.stringify({

                  chat_id:
                    currentChatId,

                  message:
                    "",

                }),

            }
          );


        if (
          !response.ok
        ) {

          throw new Error(
            `Regenerate failed: ${response.status}`
          );

        }


        if (
          !response.body
        ) {

          throw new Error(
            "Streaming response not available."
          );

        }


        const reader =
          response.body.getReader();


        const decoder =
          new TextDecoder();


        while (true) {

          const {
            done,
            value,
          } =
            await reader.read();


          if (
            done
          ) {

            break;

          }


          const chunk =
            decoder.decode(
              value,
              {
                stream:
                  true,
              }
            );


          if (
            !chunk
          ) {

            continue;

          }


          setMessages(
            (previous) => {

              const updated =
                [
                  ...previous,
                ];


              if (
                !updated[
                  garudaIndex
                ]
              ) {

                return updated;

              }


              updated[
                garudaIndex
              ] = {

                ...updated[
                  garudaIndex
                ],

                text:
                  updated[
                    garudaIndex
                  ].text +
                  chunk,

              };


              return updated;

            }
          );

        }


        await loadConversation(
          currentChatId
        );


        await refreshChats();


      } catch (error) {

        if (
          error?.name ===
          "AbortError"
        ) {

          console.log(
            "🛑 Regeneration stopped."
          );


          return;

        }


        console.error(
          "❌ Regenerate error:",
          error
        );


        setMessages(
          (previous) => {

            const updated =
              [
                ...previous,
              ];


            if (
              updated[
                garudaIndex
              ]
            ) {

              updated[
                garudaIndex
              ] = {

                ...updated[
                  garudaIndex
                ],

                text:
                  "❌ Unable to regenerate the response.",

              };

            }


            return updated;

          }
        );

      } finally {

        controllerRef.current =
          null;

        setLoading(
          false
        );

      }

    };


  // ======================================================
  // EDIT USER MESSAGE
  // ======================================================

  const editMessage =
    async (
      messageId,
      editedText
    ) => {

      const trimmedText =
        editedText.trim();


      if (
        !trimmedText ||
        loading ||
        !currentChatId
      ) {

        return;

      }


      const messageIndex =
        messages.findIndex(
          (msg) =>
            msg.id ===
            messageId
        );


      if (
        messageIndex ===
        -1
      ) {

        console.warn(
          "⚠️ Message not found:",
          messageId
        );

        return;

      }


      if (
        messages[
          messageIndex
        ].sender !==
        "user"
      ) {

        console.warn(
          "⚠️ Only user messages can be edited."
        );

        return;

      }


      setLoading(
        true
      );


      const temporaryGarudaId =
        Date.now();


      setMessages(
        (previous) => {

          const updated =
            [
              ...previous,
            ];


          const beforeEdit =
            updated.slice(
              0,
              messageIndex +
                1
            );


          beforeEdit[
            messageIndex
          ] = {

            ...beforeEdit[
              messageIndex
            ],

            text:
              trimmedText,

          };


          beforeEdit.push({

            id:
              temporaryGarudaId,

            sender:
              "garuda",

            text:
              "",

          });


          return beforeEdit;

        }
      );


      try {

        const controller =
          new AbortController();


        controllerRef.current =
          controller;


        const response =
          await fetch(
            `${API_BASE_URL}/chat/edit`,
            {

              method:
                "POST",

              headers: {

                "Content-Type":
                  "application/json",

              },

              signal:
                controller.signal,

              body:
                JSON.stringify({

                  chat_id:
                    currentChatId,

                  message_id:
                    messageId,

                  message:
                    trimmedText,

                }),

            }
          );


        if (
          !response.ok
        ) {

          throw new Error(
            "Failed to edit message."
          );

        }


        if (
          !response.body
        ) {

          throw new Error(
            "Streaming not supported."
          );

        }


        const reader =
          response.body.getReader();


        const decoder =
          new TextDecoder();


        while (true) {

          const {
            done,
            value,
          } =
            await reader.read();


          if (
            done
          ) {

            break;

          }


          const chunk =
            decoder.decode(
              value,
              {
                stream:
                  true,
              }
            );


          if (
            !chunk
          ) {

            continue;

          }


          setMessages(
            (previous) => {

              const updated =
                [
                  ...previous,
                ];


              const garudaMessageIndex =
                updated.findIndex(
                  (msg) =>
                    msg.id ===
                    temporaryGarudaId
                );


              if (
                garudaMessageIndex ===
                -1
              ) {

                return updated;

              }


              updated[
                garudaMessageIndex
              ] = {

                ...updated[
                  garudaMessageIndex
                ],

                text:
                  updated[
                    garudaMessageIndex
                  ].text +
                  chunk,

              };


              return updated;

            }
          );

        }


        await loadConversation(
          currentChatId
        );


        await refreshChats();


      } catch (error) {

        if (
          error?.name ===
          "AbortError"
        ) {

          return;

        }


        console.error(
          "❌ Edit message error:",
          error
        );


        setMessages(
          (previous) => {

            const updated =
              [
                ...previous,
              ];


            const garudaMessageIndex =
              updated.findIndex(
                (msg) =>
                  msg.id ===
                  temporaryGarudaId
              );


            if (
              garudaMessageIndex !==
              -1
            ) {

              updated[
                garudaMessageIndex
              ] = {

                ...updated[
                  garudaMessageIndex
                ],

                text:
                  "❌ Unable to update the response.",

              };

            }


            return updated;

          }
        );

      } finally {

        controllerRef.current =
          null;

        setLoading(
          false
        );

      }

    };


  // ======================================================
  // STOP GENERATION
  // ======================================================

  const stopGeneration =
    () => {

      if (
        controllerRef.current
      ) {

        controllerRef.current.abort();

        controllerRef.current =
          null;

      }


      setLoading(
        false
      );

    };


  // ======================================================
  // FLOATING GARUDA WINDOW
  // ======================================================

  if (
    isFloatingGaruda
  ) {

    return (
      <FloatingGaruda />
    );

  }


  // ======================================================
  // REGISTER
  // ======================================================

  if (
    showRegister
  ) {

    return (

      <Register

        onRegisterSuccess={() => {

          setShowRegister(
            false
          );

          setShowLogin(
            true
          );

        }}

        onLogin={() => {

          setShowRegister(
            false
          );

          setShowLogin(
            true
          );

        }}

      />

    );

  }


  // ======================================================
  // LOGIN
  // ======================================================

  if (
    showLogin
  ) {

    return (

      <Login

        onLogin={
          handleLoginSuccess
        }

        onRegister={() => {

          setShowLogin(
            false
          );

          setShowRegister(
            true
          );

        }}

      />

    );

  }


  // ======================================================
  // PROFILE
  // ======================================================

  if (
    showProfile
  ) {

    return (

      <div className="layout">

        <Sidebar

          chats={
            chats
          }

          refreshChats={
            refreshChats
          }

          setCurrentChatId={
            setCurrentChatId
          }

          clearMessages={
            clearMessages
          }

          onSelectChat={
            loadConversation
          }

          currentChatId={
            currentChatId
          }

          deleteChat={
            deleteChat
          }

          updateChatTitle={
            updateChatTitle
          }

          onOpenSettings={
            isAuthenticated
              ? openSettings
              : undefined
          }

          onOpenSmartFolders={
            openSmartFolders
          }

          isAuthenticated={
            isAuthenticated
          }

          onLogin={() =>
            setShowLogin(
              true
            )
          }

        />


        <div className="main smart-folders-main">

          <Header

            isAuthenticated={
              isAuthenticated
            }

            username={
              username
            }

            onLogin={() =>
              setShowLogin(
                true
              )
            }

            onRegister={() =>
              setShowRegister(
                true
              )
            }

            onLogout={
              handleLogout
            }

          />


          <Profile

            onBack={
              closeProfile
            }

            onLogout={
              handleLogout
            }

          />

        </div>

      </div>

    );

  }


  // ======================================================
  // SETTINGS
  // ======================================================

  if (
    showSettings
  ) {

    return (

      <div className="layout">

        <Sidebar

          chats={
            chats
          }

          refreshChats={
            refreshChats
          }

          setCurrentChatId={
            setCurrentChatId
          }

          clearMessages={
            clearMessages
          }

          onSelectChat={
            loadConversation
          }

          currentChatId={
            currentChatId
          }

          deleteChat={
            deleteChat
          }

          updateChatTitle={
            updateChatTitle
          }

          onOpenSettings={
            isAuthenticated
              ? openSettings
              : undefined
          }

          onOpenSmartFolders={
            openSmartFolders
          }

          isAuthenticated={
            isAuthenticated
          }

          onLogin={() =>
            setShowLogin(
              true
            )
          }

        />


        <div className="main">

          <Header

            isAuthenticated={
              isAuthenticated
            }

            username={
              username
            }

            onLogin={() =>
              setShowLogin(
                true
              )
            }

            onRegister={() =>
              setShowRegister(
                true
              )
            }

            onLogout={
              handleLogout
            }

          />


          <Settings

            onBack={
              closeSettings
            }

            onLogout={
              handleLogout
            }

            onOpenProfile={
              openProfile
            }

          />

        </div>

      </div>

    );

  }


  // ======================================================
  // SMART FOLDERS
  // ======================================================

  if (
    showSmartFolders
  ) {

    return (

      <div className="layout">

        <Sidebar

          chats={
            chats
          }

          refreshChats={
            refreshChats
          }

          setCurrentChatId={
            setCurrentChatId
          }

          clearMessages={
            clearMessages
          }

          onSelectChat={
            loadConversation
          }

          currentChatId={
            currentChatId
          }

          deleteChat={
            deleteChat
          }

          updateChatTitle={
            updateChatTitle
          }

          onOpenSettings={
            isAuthenticated
              ? openSettings
              : undefined
          }

          onOpenSmartFolders={
            openSmartFolders
          }

          isAuthenticated={
            isAuthenticated
          }

          onLogin={() =>
            setShowLogin(
              true
            )
          }

        />


        <div className="main">

          <Header

            isAuthenticated={
              isAuthenticated
            }

            username={
              username
            }

            onLogin={() =>
              setShowLogin(
                true
              )
            }

            onRegister={() =>
              setShowRegister(
                true
              )
            }

            onLogout={
              handleLogout
            }

          />


          <SmartFolders

            onBack={
              closeSmartFolders
            }

          />

        </div>

      </div>

    );

  }


  // ======================================================
  // MAIN CHAT UI
  // ======================================================

  return (

    <div className="layout">

      {/* 🧮 Calculator Popup Modal Render */}
      {calculatorOpen && (
        <Calculator
          onClose={() => {
            setCalculatorOpen(false);
          }}
        />
      )}

      <Sidebar

        chats={
          chats
        }

        refreshChats={
          refreshChats
        }

        setCurrentChatId={
          setCurrentChatId
        }

        clearMessages={
          clearMessages
        }

        onSelectChat={
          loadConversation
        }

        currentChatId={
          currentChatId
        }

        deleteChat={
            deleteChat
        }

        updateChatTitle={
          updateChatTitle
        }

        onOpenSettings={
          isAuthenticated
            ? openSettings
            : undefined
        }

        onOpenSmartFolders={
          openSmartFolders
        }

        isAuthenticated={
          isAuthenticated
        }

        onLogin={() =>
          setShowLogin(
            true
          )
        }

      />


      <div className="main">

        <Header

          isAuthenticated={
            isAuthenticated
          }

          username={
            username
          }

          onLogin={() =>
            setShowLogin(
              true
            )
          }

          onRegister={() =>
            setShowRegister(
              true
            )
          }

          onLogout={
            handleLogout
          }

        />


        <ChatWindow

          messages={
            messages
          }

          loading={
            loading
          }

          currentChatId={
            currentChatId
          }

          onRegenerate={
            regenerateResponse
          }

          onCopy={
            copyResponse
          }

          onEdit={
            editMessage
          }

        />


        <InputBar

          message={
            message
          }

          setMessage={
            setMessage
          }

          sendMessage={
            sendMessage
          }

          stopGeneration={
            stopGeneration
          }

          loading={
            loading
          }

          currentChatId={
            currentChatId
          }

          onEnsureChatCreated={
            async () => {

              if (
                currentChatId !== null &&
                currentChatId !== undefined
              ) {

                return currentChatId;

              }


              const createResponse =
                await axios.post(
                  `${API_BASE_URL}/new-chat`,
                  {
                    title:
                      "New Chat",
                  }
                );


              const createdChatId =
                createResponse?.data?.chat_id ??
                createResponse?.data?.id ??
                createResponse?.data?.chat?.id ??
                createResponse?.data?.new_chat_id;


              if (
                createdChatId === null ||
                createdChatId === undefined
              ) {

                throw new Error(
                  "New chat ID was not returned by backend."
                );

              }


              skipNextConversationLoadRef.current =
                true;


              setCurrentChatId(
                createdChatId
              );


              await refreshChats();


              return createdChatId;

            }
          }

          uploadedPdfs={
            uploadedPdfs
          }

          removePdf={
            removePdf
          }

          onPdfUploaded={
            handlePdfUploaded
          }

          onPdfRemoved={
            removePdf
          }

          onImageUploaded={
            handleImageUploaded
          }

          onImageRemoved={
            removeImage
          }

          onAction={
            handlePdfAction
          }

          onOpenCalculator={() => setCalculatorOpen(true)}

        />

        {!window.electronAPI && (
          <FloatingGaruda />
        )}

      </div>

    </div>

  );

}


export default App;