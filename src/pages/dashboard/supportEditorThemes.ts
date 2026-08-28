/**
 * UX configuration for the support product editor.
 *
 * The API/data model stays shared. Themes only decide which fields are
 * relevant to the operator and which card attributes are recommended.
 */

export type SupportEditorTheme = 'theme_tradicionales' | 'theme_led' | 'theme_led_movil';

export type SupportEditorSection =
  | 'product'
  | 'publication'
  | 'location'
  | 'presentation'
  | 'technical'
  | 'operations'
  | 'route'
  | 'pricing'
  | 'preview';

export type SupportCardAttributeKey =
  | 'measures'
  | 'resolution'
  | 'daily_frequency'
  | 'spot_duration_seconds'
  | 'minimum_daily_outings'
  | 'route_duration_hours'
  | 'summary';

export interface SupportEditorThemeConfig {
  id: SupportEditorTheme;
  label: string;
  family: 'traditional' | 'led' | 'led_mobile';
  sections: SupportEditorSection[];
  recommendedCardAttributes: [SupportCardAttributeKey, SupportCardAttributeKey];
  hiddenFields: string[];
}

const COMMON_SECTIONS: SupportEditorSection[] = [
  'product',
  'publication',
  'location',
  'presentation',
  'pricing',
  'preview',
];

export const SUPPORT_EDITOR_THEMES: Record<SupportEditorTheme, SupportEditorThemeConfig> = {
  theme_tradicionales: {
    id: 'theme_tradicionales',
    label: 'Tradicionales',
    family: 'traditional',
    sections: [...COMMON_SECTIONS, 'technical'],
    recommendedCardAttributes: ['measures', 'summary'],
    hiddenFields: [
      'technical.resolution',
      'technical.daily_frequency',
      'technical.turn_on_schedule',
      'technical.video_mode',
      'technical.spot_duration_seconds',
      'technical.minimum_daily_outings',
      'technical.max_advertisers',
      'technical.route_duration_hours',
      'technical.operation_days',
      'technical.requirements',
      'route.*',
    ],
  },

  theme_led: {
    id: 'theme_led',
    label: 'LED',
    family: 'led',
    sections: [...COMMON_SECTIONS, 'technical', 'operations'],
    recommendedCardAttributes: ['resolution', 'daily_frequency'],
    hiddenFields: [
      'route.*',
    ],
  },

  theme_led_movil: {
    id: 'theme_led_movil',
    label: 'LED móvil',
    family: 'led_mobile',
    sections: [...COMMON_SECTIONS, 'technical', 'operations', 'route'],
    recommendedCardAttributes: ['spot_duration_seconds', 'minimum_daily_outings'],
    hiddenFields: [],
  },
};

export function getSupportEditorTheme(tipoSoporte?: string | null): SupportEditorTheme {
  switch (tipoSoporte) {
    case 'led':
      return 'theme_led';
    case 'led_movil':
      return 'theme_led_movil';
    default:
      return 'theme_tradicionales';
  }
}

export function getSupportEditorThemeConfig(tipoSoporte?: string | null): SupportEditorThemeConfig {
  return SUPPORT_EDITOR_THEMES[getSupportEditorTheme(tipoSoporte)];
}
