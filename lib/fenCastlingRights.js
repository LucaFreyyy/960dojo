import { parseFen } from 'chessops/fen';
import { squareFile, squareRank } from 'chessops/util';

function emptyRights() {
  return {
    white: { short: false, long: false },
    black: { short: false, long: false },
  };
}

/**
 * Kingside (0-0) vs queenside (0-0-0) availability from the FEN castling field only
 * (not whether castling is legal on the current turn). Uses chessops parsing so
 * standard KQkq and Chess960 rook-file letters are handled consistently.
 *
 * @param {string} fen
 * @returns {{ white: { short: boolean, long: boolean }, black: { short: boolean, long: boolean } }}
 */
export function castlingRightsDisplayFromFen(fen) {
  const out = emptyRights();
  if (typeof fen !== 'string' || !fen.trim()) return out;
  const parsed = parseFen(fen.trim());
  if (parsed.isErr) return out;

  const { board, castlingRights } = parsed.value;

  /**
   * @param {'white' | 'black'} color
   */
  function classify(color) {
    const rank = color === 'white' ? 0 : 7;
    const rookSquares = [...castlingRights].filter((sq) => squareRank(sq) === rank);
    const rookFiles = rookSquares.map(squareFile).sort((a, b) => a - b);
    if (rookFiles.length === 0) return { short: false, long: false };

    const kingSq = [...board[color].intersect(board.king)][0];
    const kingFile = kingSq !== undefined ? squareFile(kingSq) : 4;

    if (rookFiles.length >= 2) {
      return { long: true, short: true };
    }
    const rf = rookFiles[0];
    if (rf < kingFile) return { long: true, short: false };
    if (rf > kingFile) return { long: false, short: true };
    return { short: false, long: false };
  }

  out.white = classify('white');
  out.black = classify('black');
  return out;
}
