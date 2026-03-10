export interface TemplateSegment {
    duration: number;
    effect: string;
    transition?: string;
    transitionDuration?: number;
}
export interface TemplateConfig {
    name: string;
    segments: (imageCount: number) => TemplateSegment[];
    ctaDuration: number;
    subtitleStyle: SubtitleStyle;
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
};
//# sourceMappingURL=base.d.ts.map