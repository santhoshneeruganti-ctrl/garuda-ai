const fs = require('fs');
const path = require('path');

const target = path.join(process.cwd(), 'electron.cjs');
const workerTarget = path.join(process.cwd(), 'garudaOcrWorker.cjs');

if (!fs.existsSync(target)) {
  console.error(`❌ electron.cjs not found in: ${process.cwd()}`);
  process.exit(1);
}

const source = fs.readFileSync(target, 'utf8');
const startMarker = '    async function extractGarudaPdfText(filePath) {';
const endMarker = '    async function processGarudaPdfOnDemand(filePath) {';
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker, start);

if (start === -1 || end === -1 || end <= start) {
  console.error('❌ Could not locate extractGarudaPdfText() block. No changes made.');
  process.exit(1);
}

const replacement = `    async function extractGarudaPdfText(filePath) {
        try {
            const nativeText = await extractGarudaPdfNativeTextOnly(filePath);
            if (nativeText) {
                return nativeText;
            }

            console.log("🔍 Scanned/image PDF detected, starting background OCR:", filePath);

            const workerPath = path.join(__dirname, "garudaOcrWorker.cjs");

            return await new Promise((resolve) => {
                let settled = false;
                let ocrWorker = null;

                const finish = (text) => {
                    if (settled) return;
                    settled = true;
                    resolve(String(text || "").trim());
                };

                try {
                    const { Worker } = require("worker_threads");
                    ocrWorker = new Worker(workerPath, {
                        workerData: { filePath },
                    });

                    ocrWorker.on("message", (message) => {
                        if (message?.type === "progress") {
                            console.log(
                                \`🔎 Garuda OCR: page \${message.page}/\${message.total}\`
                            );
                            return;
                        }

                        if (message?.type === "done") {
                            if (message.error) {
                                console.error("❌ Garuda OCR worker failed:", message.error);
                            }
                            finish(message.text);
                            ocrWorker.terminate().catch(() => {});
                        }
                    });

                    ocrWorker.on("error", (error) => {
                        console.error("❌ Garuda OCR worker error:", error);
                        finish("");
                    });

                    ocrWorker.on("exit", (code) => {
                        if (code !== 0 && !settled) {
                            console.error(\`❌ Garuda OCR worker exited with code \${code}\`);
                            finish("");
                        }
                    });
                } catch (error) {
                    console.error("❌ Failed to start Garuda OCR worker:", error);
                    finish("");
                }
            });
        } catch (error) {
            console.error("❌ Garuda PDF extraction failed:", error);
            return "";
        }
    }

`;

const backup = `${target}.before-ocr-worker-${Date.now()}`;
fs.copyFileSync(target, backup);
fs.writeFileSync(target, source.slice(0, start) + replacement + source.slice(end), 'utf8');

const worker = `const { parentPort, workerData } = require("worker_threads");
const fs = require("fs");

async function runOCR(filePath) {
    let parser = null;
    let ocrWorker = null;

    try {
        const { PDFParse } = require("pdf-parse");
        const buffer = fs.readFileSync(filePath);
        parser = new PDFParse({ data: buffer });

        const screenshots = await parser.getScreenshot({
            scale: 3,
            imageBuffer: true,
            imageDataUrl: false,
        });

        await parser.destroy();
        parser = null;

        if (!screenshots?.pages?.length) return "";

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
                const pageText = String(ocrResult?.data?.text || "").trim();
                if (pageText) {
                    pageTexts.push(\`\\n--- PAGE \${i + 1} ---\\n\${pageText}\`);
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

        return pageTexts.join("\\n").trim();
    } finally {
        try { if (ocrWorker) await ocrWorker.terminate(); } catch {}
        try { if (parser) await parser.destroy(); } catch {}
    }
}

(async () => {
    try {
        const text = await runOCR(workerData.filePath);
        parentPort?.postMessage({ type: "done", text });
    } catch (error) {
        parentPort?.postMessage({
            type: "done",
            text: "",
            error: error?.message || String(error),
        });
    }
})();
`;

fs.writeFileSync(workerTarget, worker, 'utf8');

console.log('✅ OCR worker patch applied.');
console.log(`📄 Backup: ${backup}`);
console.log(`🧵 Worker: ${workerTarget}`);
console.log('Next: run node --check electron.cjs');
