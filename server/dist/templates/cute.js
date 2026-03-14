"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cuteTemplate = void 0;
const base_1 = require("./base");
exports.cuteTemplate = {
    name: 'cute',
    colorGrade: 'colorbalance=rs=0.06:gs=0.02:bs=0.04:rm=0.04:gm=0.01:bm=0.03,eq=brightness=0.05:saturation=1.15',
    bgStyle: 'pastel',
    segments: (imageCount) => {
        const img = (i) => Math.min(i, imageCount - 1);
        return [
            { duration: 2.0, effect: base_1.ZP.bounce(2.0), transition: 'circlecrop', transitionDuration: 0.4, imageIndex: img(0) },
            { duration: 3.0, effect: base_1.ZP.zoomIn(3.0), transition: 'circlecrop', transitionDuration: 0.4, imageIndex: img(0) },
            { duration: 4.0, effect: base_1.ZP.bounce(4.0), transition: 'circlecrop', transitionDuration: 0.5, imageIndex: img(1) },
            { duration: 3.0, effect: base_1.ZP.rotate(3.0), transition: 'circlecrop', transitionDuration: 0.4, imageIndex: img(Math.min(2, imageCount - 1)) },
            { duration: 3.0, effect: base_1.ZP.bounce(3.0), transition: 'fade', transitionDuration: 0.5, imageIndex: img(0) },
        ];
    },
    ctaDuration: 0,
    subtitleStyle: {
        fontsize: 44,
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