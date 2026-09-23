// ======================================================
// GARUDA VOICE ALIASES
// ======================================================
//
// PURPOSE
// ------------------------------------------------------
// Converts common speech / Whisper variations into
// canonical Garuda vocabulary.
//
// IMPORTANT
// ------------------------------------------------------
// This file is NOT responsible for deciding what action
// to execute.
//
// Example:
//
// "turn up the sound"
//        ↓
// "turn up the volume"
//
// "you tube"
//        ↓
// "youtube"
//
// "file explorer"
//        ↓
// "file explorer"
//
// The INTENT engine decides what the final action is.
//
// ======================================================


// ======================================================
// ALIAS HELPER
// ======================================================
//
// Keeps the structure easy to expand.
//
// category:
//     logical feature area
//
// aliases:
//     [spoken variation, canonical word]
//
// ======================================================

export const VOICE_ALIASES = {

    // ==================================================
    // GENERAL COMMAND WORDS
    // ==================================================

    general: [

        ["opun", "open"],
        ["oppen", "open"],
        ["opan", "open"],
        ["lounch", "launch"],
        ["launche", "launch"],

        ["cloze", "close"],
        ["clos", "close"],

        ["sho", "show"],
        ["shw", "show"],

        ["seach", "search"],
        ["serch", "search"],
        ["sarch", "search"],
        ["searh", "search"],

        ["fnd", "find"],
        ["finde", "find"],

        ["plaay", "play"],
        ["pley", "play"],

        ["stop", "stop"],
        ["pause", "pause"],
        ["resume", "resume"],

        ["start", "start"],
        ["begin", "start"],
        ["run", "run"],

        ["turn on", "enable"],
        ["switch on", "enable"],
        ["turn off", "disable"],
        ["switch off", "disable"],

        ["enable it", "enable"],
        ["disable it", "disable"],

    ],


    // ==================================================
    // POLITENESS / NATURAL SPEECH
    // ==================================================

    filler: [

        ["please", ""],
        ["kindly", ""],
        ["can you", ""],
        ["could you", ""],
        ["would you", ""],
        ["will you", ""],
        ["can you please", ""],
        ["could you please", ""],
        ["would you please", ""],
        ["hey garuda", ""],
        ["hey garuda can you", ""],
        ["garuda", ""],

    ],


    // ==================================================
    // YOUTUBE
    // ==================================================

    youtube: [

        ["you tube", "youtube"],
        ["you tub", "youtube"],
        ["you to", "youtube"],
        ["you too", "youtube"],
        ["u tube", "youtube"],
        ["u tub", "youtube"],
        ["utube", "youtube"],
        ["youtub", "youtube"],
        ["youtude", "youtube"],
        ["youtoob", "youtube"],
        ["you toub", "youtube"],
        ["you tuber", "youtube"],
        ["udu", "youtube"],

    ],


    // ==================================================
    // GOOGLE
    // ==================================================

    google: [

        ["goo gle", "google"],
        ["goo goo", "google"],
        ["googel", "google"],
        ["gogle", "google"],
        ["goggle", "google"],
        ["googel search", "google search"],

    ],


    // ==================================================
    // GMAIL
    // ==================================================

    gmail: [

        ["g mail", "gmail"],
        ["gee mail", "gmail"],
        ["g-mail", "gmail"],
        ["gmail", "gmail"],

    ],


    // ==================================================
    // GITHUB
    // ==================================================

    github: [

        ["git hub", "github"],
        ["get hub", "github"],
        ["gitub", "github"],
        ["git hubb", "github"],

    ],


    // ==================================================
    // CHATGPT
    // ==================================================

    chatgpt: [

        ["chat gpt", "chatgpt"],
        ["chat g p t", "chatgpt"],
        ["chat gee pee tee", "chatgpt"],
        ["chat gp t", "chatgpt"],

    ],


    // ==================================================
    // WHATSAPP
    // ==================================================

    whatsapp: [

        ["what's app", "whatsapp"],
        ["whats app", "whatsapp"],
        ["what sap", "whatsapp"],
        ["what's up", "whatsapp"],

    ],


    // ==================================================
    // WIKIPEDIA
    // ==================================================

    wikipedia: [

        ["wiki pedia", "wikipedia"],
        ["wiki media", "wikipedia"],
        ["wikipedia", "wikipedia"],

    ],


    // ==================================================
    // BROWSER / INTERNET
    // ==================================================

    browser: [

        ["internet", "browser"],
        ["web browser", "browser"],
        ["internet browser", "browser"],
        ["browse the web", "browser"],

    ],


    // ==================================================
    // SEARCH
    // ==================================================

    search: [

        ["look up", "search"],
        ["look it up", "search"],
        ["look for", "search"],
        ["find online", "search"],
        ["search online", "search"],
        ["search the web", "search"],
        ["search internet", "search"],

    ],


    // ==================================================
    // VOLUME
    // ==================================================

    volume: [

        // ----------------------------------------------
        // volume
        // ----------------------------------------------

        ["volum", "volume"],
        ["volumee", "volume"],
        ["vol", "volume"],
        ["sound volume", "volume"],
        ["audio volume", "volume"],


        // ----------------------------------------------
        // UP
        // ----------------------------------------------

        ["volume app", "volume up"],
        ["volum app", "volume up"],
        ["volum up", "volume up"],
        ["volume upp", "volume up"],

        ["increase sound", "volume up"],
        ["increase the sound", "volume up"],
        ["increase audio", "volume up"],
        ["increase the audio", "volume up"],

        ["raise sound", "volume up"],
        ["raise the sound", "volume up"],
        ["raise audio", "volume up"],
        ["raise the audio", "volume up"],

        ["turn sound up", "volume up"],
        ["turn the sound up", "volume up"],
        ["turn audio up", "volume up"],
        ["turn the audio up", "volume up"],

        ["make sound louder", "volume up"],
        ["make the sound louder", "volume up"],
        ["make audio louder", "volume up"],
        ["make it louder", "volume up"],

        ["sound higher", "volume up"],
        ["audio higher", "volume up"],
        ["more sound", "volume up"],
        ["more volume", "volume up"],


        // ----------------------------------------------
        // DOWN
        // ----------------------------------------------

        ["volume dow", "volume down"],
        ["volum down", "volume down"],
        ["volume dwn", "volume down"],

        ["decrease sound", "volume down"],
        ["decrease the sound", "volume down"],
        ["decrease audio", "volume down"],
        ["decrease the audio", "volume down"],

        ["lower sound", "volume down"],
        ["lower the sound", "volume down"],
        ["lower audio", "volume down"],
        ["lower the audio", "volume down"],

        ["turn sound down", "volume down"],
        ["turn the sound down", "volume down"],
        ["turn audio down", "volume down"],
        ["turn the audio down", "volume down"],

        ["make sound quieter", "volume down"],
        ["make the sound quieter", "volume down"],
        ["make audio quieter", "volume down"],
        ["make it quieter", "volume down"],

        ["sound lower", "volume down"],
        ["audio lower", "volume down"],
        ["less sound", "volume down"],
        ["less volume", "volume down"],

    ],


    // ==================================================
    // MUTE / UNMUTE
    // ==================================================

    audio: [

        ["mute audio", "mute"],
        ["mute sound", "mute"],
        ["mute volume", "mute"],
        ["silence audio", "mute"],
        ["silence sound", "mute"],
        ["silence volume", "mute"],

        ["unmute audio", "unmute"],
        ["unmute sound", "unmute"],
        ["unmute volume", "unmute"],

        ["restore audio", "unmute"],
        ["restore sound", "unmute"],
        ["restore volume", "unmute"],

        ["turn mute off", "unmute"],
        ["turn off mute", "unmute"],

    ],


    // ==================================================
    // MEDIA
    // ==================================================

    media: [

        ["play music", "play"],
        ["play song", "play"],
        ["start music", "play"],
        ["start the music", "play"],

        ["stop music", "stop"],
        ["stop the music", "stop"],

        ["pause music", "pause"],
        ["pause the music", "pause"],

        ["continue music", "resume"],
        ["continue the music", "resume"],

        ["next song", "next"],
        ["next track", "next"],
        ["skip song", "next"],
        ["skip track", "next"],

        ["previous song", "previous"],
        ["previous track", "previous"],
        ["last song", "previous"],

    ],


    // ==================================================
    // FILES
    // ==================================================

    files: [

        ["file document", "document"],
        ["documents file", "document"],
        ["my document", "document"],
        ["the document", "document"],

        ["pdf document", "pdf"],
        ["pdf file", "pdf"],
        ["document pdf", "pdf"],

        ["open up the file", "open file"],
        ["open up file", "open file"],

        ["show me the file", "show file"],
        ["show me file", "show file"],

    ],


    // ==================================================
    // PDF
    // ==================================================

    pdf: [

        ["p d f", "pdf"],
        ["pee dee eff", "pdf"],
        ["pdf document", "pdf"],
        ["pdf file", "pdf"],

    ],


    // ==================================================
    // FOLDERS
    // ==================================================

    folders: [

        ["file explorer", "file explorer"],
        ["file manager", "file explorer"],
        ["windows explorer", "file explorer"],

        ["download folder", "downloads"],
        ["downloads folder", "downloads"],

        ["document folder", "documents"],
        ["documents folder", "documents"],

        ["desktop folder", "desktop"],

        ["picture folder", "pictures"],
        ["pictures folder", "pictures"],
        ["photo folder", "pictures"],
        ["photos folder", "pictures"],

        ["music folder", "music"],
        ["music directory", "music"],

        ["video folder", "videos"],
        ["videos folder", "videos"],

    ],


    // ==================================================
    // WINDOWS APPLICATIONS
    // ==================================================

    applications: [

        ["calc", "calculator"],
        ["calci", "calculator"],
        ["calculate app", "calculator"],

        ["note pad", "notepad"],
        ["note pad app", "notepad"],

        ["task manager", "task manager"],
        ["taskmanager", "task manager"],

        ["command prompt", "cmd"],
        ["command line", "cmd"],
        ["command terminal", "cmd"],

        ["power shell", "powershell"],

        ["vs code", "visual studio code"],
        ["visual code", "visual studio code"],
        ["visual studio", "visual studio code"],

        ["code editor", "visual studio code"],

    ],


    // ==================================================
    // SYSTEM CONTROLS
    // ==================================================

    system: [

        ["turn on bluetooth", "enable bluetooth"],
        ["switch on bluetooth", "enable bluetooth"],

        ["turn off bluetooth", "disable bluetooth"],
        ["switch off bluetooth", "disable bluetooth"],

        ["turn on wifi", "enable wifi"],
        ["turn on wi fi", "enable wifi"],
        ["switch on wifi", "enable wifi"],

        ["turn off wifi", "disable wifi"],
        ["turn off wi fi", "disable wifi"],
        ["switch off wifi", "disable wifi"],

        ["turn on dark mode", "enable dark mode"],
        ["enable dark theme", "enable dark mode"],

        ["turn off dark mode", "disable dark mode"],
        ["disable dark theme", "disable dark mode"],

    ],


    // ==================================================
    // TIME / DATE
    // ==================================================

    time: [

        ["what time is it", "current time"],
        ["what is the time", "current time"],
        ["tell me the time", "current time"],
        ["time right now", "current time"],
        ["time now", "current time"],

        ["what is today's date", "current date"],
        ["what date is it", "current date"],
        ["today's date", "current date"],

    ],


    // ==================================================
    // NAVIGATION
    // ==================================================

    navigation: [

        ["go back", "back"],
        ["move back", "back"],
        ["previous page", "back"],

        ["go forward", "forward"],
        ["move forward", "forward"],
        ["next page", "forward"],

        ["go home", "home"],
        ["take me home", "home"],
        ["open home", "home"],

        ["refresh page", "refresh"],
        ["reload page", "refresh"],
        ["reload this page", "refresh"],

    ],


    // ==================================================
    // WINDOWS CONTROL
    // ==================================================

    windowControl: [

        ["minimize window", "minimize"],
        ["minimise window", "minimize"],

        ["maximize window", "maximize"],
        ["maximise window", "maximize"],

        ["close window", "close"],

        ["switch window", "switch window"],
        ["change window", "switch window"],

    ],


    // ==================================================
    // GARUDA ITSELF
    // ==================================================

    garuda: [

        ["turn garuda on", "enable garuda"],
        ["switch garuda on", "enable garuda"],
        ["enable garuda", "enable garuda"],

        ["turn garuda off", "disable garuda"],
        ["switch garuda off", "disable garuda"],
        ["disable garuda", "disable garuda"],

        ["start listening", "enable garuda"],
        ["start listening garuda", "enable garuda"],

        ["stop listening", "disable garuda"],
        ["stop listening garuda", "disable garuda"],

    ],


    // ==================================================
    // AI / CHAT
    // ==================================================

    ai: [

        ["ask garuda", "chat"],
        ["talk to garuda", "chat"],
        ["talk with garuda", "chat"],

        ["explain this", "explain"],
        ["explain it", "explain"],

        ["summarize this", "summarize"],
        ["give me a summary", "summarize"],
        ["make a summary", "summarize"],

    ],


    // ==================================================
    // CLIPBOARD
    // ==================================================

    clipboard: [

        ["copy this", "copy"],
        ["copy that", "copy"],
        ["copy it", "copy"],

        ["paste this", "paste"],
        ["paste that", "paste"],
        ["paste it", "paste"],

    ],


    // ==================================================
    // CODE / DEVELOPMENT
    // ==================================================

    development: [

        ["open code", "open code editor"],
        ["open coding", "open code editor"],

        ["run the code", "run code"],
        ["execute the code", "run code"],

        ["stop the code", "stop code"],
        ["stop running", "stop code"],

        ["open terminal", "open terminal"],
        ["open command line", "open terminal"],

    ],

};


// ======================================================
// FLATTEN ALIASES
// ======================================================
//
// Converts:
//
// {
//   volume: [...],
//   youtube: [...]
// }
//
// into one searchable array.
//
// ======================================================

export function getAllVoiceAliases() {

    const allAliases = [];


    for (
        const category
        of Object.keys(
            VOICE_ALIASES
        )
    ) {

        const aliases =
            VOICE_ALIASES[
                category
            ];


        for (
            const pair
            of aliases
        ) {

            allAliases.push({

                category,

                wrong:
                    pair[0],

                correct:
                    pair[1],

            });

        }

    }


    return allAliases;

}


// ======================================================
// CANONICAL VOCABULARY
// ======================================================
//
// Useful later for fuzzy matching.
//
// Example:
//
// volume
// youtube
// github
// calculator
//
// ======================================================

export function getCanonicalVocabulary() {

    const vocabulary =
        new Set();


    const aliases =
        getAllVoiceAliases();


    for (
        const alias
        of aliases
    ) {

        if (
            alias.correct
        ) {

            vocabulary.add(
                alias.correct
            );

        }

    }


    return [
        ...vocabulary,
    ];

}