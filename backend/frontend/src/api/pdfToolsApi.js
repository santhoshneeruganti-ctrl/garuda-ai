import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8000",
});

export async function summarizePdf(chatId) {
    const response = await API.post("/pdf-tools/summarize", {
        chat_id: chatId,
    });

    return response.data;
}