import {
  useRef,
  useState,
  useEffect,
} from "react";


export default function useSpeechRecognition(
  onResult
) {

  const [
    listening,
    setListening,
  ] = useState(false);


  const recognitionRef =
    useRef(null);


  const listeningRef =
    useRef(false);


  const finalTranscriptRef =
    useRef("");


  const onResultRef =
    useRef(onResult);


  // ==================================================
  // KEEP CALLBACK UPDATED
  // ==================================================

  useEffect(() => {

    onResultRef.current =
      onResult;

  }, [
    onResult,
  ]);


  // ==================================================
  // CLEANUP
  // ==================================================

  useEffect(() => {

    return () => {

      listeningRef.current =
        false;


      if (
        recognitionRef.current
      ) {

        try {

          recognitionRef.current.abort();

        } catch (error) {

          console.warn(
            "⚠️ Speech recognition cleanup error:",
            error
          );

        }

      }


      recognitionRef.current =
        null;

    };

  }, []);


  // ==================================================
  // START LISTENING
  // ==================================================

  const startListening = () => {

    // --------------------------------------------------
    // DO NOT CREATE MULTIPLE RECOGNITION INSTANCES
    // --------------------------------------------------

    if (
      listeningRef.current
    ) {

      console.log(
        "⏭️ Garuda voice recognition is already active."
      );

      return;

    }


    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;


    if (
      !SpeechRecognition
    ) {

      alert(
        "Speech Recognition is not supported in this browser or Electron."
      );

      return;

    }


    // --------------------------------------------------
    // RESET TRANSCRIPT
    // --------------------------------------------------

    finalTranscriptRef.current =
      "";


    const recognition =
      new SpeechRecognition();


    recognition.lang =
      "en-US";


    // --------------------------------------------------
    // IMPORTANT
    //
    // We don't need continuous recognition here.
    // One voice action = one recognition session.
    // --------------------------------------------------

    recognition.continuous =
      false;


    recognition.interimResults =
      false;


    recognition.maxAlternatives =
      1;


    recognitionRef.current =
      recognition;


    // ==================================================
    // START
    // ==================================================

    recognition.onstart = () => {

      console.log(
        "🎤 Garuda voice recognition started."
      );


      listeningRef.current =
        true;


      setListening(
        true
      );

    };


    // ==================================================
    // RESULT
    // ==================================================

    recognition.onresult = (
      event
    ) => {

      let transcript =
        "";


      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {

        if (
          event.results[i].isFinal
        ) {

          transcript +=
            event.results[i][0]
              .transcript;

        }

      }


      transcript =
        transcript
          .replace(/\s+/g, " ")
          .trim();


      if (
        !transcript
      ) {

        return;

      }


      // ------------------------------------------------
      // STORE ONLY FINAL TRANSCRIPT
      // ------------------------------------------------

      finalTranscriptRef.current =
        transcript;


      console.log(
        "🎤 Garuda final transcript:",
        transcript
      );

    };


    // ==================================================
    // ERROR
    // ==================================================

    recognition.onerror = (
      event
    ) => {

      console.error(
        "❌ Garuda speech recognition error:",
        event.error
      );


      listeningRef.current =
        false;


      setListening(
        false
      );


      recognitionRef.current =
        null;

    };


    // ==================================================
    // END
    // ==================================================

    recognition.onend = () => {

      console.log(
        "🛑 Garuda voice recognition ended."
      );


      const transcript =
        finalTranscriptRef.current
          .trim();


      listeningRef.current =
        false;


      setListening(
        false
      );


      recognitionRef.current =
        null;


      // ------------------------------------------------
      // SEND EXACTLY ONCE
      // ------------------------------------------------

      if (
        transcript
      ) {

        console.log(
          "🦅 Sending final voice command:",
          transcript
        );


        finalTranscriptRef.current =
          "";


        if (
          onResultRef.current
        ) {

          onResultRef.current(
            transcript
          );

        }

      } else {

        finalTranscriptRef.current =
          "";

      }

    };


    // ==================================================
    // START RECOGNITION
    // ==================================================

    try {

      recognition.start();

    } catch (error) {

      console.error(
        "❌ Failed to start speech recognition:",
        error
      );


      listeningRef.current =
        false;


      setListening(
        false
      );


      recognitionRef.current =
        null;

    }

  };


  // ==================================================
  // STOP LISTENING
  // ==================================================

  const stopListening = () => {

    console.log(
      "🛑 Garuda voice input stopped manually."
    );


    listeningRef.current =
      false;


    setListening(
      false
    );


    const recognition =
      recognitionRef.current;


    recognitionRef.current =
      null;


    if (
      recognition
    ) {

      try {

        recognition.stop();

      } catch (error) {

        console.warn(
          "⚠️ Speech recognition stop error:",
          error
        );

      }

    }

  };


  return {

    listening,

    startListening,

    stopListening,

  };

}