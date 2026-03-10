import { TemplateConfig, ZP } from './base';

export const simpleTemplate: TemplateConfig = {
  name: 'simple',
  segments: (imageCount: number) => {
    const segs = [];
    for (let i = 0; i < Math.min(imageCount, 3); i++) {
      segs.push({
        duration: 3,
        effect: i % 2 === 0 ? ZP.zoomIn(3) : ZP.zoomOut(3),
        transition: 'fade',
        transitionDuration: 0.5,
      });
    }
    return segs;
  },
  ctaDuration: 3,
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
