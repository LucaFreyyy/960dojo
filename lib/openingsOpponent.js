import { getMaiaMoveClient } from './maiaClient';
import { Chess } from './chessCompat';

export async function getOpponentSanAndFen(currentFen, userRating, onProgress) {
  const result = await getMaiaMoveClient({
    fen: currentFen,
    rating: userRating,
    opponentRating: userRating,
    onProgress,
  });
  if (!result?.uci) return null;

  const game = new Chess(currentFen, { chess960: true });
  const from  = result.uci.slice(0, 2);
  const to    = result.uci.slice(2, 4);
  const promo = result.uci.length > 4 ? result.uci[4] : undefined;
  const m = game.move({ from, to, promotion: promo });
  if (!m) return null;

  return {
    san: m.san,
    newFen: game.fen(),
    source: 'maia',
    lastMove: [m.from, m.to],
  };
}
