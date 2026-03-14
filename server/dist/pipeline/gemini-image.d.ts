/** Product analysis result from Gemini */
export interface ProductAnalysis {
    category: string;
    color: string;
    material: string;
    suggestedScenes: string[];
}
export declare function analyzeProduct(imagePath: string): Promise<ProductAnalysis>;
export declare function generateRealisticBackground(productImagePath: string, scene: string, aspectRatio: string, outputDir: string): Promise<string>;
export declare function generateMultiAngle(productImagePath: string, angles: string[], outputDir: string): Promise<string[]>;
//# sourceMappingURL=gemini-image.d.ts.map