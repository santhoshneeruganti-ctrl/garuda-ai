// ======================================================
// GARUDA VOICE INTENT ENGINE
// ======================================================
//
// Converts normalized speech into a canonical intent.
//
// Example:
//
// "make the sound louder"
//       ↓
// VOLUME_UP
//
// "turn down the sound"
//       ↓
// VOLUME_DOWN
//
// ======================================================


// ======================================================
// INTENT TYPES
// ======================================================

export const GARUDA_INTENTS = {

    NONE:
        "NONE",

    VOLUME_UP:
        "VOLUME_UP",

    VOLUME_DOWN:
        "VOLUME_DOWN",

    MUTE:
        "MUTE",

    UNMUTE:
        "UNMUTE",

    OPEN_YOUTUBE:
        "OPEN_YOUTUBE",

    SEARCH_YOUTUBE:
        "SEARCH_YOUTUBE",

    OPEN_GOOGLE:
        "OPEN_GOOGLE",

    SEARCH_GOOGLE:
        "SEARCH_GOOGLE",

    OPEN_GMAIL:
        "OPEN_GMAIL",

    OPEN_GITHUB:
        "OPEN_GITHUB",

    OPEN_CHATGPT:
        "OPEN_CHATGPT",

    OPEN_WHATSAPP:
        "OPEN_WHATSAPP",

    OPEN_WIKIPEDIA:
        "OPEN_WIKIPEDIA",

    OPEN_FILE:
        "OPEN_FILE",

    OPEN_FOLDER:
        "OPEN_FOLDER",

    OPEN_APPLICATION:
        "OPEN_APPLICATION",

    CURRENT_TIME:
        "CURRENT_TIME",

};


// ======================================================
// SCORE RESULT
// ======================================================

function createResult(
    intent,
    score,
    reason = ""
) {

    return {

        intent,

        score,

        reason,

    };

}


// ======================================================
// NEGATION DETECTION
// ======================================================

function hasNegation(
    text
) {

    const negativeWords = [

        "don't",
        "dont",
        "do not",
        "not",
        "never",
        "no",
        "stop",

    ];


    return negativeWords.some(
        (word) =>
            text.includes(
                word
            )
    );

}


// ======================================================
// VOLUME UP
// ======================================================

function scoreVolumeUp(
    text
) {

    let score =
        0;


    if (
        text ===
        "volume up"
    ) {

        score += 100;

    }


    if (
        text.includes(
            "increase volume"
        )
    ) {

        score += 90;

    }


    if (
        text.includes(
            "increase the volume"
        )
    ) {

        score += 90;

    }


    if (
        text.includes(
            "turn up the volume"
        )
    ) {

        score += 95;

    }


    if (
        text.includes(
            "turn volume up"
        )
    ) {

        score += 95;

    }


    if (
        text.includes(
            "turn up the sound"
        )
    ) {

        score += 90;

    }


    if (
        text.includes(
            "raise the volume"
        )
    ) {

        score += 90;

    }


    if (
        text.includes(
            "raise volume"
        )
    ) {

        score += 85;

    }


    if (
        text.includes(
            "increase sound"
        )
    ) {

        score += 85;

    }


    if (
        text.includes(
            "make it louder"
        )
    ) {

        score += 90;

    }


    if (
        text.includes(
            "make the sound louder"
        )
    ) {

        score += 95;

    }


    if (
        text.includes(
            "make it loud"
        )
    ) {

        score += 80;

    }


    if (
        text.includes(
            "louder"
        )
    ) {

        score += 70;

    }


    if (
        text.includes(
            "sound up"
        )
    ) {

        score += 75;

    }


    if (
        text.includes(
            "more volume"
        )
    ) {

        score += 75;

    }


    if (
        hasNegation(
            text
        )
    ) {

        score -= 100;

    }


    return score;

}


// ======================================================
// VOLUME DOWN
// ======================================================

function scoreVolumeDown(
    text
) {

    let score =
        0;


    if (
        text ===
        "volume down"
    ) {

        score += 100;

    }


    if (
        text.includes(
            "decrease volume"
        )
    ) {

        score += 90;

    }


    if (
        text.includes(
            "decrease the volume"
        )
    ) {

        score += 90;

    }


    if (
        text.includes(
            "turn down the volume"
        )
    ) {

        score += 95;

    }


    if (
        text.includes(
            "turn volume down"
        )
    ) {

        score += 95;

    }


    if (
        text.includes(
            "turn down the sound"
        )
    ) {

        score += 90;

    }


    if (
        text.includes(
            "lower the volume"
        )
    ) {

        score += 90;

    }


    if (
        text.includes(
            "lower volume"
        )
    ) {

        score += 85;

    }


    if (
        text.includes(
            "decrease sound"
        )
    ) {

        score += 85;

    }


    if (
        text.includes(
            "make it quieter"
        )
    ) {

        score += 90;

    }


    if (
        text.includes(
            "make the sound quieter"
        )
    ) {

        score += 95;

    }


    if (
        text.includes(
            "quieter"
        )
    ) {

        score += 70;

    }


    if (
        text.includes(
            "sound down"
        )
    ) {

        score += 75;

    }


    if (
        text.includes(
            "less volume"
        )
    ) {

        score += 75;

    }


    if (
        hasNegation(
            text
        )
    ) {

        score -= 100;

    }


    return score;

}


// ======================================================
// MUTE
// ======================================================

function scoreMute(
    text
) {

    let score =
        0;


    if (
        text ===
        "mute"
    ) {

        score += 100;

    }


    if (
        text.includes(
            "mute volume"
        )
    ) {

        score += 95;

    }


    if (
        text.includes(
            "mute the volume"
        )
    ) {

        score += 95;

    }


    if (
        text.includes(
            "mute sound"
        )
    ) {

        score += 90;

    }


    if (
        text.includes(
            "mute audio"
        )
    ) {

        score += 90;

    }


    if (
        text.includes(
            "silence"
        )
    ) {

        score += 85;

    }


    if (
        text.includes(
            "turn the sound off"
        )
    ) {

        score += 90;

    }


    return score;

}


// ======================================================
// UNMUTE
// ======================================================

function scoreUnmute(
    text
) {

    let score =
        0;


    if (
        text ===
        "unmute"
    ) {

        score += 100;

    }


    if (
        text.includes(
            "unmute volume"
        )
    ) {

        score += 95;

    }


    if (
        text.includes(
            "unmute the volume"
        )
    ) {

        score += 95;

    }


    if (
        text.includes(
            "restore sound"
        )
    ) {

        score += 90;

    }


    if (
        text.includes(
            "restore the sound"
        )
    ) {

        score += 90;

    }


    if (
        text.includes(
            "turn off mute"
        )
    ) {

        score += 95;

    }


    return score;

}


// ======================================================
// TIME
// ======================================================

function scoreTime(
    text
) {

    const phrases = [

        "what is the time",

        "what time is it",

        "tell me the time",

        "current time",

        "time now",

        "what's the time",

        "tell me current time",

        "what time it is",

    ];


    if (
        phrases.some(
            (phrase) =>
                text.includes(
                    phrase
                )
        )
    ) {

        return 100;

    }


    return 0;

}


// ======================================================
// WEBSITE INTENT
// ======================================================

function scoreWebsite(
    text,
    website
) {

    let score =
        0;


    if (
        text.includes(
            website
        )
    ) {

        score += 50;

    }


    if (
        text ===
        website
    ) {

        score += 30;

    }


    if (
        text.includes(
            "open"
        )
    ) {

        score += 35;

    }


    if (
        text.includes(
            "launch"
        )
    ) {

        score += 30;

    }


    return score;

}


// ======================================================
// YOUTUBE
// ======================================================

function scoreYouTube(
    text
) {

    let score =
        scoreWebsite(
            text,
            "youtube"
        );


    if (
        text.includes(
            "search"
        )
    ) {

        return {

            intent:
                GARUDA_INTENTS.SEARCH_YOUTUBE,

            score:
                score + 40,

        };

    }


    if (
        text.includes(
            "find"
        )
    ) {

        return {

            intent:
                GARUDA_INTENTS.SEARCH_YOUTUBE,

            score:
                score + 35,

        };

    }


    if (
        text.includes(
            "play"
        )
    ) {

        return {

            intent:
                GARUDA_INTENTS.SEARCH_YOUTUBE,

            score:
                score + 40,

        };

    }


    return {

        intent:
            GARUDA_INTENTS.OPEN_YOUTUBE,

        score,

    };

}


// ======================================================
// GOOGLE
// ======================================================

function scoreGoogle(
    text
) {

    let score =
        scoreWebsite(
            text,
            "google"
        );


    if (
        text.includes(
            "search"
        )
    ) {

        return {

            intent:
                GARUDA_INTENTS.SEARCH_GOOGLE,

            score:
                score + 40,

        };

    }


    if (
        text.includes(
            "find"
        )
    ) {

        return {

            intent:
                GARUDA_INTENTS.SEARCH_GOOGLE,

            score:
                score + 35,

        };

    }


    return {

        intent:
            GARUDA_INTENTS.OPEN_GOOGLE,

        score,

    };

}


// ======================================================
// FILE
// ======================================================

function scoreFile(
    text
) {

    const keywords = [

        "pdf",
        "document",
        "file",
        "resume",
        "report",
        "assignment",

    ];


    const hasFileKeyword =
        keywords.some(
            (keyword) =>
                text.includes(
                    keyword
                )
        );


    if (
        !hasFileKeyword
    ) {

        return 0;

    }


    if (
        text.includes(
            "open"
        ) ||
        text.includes(
            "show"
        )
    ) {

        return 100;

    }


    return 50;

}


// ======================================================
// GET BEST INTENT
// ======================================================

export function detectVoiceIntent(
    normalizedText
) {

    const text =
        String(
            normalizedText || ""
        )
            .toLowerCase()
            .trim();


    if (!text) {

        return {

            intent:
                GARUDA_INTENTS.NONE,

            score:
                0,

            confidence:
                0,

            text,

        };

    }


    const candidates = [];


    // ==================================================
    // VOLUME
    // ==================================================

    candidates.push(
        createResult(
            GARUDA_INTENTS.VOLUME_UP,
            scoreVolumeUp(text)
        )
    );


    candidates.push(
        createResult(
            GARUDA_INTENTS.VOLUME_DOWN,
            scoreVolumeDown(text)
        )
    );


    candidates.push(
        createResult(
            GARUDA_INTENTS.MUTE,
            scoreMute(text)
        )
    );


    candidates.push(
        createResult(
            GARUDA_INTENTS.UNMUTE,
            scoreUnmute(text)
        )
    );


    // ==================================================
    // TIME
    // ==================================================

    candidates.push(
        createResult(
            GARUDA_INTENTS.CURRENT_TIME,
            scoreTime(text)
        )
    );


    // ==================================================
    // YOUTUBE
    // ==================================================

    const youtube =
        scoreYouTube(text);


    candidates.push(
        createResult(
            youtube.intent,
            youtube.score
        )
    );


    // ==================================================
    // GOOGLE
    // ==================================================

    const google =
        scoreGoogle(text);


    candidates.push(
        createResult(
            google.intent,
            google.score
        )
    );


    // ==================================================
    // OTHER WEBSITES
    // ==================================================

    candidates.push(
        createResult(
            GARUDA_INTENTS.OPEN_GMAIL,
            scoreWebsite(
                text,
                "gmail"
            )
        )
    );


    candidates.push(
        createResult(
            GARUDA_INTENTS.OPEN_GITHUB,
            scoreWebsite(
                text,
                "github"
            )
        )
    );


    candidates.push(
        createResult(
            GARUDA_INTENTS.OPEN_CHATGPT,
            scoreWebsite(
                text,
                "chatgpt"
            )
        )
    );


    candidates.push(
        createResult(
            GARUDA_INTENTS.OPEN_WHATSAPP,
            scoreWebsite(
                text,
                "whatsapp"
            )
        )
    );


    candidates.push(
        createResult(
            GARUDA_INTENTS.OPEN_WIKIPEDIA,
            scoreWebsite(
                text,
                "wikipedia"
            )
        )
    );


    // ==================================================
    // FILE
    // ==================================================

    candidates.push(
        createResult(
            GARUDA_INTENTS.OPEN_FILE,
            scoreFile(text)
        )
    );


    // ==================================================
    // SORT
    // ==================================================

    candidates.sort(
        (
            a,
            b
        ) =>
            b.score -
            a.score
    );


    const best =
        candidates[0];


    // ==================================================
    // NO MATCH
    // ==================================================

    if (
        !best ||
        best.score <= 0
    ) {

        return {

            intent:
                GARUDA_INTENTS.NONE,

            score:
                0,

            confidence:
                0,

            text,

        };

    }


    // ==================================================
    // CONFIDENCE
    // ==================================================

    const confidence =
        Math.max(
            0,
            Math.min(
                1,
                best.score / 100
            )
        );


    return {

        intent:
            best.intent,

        score:
            best.score,

        confidence,

        text,

    };

}


// ======================================================
// SHOULD EXECUTE?
// ======================================================

export function shouldExecuteIntent(
    result
) {

    if (!result) {

        return false;

    }


    return (
        result.confidence >=
        0.75
    );

}


// ======================================================
// SHOULD ASK FOR CLARIFICATION?
// ======================================================

export function shouldAskForClarification(
    result
) {

    if (!result) {

        return false;

    }


    return (
        result.confidence >=
        0.50 &&
        result.confidence <
        0.75
    );

}