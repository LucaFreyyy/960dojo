import { Chess } from 'chess.js';
import { getDatabaseMoveWithMeta } from './moveGeneration';
import { getStockfishMove } from './stockfishUtils';

function tryPlayDbMove(game, uci, sanFallback) {
  if (uci && uci.length >= 4) {
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promotion = uci.length >= 5 ? uci[4] : undefined;
    const m = game.move({ from, to, promotion });
    if (m) return m;
  }
  if (sanFallback) {
    const m2 = game.move(sanFallback, { sloppy: true });
    if (m2) return m2;
  }
  return null;
}

export async function getOpponentSanAndFen(currentFen, userRating) {
  const db = await getDatabaseMoveWithMeta(currentFen, userRating, { variant: 'chess960' });
  if (db) {
    const game = new Chess(currentFen, { chess960: true });
    const m = tryPlayDbMove(game, db.uci, db.san);
    if (m) {
      return {
        san: m.san,
        newFen: game.fen(),
        source: 'db',
        lastMove: [m.from, m.to],
      };
    }
  }

  const sf = await getStockfishMove(currentFen, userRating);
  if (!sf?.san || !sf.resultFen) return null;
  return {
    san: sf.san,
    newFen: sf.resultFen,
    source: 'sf',
    lastMove: [sf.startSquare, sf.endSquare],
  };
}
