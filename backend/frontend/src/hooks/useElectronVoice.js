import {
    useRef,
    useState,
    useEffect,
} from "react";


export default function useElectronVoice(
    onResult
) {

    const [
        listening,
        setListening,
    ] = useState(false);


    const [
        processing,
        setProcessing,
    ] = useState(false);


    const streamRef =
        useRef(null);


    const recorderRef =
        useRef(null);


    const chunksRef =
        useRef([]);


    const activeRef =
        useRef(false);


    const processingRef =
        useRef(false);


    const resultCallbackRef =
        useRef(onResult);


    useEffect(() => {

        resultCallbackRef.current =
            onResult;

    }, [
        onResult,
    ]);


    // ==================================================
    // CLEANUP
    // ==================================================

    useEffect(() => {

        return () => {

            activeRef.current =
                false;


            processingRef.current =
                false;


            if (
                recorderRef.current
            ) {

                try {

                    if (
                        recorderRef.current.state !==
                        "inactive"
                    ) {

                        recorderRef.current.stop();

                    }

                } catch (
                    error
                ) {

                    console.warn(
                        "Electron recorder cleanup:",
                        error
                    );

                }

            }


            recorderRef.current =
                null;


            if (
                streamRef.current
            ) {

                streamRef.current
                    .getTracks()
                    .forEach(
                        (track) => {

                            track.stop();

                        }
                    );

            }


            streamRef.current =
                null;

        };

    }, []);


    // ==================================================
    // GET MICROPHONE
    // ==================================================

    const getMicrophone =
        async () => {

            console.log(
                "🎤 Electron: Checking microphone access..."
            );


            if (
                !navigator.mediaDevices ||
                typeof navigator
                    .mediaDevices
                    .getUserMedia !==
                    "function"
            ) {

                throw new Error(
                    "Electron microphone API is unavailable."
                );

            }


            try {

                // ------------------------------------------
                // CHECK AVAILABLE AUDIO INPUT DEVICES
                // ------------------------------------------

                let microphones =
                    [];


                try {

                    const devices =
                        await navigator
                            .mediaDevices
                            .enumerateDevices();


                    microphones =
                        devices.filter(
                            (device) =>
                                device.kind ===
                                "audioinput"
                        );


                    console.log(
                        "🎤 Electron microphones found:",
                        microphones.length,
                        microphones
                    );

                } catch (
                    deviceError
                ) {

                    console.warn(
                        "⚠️ Electron microphone device enumeration failed:",
                        deviceError
                    );

                }


                // ------------------------------------------
                // REQUEST MICROPHONE
                // ------------------------------------------

                const stream =
                    await navigator
                        .mediaDevices
                        .getUserMedia({

                            audio: {

                                echoCancellation:
                                    true,

                                noiseSuppression:
                                    true,

                                autoGainControl:
                                    true,

                                channelCount:
                                    1,

                            },

                            video:
                                false,

                        });


                console.log(
                    "✅ Electron microphone stream acquired."
                );


                // ------------------------------------------
                // VERIFY AUDIO TRACK
                // ------------------------------------------

                const audioTracks =
                    stream
                        .getAudioTracks();


                console.log(
                    "🎤 Electron audio tracks:",
                    audioTracks
                );


                if (
                    !audioTracks.length
                ) {

                    stream
                        .getTracks()
                        .forEach(
                            (track) => {

                                track.stop();

                            }
                        );


                    throw new Error(
                        "Microphone stream was created, but no audio track is available."
                    );

                }


                const audioTrack =
                    audioTracks[0];


                console.log(
                    "🎤 Electron active microphone:",
                    {
                        label:
                            audioTrack.label,
                        enabled:
                            audioTrack.enabled,
                        muted:
                            audioTrack.muted,
                        readyState:
                            audioTrack.readyState,
                    }
                );


                return stream;

            } catch (
                error
            ) {

                console.error(
                    "❌ Electron getUserMedia failed:",
                    {
                        name:
                            error?.name,
                        message:
                            error?.message,
                        constraint:
                            error?.constraint,
                    }
                );


                throw error;

            }

        };


    // ==================================================
    // FIND SUPPORTED MIME TYPE
    // ==================================================

    const getMimeType =
        () => {

            const types = [

                "audio/webm;codecs=opus",

                "audio/webm",

                "audio/ogg;codecs=opus",

                "audio/ogg",

            ];


            for (
                const type of types
            ) {

                try {

                    if (
                        MediaRecorder
                            .isTypeSupported(
                                type
                            )
                    ) {

                        console.log(
                            "🎙️ Electron recorder MIME:",
                            type
                        );


                        return type;

                    }

                } catch (
                    error
                ) {

                    console.warn(
                        "MIME check failed:",
                        type,
                        error
                    );

                }

            }


            console.warn(
                "⚠️ No preferred Electron audio MIME type found. Using browser default."
            );


            return "";

        };


    // ==================================================
    // TRANSCRIBE
    // ==================================================

    const transcribe =
        async (
            audioBlob
        ) => {

            if (
                !audioBlob ||
                audioBlob.size <= 0
            ) {

                console.warn(
                    "⚠️ Electron audio blob is empty."
                );


                return "";

            }


            if (
                processingRef.current
            ) {

                console.log(
                    "⏭️ Electron transcription already running."
                );


                return "";

            }


            processingRef.current =
                true;


            setProcessing(
                true
            );


            try {

                console.log(
                    "🎤 Electron recorded audio:",
                    {
                        size:
                            audioBlob.size,
                        type:
                            audioBlob.type,
                    }
                );


                const formData =
                    new FormData();


                formData.append(
    "audio",
    audioBlob,
    "garuda-voice.webm"
);


                console.log(
                    "🎤 Electron sending audio to Whisper..."
                );


                const response =
                    await fetch(
                        "http://127.0.0.1:8000/voice/transcribe",
                        {

                            method:
                                "POST",

                            body:
                                formData,

                        }
                    );


                if (
                    !response.ok
                ) {

                    const errorText =
                        await response
                            .text()
                            .catch(
                                () => ""
                            );


                    console.error(
                        "❌ Electron Whisper response:",
                        response.status,
                        errorText
                    );


                    throw new Error(
                        `Voice transcription failed: ${response.status}`
                    );

                }


                const data =
                    await response.json();


                const transcript =
                    String(
                        data?.text ||
                        data?.transcript ||
                        ""
                    )
                        .replace(
                            /\s+/g,
                            " "
                        )
                        .trim();


                if (
                    !transcript
                ) {

                    console.log(
                        "⚠️ Empty Electron transcript."
                    );


                    return "";

                }


                console.log(
                    "📝 Electron transcript:",
                    transcript
                );


                return transcript;

            } catch (
                error
            ) {

                console.error(
                    "❌ Electron voice transcription error:",
                    error
                );


                return "";

            } finally {

                processingRef.current =
                    false;


                setProcessing(
                    false
                );

            }

        };


    // ==================================================
    // START LISTENING
    // ==================================================

    const startListening =
        async () => {

            if (
                activeRef.current
            ) {

                console.log(
                    "⏭️ Electron voice already listening."
                );


                return;

            }


            if (
                processingRef.current
            ) {

                console.log(
                    "⏭️ Previous Electron voice command is still processing."
                );


                return;

            }


            try {

                console.log(
                    "🎤 Starting Electron microphone..."
                );


                activeRef.current =
                    true;


                // ------------------------------------------
                // GET MICROPHONE STREAM
                // ------------------------------------------

                const stream =
                    await getMicrophone();


                // User may have stopped while
                // microphone permission was requested.

                if (
                    !activeRef.current
                ) {

                    stream
                        .getTracks()
                        .forEach(
                            (track) => {

                                track.stop();

                            }
                        );


                    return;

                }


                streamRef.current =
                    stream;


                // ------------------------------------------
                // CHECK MEDIA RECORDER
                // ------------------------------------------

                if (
                    typeof MediaRecorder ===
                    "undefined"
                ) {

                    throw new Error(
                        "MediaRecorder is unavailable in Electron."
                    );

                }


                const mimeType =
                    getMimeType();


                // ------------------------------------------
                // CREATE RECORDER
                // ------------------------------------------

                const recorder =
                    mimeType
                        ? new MediaRecorder(
                            stream,
                            {
                                mimeType,
                            }
                        )
                        : new MediaRecorder(
                            stream
                        );


                recorderRef.current =
                    recorder;


                chunksRef.current =
                    [];


                // ------------------------------------------
                // RECORDER START
                // ------------------------------------------

                recorder.onstart =
                    () => {

                        console.log(
                            "🎤 Electron recording started."
                        );


                        setListening(
                            true
                        );

                    };


                // ------------------------------------------
                // AUDIO DATA
                // ------------------------------------------

                recorder.ondataavailable =
                    (
                        event
                    ) => {

                        if (
                            event.data &&
                            event.data.size > 0
                        ) {

                            chunksRef.current.push(
                                event.data
                            );

                        }

                    };


                // ------------------------------------------
                // RECORDER ERROR
                // ------------------------------------------

                recorder.onerror =
                    (
                        event
                    ) => {

                        console.error(
                            "❌ Electron MediaRecorder error:",
                            event.error ||
                            event
                        );

                    };


                // ------------------------------------------
                // RECORDER STOP
                // ------------------------------------------

                recorder.onstop =
                    async () => {

                        console.log(
                            "🛑 Electron recording stopped."
                        );


                        setListening(
                            false
                        );


                        recorderRef.current =
                            null;


                        const blob =
                            new Blob(
                                chunksRef.current,
                                {
                                    type:
                                        mimeType ||
                                        "audio/webm",
                                }
                            );


                        console.log(
                            "🎤 Electron audio blob created:",
                            {
                                size:
                                    blob.size,
                                type:
                                    blob.type,
                            }
                        );


                        chunksRef.current =
                            [];


                        // ----------------------------------
                        // RELEASE MICROPHONE
                        // ----------------------------------

                        if (
                            streamRef.current
                        ) {

                            streamRef.current
                                .getTracks()
                                .forEach(
                                    (
                                        track
                                    ) => {

                                        track.stop();

                                    }
                                );

                        }


                        streamRef.current =
                            null;


                        /*
                         * If stopListening() was called,
                         * activeRef is false.
                         *
                         * We still need to transcribe the
                         * audio recorded before stop.
                         */

                        activeRef.current =
                            false;


                        if (
                            !blob ||
                            blob.size <= 0
                        ) {

                            console.warn(
                                "⚠️ Electron recording produced no audio data."
                            );


                            return;

                        }


                        const transcript =
                            await transcribe(
                                blob
                            );


                        if (
                            transcript &&
                            resultCallbackRef.current
                        ) {

                            console.log(
                                "🦅 Sending ONE Electron voice command:",
                                transcript
                            );


                            resultCallbackRef.current(
                                transcript
                            );

                        }

                    };


                // ------------------------------------------
                // START RECORDING
                // ------------------------------------------

                recorder.start();


                console.log(
                    "🎙️ Electron MediaRecorder start requested."
                );

            } catch (
                error
            ) {

                console.error(
                    "❌ Electron microphone failed:",
                    {
                        name:
                            error?.name,
                        message:
                            error?.message,
                        error,
                    }
                );


                activeRef.current =
                    false;


                setListening(
                    false
                );


                if (
                    recorderRef.current
                ) {

                    try {

                        if (
                            recorderRef.current.state !==
                            "inactive"
                        ) {

                            recorderRef.current.stop();

                        }

                    } catch (
                        recorderError
                    ) {

                        console.warn(
                            "⚠️ Electron recorder cleanup failed:",
                            recorderError
                        );

                    }

                }


                recorderRef.current =
                    null;


                if (
                    streamRef.current
                ) {

                    streamRef.current
                        .getTracks()
                        .forEach(
                            (
                                track
                            ) => {

                                track.stop();

                            }
                        );

                }


                streamRef.current =
                    null;

            }

        };


    // ==================================================
    // STOP LISTENING
    // ==================================================

    const stopListening =
        () => {

            console.log(
                "🛑 Stopping Electron voice..."
            );


            setListening(
                false
            );


            const recorder =
                recorderRef.current;


            if (
                recorder &&
                recorder.state !==
                    "inactive"
            ) {

                try {

                    /*
                     * Do NOT set activeRef to false
                     * before recorder.onstop.
                     *
                     * onstop must process the recorded
                     * audio and send it to Whisper.
                     */

                    recorder.stop();

                } catch (
                    error
                ) {

                    console.warn(
                        "⚠️ Electron recorder stop failed:",
                        error
                    );


                    activeRef.current =
                        false;

                }

            } else {

                activeRef.current =
                    false;


                if (
                    streamRef.current
                ) {

                    streamRef.current
                        .getTracks()
                        .forEach(
                            (
                                track
                            ) => {

                                track.stop();

                            }
                        );

                }


                streamRef.current =
                    null;


                recorderRef.current =
                    null;

            }

        };


    // ==================================================
    // RETURN
    // ==================================================

    return {

        listening,

        processing,

        startListening,

        stopListening,

    };

}