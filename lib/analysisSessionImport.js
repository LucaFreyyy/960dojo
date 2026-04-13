function storageKeyForNonce(nonce) {
  return `960dojo_analysis_import_${nonce}`;
}

/**
 * Store puzzle PGN and open our analysis page in a new tab.
 * Uses localStorage (not sessionStorage): each browser tab has its own sessionStorage, so a tab
 * opened via window.open cannot see data written in the tactics tab.
 */
/**
 * @param {string} pgn
 * @param {{ browseAtStart?: boolean, evalMainlinePawns?: Array<number|null> }} [options]
 * - `browseAtStart`: if true, analysis opens at initial position (index -1) instead of last move.
 * - `evalMainlinePawns`: optional flat eval array for mainline positions (`[initial, afterMove1, ...]`).
 */
export function stashPgnAndOpenAnalysis(pgn, options = {}) {
  if (typeof window === 'undefined' || !pgn) return;
  const { browseAtStart = false, evalMainlinePawns = null } = options;
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  try {
    const payload = {
      pgn: String(pgn),
      evalMainlinePawns: Array.isArray(evalMainlinePawns)
        ? evalMainlinePawns.map((x) => (Number.isFinite(x) ? Number(x) : null))
        : null,
    };
    localStorage.setItem(storageKeyForNonce(nonce), JSON.stringify(payload));
  } catch {
    return;
  }
  const q = new URLSearchParams({ importPgn: '1', n: nonce });
  if (browseAtStart) q.set('at', 'start');
  window.open(`/analysis?${q.toString()}`, '_blank', 'noopener,noreferrer');
}

/** Read and remove PGN stored for this import nonce (one-shot). */
export function takePgnForImportNonce(nonce) {
  const payload = takeAnalysisImportForNonce(nonce);
  return payload?.pgn || '';
}

/** Read and remove analysis import payload stored for this nonce (one-shot). */
export function takeAnalysisImportForNonce(nonce) {
  if (typeof window === 'undefined' || !nonce) return { pgn: '', evalMainlinePawns: null };
  const key = storageKeyForNonce(String(nonce));
  try {
    const v = localStorage.getItem(key);
    if (v) localStorage.removeItem(key);
    if (!v) return { pgn: '', evalMainlinePawns: null };
    try {
      const parsed = JSON.parse(v);
      if (parsed && typeof parsed === 'object' && typeof parsed.pgn === 'string') {
        const evalMainlinePawns = Array.isArray(parsed.evalMainlinePawns)
          ? parsed.evalMainlinePawns.map((x) => (Number.isFinite(x) ? Number(x) : null))
          : null;
        return { pgn: parsed.pgn, evalMainlinePawns };
      }
    } catch {
      // Backward compatibility: older imports stored raw PGN string.
    }
    return { pgn: v, evalMainlinePawns: null };
  } catch {
    return { pgn: '', evalMainlinePawns: null };
  }
}
