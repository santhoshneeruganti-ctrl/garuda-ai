import {
    useEffect,
    useRef,
    useState,
} from "react";

export default function useGarudaAssistant(
    enabled,
    onCommand
) {
    // ==================================================
    // AUDIO REFERENCES
    // ==================================================

    const streamRef = useRef(null);
    const recorderRef = useRef(null);
    const chunksRef = useRef([]);

    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);

    const animationFrameRef = useRef(null);
    const silenceTimerRef = useRef(null);
    const maxRecordingTimerRef = useRef(null);
    const restartTimerRef = useRef(null);

    // ==================================================
    // LATEST VALUES
    // ==================================================

    const enabledRef = useRef(enabled);
    const onCommandRef = useRef(onCommand);

    // ==================================================
    // STATE CONTROL
    // ==================================================

    const recordingStartedRef = useRef(false);
    const recordingStartTimeRef = useRef(null);
    const speechDetectedRef = useRef(false);
    const startingRef = useRef(false);
    const sessionRef = useRef(0);

    // ==================================================
    // TRANSCRIPTION CONTROL
    // ==================================================

    const transcribingRef = useRef(false);

    const lastTranscriptRef = useRef("");
    const lastTranscriptTimeRef = useRef(0);

    const TRANSCRIPT_DUPLICATE_COOLDOWN = 2500;

    // ==================================================
    // REACT STATE
    // ==================================================

    const [listening, setListening] = useState(false);
    const [processing, setProcessing] = useState(false);

    // ==================================================
    // SETTINGS
    // ==================================================

    const SILENCE_THRESHOLD = 0.020;

    const SILENCE_DURATION = 900;

    const MAX_RECORDING_DURATION = 12000;

    const MIN_RECORDING_DURATION = 450;

    // ==================================================
    // KEEP LATEST VALUES
    // ==================================================

    useEffect(() => {
        enabledRef.current = enabled;
    }, [enabled]);

    useEffect(() => {
        onCommandRef.current = onCommand;
    }, [onCommand]);

    // ==================================================
    // TRANSCRIBE AUDIO
    // ==================================================

    const transcribeAudio = async (audioBlob) => {
        if (transcribingRef.current) {
            console.log(
                "⏳ Garuda transcription already running."
            );
            return;
        }

        if (
            !audioBlob ||
            audioBlob.size < 1000
        ) {
            console.log(
                "ℹ️ Audio too small. Skipping."
            );
            return;
        }

        transcribingRef.current = true;
        setProcessing(true);

        try {
            console.log(
                "🎤 Sending audio to Garuda..."
            );

            const formData = new FormData();

            formData.append(
                "audio",
                audioBlob,
                "garuda-command.webm"
            );

            const controller =
                new AbortController();

            const timeout =
                setTimeout(() => {
                    controller.abort();
                }, 20000);

            let response;

            try {
                response = await fetch(
                    "http://127.0.0.1:8000/voice/transcribe",
                    {
                        method: "POST",
                        body: formData,
                        signal: controller.signal,
                    }
                );
            } finally {
                clearTimeout(timeout);
            }

            if (!response.ok) {
                throw new Error(
                    `Voice API failed with status ${response.status}`
                );
            }

            const data =
                await response.json();

            console.log(
                "🧠 Whisper response:",
                data
            );

            const transcript =
                String(
                    data?.text || ""
                )
                    .trim();

            if (!transcript) {
                console.log(
                    "ℹ️ No speech detected."
                );
                return;
            }

            const normalizedTranscript =
                transcript
                    .toLowerCase()
                    .replace(/\s+/g, " ")
                    .trim();

            const now = Date.now();

            // ==================================================
            // DUPLICATE COMMAND PROTECTION
            // ==================================================

            if (
                normalizedTranscript ===
                    lastTranscriptRef.current &&
                now -
                    lastTranscriptTimeRef.current <
                    TRANSCRIPT_DUPLICATE_COOLDOWN
            ) {
                console.log(
                    "♻️ Duplicate transcript ignored:",
                    transcript
                );

                return;
            }

            lastTranscriptRef.current =
                normalizedTranscript;

            lastTranscriptTimeRef.current =
                now;

            // ==================================================
            // SEND COMMAND
            // ==================================================

            console.log(
                "🗣️ Garuda heard:",
                transcript
            );

            const commandHandler =
                onCommandRef.current;

            if (
                typeof commandHandler !==
                "function"
            ) {
                console.error(
                    "❌ Garuda command handler unavailable."
                );

                return;
            }

            const result =
                await commandHandler(
                    transcript
                );

            console.log(
                "✅ Garuda command result:",
                result
            );

        } catch (error) {
            if (
                error?.name ===
                "AbortError"
            ) {
                console.error(
                    "⏱️ Voice transcription timed out."
                );
            } else {
                console.error(
                    "❌ Voice transcription failed:",
                    error
                );
            }

        } finally {
            transcribingRef.current = false;

            setProcessing(false);
        }
    };

    // ==================================================
    // STOP AUDIO MONITORING
    // ==================================================

    const stopAudioMonitoring = () => {
        if (
            animationFrameRef.current
        ) {
            cancelAnimationFrame(
                animationFrameRef.current
            );

            animationFrameRef.current =
                null;
        }

        if (
            silenceTimerRef.current
        ) {
            clearTimeout(
                silenceTimerRef.current
            );

            silenceTimerRef.current =
                null;
        }

        if (
            maxRecordingTimerRef.current
        ) {
            clearTimeout(
                maxRecordingTimerRef.current
            );

            maxRecordingTimerRef.current =
                null;
        }
    };

    // ==================================================
    // RELEASE AUDIO RESOURCES
    // ==================================================

    const releaseAudioResources = () => {
        if (streamRef.current) {
            streamRef.current
                .getTracks()
                .forEach((track) => {
                    try {
                        track.stop();
                    } catch (error) {
                        // Already stopped
                    }
                });

            streamRef.current = null;
        }

        if (sourceRef.current) {
            try {
                sourceRef.current.disconnect();
            } catch (error) {
                // Already disconnected
            }

            sourceRef.current = null;
        }

        analyserRef.current = null;

        if (audioContextRef.current) {
            try {
                audioContextRef.current.close();
            } catch (error) {
                // Already closed
            }

            audioContextRef.current = null;
        }
    };

    // ==================================================
    // STOP RECORDING
    // ==================================================

    const stopRecording = () => {
        console.log(
            "🛑 Stopping Garuda recording..."
        );

        sessionRef.current += 1;

        stopAudioMonitoring();

        if (
            restartTimerRef.current
        ) {
            clearTimeout(
                restartTimerRef.current
            );

            restartTimerRef.current =
                null;
        }

        recordingStartTimeRef.current =
            null;

        setListening(false);

        const recorder =
            recorderRef.current;

        if (
            recorder &&
            recorder.state === "recording"
        ) {
            try {
                recorder.stop();
            } catch (error) {
                console.log(
                    "Recorder stop skipped."
                );
            }
        } else {
            recorderRef.current =
                null;

            recordingStartedRef.current =
                false;

            releaseAudioResources();
        }
    };

    // ==================================================
    // MONITOR MICROPHONE
    // ==================================================

    const monitorAudio = () => {
        if (!enabledRef.current) {
            return;
        }

        const analyser =
            analyserRef.current;

        const recorder =
            recorderRef.current;

        if (
            !analyser ||
            !recorder ||
            recorder.state !==
                "recording"
        ) {
            return;
        }

        const dataArray =
            new Uint8Array(
                analyser.fftSize
            );

        analyser.getByteTimeDomainData(
            dataArray
        );

        let sum = 0;

        for (
            let index = 0;
            index < dataArray.length;
            index++
        ) {
            const normalized =
                (
                    dataArray[index] -
                    128
                ) / 128;

            sum +=
                normalized *
                normalized;
        }

        const rms =
            Math.sqrt(
                sum /
                dataArray.length
            );

        const isSpeaking =
            rms >
            SILENCE_THRESHOLD;

        // ==================================================
        // SPEECH DETECTED
        // ==================================================

        if (isSpeaking) {
            if (
                !speechDetectedRef.current
            ) {
                speechDetectedRef.current =
                    true;

                console.log(
                    "🗣️ Speech detected..."
                );
            }

            if (
                silenceTimerRef.current
            ) {
                clearTimeout(
                    silenceTimerRef.current
                );

                silenceTimerRef.current =
                    null;
            }
        }

        // ==================================================
        // SILENCE DETECTED
        // ==================================================

        else if (
            speechDetectedRef.current
        ) {
            if (
                !silenceTimerRef.current
            ) {
                silenceTimerRef.current =
                    setTimeout(() => {
                        const startTime =
                            recordingStartTimeRef.current;

                        const duration =
                            startTime
                                ? Date.now() -
                                  startTime
                                : 0;

                        if (
                            duration >=
                            MIN_RECORDING_DURATION
                        ) {
                            console.log(
                                "🤫 Speech ended."
                            );

                            stopRecording();
                        }

                        silenceTimerRef.current =
                            null;
                    }, SILENCE_DURATION);
            }
        }

        // ==================================================
        // CONTINUE MONITORING
        // ==================================================

        if (
            enabledRef.current &&
            recorderRef.current &&
            recorderRef.current.state ===
                "recording"
        ) {
            animationFrameRef.current =
                requestAnimationFrame(
                    monitorAudio
                );
        }
    };

    // ==================================================
    // START RECORDING
    // ==================================================

    const startRecording = async () => {
        if (!enabledRef.current) {
            return;
        }

        if (startingRef.current) {
            console.log(
                "⏳ Garuda start already in progress."
            );

            return;
        }

        if (
            recorderRef.current &&
            recorderRef.current.state ===
                "recording"
        ) {
            console.log(
                "🎤 Garuda already listening."
            );

            return;
        }

        startingRef.current = true;

        const currentSession =
            ++sessionRef.current;

        try {
            console.log(
                "🎤 Starting Garuda microphone..."
            );

            // ==================================================
            // MICROPHONE
            // ==================================================

            if (!streamRef.current) {
                streamRef.current =
                    await navigator
                        .mediaDevices
                        .getUserMedia({
                            audio: true,
                        });

                console.log(
                    "✅ Microphone access granted."
                );
            }

            // ==================================================
            // CANCEL OLD START
            // ==================================================

            if (
                !enabledRef.current ||
                currentSession !==
                    sessionRef.current
            ) {
                releaseAudioResources();

                startingRef.current =
                    false;

                return;
            }

            // ==================================================
            // MEDIA RECORDER
            // ==================================================

            if (
                !window.MediaRecorder
            ) {
                throw new Error(
                    "MediaRecorder is not supported."
                );
            }

            // ==================================================
            // AUDIO FORMAT
            // ==================================================

            let mimeType =
                "audio/webm;codecs=opus";

            if (
                !MediaRecorder.isTypeSupported(
                    mimeType
                )
            ) {
                mimeType =
                    "audio/webm";
            }

            if (
                !MediaRecorder.isTypeSupported(
                    mimeType
                )
            ) {
                mimeType = "";
            }

            // ==================================================
            // AUDIO CONTEXT
            // ==================================================

            if (
                !audioContextRef.current
            ) {
                const AudioContext =
                    window.AudioContext ||
                    window.webkitAudioContext;

                if (!AudioContext) {
                    throw new Error(
                        "AudioContext is not supported."
                    );
                }

                audioContextRef.current =
                    new AudioContext();
            }

            const audioContext =
                audioContextRef.current;

            if (
                audioContext.state ===
                "suspended"
            ) {
                await audioContext.resume();
            }

            // ==================================================
            // AUDIO SOURCE
            // ==================================================

            const source =
                audioContext
                    .createMediaStreamSource(
                        streamRef.current
                    );

            // ==================================================
            // ANALYSER
            // ==================================================

            const analyser =
                audioContext.createAnalyser();

            analyser.fftSize = 2048;

            analyser.smoothingTimeConstant =
                0.8;

            source.connect(
                analyser
            );

            sourceRef.current =
                source;

            analyserRef.current =
                analyser;

            // ==================================================
            // MEDIA RECORDER
            // ==================================================

            const recorder =
                mimeType
                    ? new MediaRecorder(
                        streamRef.current,
                        {
                            mimeType,
                        }
                    )
                    : new MediaRecorder(
                        streamRef.current
                    );

            recorderRef.current =
                recorder;

            chunksRef.current = [];

            recordingStartedRef.current =
                true;

            speechDetectedRef.current =
                false;

            recordingStartTimeRef.current =
                Date.now();

            // ==================================================
            // AUDIO DATA
            // ==================================================

            recorder.ondataavailable =
                (event) => {
                    if (
                        event.data &&
                        event.data.size > 0
                    ) {
                        chunksRef.current.push(
                            event.data
                        );
                    }
                };

            // ==================================================
            // RECORDING STOPPED
            // ==================================================

            recorder.onstop =
                async () => {
                    console.log(
                        "🛑 Audio recorder stopped."
                    );

                    stopAudioMonitoring();

                    recordingStartedRef.current =
                        false;

                    setListening(false);

                    const audioBlob =
                        new Blob(
                            chunksRef.current,
                            {
                                type:
                                    mimeType ||
                                    "audio/webm",
                            }
                        );

                    chunksRef.current = [];

                    recorderRef.current =
                        null;

                    releaseAudioResources();

                    if (
                        audioBlob.size > 0
                    ) {
                        await transcribeAudio(
                            audioBlob
                        );
                    }

                    // ==================================================
                    // NEXT LISTENING CYCLE
                    // ==================================================

                    if (
                        enabledRef.current
                    ) {
                        if (
                            restartTimerRef.current
                        ) {
                            clearTimeout(
                                restartTimerRef.current
                            );
                        }

                        restartTimerRef.current =
                            setTimeout(() => {
                                restartTimerRef.current =
                                    null;

                                if (
                                    enabledRef.current &&
                                    !transcribingRef.current
                                ) {
                                    startRecording();
                                }
                            }, 250);
                    }
                };

            // ==================================================
            // RECORDER ERROR
            // ==================================================

            recorder.onerror =
                (event) => {
                    console.error(
                        "❌ MediaRecorder error:",
                        event
                    );

                    stopAudioMonitoring();

                    recordingStartedRef.current =
                        false;

                    recorderRef.current =
                        null;

                    setListening(false);

                    releaseAudioResources();

                    startingRef.current =
                        false;

                    if (
                        enabledRef.current
                    ) {
                        restartTimerRef.current =
                            setTimeout(() => {
                                restartTimerRef.current =
                                    null;

                                if (
                                    enabledRef.current
                                ) {
                                    startRecording();
                                }
                            }, 750);
                    }
                };

            // ==================================================
            // START
            // ==================================================

            recorder.start();

            startingRef.current =
                false;

            setListening(true);

            console.log(
                "🦅 Garuda is listening..."
            );

            animationFrameRef.current =
                requestAnimationFrame(
                    monitorAudio
                );

            // ==================================================
            // MAX RECORDING TIME
            // ==================================================

            maxRecordingTimerRef.current =
                setTimeout(() => {
                    if (
                        recorderRef.current ===
                            recorder &&
                        recorder.state ===
                            "recording"
                    ) {
                        console.log(
                            "⏱️ Maximum recording time reached."
                        );

                        stopRecording();
                    }
                }, MAX_RECORDING_DURATION);

        } catch (error) {
            console.error(
                "❌ Microphone error:",
                error
            );

            startingRef.current =
                false;

            recordingStartedRef.current =
                false;

            speechDetectedRef.current =
                false;

            setListening(false);

            stopAudioMonitoring();

            releaseAudioResources();
        }
    };

    // ==================================================
    // ON / OFF
    // ==================================================

    useEffect(() => {
        enabledRef.current =
            enabled;

        if (enabled) {
            console.log(
                "🦅 Garuda Assistant ENABLED."
            );

            startRecording();
        } else {
            console.log(
                "🛑 Garuda Assistant DISABLED."
            );

            sessionRef.current += 1;

            if (
                restartTimerRef.current
            ) {
                clearTimeout(
                    restartTimerRef.current
                );

                restartTimerRef.current =
                    null;
            }

            stopAudioMonitoring();

            const recorder =
                recorderRef.current;

            if (
                recorder &&
                recorder.state ===
                    "recording"
            ) {
                try {
                    recorder.stop();
                } catch (error) {
                    console.log(
                        "Recorder already stopped."
                    );
                }
            }

            recorderRef.current =
                null;

            recordingStartedRef.current =
                false;

            speechDetectedRef.current =
                false;

            startingRef.current =
                false;

            setListening(false);

            releaseAudioResources();
        }

        return () => {
            sessionRef.current += 1;

            stopAudioMonitoring();

            if (
                restartTimerRef.current
            ) {
                clearTimeout(
                    restartTimerRef.current
                );

                restartTimerRef.current =
                    null;
            }
        };

    }, [enabled]);

    // ==================================================
    // COMPONENT UNMOUNT
    // ==================================================

    useEffect(() => {
        return () => {
            console.log(
                "🧹 Cleaning up Garuda Assistant..."
            );

            sessionRef.current += 1;

            enabledRef.current =
                false;

            stopAudioMonitoring();

            if (
                restartTimerRef.current
            ) {
                clearTimeout(
                    restartTimerRef.current
                );

                restartTimerRef.current =
                    null;
            }

            const recorder =
                recorderRef.current;

            if (
                recorder &&
                recorder.state ===
                    "recording"
            ) {
                try {
                    recorder.stop();
                } catch (error) {
                    // Already stopped
                }
            }

            recorderRef.current =
                null;

            recordingStartedRef.current =
                false;

            releaseAudioResources();
        };
    }, []);

    // ==================================================
    // RETURN STATUS
    // ==================================================

    return {
        listening,
        processing,
    };
}