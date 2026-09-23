// ======================================================
// GARUDA VOICE NORMALIZER
// ======================================================
//
// PURPOSE
// ------------------------------------------------------
// Converts raw Whisper speech into clean, predictable
// Garuda command text.
//
// Pipeline:
//
// Raw Whisper
//      ↓
// Basic cleanup
//      ↓
// Wake-word cleanup
//      ↓
// Filler removal
//      ↓
// Alias correction
//      ↓
// Repeated-word cleanup
//      ↓
// Final normalized command
//
// Example:
//
// "Hey Garuda, can you please turn up the sound?"
//                    ↓
// "turn up the volume"
//
// ======================================================

import {
    getAllVoiceAliases,
} from "./voiceAliases";


// ======================================================
// CONFIGURATION
// ======================================================

const NORMALIZER_CONFIG = {

    // Maximum number of alias passes.
    //
    // This prevents accidental endless replacements.

    maxAliasPasses: 3,

};


// ======================================================
// BASIC TEXT NORMALIZATION
// ======================================================

function basicNormalize(
    text
) {

    return String(
        text ?? ""
    )

        // ----------------------------------------------
        // Lowercase
        // ----------------------------------------------

        .toLowerCase()

        // ----------------------------------------------
        // Remove punctuation
        // ----------------------------------------------

        .replace(
            /[.,!?;:()[\]{}"'`]/g,
            " "
        )

        // ----------------------------------------------
        // Normalize whitespace
        // ----------------------------------------------

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


// ======================================================
// REGEX ESCAPE
// ======================================================

function escapeRegex(
    value
) {

    return String(
        value
    ).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );

}


// ======================================================
// REMOVE WAKE WORD
// ======================================================
//
// We don't want:
//
// "garuda open youtube"
//
// to remain as:
//
// "garuda open youtube"
//
// Instead:
//
// "open youtube"
//
// ======================================================

function removeWakeWord(
    text
) {

    let result =
        text;


    const wakePatterns = [

        /^garuda\s+/i,

        /^hey\s+garuda\s+/i,

        /^okay\s+garuda\s+/i,

        /^ok\s+garuda\s+/i,

        /^garuda\s*[:,\-]?\s*/i,

        /^hey\s+garuda\s*[:,\-]?\s*/i,

        /^okay\s+garuda\s*[:,\-]?\s*/i,

        /^ok\s+garuda\s*[:,\-]?\s*/i,

    ];


    for (
        const pattern
        of wakePatterns
    ) {

        result =
            result.replace(
                pattern,
                ""
            );

    }


    return result
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}


// ======================================================
// REMOVE FILLER / POLITENESS WORDS
// ======================================================
//
// These words usually don't change the command.
//
// "please open youtube"
//       ↓
// "open youtube"
//
// ======================================================

function removeFillerWords(
    text
) {

    let result =
        text;


    const fillers = [

        "please",

        "kindly",

        "can you",

        "could you",

        "would you",

        "will you",

        "can you please",

        "could you please",

        "would you please",

        "would you kindly",

        "hey",

        "okay",

        "ok",

        "just",

    ];


    // --------------------------------------------------
    // Longest phrases first
    // --------------------------------------------------

    fillers.sort(
        (
            a,
            b
        ) =>
            b.length -
            a.length
    );


    for (
        const filler
        of fillers
    ) {

        const escaped =
            escapeRegex(
                filler
            );


        result =
            result.replace(
                new RegExp(
                    `\\b${escaped}\\b`,
                    "gi"
                ),
                " "
            );

    }


    return result
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}


// ======================================================
// APPLY ALIASES
// ======================================================
//
// Uses the categorized alias system:
//
// general
// youtube
// google
// volume
// files
// applications
// system
// etc.
//
// ======================================================

function applyAliases(
    text
) {

    let result =
        text;


    const aliases =
        getAllVoiceAliases();


    // --------------------------------------------------
    // Longest aliases first
    // --------------------------------------------------
    //
    // Example:
    //
    // "turn the sound up"
    //
    // should be considered before:
    //
    // "sound"
    //
    // --------------------------------------------------

    aliases.sort(
        (
            a,
            b
        ) =>
            b.wrong.length -
            a.wrong.length
    );


    // --------------------------------------------------
    // Multiple passes
    // --------------------------------------------------
    //
    // Some aliases can produce another canonical
    // phrase that may itself need normalization.
    //
    // --------------------------------------------------

    for (
        let pass = 0;
        pass <
            NORMALIZER_CONFIG.maxAliasPasses;
        pass++
    ) {

        let changed =
            false;


        for (
            const alias
            of aliases
        ) {

            const wrong =
                String(
                    alias.wrong || ""
                ).trim();


            const correct =
                String(
                    alias.correct ?? ""
                );


            if (!wrong) {

                continue;

            }


            const escaped =
                escapeRegex(
                    wrong
                );


            const regex =
                new RegExp(
                    `\\b${escaped}\\b`,
                    "gi"
                );


            const updated =
                result.replace(
                    regex,
                    correct
                );


            if (
                updated !==
                result
            ) {

                changed =
                    true;

                result =
                    updated;

            }

        }


        if (!changed) {

            break;

        }

    }


    return result
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}


// ======================================================
// REMOVE DUPLICATE WORDS
// ======================================================
//
// Whisper sometimes produces:
//
// "volume volume down"
//
// or:
//
// "open open youtube"
//
// Convert:
//
// "volume down"
// "open youtube"
//
// ======================================================

function removeRepeatedWords(
    text
) {

    if (!text) {

        return "";

    }


    return text.replace(
        /\b([a-z0-9]+)(?:\s+\1\b)+/gi,
        "$1"
    );

}


// ======================================================
// REMOVE REPEATED COMMAND PHRASES
// ======================================================
//
// Example:
//
// "volume down volume down"
//        ↓
// "volume down"
//
// ======================================================

function removeRepeatedPhrases(
    text
) {

    let result =
        text;


    const repeatedPatterns = [

        [
            "volume up volume up",
            "volume up",
        ],

        [
            "volume down volume down",
            "volume down",
        ],

        [
            "turn up the volume turn up the volume",
            "turn up the volume",
        ],

        [
            "turn down the volume turn down the volume",
            "turn down the volume",
        ],

        [
            "increase the volume increase the volume",
            "increase the volume",
        ],

        [
            "decrease the volume decrease the volume",
            "decrease the volume",
        ],

        [
            "open youtube open youtube",
            "open youtube",
        ],

        [
            "open google open google",
            "open google",
        ],

        [
            "open gmail open gmail",
            "open gmail",
        ],

        [
            "open github open github",
            "open github",
        ],

    ];


    for (
        const [
            repeated,
            clean,
        ]
        of repeatedPatterns
    ) {

        result =
            result.replace(
                repeated,
                clean
            );

    }


    return result
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}


// ======================================================
// REMOVE TRAILING FILLERS
// ======================================================
//
// Sometimes speech becomes:
//
// "open youtube please"
//
// We want:
//
// "open youtube"
//
// ======================================================

function removeTrailingFillers(
    text
) {

    return text

        .replace(
            /\s+\bplease\b$/i,
            ""
        )

        .replace(
            /\s+\bkindly\b$/i,
            ""
        )

        .replace(
            /\s+\bokay\b$/i,
            ""
        )

        .replace(
            /\s+\bok\b$/i,
            ""
        )

        .trim();

}


// ======================================================
// FINAL CLEANUP
// ======================================================

function finalCleanup(
    text
) {

    return String(
        text || ""
    )

        .replace(
            /\s+/g,
            " "
        )

        .replace(
            /^\s+|\s+$/g,
            ""
        )

        .trim();

}


// ======================================================
// MAIN NORMALIZER
// ======================================================

export function normalizeVoice(
    transcript
) {

    // --------------------------------------------------
    // STEP 1
    // Basic normalization
    // --------------------------------------------------

    let text =
        basicNormalize(
            transcript
        );


    if (!text) {

        return "";

    }


    // --------------------------------------------------
    // STEP 2
    // Remove wake word
    // --------------------------------------------------

    text =
        removeWakeWord(
            text
        );


    // --------------------------------------------------
    // STEP 3
    // Remove filler words
    // --------------------------------------------------

    text =
        removeFillerWords(
            text
        );


    // --------------------------------------------------
    // STEP 4
    // Apply known speech aliases
    // --------------------------------------------------

    text =
        applyAliases(
            text
        );


    // --------------------------------------------------
    // STEP 5
    // Remove repeated phrases
    // --------------------------------------------------

    text =
        removeRepeatedPhrases(
            text
        );


    // --------------------------------------------------
    // STEP 6
    // Remove repeated words
    // --------------------------------------------------

    text =
        removeRepeatedWords(
            text
        );


    // --------------------------------------------------
    // STEP 7
    // Remove trailing fillers
    // --------------------------------------------------

    text =
        removeTrailingFillers(
            text
        );


    // --------------------------------------------------
    // STEP 8
    // Final cleanup
    // --------------------------------------------------

    text =
        finalCleanup(
            text
        );


    return text;

}


// ======================================================
// DETAILED NORMALIZATION
// ======================================================
//
// Useful for debugging the voice pipeline.
//
// Returns:
//
// {
//     raw,
//     normalized,
//     changed
// }
//
// ======================================================

export function normalizeVoiceDetailed(
    transcript
) {

    const raw =
        String(
            transcript ?? ""
        ).trim();


    const normalized =
        normalizeVoice(
            raw
        );


    return {

        raw,

        normalized,

        changed:
            raw.toLowerCase() !==
            normalized,

    };

}


// ======================================================
// DEBUG HELPER
// ======================================================
//
// Call this from browser console:
//
// debugGarudaVoice("Hey Garuda, make the sound louder")
//
// ======================================================

export function debugGarudaVoice(
    transcript
) {

    const result =
        normalizeVoiceDetailed(
            transcript
        );


    console.log(
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    );

    console.log(
        "🦅 GARUDA VOICE DEBUG"
    );

    console.log(
        "Raw:",
        result.raw
    );

    console.log(
        "Normalized:",
        result.normalized
    );

    console.log(
        "Changed:",
        result.changed
    );

    console.log(
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    );


    return result;

}