/** For testing / monitoring */
export declare function getUsage(userId: string): {
    date: string;
    count: number;
} | undefined;
export interface GenerateImageOpts {
    type: 'background' | 'multiAngle';
    userId?: string;
    plan?: string;
    productImagePath: string;
    scene?: string;
    angles?: string[];
    aspectRatio?: string;
    outputDir: string;
}
export declare function generateImage(opts: GenerateImageOpts): Promise<string | string[]>;
//# sourceMappingURL=image-router.d.ts.map