export const UI_STYLE_OPTIONS = [
  { id: 'dojo-classic', label: 'Dojo Classic' },
  { id: 'neon-night', label: 'Neon Night' },
  { id: 'paper-ink', label: 'Paper Ink' },
  { id: 'sunset-arcade', label: 'Sunset Arcade' },
  { id: 'forest-terminal', label: 'Forest Terminal' },
];

export function normalizeUiStyle(v) {
  if (typeof v !== 'string') return 'dojo-classic';
  const safe = v.trim().toLowerCase();
  return UI_STYLE_OPTIONS.some((x) => x.id === safe) ? safe : 'dojo-classic';
}
