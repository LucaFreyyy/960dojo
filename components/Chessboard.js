import { useEffect, useRef, useState } from 'react';
import { Chessground } from 'chessground';
import { parseFen, makeFen } from 'chessops/fen';
import { Chess } from 'chessops/chess';
import { parseUci } from 'chessops/util';
import { makeSan } from 'chessops/san';

export default function ChessBoard({ fen, orientation, onPositionChange }) {
  const containerRef = useRef(null);

  // Helper: Create chess position from FEN (chessops uses Result types)
  const createPosition = (fenString) => {
    const setup = parseFen(fenString);
    if (setup.isErr) {
      console.error('Invalid FEN:', setup.error);
      return null;
    }
    return Chess.fromSetup(setup.value).unwrap();
  };

  const positionRef = useRef(createPosition(fen));
  const orientationRef = useRef(orientation)
  const [ground, setGround] = useState(null);

  // This function outputs all the available moves in a given position as a Map
  // This gets passed to the visualization to display and accept legal moves
  const toDests = (position) => {
    if (!position) return new Map();

    const currentFen = makeFen(position.toSetup());
    console.log('🔍 Current FEN:', currentFen);

    const dests = new Map();

    // Get legal moves from chessops
    const legalMoves = [];
    for (const [from, toSquares] of position.allDests()) {
      for (const to of toSquares) {
        legalMoves.push({ from, to });
      }
    }

    console.log('🔍 Total moves generated:', legalMoves.length);

    // Convert square indices to algebraic notation
    const files = 'abcdefgh';
    const squareToAlgebraic = (sq) => files[sq & 7] + ((sq >> 3) + 1);

    // Build dests map
    for (const [from, toSquares] of position.allDests()) {
      const fromSq = squareToAlgebraic(from);
      const toSqs = Array.from(toSquares).map(to => squareToAlgebraic(to));
      dests.set(fromSq, toSqs);
    }
    return dests;
  };

  // Runs on mount
  useEffect(() => {
    // Initialize board with chessops
    const cg = Chessground(containerRef.current, {
      fen: fen,
      orientation: orientation,
      movable: {
        free: false,
        color: 'both',
        dests: toDests(positionRef.current),
        events: {
          after: (orig, dest) => {
            console.log("Orig, dest: ", orig, dest);

            // Convert algebraic to chessops square indices
            const files = 'abcdefgh';
            const algebraicToSquare = (sq) => {
              const file = files.indexOf(sq[0]);
              const rank = parseInt(sq[1]) - 1;
              return rank * 8 + file;
            };

            const fromIdx = algebraicToSquare(orig);
            const toIdx = algebraicToSquare(dest);
            const move = { from: fromIdx, to: toIdx };

            // Get SAN before playing the move
            const san = makeSan(positionRef.current, move);

            // Play the move
            positionRef.current.play(move);
            const newFen = makeFen(positionRef.current.toSetup());

            // Notify parent
            if (onPositionChange) {
              onPositionChange(newFen);
            }

            cg.set({
              fen: newFen,
              orientation: orientationRef.current,
              movable: { dests: toDests(positionRef.current) },
            });

            console.log("Move made: " + san);
          }
        }
      }
    });
    setGround(cg);
  }, []);

  // FEN got updated: Setup new game
  useEffect(() => {
    if (!ground || !fen) return;

    // Create new position from FEN
    const newPosition = createPosition(fen);
    if (!newPosition) return;

    positionRef.current = newPosition;

    // Update ground instance (visu)
    ground.set({
      fen: fen,
      lastMove: undefined,
      movable: { dests: toDests(positionRef.current) }
    });
  }, [fen]);

  // orientation got updated: Flip the board
  useEffect(() => {
    if (!ground) return;

    orientationRef.current = orientation;
    ground.set({
      orientation: orientationRef.current,
    });
  }, [orientation]);

  return <div ref={containerRef} style={{ width: '500px', height: '500px' }} />;
};
