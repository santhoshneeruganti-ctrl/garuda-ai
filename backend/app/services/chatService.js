import api from "./api";

export const getChats = async () => {
  const res = await api.get("/chats");
  return res.data;
};

export const getConversation = async (chatId) => {
  const res = await api.get(`/chat/${chatId}`);
  return res.data;
};

export const deleteChat = async (chatId) => {
  return await api.delete(`/chat/${chatId}`);
};

export const renameChat = async (chatId, title) => {
  return await api.put(`/chat/${chatId}/title`, {
    title,
  });
};

export const sendNormalMessage = async (chatId, message) => {
  return await api.post("/chat", {
    chat_id: chatId,
    message,
  });
};

export const streamMessage = async (chatId, message) => {

  return await fetch(
    "http://127.0.0.1:8000/chat/stream",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        chat_id: chatId,
        message,
      }),
    }
  );

};

export const regenerateMessage = async (chatId) => {

  return await fetch(
    "http://127.0.0.1:8000/chat/regenerate",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        chat_id: chatId,
        message: "",
      }),
    }
  );

};