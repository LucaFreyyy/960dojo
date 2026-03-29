import { useEffect, useRef, useState } from 'react';
import { Chessground } from 'chessground';
import { Chess } from 'chess.js';

export default function ChessBoard({ fen }) {
  const boardRef = useRef(null);
  const [game, setGame] = useState(new Chess(fen, { chess960: true }));
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
    const cg = Chessground(boardRef.current, {
      fen: game.fen(),
      movable: {
        free: false,
        color: 'both',
        dests: toDests(game),
        events: {
          after: (orig, dest) => {
            const move = game.move({ from: orig, to: dest });
            // TODO: send to database or somewhere
            cg.set({
              fen: game.fen(),
              movable: { dests: toDests(game) }
            });
            console.log("Move made: " + move)
          }
        }
      }
    });
    setGround(cg);
  }, []);

  // Runs on FEN change
  useEffect(() => {
    if (!ground || !fen) return;

    // Update game instance
    const newGame = new Chess(fen, { chess960: true })
    setGame(newGame)

    // Update ground instance (visu)
    ground.set({
      fen: game.fen(),
      movable: { dests: toDests(game) }
    });
  }, [fen]);



  return <div ref={boardRef} style={{ width: '500px', height: '500px' }} />;
};
