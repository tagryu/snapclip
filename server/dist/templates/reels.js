"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reelsTemplate = void 0;
const base_1 = require("./base");
/**
 * Reels / TikTok style template — 15 seconds, 8 segments with fast cuts.
 *
 * Timeline:
 *  0-1s:  Fast zoom-in on first image (impact opener)
 *  1-3s:  Product name + price overlay (slight pulse)
 *  3-5s:  Second image, left→right pan
 *  5-7s:  Third image, zoom out reveal
 *  7-9s:  Worn/lifestyle shot, breathe (zoom in→out)
 *  9-11s: Detail cuts — rapid 1s alternating
 * 11-13s: AI copy text overlay (slow zoom)
 * 13-15s: CTA + logo (pulse)
 */
exports.reelsTemplate = {
    name: 'reels',
    colorGrade: 'eq=contrast=1.15:brightness=0.02:saturation=1.3',
    segments: (imageCount) => {
        const img = (i) => Math.min(i, imageCount - 1);
        return [
            // 0-1s: Snap zoom in — punchy opener
            { duration: 1.0, effect: base_1.ZP.snapZoomIn(1.0), transition: 'fadewhite', transitionDuration: 0.1, imageIndex: img(0) },
            // 1-3s: Product info overlay on image 0 with pulse
            { duration: 2.0, effect: base_1.ZP.pulse(2.0), transition: 'wiperight', transitionDuration: 0.15, imageIndex: img(0) },
            // 3-5s: Second image, pan left→right
            { duration: 2.0, effect: base_1.ZP.panRight(2.0), transition: 'slideleft', transitionDuration: 0.15, imageIndex: img(1) },
            // 5-7s: Third image, zoom out reveal
            { duration: 2.0, effect: base_1.ZP.fastZoomOut(2.0), transition: 'zoomin', transitionDuration: 0.2, imageIndex: img(2) },
            // 7-9s: Lifestyle/worn shot — breathe effect
            { duration: 2.0, effect: base_1.ZP.breathe(2.0), transition: 'fadeblack', transitionDuration: 0.15, imageIndex: img(Math.min(1, imageCount - 1)) },
            // 9-10s: Detail cut 1 — quick static
            { duration: 1.0, effect: base_1.ZP.quickStatic(1.0), transition: 'wiperight', transitionDuration: 0.1, imageIndex: img(2) },
            // 10-11s: Detail cut 2 — quick static
            { duration: 1.0, effect: base_1.ZP.quickStatic(1.0), transition: 'wipeleft', transitionDuration: 0.1, imageIndex: img(0) },
            // 11-13s: AI copy text (slow zoom for emphasis)
            { duration: 2.0, effect: base_1.ZP.slowZoomIn(2.0), transition: 'fadeblack', transitionDuration: 0.2, imageIndex: img(1) },
            // 13-15s: CTA + logo
            { duration: 2.0, effect: base_1.ZP.pulse(2.0), transition: 'fadewhite', transitionDuration: 0.2, imageIndex: img(0) },
        ];
    },
    ctaDuration: 0,
    subtitleStyle: {
        fontsize: 60,
        fontcolor: 'white',
        borderw: 4,
        bordercolor: 'black',
        alignment: 'x=(w-text_w)/2:y=(h-th)/2',
        bold: true,
        boxEnabled: false,
    },
};
//# sourceMappingURL=reels.js.map