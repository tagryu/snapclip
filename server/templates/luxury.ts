import { TemplateConfig, ZP } from './base';

export const luxuryTemplate: TemplateConfig = {
  name: 'luxury',
  colorGrade: 'colorbalance=rs=0.05:gs=0.02:bs=-0.03:rh=0.03:gh=0.01:bh=-0.02,eq=contrast=1.05:brightness=-0.02:saturation=0.85',
  bgStyle: 'gold',
  segments: (imageCount: number) => {
    const img = (i: number) => Math.min(i, imageCount - 1);
    return [
      { duration: 2.0, effect: ZP.slowZoomIn(2.0), transition: 'dissolve', transitionDuration: 0.8, imageIndex: img(0) },
      { duration: 3.0, effect: ZP.kenBurns(3.0), transition: 'dissolve', transitionDuration: 0.8, imageIndex: img(0) },
      { duration: 4.0, effect: ZP.panLeft(4.0), transition: 'dissolve', transitionDuration: 0.7, imageIndex: img(1) },
      { duration: 3.0, effect: ZP.slowZoomIn(3.0), transition: 'dissolve', transitionDuration: 0.6, imageIndex: img(Math.min(2, imageCount - 1)) },
      { duration: 3.0, effect: ZP.pulse(3.0), transition: 'dissolve', transitionDuration: 0.8, imageIndex: img(0) },
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
