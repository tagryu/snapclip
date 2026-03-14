import { TemplateConfig, ZP } from './base';

/**
 * Dynamic template — 15s, 7 segments with very fast 1.5-2.5s cuts.
 * High energy, alternating zoom effects for maximum impact.
 *
 * Timeline (~15s):
 *  0-2s:    Fast zoom — impact opener
 *  2-3.5s:  Shake zoom in — product name
 *  3.5-6s:  Snap zoom punch — feature highlight
 *  6-8s:    Fast zoom alternating — feature 2
 *  8-10s:   Shake zoom in — feature 3
 *  10-12s:  Snap zoom punch — price + benefit
 *  12-15s:  Fast zoom — CTA
 */
export const dynamicTemplate: TemplateConfig = {
  name: 'dynamic',
  colorGrade: 'eq=contrast=1.3:brightness=0.02:saturation=0.9',
  segments: (imageCount: number) => {
    const img = (i: number) => Math.min(i, imageCount - 1);
    return [
      // 0: Impact opener — fast zoom
      { duration: 2.0, effect: ZP.fastZoom(2.0), transition: 'slidedown', transitionDuration: 0.15, imageIndex: img(0) },
      // 1: Product name — shake zoom
      { duration: 1.5, effect: ZP.shakeZoomIn(1.5), transition: 'slideup', transitionDuration: 0.15, imageIndex: img(0) },
      // 2: Feature highlight — snap zoom punch
      { duration: 2.5, effect: ZP.snapZoomPunch(2.5), transition: 'wiperight', transitionDuration: 0.15, imageIndex: img(1) },
      // 3: Feature 2 — fast zoom
      { duration: 2.0, effect: ZP.fastZoom(2.0), transition: 'slidedown', transitionDuration: 0.15, imageIndex: img(1) },
      // 4: Feature 3 — shake zoom
      { duration: 2.0, effect: ZP.shakeZoomIn(2.0), transition: 'slideup', transitionDuration: 0.15, imageIndex: img(Math.min(2, imageCount - 1)) },
      // 5: Price + benefit — snap zoom punch
      { duration: 2.0, effect: ZP.snapZoomPunch(2.0), transition: 'wiperight', transitionDuration: 0.15, imageIndex: img(0) },
      // 6: CTA — fast zoom
      { duration: 3.0, effect: ZP.fastZoom(3.0), transition: 'slidedown', transitionDuration: 0.2, imageIndex: img(0) },
    ];
  },
  ctaDuration: 0,
  subtitleStyle: {
    fontsize: 56,
    fontcolor: 'yellow',
    borderw: 4,
    bordercolor: 'black',
    alignment: 'x=(w-text_w)/2:y=(h-th)/2',
    bold: true,
    boxEnabled: false,
  },
};
