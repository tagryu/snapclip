import { TemplateConfig, ZP } from './base';

export const trendyTemplate: TemplateConfig = {
  name: 'trendy',
  segments: (imageCount: number) => {
    const segs = [];
    for (let i = 0; i < Math.min(imageCount, 3); i++) {
      segs.push({
        duration: 2,
        effect: i % 2 === 0 ? ZP.fastZoom(2) : ZP.panRight(2),
        transition: i % 2 === 0 ? 'pixelize' : 'wiperight',
        transitionDuration: 0.3,
      });
    }
    return segs;
  },
  ctaDuration: 2,
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
