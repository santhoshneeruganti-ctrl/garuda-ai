import {
    useCallback,
} from "react";

import useSpeechRecognition
    from "../../hooks/useSpeechRecognition";

import useElectronVoice
    from "../../hooks/useElectronVoice";

import "./VoiceButton.css";


function VoiceButton({
    setMessage,
    onVoiceCommand,
}) {


    const isElectron =
        Boolean(
            window.electronAPI
        ) ||
        navigator.userAgent
            .toLowerCase()
            .includes(
                "electron"
            );


    // ==================================================
    // BROWSER VOICE
    // ==================================================

    const handleBrowserResult =
        useCallback(
            (
                text
            ) => {

                console.log(
                    "🎤 Browser voice:",
                    text
                );


                const cleanText =
                    text?.trim();


                if (
                    !cleanText
                ) {

                    return;

                }


                setMessage(
                    cleanText
                );


                if (
                    onVoiceCommand
                ) {

                    onVoiceCommand(
                        cleanText
                    );

                }

            },
            [
                setMessage,
                onVoiceCommand,
            ]
        );


    const browserVoice =
        useSpeechRecognition(
            handleBrowserResult
        );


    // ==================================================
    // ELECTRON VOICE
    // ==================================================

    const handleElectronResult =
        useCallback(
            (
                text
            ) => {

                console.log(
                    "🦅 Electron voice:",
                    text
                );


                const cleanText =
                    text?.trim();


                if (
                    !cleanText
                ) {

                    return;

                }


                setMessage(
                    cleanText
                );


                if (
                    onVoiceCommand
                ) {

                    onVoiceCommand(
                        cleanText
                    );

                }

            },
            [
                setMessage,
                onVoiceCommand,
            ]
        );


    const electronVoice =
        useElectronVoice(
            handleElectronResult
        );


    const listening =
        isElectron
            ? electronVoice.listening
            : browserVoice.listening;


    const startListening =
        isElectron
            ? electronVoice.startListening
            : browserVoice.startListening;


    const stopListening =
        isElectron
            ? electronVoice.stopListening
            : browserVoice.stopListening;


    // ==================================================
    // BUTTON
    // ==================================================

    return (

        <button
            type="button"
            tabIndex={-1}

            className={
                `voice-btn ${
                    listening
                        ? "listening"
                        : ""
                }`
            }

            onMouseDown={(
                event
            ) => {

                event.preventDefault();

            }}

            onKeyDown={(
                event
            ) => {

                event.preventDefault();

                event.stopPropagation();

            }}

            onClick={(
                event
            ) => {

                event.preventDefault();

                event.stopPropagation();


                if (
                    listening
                ) {

                    stopListening();

                } else {

                    startListening();

                }

            }}

            title={
                listening
                    ? "Stop Voice Input"
                    : "Voice Input"
            }

            aria-label={
                listening
                    ? "Stop Voice Input"
                    : "Start Voice Input"
            }

            aria-pressed={
                listening
            }
        >

            🎤

        </button>

    );

}


export default VoiceButton;