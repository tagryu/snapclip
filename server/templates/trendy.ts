import { TemplateConfig, ZP } from './base';

/**
 * Trendy / TikTok-native template — 15s, 8 segments with fast 1.5-2s cuts.
 *
 * Timeline (~15s):
 *  0-1.5s:  Shake zoom hook — punchy opener
 *  1.5-3s:  Snap zoom punch — product name
 *  3-5s:    Fast pan right — reveal
 *  5-6.5s:  Shake zoom in — feature 1
 *  6.5-8.5s: Pan left fast — feature 2
 *  8.5-10s: Snap zoom punch — feature 3
 *  10-12s:  Fast zoom — price + benefit
 *  12-14.5s: Shake zoom + snap — CTA
 */
export const trendyTemplate: TemplateConfig = {
  name: 'trendy',
  colorGrade: 'eq=contrast=1.25:brightness=0.03:saturation=1.45',
  segments: (imageCount: number) => {
    const img = (i: number) => Math.min(i, imageCount - 1);
    return [
      // 0: Hook — shake zoom opener
      { duration: 1.5, effect: ZP.shakeZoomIn(1.5), transition: 'pixelize', transitionDuration: 0.15, imageIndex: img(0) },
      // 1: Product name — snap zoom punch
      { duration: 1.5, effect: ZP.snapZoomPunch(1.5), transition: 'wiperight', transitionDuration: 0.15, imageIndex: img(0) },
      // 2: Reveal — fast pan right
      { duration: 2.0, effect: ZP.panRight(2.0), transition: 'slideup', transitionDuration: 0.15, imageIndex: img(1) },
      // 3: Feature 1 — shake zoom
      { duration: 1.5, effect: ZP.shakeZoomIn(1.5), transition: 'pixelize', transitionDuration: 0.15, imageIndex: img(1) },
      // 4: Feature 2 — pan left
      { duration: 2.0, effect: ZP.panLeft(2.0), transition: 'wiperight', transitionDuration: 0.15, imageIndex: img(Math.min(2, imageCount - 1)) },
      // 5: Feature 3 — snap zoom punch
      { duration: 1.5, effect: ZP.snapZoomPunch(1.5), transition: 'slideup', transitionDuration: 0.15, imageIndex: img(0) },
      // 6: Price + benefit — fast zoom
      { duration: 2.0, effect: ZP.fastZoom(2.0), transition: 'pixelize', transitionDuration: 0.15, imageIndex: img(Math.min(2, imageCount - 1)) },
      // 7: CTA — shake zoom energy
      { duration: 2.5, effect: ZP.shakeZoomIn(2.5), transition: 'wiperight', transitionDuration: 0.2, imageIndex: img(0) },
    ];
  },
  ctaDuration: 0,
  subtitleStyle: {
    fontsize: 52,
    fontcolor: 'white',
    borderw: 4,
    bordercolor: 'black',
    alignment: 'x=(w-text_w)/2:y=(h-th)/2',
    bold: true,
    boxEnabled: false,
  },
};
