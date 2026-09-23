import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    executeGarudaCommand,
} from "../services/garudaCommandEngine";


// ======================================================
// 🧹 CLEAN INTERNAL TOOL-CALL TEXT
// ======================================================

const cleanToolCalls = (text = "") => {

    if (!text) {
        return "";
    }

    let cleaned = String(text);

    // XML tool call
    cleaned = cleaned.replace(
        /<tool_call>[\s\S]*?<\/tool_call>/gi,
        ""
    );

    // Function block
    cleaned = cleaned.replace(
        /<function[\s\S]*?<\/function>/gi,
        ""
    );

    // Tool call marker
    cleaned = cleaned.replace(
        /<\|tool_call\|>[\s\S]*?<\|\/tool_call\|>/gi,
        ""
    );

    // Function call marker
    cleaned = cleaned.replace(
        /<\|function_call\|>[\s\S]*?<\|\/function_call\|>/gi,
        ""
    );

    // Tool JSON
    cleaned = cleaned.replace(
        /^\s*\{[\s\S]*?"(?:tool|query|arguments)"[\s\S]*?\}\s*$/gi,
        ""
    );

    return cleaned.trim();
};


// ======================================================
// 🧠 STREAM UPDATE HELPER
// ======================================================

const appendStreamText = (
    setMessages,
    messageId,
    text
) => {

    if (!text) {
        return;
    }

    setMessages((previous) => {

        const index =
            previous.findIndex(
                (item) =>
                    item.id === messageId
            );

        if (index === -1) {
            return previous;
        }

        const updated = [
            ...previous,
        ];

        updated[index] = {
            ...updated[index],
            text:
                (updated[index].text || "") +
                text,
        };

        return updated;
    });
};


// ======================================================
// CHAT HOOK
// ======================================================

export default function useChat(
    uploadedPdfs = []
) {

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


    const [
        currentChatId,
        setCurrentChatId,
    ] = useState(2);


    const [
        chats,
        setChats,
    ] = useState([]);


    // ==================================================
    // 🛑 ACTIVE REQUEST
    // ==================================================

    const abortControllerRef =
        useRef(null);


    // ==================================================
    // 🎯 CURRENT STREAM MESSAGE ID
    // ==================================================

    const streamMessageIdRef =
        useRef(null);


    // ==================================================
    // 📦 STREAM BUFFER
    // ==================================================

    const streamBufferRef =
        useRef("");


    // ==================================================
    // 🎞️ ANIMATION FRAME
    // ==================================================

    const streamFrameRef =
        useRef(null);


    // ======================================================
    // 🎙️ VOICE INPUT & TTS REFS (Steps 1, 2, 5)
    // ======================================================

    const voiceInputRef = useRef(false);
    const voiceResponseTextRef = useRef("");
    const speechAudioRef = useRef(null);


    // ======================================================
    // 🔊 SPEAK GARUDA RESPONSE (Step 2)
    // ======================================================

    const speakGarudaResponse = useCallback(
        async (text) => {

            const cleanText =
                String(text || "").trim();

            if (!cleanText) {
                return;
            }

            try {

                // Stop previous audio
                if (speechAudioRef.current) {

                    speechAudioRef.current.pause();

                    speechAudioRef.current.currentTime =
                        0;

                    speechAudioRef.current =
                        null;
                }

                console.log(
                    "🔊 Garuda TTS:",
                    cleanText.slice(0, 100)
                );

                const response =
                    await fetch(
                        "http://127.0.0.1:8000/voice/speak",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body: JSON.stringify({
                                text: cleanText,
                            }),
                        }
                    );

                if (!response.ok) {

                    throw new Error(
                        `TTS request failed: ${response.status}`
                    );
                }

                const audioBlob =
                    await response.blob();

                if (
                    !audioBlob ||
                    audioBlob.size === 0
                ) {

                    throw new Error(
                        "TTS returned empty audio."
                    );
                }

                const audioUrl =
                    URL.createObjectURL(
                        audioBlob
                    );

                const audio =
                    new Audio(
                        audioUrl
                    );

                speechAudioRef.current =
                    audio;

                audio.onended = () => {

                    URL.revokeObjectURL(
                        audioUrl
                    );

                    if (
                        speechAudioRef.current ===
                        audio
                    ) {

                        speechAudioRef.current =
                            null;
                    }
                };

                audio.onerror = () => {

                    console.error(
                        "❌ Garuda audio playback failed."
                    );

                    URL.revokeObjectURL(
                        audioUrl
                    );

                    if (
                        speechAudioRef.current ===
                        audio
                    ) {

                        speechAudioRef.current =
                            null;
                    }
                };

                await audio.play();

                console.log(
                    "🔊 Garuda is speaking..."
                );

            } catch (error) {

                console.error(
                    "❌ Garuda TTS error:",
                    error
                );
            }
        },
        []
    );


    // ==================================================
    // 🧹 FLUSH STREAM BUFFER
    // ==================================================

    const flushStreamBuffer = useCallback(() => {

        if (!streamMessageIdRef.current) {
            streamBufferRef.current = "";
            return;
        }

        const bufferedText =
            streamBufferRef.current;

        if (!bufferedText) {
            return;
        }

        streamBufferRef.current = "";

        appendStreamText(
            setMessages,
            streamMessageIdRef.current,
            bufferedText
        );

        streamFrameRef.current = null;

    }, []);


    // ==================================================
    // 📥 QUEUE STREAM CHUNK
    // ==================================================

    const queueStreamChunk = useCallback(
        (chunk) => {

            if (!chunk) {
                return;
            }

            // Step 5: Collect AI response text for voice output
            if (
                voiceInputRef.current
            ) {

                voiceResponseTextRef.current +=
                    chunk;

            }

            streamBufferRef.current +=
                chunk;

            if (
                streamFrameRef.current ===
                null
            ) {

                streamFrameRef.current =
                    requestAnimationFrame(() => {

                        flushStreamBuffer();

                    });
            }

        },
        [
            flushStreamBuffer,
        ]
    );


    // ==================================================
    // 🧹 CLEAN STREAM RESOURCES
    // ==================================================

    const cleanupStream = useCallback(() => {

        if (
            streamFrameRef.current !==
            null
        ) {

            cancelAnimationFrame(
                streamFrameRef.current
            );

            streamFrameRef.current =
                null;
        }

        // Flush remaining text before cleanup
        if (
            streamMessageIdRef.current &&
            streamBufferRef.current
        ) {

            const remainingText =
                streamBufferRef.current;

            streamBufferRef.current =
                "";

            appendStreamText(
                setMessages,
                streamMessageIdRef.current,
                remainingText
            );
        }

        streamMessageIdRef.current =
            null;

    }, []);


    // ==================================================
    // 🧹 CLEANUP ON UNMOUNT (Step 10)
    // ==================================================

    useEffect(() => {

        return () => {

            if (
                abortControllerRef.current
            ) {

                abortControllerRef.current.abort();
            }

            cleanupStream();

            if (
                speechAudioRef.current
            ) {

                speechAudioRef.current.pause();

                speechAudioRef.current.currentTime =
                    0;

                speechAudioRef.current =
                    null;
            }

        };

    }, [
        cleanupStream,
    ]);


    // ======================================================
    // SEND NORMAL MESSAGE (Steps 3, 4, 6, 7)
    // ======================================================

    const sendMessage = async (
        customText = null,
        options = {}
    ) => {

        const textToSend = (
            customText || message
        ).trim();


        if (
            !textToSend ||
            loading
        ) {
            return;
        }


        const isVoiceInput =
            options?.isVoiceInput === true;


        voiceInputRef.current =
            isVoiceInput;


        const tempUserId =
            Date.now();

        const garudaMessageId =
            tempUserId + 1;


        setMessage("");


        // Snapshot current PDF attachments
        const messagePdfs =
            Array.isArray(
                uploadedPdfs
            )
                ? uploadedPdfs
                    .filter(
                        (pdf) =>
                            pdf &&
                            pdf.id !== null &&
                            pdf.id !== undefined
                    )
                    .map(
                        (pdf) => ({
                            id: pdf.id,
                            name:
                                pdf.name ||
                                "Unnamed PDF",
                        })
                    )
                : [];


        // Desktop command interceptor
        const commandResult =
            await executeGarudaCommand(
                textToSend
            );


        if (
            commandResult &&
            commandResult.handled
        ) {

            console.log(
                "🦅 Desktop command handled locally:",
                commandResult
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
                            textToSend,

                        uploaded_pdfs:
                            messagePdfs,
                    },

                    {
                        id:
                            garudaMessageId,

                        sender:
                            "garuda",

                        text:
                            commandResult.message,
                    },
                ]
            );

            // Step 4: Speak local command result if voice input
            if (
                isVoiceInput &&
                commandResult.message
            ) {

                await speakGarudaResponse(
                    commandResult.message
                );

            }

            return;
        }


        // Start loading
        setLoading(true);


        // Step 6: Reset stream state & voice buffer
        cleanupStream();
        voiceResponseTextRef.current = "";

        streamMessageIdRef.current =
            garudaMessageId;


        // Add user + garuda placeholder
        setMessages(
            (previous) => [
                ...previous,

                {
                    id:
                        tempUserId,

                    sender:
                        "user",

                    text:
                        textToSend,

                    uploaded_pdfs:
                        messagePdfs,
                },

                {
                    id:
                        garudaMessageId,

                    sender:
                        "garuda",

                    text:
                        "",
                },
            ]
        );


        try {

            const controller =
                new AbortController();

            abortControllerRef.current =
                controller;


            const response =
                await fetch(
                    "http://127.0.0.1:8000/chat/stream",
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({

                                chat_id:
                                    currentChatId,

                                message:
                                    textToSend,

                                uploaded_pdfs:
                                    messagePdfs,

                            }),

                        signal:
                            controller.signal,
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Failed to connect to backend."
                );
            }


            if (!response.body) {

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


                if (done) {
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


                queueStreamChunk(
                    chunk
                );
            }


            const finalChunk =
                decoder.decode();


            if (finalChunk) {

                queueStreamChunk(
                    finalChunk
                );
            }


            if (
                streamFrameRef.current !==
                null
            ) {

                cancelAnimationFrame(
                    streamFrameRef.current
                );

                streamFrameRef.current =
                    null;
            }


            flushStreamBuffer();


            // Step 7: Trigger TTS after full stream completion
            if (
                isVoiceInput &&
                voiceResponseTextRef.current.trim()
            ) {

                await speakGarudaResponse(
                    voiceResponseTextRef.current
                );

            }


        } catch (error) {

            if (
                error?.name ===
                "AbortError"
            ) {

                console.log(
                    "🛑 Chat generation stopped."
                );

            } else {

                console.error(
                    "❌ Chat stream error:",
                    error
                );


                setMessages(
                    (previous) => {

                        const updated = [
                            ...previous,
                        ];


                        const index =
                            updated.findIndex(
                                (item) =>
                                    item.id ===
                                    garudaMessageId
                            );


                        if (
                            index === -1
                        ) {
                            return updated;
                        }


                        updated[index] = {
                            ...updated[index],

                            sender:
                                "garuda",

                            text:
                                "❌ Cannot connect to Garuda backend.",
                        };


                        return updated;
                    }
                );
            }

        } finally {

            cleanupStream();

            abortControllerRef.current =
                null;

            setLoading(false);
        }
    };


    // ======================================================
    // 🛑 STOP GENERATION (Step 9)
    // ======================================================

    const stopGeneration = () => {

        // Stop active speech
        if (
            speechAudioRef.current
        ) {

            speechAudioRef.current.pause();

            speechAudioRef.current.currentTime =
                0;

            speechAudioRef.current =
                null;
        }


        if (
            abortControllerRef.current
        ) {

            abortControllerRef.current.abort();

            abortControllerRef.current =
                null;
        }


        cleanupStream();

        setLoading(false);
    };


    // ======================================================
    // 🔄 REGENERATE LAST RESPONSE
    // ======================================================

    const regenerateResponse = async () => {

        if (loading) {
            return;
        }


        const lastGarudaIndex =
            [...messages]
                .map(
                    (msg, index) => ({
                        msg,
                        index,
                    })
                )
                .reverse()
                .find(
                    ({ msg }) =>
                        msg.sender ===
                        "garuda"
                )?.index;


        if (
            lastGarudaIndex ===
            undefined
        ) {

            console.warn(
                "⚠️ No Garuda response to regenerate."
            );

            return;
        }


        const lastGarudaMessage =
            messages[
                lastGarudaIndex
            ];


        const lastGarudaMessageId =
            lastGarudaMessage.id;


        setLoading(true);


        cleanupStream();

        streamMessageIdRef.current =
            lastGarudaMessageId;


        setMessages(
            (previous) => {

                const updated = [
                    ...previous,
                ];


                if (
                    !updated[
                        lastGarudaIndex
                    ]
                ) {
                    return updated;
                }


                updated[
                    lastGarudaIndex
                ] = {

                    ...updated[
                        lastGarudaIndex
                    ],

                    text:
                        "",
                };


                return updated;
            }
        );


        try {

            const controller =
                new AbortController();

            abortControllerRef.current =
                controller;


            const response =
                await fetch(
                    "http://127.0.0.1:8000/chat/regenerate",
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({

                                chat_id:
                                    currentChatId,

                                message:
                                    "",
                            }),

                        signal:
                            controller.signal,
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Failed to regenerate response."
                );
            }


            if (!response.body) {

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


                if (done) {
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


                queueStreamChunk(
                    chunk
                );
            }


            const finalChunk =
                decoder.decode();


            if (finalChunk) {

                queueStreamChunk(
                    finalChunk
                );
            }


            if (
                streamFrameRef.current !==
                null
            ) {

                cancelAnimationFrame(
                    streamFrameRef.current
                );

                streamFrameRef.current =
                    null;
            }


            flushStreamBuffer();


        } catch (error) {

            if (
                error?.name ===
                "AbortError"
            ) {

                console.log(
                    "🛑 Regeneration stopped."
                );

            } else {

                console.error(
                    "❌ Regenerate error:",
                    error
                );


                setMessages(
                    (previous) => {

                        const updated = [
                            ...previous,
                        ];


                        if (
                            !updated[
                                lastGarudaIndex
                            ]
                        ) {
                            return updated;
                        }


                        updated[
                            lastGarudaIndex
                        ] = {

                            ...updated[
                                lastGarudaIndex
                            ],

                            text:
                                "❌ Unable to regenerate the response.",
                        };


                        return updated;
                    }
                );
            }

        } finally {

            cleanupStream();

            abortControllerRef.current =
                null;

            setLoading(false);
        }
    };


    // ======================================================
    // ✏️ EDIT USER MESSAGE
    // ======================================================

    const editMessage = async (
        messageId,
        editedText
    ) => {

        const trimmedText =
            editedText.trim();


        if (
            !trimmedText ||
            loading
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
            messageIndex === -1
        ) {

            console.warn(
                "⚠️ Message not found:",
                messageId
            );

            return;
        }


        setLoading(true);


        const newGarudaMessageId =
            Date.now();


        cleanupStream();

        streamMessageIdRef.current =
            newGarudaMessageId;


        setMessages(
            (previous) => {

                const updated = [
                    ...previous,
                ];


                updated[
                    messageIndex
                ] = {

                    ...updated[
                        messageIndex
                    ],

                    text:
                        trimmedText,
                };


                if (
                    updated[
                        messageIndex + 1
                    ]?.sender ===
                    "garuda"
                ) {

                    updated.splice(
                        messageIndex + 1,
                        1
                    );
                }


                updated.splice(
                    messageIndex + 1,
                    0,
                    {

                        id:
                            newGarudaMessageId,

                        sender:
                            "garuda",

                        text:
                            "",
                    }
                );


                return updated;
            }
        );


        try {

            const controller =
                new AbortController();

            abortControllerRef.current =
                controller;


            const response =
                await fetch(
                    "http://127.0.0.1:8000/chat/edit",
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({

                                chat_id:
                                    currentChatId,

                                message_id:
                                    messageId,

                                message:
                                    trimmedText,
                            }),

                        signal:
                            controller.signal,
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Failed to edit message."
                );
            }


            if (!response.body) {

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


                if (done) {
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


                queueStreamChunk(
                    chunk
                );
            }


            const finalChunk =
                decoder.decode();


            if (finalChunk) {

                queueStreamChunk(
                    finalChunk
                );
            }


            if (
                streamFrameRef.current !==
                null
            ) {

                cancelAnimationFrame(
                    streamFrameRef.current
                );

                streamFrameRef.current =
                    null;
            }


            flushStreamBuffer();


        } catch (error) {

            if (
                error?.name ===
                "AbortError"
            ) {

                console.log(
                    "🛑 Edit generation stopped."
                );

            } else {

                console.error(
                    "❌ Edit message error:",
                    error
                );


                setMessages(
                    (previous) => {

                        const updated = [
                            ...previous,
                        ];


                        const garudaIndex =
                            updated.findIndex(
                                (msg) =>
                                    msg.id ===
                                    newGarudaMessageId
                            );


                        if (
                            garudaIndex ===
                            -1
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
                                "❌ Unable to update the response.",
                        };


                        return updated;
                    }
                );
            }

        } finally {

            cleanupStream();

            abortControllerRef.current =
                null;

            setLoading(false);
        }
    };


    // ======================================================
    // 💡 MINI CHAT FOLLOW-UP
    // ======================================================

    const sendFollowUpQuestion = async ({
        originalQuestion = "",
        originalAnswer = "",
        miniConversation = [],
        question = "",
    }) => {

        const trimmedQuestion =
            question.trim();


        if (!trimmedQuestion) {
            return "";
        }


        const safeOriginalAnswer =
            cleanToolCalls(
                originalAnswer
            );


        const safeMiniConversation =
            Array.isArray(
                miniConversation
            )
                ? miniConversation.map(
                    (item) => ({

                        question:
                            cleanToolCalls(
                                item?.question ||
                                ""
                            ),

                        answer:
                            cleanToolCalls(
                                item?.answer ||
                                ""
                            ),

                    })
                )
                : [];


        try {

            const response =
                await fetch(
                    "http://127.0.0.1:8000/chat/follow-up",
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({

                                original_question:
                                    originalQuestion,

                                original_answer:
                                    safeOriginalAnswer,

                                mini_conversation:
                                    safeMiniConversation,

                                question:
                                    trimmedQuestion,
                            }),
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Failed to connect to Garuda follow-up service."
                );
            }


            if (!response.body) {

                throw new Error(
                    "Streaming not supported."
                );
            }


            const reader =
                response.body.getReader();


            const decoder =
                new TextDecoder();


            let result = "";


            while (true) {

                const {
                    done,
                    value,
                } =
                    await reader.read();


                if (done) {
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


                result += chunk;
            }


            const finalChunk =
                decoder.decode();


            if (finalChunk) {

                result += finalChunk;
            }


            const cleanedResult =
                cleanToolCalls(
                    result
                );


            return (
                cleanedResult ||
                "No answer received."
            );

        } catch (error) {

            console.error(
                "❌ Mini follow-up error:",
                error
            );


            return (
                "❌ Unable to answer your question."
            );
        }
    };


    // ======================================================
    // RETURN
    // ======================================================

    return {

        message,
        setMessage,

        messages,
        setMessages,

        loading,
        setLoading,

        currentChatId,
        setCurrentChatId,

        chats,
        setChats,

        sendMessage,

        stopGeneration,

        regenerateResponse,

        editMessage,

        sendFollowUpQuestion,
    };
}