import type { AspectConfig } from '../pipeline/types';

export interface TemplateSegment {
  duration: number;
  effect: string;       // zoompan filter string
  transition?: string;  // xfade transition type
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
  alignment: string; // drawtext position expr
  bold: boolean;
  boxEnabled: boolean;
  boxcolor?: string;
}

// Common zoompan expressions
export const ZP = {
  zoomIn: (dur: number, fps: number = 30) =>
    `zoompan=z='min(zoom+0.002,1.3)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${dur * fps}:s=1080x1080:fps=${fps}`,
  zoomOut: (dur: number, fps: number = 30) =>
    `zoompan=z='if(eq(on,1),1.3,max(zoom-0.002,1))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${dur * fps}:s=1080x1080:fps=${fps}`,
  slowZoomIn: (dur: number, fps: number = 30) =>
    `zoompan=z='min(zoom+0.001,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${dur * fps}:s=1080x1080:fps=${fps}`,
  panRight: (dur: number, fps: number = 30) =>
    `zoompan=z='1.2':x='if(eq(on,1),0,min(x+2,iw-iw/zoom))':y='ih/2-(ih/zoom/2)':d=${dur * fps}:s=1080x1080:fps=${fps}`,
  panLeft: (dur: number, fps: number = 30) =>
    `zoompan=z='1.2':x='if(eq(on,1),iw-iw/zoom,max(x-2,0))':y='ih/2-(ih/zoom/2)':d=${dur * fps}:s=1080x1080:fps=${fps}`,
  bounce: (dur: number, fps: number = 30) =>
    `zoompan=z='1.1+0.05*sin(on*PI/${fps})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${dur * fps}:s=1080x1080:fps=${fps}`,
  rotate: (dur: number, fps: number = 30) =>
    `zoompan=z='1.15+0.05*sin(on*PI/${fps}/2)':x='iw/2-(iw/zoom/2)+10*sin(on*PI/${fps})':y='ih/2-(ih/zoom/2)':d=${dur * fps}:s=1080x1080:fps=${fps}`,
  fastZoom: (dur: number, fps: number = 30) =>
    `zoompan=z='min(zoom+0.005,1.5)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${dur * fps}:s=1080x1080:fps=${fps}`,
};
