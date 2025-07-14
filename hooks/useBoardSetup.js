import { useCallback } from 'react';
import { freestyleNumberToFEN } from '../lib/chesslogic';
import { getPositionMatrixFromIndex } from '../lib/positionUtils';
import { redrawBoard, highlightLastMove } from '../lib/boardSetupAndDrawing';

// Accept gameState and setGameState as arguments
export function useBoardSetup(gameState, setGameState) {
    const setPositionByNumber = useCallback(async (number, color = null) => {
        if (!color) {
            const whiteBtn = document.getElementById('whiteBtn');
            const blackBtn = document.getElementById('blackBtn');
            color = whiteBtn?.classList.contains('active') ? 'white' :
                blackBtn?.classList.contains('active') ? 'black' :
                    Math.random() > 0.5 ? 'white' : 'black';
        }

        const board = getPositionMatrixFromIndex(number, color);
        redrawBoard(board);

        const fen = freestyleNumberToFEN(number);

        setGameState(prev => ({
            ...prev,
            position: fen,
            userColor: color,
        }));
    }, [setGameState]);

    const initializeBoard = useCallback(async () => {
        const numberSelect = document.getElementById('numberSelect');
        if (!numberSelect) return;

        const options = Array.from(numberSelect.options).filter(opt => !opt.disabled);
        const randomOption = options[Math.floor(Math.random() * options.length)];
        const randomNumber = parseInt(randomOption.value);
        numberSelect.value = randomNumber;

        const colorBtn = document.getElementById('whiteBtn')?.classList.contains('active') ? 'white' : 'black';
        await setPositionByNumber(randomNumber, colorBtn);
    }, [setPositionByNumber]);

    const redrawBoard = useCallback(() => {
        const fen = gameState.fenHistory?.[gameState.currentBrowsePosition]?.split(' ')[0];
        if (!fen) return;

        const isBlack = gameState.userColor === 'black';
        redrawBoard(fen, isBlack);
        highlightLastMove(gameState.moveHistoryUCI?.[gameState.currentBrowsePosition], isBlack);
    }, [gameState]);

    return {
        setPositionByNumber,
        initializeBoard,
        redrawBoard,
    };
}
