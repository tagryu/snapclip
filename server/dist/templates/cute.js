"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cuteTemplate = void 0;
const base_1 = require("./base");
exports.cuteTemplate = {
    name: 'cute',
    segments: (imageCount) => {
        const segs = [];
        for (let i = 0; i < Math.min(imageCount, 3); i++) {
            segs.push({
                duration: 2,
                effect: i % 2 === 0 ? base_1.ZP.bounce(2) : base_1.ZP.rotate(2),
                transition: 'circlecrop',
                transitionDuration: 0.5,
            });
        }
        return segs;
    },
    ctaDuration: 3,
    subtitleStyle: {
        fontsize: 40,
        fontcolor: '#FF69B4',
        borderw: 3,
        bordercolor: 'white',
        alignment: 'x=(w-text_w)/2:y=h-th-50',
        bold: false,
        boxEnabled: true,
        boxcolor: 'white@0.7',
    },
};
//# sourceMappingURL=cute.js.map