export interface PipelineInput {
  projectId: string;
  productName: string;
  productPrice: string;
  productFeatures: string[];
  images: string[];           // file paths or URLs
  template: 'simple' | 'trendy' | 'luxury' | 'cute' | 'dynamic';
  aspectRatio: '9:16' | '1:1' | '16:9';
  bgmPath?: string;
  voiceEnabled: boolean;
  backgroundStyle: 'dark' | 'light' | 'pink' | 'blue' | 'green';
}

export interface PipelineOutput {
  videoUrl: string;
  thumbnailUrl: string;
  durationSec: number;
  aiCopy: AICopy;
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

export const ASPECT_CONFIGS: Record<string, AspectConfig> = {
  '9:16': { width: 1080, height: 1920, label: '9:16' },
  '1:1':  { width: 1080, height: 1080, label: '1:1' },
  '16:9': { width: 1920, height: 1080, label: '16:9' },
};

export type ProgressCallback = (progress: number, stage: string) => void;
