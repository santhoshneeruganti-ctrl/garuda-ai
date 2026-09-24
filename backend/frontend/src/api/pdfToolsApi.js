import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API = axios.create({
    baseURL: API_BASE_URL,
});

export async function summarizePdf(chatId) {
    const response = await API.post("/pdf-tools/summarize", {
        chat_id: chatId,
    });

    return response.data;
}