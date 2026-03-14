import type { AspectConfig } from '../pipeline/types';

export interface TemplateSegment {
  duration: number;
  effect: string;       // zoompan filter string
  transition?: string;  // xfade transition type
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

// Common zoompan expressions
export const ZP = {
  zoomIn: (dur: number, fps: number = 30) =>
    `zoompan=z='min(zoom+0.002,1.3)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${dur * fps}:s=1080x1080:fps=${fps}`,
  zoomOut: (dur: number, fps: number = 30) =>
    `zoompan=z='if(eq(on,1),1.3,max(zoom-0.002,1))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${dur * fps}:s=1080x1080:fps=${fps}`,
  slowZoomIn: (dur: number, fps: number = 30) =>
    `zoompan=z='min(zoom+0.0008,1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${dur * fps}:s=1080x1080:fps=${fps}`,
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
  /** Dramatic fast zoom out from 1.6x */
  fastZoomOut: (dur: number, fps: number = 30) =>
    `zoompan=z='if(eq(on,1),1.6,max(zoom-0.006,1))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${dur * fps}:s=1080x1080:fps=${fps}`,
  /** Ken Burns - slow diagonal pan with zoom */
  kenBurns: (dur: number, fps: number = 30) =>
    `zoompan=z='min(zoom+0.001,1.2)':x='if(eq(on,1),0,min(x+1,iw-iw/zoom))':y='if(eq(on,1),0,min(y+0.5,ih-ih/zoom))':d=${dur * fps}:s=1080x1080:fps=${fps}`,
  /** Static with subtle pulse */
  pulse: (dur: number, fps: number = 30) =>
    `zoompan=z='1.02+0.02*sin(on*2*PI/${fps}/2)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${dur * fps}:s=1080x1080:fps=${fps}`,
  /** Snap zoom in — very fast zoom for reels/tiktok impact */
  snapZoomIn: (dur: number, fps: number = 30) =>
    `zoompan=z='min(1+0.5*pow(on/${dur * fps},0.3),1.5)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${dur * fps}:s=1080x1080:fps=${fps}`,
  /** Zoom in then out (breathe) */
  breathe: (dur: number, fps: number = 30) =>
    `zoompan=z='1.1+0.15*sin(on*PI/${dur * fps})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${dur * fps}:s=1080x1080:fps=${fps}`,
  /** Quick cut static — minimal motion, just holds */
  quickStatic: (dur: number, fps: number = 30) =>
    `zoompan=z='1.05':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${dur * fps}:s=1080x1080:fps=${fps}`,

  /** Camera shake + zoom in — fast zoom with 3-5px random offset for energy */
  shakeZoomIn: (dur: number, fps: number = 30) =>
    `zoompan=z='min(zoom+0.004,1.4)':x='iw/2-(iw/zoom/2)+random(1)*5-2':y='ih/2-(ih/zoom/2)+random(2)*5-2':d=${dur * fps}:s=1080x1080:fps=${fps}`,

  /** Spiral zoom — zoom with circular x/y movement */
  spiralZoom: (dur: number, fps: number = 30) =>
    `zoompan=z='min(zoom+0.002,1.25)':x='iw/2-(iw/zoom/2)+15*sin(on*2*PI/${dur * fps})':y='ih/2-(ih/zoom/2)+15*cos(on*2*PI/${dur * fps})':d=${dur * fps}:s=1080x1080:fps=${fps}`,

  /** Snap zoom punch — ultra fast zoom in then snap back (punch effect) */
  snapZoomPunch: (dur: number, fps: number = 30) => {
    const d = dur * fps;
    // First 30% frames: fast zoom to 1.5x, hold middle, last 30%: zoom back to 1.0
    return `zoompan=z='if(lt(on,${Math.round(d * 0.3)}),1+0.5*on/${Math.round(d * 0.3)},if(gt(on,${Math.round(d * 0.7)}),1.5-0.5*(on-${Math.round(d * 0.7)})/${Math.round(d * 0.3)},1.5))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${d}:s=1080x1080:fps=${fps}`;
  },

  /** Diagonal pan — top-left to bottom-right with slight zoom */
  panDiagonal: (dur: number, fps: number = 30) =>
    `zoompan=z='min(zoom+0.001,1.15)':x='if(eq(on,1),0,min(x+1.5,iw-iw/zoom))':y='if(eq(on,1),0,min(y+1,ih-ih/zoom))':d=${dur * fps}:s=1080x1080:fps=${fps}`,

  /** Slow drift — very subtle random drift movement (luxury feel) */
  slowDrift: (dur: number, fps: number = 30) =>
    `zoompan=z='1.08+0.02*sin(on*PI/${dur * fps})':x='iw/2-(iw/zoom/2)+8*sin(on*PI/${dur * fps}/2)':y='ih/2-(ih/zoom/2)+5*cos(on*PI/${dur * fps}/3)':d=${dur * fps}:s=1080x1080:fps=${fps}`,
};
