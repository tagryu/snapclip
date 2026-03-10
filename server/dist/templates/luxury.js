"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.luxuryTemplate = void 0;
const base_1 = require("./base");
exports.luxuryTemplate = {
    name: 'luxury',
    segments: (imageCount) => {
        const segs = [];
        for (let i = 0; i < Math.min(imageCount, 2); i++) {
            segs.push({
                duration: 4,
                effect: i % 2 === 0 ? base_1.ZP.slowZoomIn(4) : base_1.ZP.panLeft(4),
                transition: 'dissolve',
                transitionDuration: 1.0,
            });
        }
        return segs;
    },
    ctaDuration: 3,
    subtitleStyle: {
        fontsize: 36,
        fontcolor: 'white@0.9',
        borderw: 0,
        bordercolor: 'black',
        alignment: 'x=(w-text_w)/2:y=h-th-80',
        bold: false,
        boxEnabled: false,
    },
};
//# sourceMappingURL=luxury.js.map