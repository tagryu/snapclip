import { TemplateConfig } from './base';
import { simpleTemplate } from './simple';
import { trendyTemplate } from './trendy';
import { luxuryTemplate } from './luxury';
import { cuteTemplate } from './cute';
import { dynamicTemplate } from './dynamic';

export const templates: Record<string, TemplateConfig> = {
  simple: simpleTemplate,
  trendy: trendyTemplate,
  luxury: luxuryTemplate,
  cute: cuteTemplate,
  dynamic: dynamicTemplate,
};

export { TemplateConfig, SubtitleStyle, TemplateSegment } from './base';
