import { parseFen, makeFen } from 'chessops/fen';
import { Chess } from 'chessops/chess';
import { makeSan } from 'chessops/san';

// Convert square index (0-63) to algebraic notation ("a1", "e4", etc.)
export const squareToAlgebraic = (sq) => {
  const files = 'abcdefgh';
  return files[sq & 7] + ((sq >> 3) + 1);
};

// Convert algebraic notation ("e4") to square index (0-63)
export const algebraicToSquare = (sq) => {
  const files = 'abcdefgh';
  const file = files.indexOf(sq[0]);
  const rank = parseInt(sq[1]) - 1;
  return rank * 8 + file;
};

// Create chess position from FEN string (handles chessops Result types)
export const createPosition = (fenString) => {
  const setup = parseFen(fenString);
  if (setup.isErr) {
    console.error('Invalid FEN:', setup.error);
    return null;
  }
  
  const posResult = Chess.fromSetup(setup.value);
  if (posResult.isErr) {
    console.error('Invalid position:', posResult.error);
    return null;
  }
  
  return posResult.value;
};

// Generate legal move destinations for Chessground
// Returns Map of "e4" -> ["e5", "e6"] format
export const toDests = (position) => {
  if (!position) return new Map();
  
  const currentFen = makeFen(position.toSetup());
  console.log('🔍 Current FEN:', currentFen);
  
  const dests = new Map();
  
  // Get all legal moves
  const legalMoves = [];
  for (const [from, toSquares] of position.allDests()) {
    for (const to of toSquares) {
      legalMoves.push({ from, to });
    }
  }
  
  console.log('🔍 Total moves generated:', legalMoves.length);
  
  // Build dests map in algebraic notation
  for (const [from, toSquares] of position.allDests()) {
    const fromSq = squareToAlgebraic(from);
    const toSqs = Array.from(toSquares).map(to => squareToAlgebraic(to));
    dests.set(fromSq, toSqs);
  }
  
  console.log('🔍 Dests map size:', dests.size);

  return dests;
};

// Make a move and return the new FEN and SAN
export const makeMove = (position, from, to) => {
  const fromIdx = algebraicToSquare(from);
  const toIdx = algebraicToSquare(to);
  const move = { from: fromIdx, to: toIdx };
  
  // Get SAN before playing
  const san = makeSan(position, move);
  
  // Play the move (mutates position)
  position.play(move);
  
  // Get new FEN
  const newFen = makeFen(position.toSetup());
  
  return { san, newFen };
};
