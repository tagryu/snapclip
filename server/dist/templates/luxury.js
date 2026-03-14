"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.luxuryTemplate = void 0;
const base_1 = require("./base");
exports.luxuryTemplate = {
    name: 'luxury',
    colorGrade: 'colorbalance=rs=0.05:gs=0.02:bs=-0.03:rh=0.03:gh=0.01:bh=-0.02,eq=contrast=1.05:brightness=-0.02:saturation=0.85',
    bgStyle: 'gold',
    segments: (imageCount) => {
        const img = (i) => Math.min(i, imageCount - 1);
        return [
            { duration: 2.0, effect: base_1.ZP.slowZoomIn(2.0), transition: 'dissolve', transitionDuration: 0.8, imageIndex: img(0) },
            { duration: 3.0, effect: base_1.ZP.kenBurns(3.0), transition: 'dissolve', transitionDuration: 0.8, imageIndex: img(0) },
            { duration: 4.0, effect: base_1.ZP.panLeft(4.0), transition: 'dissolve', transitionDuration: 0.7, imageIndex: img(1) },
            { duration: 3.0, effect: base_1.ZP.slowZoomIn(3.0), transition: 'dissolve', transitionDuration: 0.6, imageIndex: img(Math.min(2, imageCount - 1)) },
            { duration: 3.0, effect: base_1.ZP.pulse(3.0), transition: 'dissolve', transitionDuration: 0.8, imageIndex: img(0) },
        ];
    },
    ctaDuration: 0,
    subtitleStyle: {
        fontsize: 38,
        fontcolor: '#F5E6CA',
        borderw: 0,
        bordercolor: 'black',
        alignment: 'x=(w-text_w)/2:y=h-th-80',
        bold: false,
        boxEnabled: false,
    },
};
//# sourceMappingURL=luxury.js.map