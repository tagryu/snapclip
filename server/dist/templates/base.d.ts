export interface TemplateSegment {
    duration: number;
    effect: string;
    transition?: string;
    transitionDuration?: number;
    /** Which image index to use (allows reusing images across 5 segments) */
    imageIndex: number;
}
export interface TemplateConfig {
    name: string;
    /** Returns segments totalling ~15s (5 for classic, 7-9 for fast-cut templates) */
    segments: (imageCount: number) => TemplateSegment[];
    ctaDuration: number;
    subtitleStyle: SubtitleStyle;
    /** Color grading filter applied to each segment (optional) */
    colorGrade?: string;
    /** Background gradient style override */
    bgStyle?: string;
}
export interface SubtitleStyle {
    fontsize: number;
    fontcolor: string;
    borderw: number;
    bordercolor: string;
    alignment: string;
    bold: boolean;
    boxEnabled: boolean;
    boxcolor?: string;
}
export declare const ZP: {
    zoomIn: (dur: number, fps?: number) => string;
    zoomOut: (dur: number, fps?: number) => string;
    slowZoomIn: (dur: number, fps?: number) => string;
    panRight: (dur: number, fps?: number) => string;
    panLeft: (dur: number, fps?: number) => string;
    bounce: (dur: number, fps?: number) => string;
    rotate: (dur: number, fps?: number) => string;
    fastZoom: (dur: number, fps?: number) => string;
    /** Dramatic fast zoom out from 1.6x */
    fastZoomOut: (dur: number, fps?: number) => string;
    /** Ken Burns - slow diagonal pan with zoom */
    kenBurns: (dur: number, fps?: number) => string;
    /** Static with subtle pulse */
    pulse: (dur: number, fps?: number) => string;
    /** Snap zoom in — very fast zoom for reels/tiktok impact */
    snapZoomIn: (dur: number, fps?: number) => string;
    /** Zoom in then out (breathe) */
    breathe: (dur: number, fps?: number) => string;
    /** Quick cut static — minimal motion, just holds */
    quickStatic: (dur: number, fps?: number) => string;
    /** Camera shake + zoom in — fast zoom with 3-5px random offset for energy */
    shakeZoomIn: (dur: number, fps?: number) => string;
    /** Spiral zoom — zoom with circular x/y movement */
    spiralZoom: (dur: number, fps?: number) => string;
    /** Snap zoom punch — ultra fast zoom in then snap back (punch effect) */
    snapZoomPunch: (dur: number, fps?: number) => string;
    /** Diagonal pan — top-left to bottom-right with slight zoom */
    panDiagonal: (dur: number, fps?: number) => string;
    /** Slow drift — very subtle random drift movement (luxury feel) */
    slowDrift: (dur: number, fps?: number) => string;
};
//# sourceMappingURL=base.d.ts.map