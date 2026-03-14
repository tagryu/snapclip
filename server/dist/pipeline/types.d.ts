export interface PipelineInput {
    projectId: string;
    productName: string;
    productPrice: string;
    productFeatures: string[];
    images: string[];
    template: 'simple' | 'trendy' | 'luxury' | 'cute' | 'dynamic';
    aspectRatio: '9:16' | '1:1' | '16:9';
    bgmPath?: string;
    voiceEnabled: boolean;
    backgroundStyle: 'dark' | 'light' | 'pink' | 'blue' | 'green';
}
export interface ProductAnalysisResult {
    category: string;
    color: string;
    material: string;
    suggestedScenes: string[];
}
export interface PipelineOutput {
    videoUrl: string;
    thumbnailUrl: string;
    durationSec: number;
    aiCopy: AICopy;
    productAnalysis?: ProductAnalysisResult;
}
export interface AICopy {
    lines: string[];
    hashtags: string[];
}
export interface AspectConfig {
    width: number;
    height: number;
    label: string;
}
export declare const ASPECT_CONFIGS: Record<string, AspectConfig>;
export type ProgressCallback = (progress: number, stage: string) => void;
//# sourceMappingURL=types.d.ts.map