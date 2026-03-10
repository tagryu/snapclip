"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTTS = generateTTS;
exports.generateNarration = generateNarration;
const child_process_1 = require("child_process");
const util_1 = require("util");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const logger_1 = require("../src/logger");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
async function generateTTS(text, outputDir, voice = 'ko-KR-SunHiNeural') {
    logger_1.logger.info(`Generating TTS: "${text.substring(0, 50)}..."`);
    await promises_1.default.mkdir(outputDir, { recursive: true });
    const outputPath = path_1.default.join(outputDir, `tts_${Date.now()}.mp3`);
    // edge-tts CLI
    const escapedText = text.replace(/"/g, '\\"');
    const cmd = `edge-tts --voice "${voice}" --text "${escapedText}" --write-media "${outputPath}"`;
    try {
        await execAsync(cmd, { timeout: 30000 });
        logger_1.logger.info(`TTS generated: ${outputPath}`);
        return outputPath;
    }
    catch (err) {
        logger_1.logger.error(`TTS failed: ${err.message}`);
        throw new Error(`TTS generation failed: ${err.message}`);
    }
}
async function generateNarration(productName, copyLines, outputDir) {
    const script = `${productName}. ${copyLines.join('. ')}`;
    return generateTTS(script, outputDir);
}
//# sourceMappingURL=tts.js.map