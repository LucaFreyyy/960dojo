import { useEffect, useRef, useState } from 'react';
import { Chessground } from 'chessground';
import { Chess } from 'chess.js';

export default function ChessBoard({ fen, orientation, onPositionChange }) {
  const containerRef = useRef(null);
  const gameRef = useRef(new Chess(fen, { chess960: true }));
  const orientationRef = useRef(orientation)
  const [ground, setGround] = useState(null);

  // This function outputs all the available moves in a given position as a Map
  // This gets passed to the visualization to display and accept legal moves
  const toDests = (game) => {
    const dests = new Map();
    const moves = game.moves({ verbose: true });

    moves.forEach(move => {
      if (!dests.has(move.from)) {
        dests.set(move.from, []);
      }
      dests.get(move.from).push(move.to);
    });

    return dests;
  };

  // Runs on mount
  useEffect(() => {
    // Initialize board
    const cg = Chessground(containerRef.current, {
      fen: fen,
      orientation: orientation,
      movable: {
        free: false,
        color: 'both',
        dests: toDests(gameRef.current),
        events: {
          after: (orig, dest) => {
            const move = gameRef.current.move({ from: orig, to: dest });
            // Notify parent
            if (onPositionChange) {
              onPositionChange(gameRef.current.fen());
            }
            cg.set({
              fen: gameRef.current.fen(),
              orientation: orientationRef.current,
              movable: { dests: toDests(gameRef.current) }
            });
            console.log("Move made: " + move.san)
          }
        }
      }
    });
    setGround(cg);
  }, []);

  // FEN got updated: Setup new game
  useEffect(() => {
    if (!ground || !fen) return;

    // Update game instance
    const newGame = new Chess(fen, { chess960: true })
    gameRef.current = newGame

    // Update ground instance (visu)
    ground.set({
      fen: fen,
      lastMove: undefined,
      movable: { dests: toDests(gameRef.current) }
    });
  }, [fen]);

  // orientation got updated: Flip the board
  useEffect(() => {
    if (!ground) return;

    orientationRef.current = orientation
    ground.set({
      orientation: orientationRef.current,
    });
  }, [orientation]);

  return <div ref={containerRef} style={{ width: '500px', height: '500px' }} />;
};
