import {
    isPDFCommand,
    findRequestedPDF,
    createPDFResult,
} from "./pdfCommandService";


// ======================================================
// FILE COMMAND SERVICE
// ======================================================
// Handles file-related Garuda voice commands.
//
// Flow:
//
// Voice
//   ↓
// Command Engine
//   ↓
// File Command Service
//   ↓
// PDF Command Service
//   ↓
// Find matching PDF
//   ↓
// Electron opens file
// ======================================================


// ======================================================
// GET AVAILABLE FILES
// ======================================================

async function getAvailableFiles() {

    try {

        // ==================================================
        // ELECTRON FILE API
        // ==================================================

        if (
            window.electronAPI &&
            typeof window.electronAPI.getFiles ===
                "function"
        ) {

            const files =
                await window.electronAPI.getFiles();

            if (
                Array.isArray(files)
            ) {

                return files;
            }
        }


        // ==================================================
        // FALLBACK
        // ==================================================

        console.log(
            "ℹ️ Electron file-list API is not available."
        );

        return [];

    } catch (error) {

        console.error(
            "❌ Unable to get available files:",
            error
        );

        return [];
    }
}


// ======================================================
// OPEN FILE
// ======================================================

async function openFile(
    file
) {

    if (!file) {

        return {

            success:
                false,

            message:
                "File was not found.",

        };
    }


    // ==================================================
    // ELECTRON API
    // ==================================================

    if (
        window.electronAPI &&
        typeof window.electronAPI.openFile ===
            "function"
    ) {

        try {

            const result =
                await window.electronAPI.openFile(
                    file.path ||
                    file.filePath ||
                    file.fullPath ||
                    file.name
                );


            return {

                success:
                    true,

                result,

                message:
                    `Opening ${
                        file.name ||
                        file.filename ||
                        "file"
                    }`,

            };

        } catch (error) {

            console.error(
                "❌ Electron file open error:",
                error
            );

            return {

                success:
                    false,

                message:
                    "Unable to open the file.",

                error,

            };
        }
    }


    // ==================================================
    // BROWSER FALLBACK
    // ==================================================

    if (
        file.url
    ) {

        window.open(
            file.url,
            "_blank",
            "noopener,noreferrer"
        );


        return {

            success:
                true,

            message:
                `Opening ${
                    file.name ||
                    file.filename ||
                    "file"
                }`,

        };
    }


    // ==================================================
    // NO OPEN METHOD
    // ==================================================

    console.log(
        "⚠️ No file-opening API available:",
        file
    );


    return {

        success:
            false,

        message:
            "File opening is not available.",

    };
}


// ======================================================
// OPEN REQUESTED PDF
// ======================================================

export async function openRequestedPDF(
    command
) {

    console.log(
        "📄 Garuda PDF command:",
        command
    );


    // ==================================================
    // CHECK COMMAND
    // ==================================================

    if (
        !isPDFCommand(
            command
        )
    ) {

        return {

            handled:
                false,

            success:
                false,

            message:
                "Not a PDF command.",

        };
    }


    // ==================================================
    // GET FILES
    // ==================================================

    const files =
        await getAvailableFiles();


    // ==================================================
    // FIND PDF
    // ==================================================

    const matchedPDF =
        findRequestedPDF(
            files,
            command
        );


    // ==================================================
    // BUILD RESULT
    // ==================================================

    const pdfResult =
        createPDFResult(
            matchedPDF
        );


    // ==================================================
    // PDF NOT FOUND
    // ==================================================

    if (
        !pdfResult.success
    ) {

        return pdfResult;
    }


    // ==================================================
    // OPEN PDF
    // ==================================================

    const openResult =
        await openFile(
            matchedPDF
        );


    // ==================================================
    // OPEN FAILED
    // ==================================================

    if (
        !openResult.success
    ) {

        return {

            handled:
                true,

            success:
                false,

            type:
                "pdf",

            file:
                matchedPDF,

            message:
                openResult.message,

        };
    }


    // ==================================================
    // SUCCESS
    // ==================================================

    return {

        handled:
            true,

        success:
            true,

        type:
            "pdf",

        file:
            matchedPDF,

        message:
            openResult.message,

    };
}


// ======================================================
// EXPORT GENERAL FILE SERVICE
// ======================================================

export async function executeFileCommand(
    command
) {

    const result =
        await openRequestedPDF(
            command
        );


    if (
        result.handled
    ) {

        return result;
    }


    return {

        handled:
            false,

        success:
            false,

        message:
            "Not a supported file command.",

    };
}