export function normalizePieceSet(v) {
  if (typeof v !== 'string') return 'cburnett';
  const safe = v.trim().toLowerCase();
  return /^[a-z0-9-]+$/.test(safe) ? safe : 'cburnett';
}

export function normalizeBoardTheme(v) {
  if (typeof v !== 'string') return 'brown.png';
  const safe = v.trim().toLowerCase();
  if (!safe) return 'brown.png';
  if (/^[a-z0-9-]+\.(png|jpg|jpeg|svg)$/i.test(safe)) return safe;
  if (/^[a-z0-9-]+$/i.test(safe)) return `${safe}.png`;
  return 'brown.png';
}

export function boardThemeAsset(theme) {
  return `/lichess-assets/board/${normalizeBoardTheme(theme)}`;
}
