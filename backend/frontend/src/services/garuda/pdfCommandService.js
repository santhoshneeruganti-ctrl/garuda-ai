// ======================================================
// pdfCommandService.js
// ======================================================
// PDF-specific command helpers.
//
// This file is responsible for:
// 1. Detecting PDF-related voice commands
// 2. Extracting the requested document name
// 3. Finding the best matching PDF
//
// It does NOT contain the main Garuda command engine.
// It also does NOT duplicate the existing PDF upload logic.
// ======================================================

import {
    findBestPDF,
} from "./fileMatcher";


// ======================================================
// PDF COMMAND KEYWORDS
// ======================================================

const PDF_COMMAND_WORDS = [

    "open pdf",

    "open the pdf",

    "open document",

    "open the document",

    "open file",

    "open the file",

    "open my pdf",

    "open my document",

    "open my file",

];


// ======================================================
// REMOVE COMMAND WORDS
// ======================================================

function removeCommandWords(
    command
) {

    let text =
        String(
            command || ""
        )
            .toLowerCase()
            .replace(
                /\s+/g,
                " "
            )
            .trim();


    for (
        const phrase
        of PDF_COMMAND_WORDS
    ) {

        text =
            text.replace(
                phrase,
                ""
            );
    }


    return text
        .replace(
            /\bplease\b/g,
            ""
        )
        .replace(
            /\bcan you\b/g,
            ""
        )
        .replace(
            /\bcould you\b/g,
            ""
        )
        .replace(
            /\bgaruda\b/g,
            ""
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();
}


// ======================================================
// CHECK PDF COMMAND
// ======================================================

export function isPDFCommand(
    command
) {

    const text =
        String(
            command || ""
        )
            .toLowerCase()
            .replace(
                /\s+/g,
                " "
            )
            .trim();


    if (!text) {
        return false;
    }


    // ==============================================
    // DIRECT PDF WORD
    // ==============================================

    if (
        text.includes(
            "pdf"
        )
    ) {

        return true;
    }


    // ==============================================
    // DOCUMENT COMMAND
    // ==============================================

    if (
        text.includes(
            "open document"
        ) ||
        text.includes(
            "open the document"
        )
    ) {

        return true;
    }


    // ==============================================
    // FILE COMMAND
    //
    // Do NOT treat every "open file"
    // as a PDF command.
    // ==============================================

    if (
        text.includes(
            "open pdf"
        ) ||
        text.includes(
            "open my pdf"
        )
    ) {

        return true;
    }


    return false;
}


// ======================================================
// EXTRACT PDF QUERY
// ======================================================

export function extractPDFQuery(
    command
) {

    let text =
        removeCommandWords(
            command
        );


    // ==============================================
    // REMOVE PDF WORD
    // ==============================================

    text =
        text.replace(
            /\bpdf\b/g,
            ""
        );


    // ==============================================
    // REMOVE COMMON FILLER
    // ==============================================

    text =
        text.replace(
            /\bthe\b/g,
            ""
        );


    text =
        text.replace(
            /\bmy\b/g,
            ""
        );


    text =
        text.replace(
            /\bplease\b/g,
            ""
        );


    // ==============================================
    // CLEAN
    // ==============================================

    return text
        .replace(
            /\s+/g,
            " "
        )
        .trim();
}


// ======================================================
// FIND REQUESTED PDF
// ======================================================

export function findRequestedPDF(
    files,
    command
) {

    const query =
        extractPDFQuery(
            command
        );


    console.log(
        "📄 PDF search query:",
        query
    );


    if (!query) {

        console.log(
            "⚠️ No PDF name was provided."
        );

        return null;
    }


    const matchedPDF =
        findBestPDF(
            files,
            query
        );


    if (
        matchedPDF
    ) {

        console.log(
            "✅ Matching PDF found:",
            matchedPDF
        );

    } else {

        console.log(
            "❌ No matching PDF found for:",
            query
        );
    }


    return matchedPDF;
}


// ======================================================
// BUILD PDF RESULT
// ======================================================

export function createPDFResult(
    file
) {

    if (!file) {

        return {

            handled:
                true,

            success:
                false,

            type:
                "pdf",

            message:
                "Required PDF document was not found.",

        };
    }


    return {

        handled:
            true,

        success:
            true,

        type:
            "pdf",

        file,

        message:
            `Found PDF: ${
                file.name ||
                file.filename ||
                "document"
            }`,

    };
}