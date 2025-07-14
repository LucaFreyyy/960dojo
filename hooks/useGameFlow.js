import { useCallback } from 'react';
import { freestyleNumberToFEN } from '../lib/chesslogic';
import { positionWithFixedPieces } from '../lib/positionGeneration'; // if still needed

export function useGameFlow({ gameState, setGameState, getUserPreferences }) {
    const setupStartPosition = useCallback(() => {
        const colorBtns = document.querySelector('.color');
        const category = document.getElementById('Category')?.value;
        const rated = document.getElementById('ratedBtn')?.classList.contains('active');
        const numberSelect = document.getElementById('numberSelect');
        const piece = document.getElementById('PieceSelector')?.value;
        const sq1 = document.getElementById('SquareFixPieceSelector1')?.value;
        const sq2 = document.getElementById('SquareFixPieceSelector2')?.value;

        let userColor = colorBtns?.querySelector('.active')?.id.replace('Btn', '') || 'random';
        if (userColor === 'random') userColor = Math.random() > 0.5 ? 'white' : 'black';

        let number = 0;

        if (rated) {
            const userPrefs = getUserPreferences?.();
            userColor = userPrefs?.opening_color || userColor;
            number = userPrefs?.opening_position || 0;
        } else if (category === 'Random') {
            number = Math.floor(Math.random() * 960);
        } else if (category === 'Fixed Piece') {
            const matches = positionWithFixedPieces(piece, sq1, sq2);
            if (!matches.length) return;
            number = parseInt(matches[Math.floor(Math.random() * matches.length)], 10);
        } else {
            number = parseInt(numberSelect?.value || '0', 10);
        }

        const newFEN = freestyleNumberToFEN(number);
        numberSelect.value = number;

        setGameState((prev) => ({
            ...prev,
            isRated: rated,
            userColor,
            userRating: rated ? getUserPreferences?.()?.rating_openings : prev.userRating,
            colorToMove: 'white',
            position: newFEN,
        }));

        return { number, color: userColor };
    }, [setGameState, getUserPreferences]);

    const startGame = useCallback(() => {
        const result = setupStartPosition();
        if (result) {
            window.setPositionByNumber?.(result.number, result.color);
        }
    }, [setupStartPosition]);

    return { setupStartPosition, startGame };
}
