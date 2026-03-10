"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicTemplate = void 0;
const base_1 = require("./base");
exports.dynamicTemplate = {
    name: 'dynamic',
    segments: (imageCount) => {
        const segs = [];
        for (let i = 0; i < Math.min(imageCount, 3); i++) {
            segs.push({
                duration: 1.5,
                effect: i % 2 === 0 ? base_1.ZP.rotate(1.5) : base_1.ZP.fastZoom(1.5),
                transition: i === 0 ? 'fadewhite' : 'zoomin',
                transitionDuration: 0.2,
            });
        }
        return segs;
    },
    ctaDuration: 1,
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
//# sourceMappingURL=dynamic.js.map