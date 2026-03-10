import { TemplateConfig, ZP } from './base';

export const cuteTemplate: TemplateConfig = {
  name: 'cute',
  segments: (imageCount: number) => {
    const segs = [];
    for (let i = 0; i < Math.min(imageCount, 3); i++) {
      segs.push({
        duration: 2,
        effect: i % 2 === 0 ? ZP.bounce(2) : ZP.rotate(2),
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
