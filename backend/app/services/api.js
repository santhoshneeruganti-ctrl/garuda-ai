import axios from "axios";


const API_BASE_URL = "http://127.0.0.1:8000";


const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 120000,
});


export async function uploadImage(
    file,
    chatId
) {

    const formData = new FormData();

    formData.append(
        "file",
        file
    );

    formData.append(
        "chat_id",
        String(chatId)
    );

    return api.post(
        "/image/upload",
        formData
    );
}


export async function uploadPDF(
    file,
    chatId
) {

    const formData = new FormData();

    formData.append(
        "file",
        file
    );

    formData.append(
        "chat_id",
        String(chatId)
    );

    return api.post(
        "/pdf/upload",
        formData
    );
}


export default api;