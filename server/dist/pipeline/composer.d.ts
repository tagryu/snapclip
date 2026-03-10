import type { AICopy, AspectConfig } from './types';
interface ComposerOptions {
    images: string[];
    template: string;
    aspect: AspectConfig;
    productName: string;
    productPrice: string;
    aiCopy: AICopy;
    bgmPath?: string;
    narrationPath?: string;
    outputDir: string;
}
export declare function composeVideo(opts: ComposerOptions): Promise<string>;
export {};
//# sourceMappingURL=composer.d.ts.map