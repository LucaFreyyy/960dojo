import { makeSan } from 'chessops/san';
import { makeFen, parseFen } from 'chessops/fen';
import { Chess } from 'chessops/chess';
import { drawArrow } from './arrowUtils';

export function addDragDropHandlers(gameState, updateUI) {
    function handleDragStart(event) {
        const square = event.target.getAttribute('data-square');
        gameState.dragStartSquare = square;
    }

    function handleDrop(event) {
        const target = event.target;
        const endSquare = target.getAttribute('data-square');

        if (!gameState.dragStartSquare || !endSquare) return;

        const fen = gameState.fenHistory[gameState.fenHistory.length - 1];
        const setup = parseFen(fen);
        if (setup.isErr) return;

        const pos = Chess.fromSetup(setup.value).value;
        const move = {
            from: algebraicToIndex(gameState.dragStartSquare),
            to: algebraicToIndex(endSquare),
        };

        const result = pos.clone();
        const success = result.play(move);
        if (!success) return;

        const newFen = makeFen(result.toSetup());
        const san = makeSan(pos, move);

        gameState.moveHistorySAN.push(san);
        gameState.moveHistoryUCI.push(gameState.dragStartSquare + endSquare);
        gameState.fenHistory.push(newFen);
        gameState.colorToMove = result.turn === 'w' ? 'white' : 'black';
        gameState.halfMoveNumber += 1;

        updateUI(); // trigger redraw, arrow, move highlight, etc.
        drawArrow(gameState.dragStartSquare, endSquare, 'rgba(50, 255, 50, 0.8)');

        gameState.dragStartSquare = null;
    }

    function algebraicToIndex(sq) {
        return (parseInt(sq[1], 10) - 1) * 8 + (sq.charCodeAt(0) - 'a'.charCodeAt(0));
    }

    return {
        handleDragStart,
        handleDrop,
    };
}
