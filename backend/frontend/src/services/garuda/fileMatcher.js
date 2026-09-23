// ======================================================
// fileMatcher.js
// ======================================================
// Finds the best matching file from a list of files.
// This module does NOT open files.
// ======================================================


function normalizeFileName(
    value
) {

    return String(
        value || ""
    )
        .toLowerCase()
        .replace(
            /\.[^/.]+$/,
            ""
        )
        .replace(
            /[_-]+/g,
            " "
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();
}


// ======================================================
// CREATE SEARCH TERMS
// ======================================================

function createSearchTerms(
    query
) {

    return normalizeFileName(
        query
    )
        .split(" ")
        .filter(
            Boolean
        );
}


// ======================================================
// SCORE FILE
// ======================================================

function scoreFile(
    file,
    query
) {

    const fileName =
        normalizeFileName(
            file?.name ||
            file?.filename ||
            file?.title ||
            ""
        );


    const searchText =
        normalizeFileName(
            query
        );


    if (
        !fileName ||
        !searchText
    ) {

        return 0;
    }


    // ==============================================
    // EXACT MATCH
    // ==============================================

    if (
        fileName ===
        searchText
    ) {

        return 100;
    }


    // ==============================================
    // FULL CONTAINS
    // ==============================================

    if (
        fileName.includes(
            searchText
        )
    ) {

        return 80;
    }


    // ==============================================
    // WORD MATCH
    // ==============================================

    const terms =
        createSearchTerms(
            query
        );


    let score =
        0;


    for (
        const term of terms
    ) {

        if (
            fileName.includes(
                term
            )
        ) {

            score += 20;
        }
    }


    return score;
}


// ======================================================
// FIND BEST MATCH
// ======================================================

export function findBestFile(
    files,
    query
) {

    if (
        !Array.isArray(files) ||
        files.length === 0
    ) {

        return null;
    }


    let bestFile =
        null;

    let bestScore =
        0;


    for (
        const file of files
    ) {

        const score =
            scoreFile(
                file,
                query
            );


        if (
            score >
            bestScore
        ) {

            bestScore =
                score;

            bestFile =
                file;
        }
    }


    return bestFile;
}


// ======================================================
// FIND BEST PDF
// ======================================================

export function findBestPDF(
    files,
    query
) {

    const pdfFiles =
        files.filter(
            (file) => {

                const name =
                    String(
                        file?.name ||
                        file?.filename ||
                        ""
                    )
                        .toLowerCase();

                return name.endsWith(
                    ".pdf"
                );
            }
        );


    return findBestFile(
        pdfFiles,
        query
    );
}