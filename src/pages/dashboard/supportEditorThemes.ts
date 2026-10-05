/**
 * UX configuration for the support product editor.
 * Themes are the source of truth for operator-visible sections and fields.
 */

export type SupportEditorTheme = 'theme_tradicionales' | 'theme_led' | 'theme_led_movil';
export type SupportEditorSection = 'product' | 'publication' | 'location' | 'presentation' | 'technical' | 'operations' | 'route' | 'pricing' | 'preview';
export type SupportCardAttributeKey = 'measures' | 'resolution' | 'daily_frequency' | 'spot_duration_seconds' | 'minimum_daily_outings' | 'route_duration_hours' | 'summary' | 'caras' | 'monthly_impacts';

export interface SupportEditorThemeConfig {
  id: SupportEditorTheme;
  label: string;
  family: 'traditional' | 'led' | 'led_mobile';
  sections: SupportEditorSection[];
  recommendedCardAttributes: [SupportCardAttributeKey, SupportCardAttributeKey, SupportCardAttributeKey];
  hiddenFields: string[];
}

const COMMON_SECTIONS: SupportEditorSection[] = ['product', 'publication', 'location', 'presentation', 'pricing', 'preview'];

export const SUPPORT_EDITOR_THEMES: Record<SupportEditorTheme, SupportEditorThemeConfig> = {
  theme_tradicionales: {
    id: 'theme_tradicionales', label: 'Tradicionales', family: 'traditional',
    sections: [...COMMON_SECTIONS, 'technical'],
    recommendedCardAttributes: ['measures', 'caras', 'monthly_impacts'],
    hiddenFields: ['technical.resolution','technical.daily_frequency','technical.turn_on_schedule','technical.video_mode','technical.spot_duration_seconds','technical.minimum_daily_outings','technical.max_advertisers','technical.route_duration_hours','technical.operation_days','technical.requirements','route.*'],
  },
  theme_led: {
    id: 'theme_led', label: 'LED', family: 'led',
    sections: [...COMMON_SECTIONS, 'technical', 'operations'],
    recommendedCardAttributes: ['measures', 'resolution', 'monthly_impacts'],
    hiddenFields: ['route.*'],
  },
  theme_led_movil: {
    id: 'theme_led_movil', label: 'LED móvil', family: 'led_mobile',
    sections: [...COMMON_SECTIONS, 'technical', 'operations', 'route'],
    recommendedCardAttributes: ['route_duration_hours', 'spot_duration_seconds', 'monthly_impacts'],
    hiddenFields: [],
  },
};

export function getSupportEditorTheme(tipoSoporte?: string | null): SupportEditorTheme {
  return tipoSoporte === 'led' ? 'theme_led' : tipoSoporte === 'led_movil' ? 'theme_led_movil' : 'theme_tradicionales';
}

export function getSupportEditorThemeConfig(tipoSoporte?: string | null): SupportEditorThemeConfig {
  return SUPPORT_EDITOR_THEMES[getSupportEditorTheme(tipoSoporte)];
}

export function isEditorSectionVisible(theme: SupportEditorThemeConfig, section: SupportEditorSection) {
  return theme.sections.includes(section);
}

export function isEditorFieldVisible(theme: SupportEditorThemeConfig, field: string) {
  return !theme.hiddenFields.some((hidden) => hidden === field || (hidden.endsWith('.*') && field.startsWith(hidden.slice(0, -1))));
}
