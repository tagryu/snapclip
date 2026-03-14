import type { AICopy, AspectConfig } from './types';
interface ComposerOptions {
    images: string[];
    template: string;
    aspect: AspectConfig;
    productName: string;
    productPrice: string;
    aiCopy: AICopy;
    productFeatures?: string[];
    bgmPath?: string;
    narrationPath?: string;
    outputDir: string;
    /** BPM for beat-sync cut timing (optional). Overrides segment durations. */
    bpm?: number;
}
export declare function composeVideo(opts: ComposerOptions): Promise<string>;
export {};
//# sourceMappingURL=composer.d.ts.map