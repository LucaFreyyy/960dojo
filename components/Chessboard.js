import { useEffect, useRef, useState } from 'react';
import { Chessground } from 'chessground';
import { makeFen } from 'chessops/fen';
import { createPosition, toDests, makeMove } from '../lib/chessopsUtils';

export default function ChessBoard({ fen, orientation, onPositionChange }) {
  const containerRef = useRef(null);
  const positionRef = useRef(createPosition(fen));
  const orientationRef = useRef(orientation);
  const [ground, setGround] = useState(null);

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

            const { san, newFen } = makeMove(positionRef.current, orig, dest);

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
