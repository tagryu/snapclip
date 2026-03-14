"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleTemplate = void 0;
const base_1 = require("./base");
exports.simpleTemplate = {
    name: 'simple',
    segments: (imageCount) => {
        const img = (i) => Math.min(i, imageCount - 1);
        return [
            // Seg1 [0-2s] Hook: product name + tagline
            { duration: 2.0, effect: base_1.ZP.zoomIn(2.0), transition: 'fade', transitionDuration: 0.4, imageIndex: img(0) },
            // Seg2 [2-5s] Product zoom-in reveal
            { duration: 3.0, effect: base_1.ZP.zoomOut(3.0), transition: 'fade', transitionDuration: 0.5, imageIndex: img(0) },
            // Seg3 [5-9s] Features
            { duration: 4.0, effect: base_1.ZP.slowZoomIn(4.0), transition: 'fade', transitionDuration: 0.5, imageIndex: img(1) },
            // Seg4 [9-12s] Price + benefit
            { duration: 3.0, effect: base_1.ZP.zoomIn(3.0), transition: 'fade', transitionDuration: 0.4, imageIndex: img(Math.min(2, imageCount - 1)) },
            // Seg5 [12-15s] CTA
            { duration: 3.0, effect: base_1.ZP.pulse(3.0), transition: 'fade', transitionDuration: 0.5, imageIndex: img(0) },
        ];
    },
    ctaDuration: 0, // CTA is now segment 5
    subtitleStyle: {
        fontsize: 42,
        fontcolor: 'white',
        borderw: 2,
        bordercolor: 'black',
        alignment: 'x=(w-text_w)/2:y=h-th-60',
        bold: false,
        boxEnabled: false,
    },
};
//# sourceMappingURL=simple.js.map