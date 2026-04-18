import { positionNrToStartFen } from './chess960';
import { buildPgnFromSans, replaySansFromStoredPgn } from './openingsPgn';

export function buildOpeningAnalysisPgn(openingNr, pgnText) {
  let startFen;
  try {
    startFen = positionNrToStartFen(openingNr);
  } catch {
    return null;
  }
  const sans = replaySansFromStoredPgn(pgnText || '', startFen);
  const movetext = buildPgnFromSans(startFen, sans);
  return [
    '[Event "960 Dojo opening session"]',
    '[Variant "Chess960"]',
    `[FEN "${startFen}"]`,
    '[SetUp "1"]',
    '',
    movetext.trim(),
  ].join('\n').trim();
}
