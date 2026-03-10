import { TemplateConfig, ZP } from './base';

export const luxuryTemplate: TemplateConfig = {
  name: 'luxury',
  segments: (imageCount: number) => {
    const segs = [];
    for (let i = 0; i < Math.min(imageCount, 2); i++) {
      segs.push({
        duration: 4,
        effect: i % 2 === 0 ? ZP.slowZoomIn(4) : ZP.panLeft(4),
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
