import { TemplateConfig } from './base';
import { simpleTemplate } from './simple';
import { trendyTemplate } from './trendy';
import { luxuryTemplate } from './luxury';
import { cuteTemplate } from './cute';
import { dynamicTemplate } from './dynamic';
import { reelsTemplate } from './reels';

export const templates: Record<string, TemplateConfig> = {
  simple: simpleTemplate,
  trendy: trendyTemplate,
  luxury: luxuryTemplate,
  cute: cuteTemplate,
  dynamic: dynamicTemplate,
  reels: reelsTemplate,
};

export { TemplateConfig, SubtitleStyle, TemplateSegment } from './base';
