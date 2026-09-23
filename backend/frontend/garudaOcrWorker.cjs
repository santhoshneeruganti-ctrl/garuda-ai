const { parentPort, workerData } = require("worker_threads");
const fs = require("fs");

async function runOCR(filePath) {
    let parser = null;
    let ocrWorker = null;

    try {
        const { PDFParse } = require("pdf-parse");
        const buffer = fs.readFileSync(filePath);

        parser = new PDFParse({
            data: buffer,
        });

        const screenshots = await parser.getScreenshot({
            scale: 3,
            imageBuffer: true,
            imageDataUrl: false,
        });

        await parser.destroy();
        parser = null;

        if (!screenshots?.pages?.length) {
            return "";
        }

        const { createWorker } = require("tesseract.js");

        ocrWorker = await createWorker("eng");

        await ocrWorker.setParameters({
            tessedit_pageseg_mode: "6",
            preserve_interword_spaces: "1",
        });

        const pageTexts = [];
        const total = screenshots.pages.length;

        for (let i = 0; i < total; i++) {
            const page = screenshots.pages[i];

            try {
                const ocrResult = await ocrWorker.recognize(page.data);
                const pageText = String(
                    ocrResult?.data?.text || ""
                ).trim();

                if (pageText) {
                    pageTexts.push(
                        `\n--- PAGE ${i + 1} ---\n${pageText}`
                    );
                }
            } catch (error) {
                parentPort?.postMessage({
                    type: "page-error",
                    page: i + 1,
                    error: error?.message || String(error),
                });
            }

            parentPort?.postMessage({
                type: "progress",
                page: i + 1,
                total,
            });
        }

        return pageTexts.join("\n").trim();
    } finally {
        try {
            if (ocrWorker) {
                await ocrWorker.terminate();
            }
        } catch {}

        try {
            if (parser) {
                await parser.destroy();
            }
        } catch {}
    }
}

(async () => {
    try {
        const text = await runOCR(workerData.filePath);

        parentPort?.postMessage({
            type: "done",
            text,
        });
    } catch (error) {
        parentPort?.postMessage({
            type: "done",
            text: "",
            error: error?.message || String(error),
        });
    }
})();
