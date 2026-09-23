import {
  useCallback,
  useEffect,
  useState,
} from "react";

import useGarudaAssistant from "../../hooks/useGarudaAssistant";

import {
  executeGarudaCommand,
} from "../../services/garudaCommandEngine";

import "./GarudaToggle.css";


function GarudaToggle() {

  // ======================================================
  // ELECTRON CHECK
  // ======================================================

  const [
    isDesktopApp,
    setIsDesktopApp,
  ] = useState(false);


  // ======================================================
  // GARUDA STATE
  // ======================================================

  const [
    enabled,
    setEnabled,
  ] = useState(false);


  // ======================================================
  // DETECT ELECTRON
  // ======================================================

  useEffect(() => {

    const desktop =
      Boolean(window.electronAPI);

    setIsDesktopApp(desktop);

  }, []);


  // ======================================================
  // COMMAND HANDLER
  // ======================================================

  const handleCommand =
    useCallback(
      async (command) => {

        console.log(
          "🦅 Garuda command:",
          command
        );


        try {

          const result =
            await executeGarudaCommand(
              command
            );


          // ==================================================
          // COMMAND HANDLED
          // ==================================================

          if (result?.handled) {

            console.log(
              "✅ Garuda action:",
              result.message
            );

            return result;

          }


          // ==================================================
          // UNKNOWN COMMAND
          // ==================================================

          console.log(
            "🤖 Unknown Garuda command:",
            command
          );


          return {
            handled: false,
            message:
              "Unknown Garuda command.",
          };


        } catch (error) {

          console.error(
            "❌ Garuda command error:",
            error
          );


          throw error;

        }

      },
      []
    );


  // ======================================================
  // VOICE ASSISTANT
  //
  // Browser  → Disabled
  // Electron → Enabled when toggle is ON
  // ======================================================

  const {
    listening,
    processing,
    error,
  } = useGarudaAssistant(
    isDesktopApp && enabled,
    handleCommand
  );


  // ======================================================
  // TOGGLE HANDLER
  // ======================================================

  function handleToggle() {

    setEnabled(
      (current) => !current
    );

  }


  // ======================================================
  // BROWSER
  // ======================================================

  if (!isDesktopApp) {

    return null;

  }


  // ======================================================
  // STATUS TEXT
  // ======================================================

  let statusText =
    "Voice assistant is off";


  if (enabled) {

    if (error) {

      statusText =
        "Voice assistant error";

    } else if (processing) {

      statusText =
        "Processing your command...";

    } else if (listening) {

      statusText =
        "Listening for your command...";

    } else {

      statusText =
        "Getting ready...";

    }

  }


  // ======================================================
  // STATUS CLASS
  // ======================================================

  let statusClass =
    "garuda-toggle-status";


  if (enabled) {

    statusClass +=
      " active";

  }


  if (listening) {

    statusClass +=
      " listening";

  }


  if (processing) {

    statusClass +=
      " processing";

  }


  if (error) {

    statusClass +=
      " error";

  }


  // ======================================================
  // DESKTOP UI
  // ======================================================

  return (

    <button
      type="button"

      className={
        enabled
          ? "garuda-toggle active"
          : "garuda-toggle"
      }

      onClick={
        handleToggle
      }

      aria-pressed={
        enabled
      }

      title={
        enabled
          ? "Turn Garuda voice assistant off"
          : "Turn Garuda voice assistant on"
      }
    >

      {/* ==================================================
          LEFT CONTENT
      ================================================== */}

      <span className="garuda-toggle-info">


        {/* ==================================================
            GARUDA ICON
        ================================================== */}

        <span
          className={
            listening
              ? "garuda-toggle-icon listening"
              : processing
              ? "garuda-toggle-icon processing"
              : error
              ? "garuda-toggle-icon error"
              : "garuda-toggle-icon"
          }
        >

          {processing
            ? "🧠"
            : listening
            ? "🎤"
            : error
            ? "⚠️"
            : "🦅"
          }

        </span>


        {/* ==================================================
            TEXT
        ================================================== */}

        <span className="garuda-toggle-content">


          {/* TITLE */}

          <span className="garuda-toggle-title">

            Garuda Assistant

          </span>


          {/* STATUS */}

          <span
            className={statusClass}
          >

            {statusText}

          </span>


        </span>


      </span>


      {/* ==================================================
          SWITCH
      ================================================== */}

      <span
        className="garuda-switch"
      >

        <span
          className="garuda-switch-knob"
        />

      </span>


    </button>

  );

}


export default GarudaToggle;