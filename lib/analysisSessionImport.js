function storageKeyForNonce(nonce) {
  return `960dojo_analysis_import_${nonce}`;
}

/**
 * Store puzzle PGN and open our analysis page in a new tab.
 * Uses localStorage (not sessionStorage): each browser tab has its own sessionStorage, so a tab
 * opened via window.open cannot see data written in the tactics tab.
 */
export function stashPgnAndOpenAnalysis(pgn) {
  if (typeof window === 'undefined' || !pgn) return;
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  try {
    localStorage.setItem(storageKeyForNonce(nonce), String(pgn));
  } catch {
    return;
  }
  const q = new URLSearchParams({ importPgn: '1', n: nonce });
  window.open(`/analysis?${q.toString()}`, '_blank', 'noopener,noreferrer');
}

/** Read and remove PGN stored for this import nonce (one-shot). */
export function takePgnForImportNonce(nonce) {
  if (typeof window === 'undefined' || !nonce) return '';
  const key = storageKeyForNonce(String(nonce));
  try {
    const v = localStorage.getItem(key);
    if (v) localStorage.removeItem(key);
    return v || '';
  } catch {
    return '';
  }
}
