import { useEffect } from 'react';

export default function useMoveHighlight(gameState) {
    useEffect(() => {
        const highlightLastMove = () => {
            const uciMove = gameState.moveHistoryUCI[gameState.fenHistory.length - 1];
            if (!uciMove) return;

            const isBlack = gameState.userColor === 'black';
            const fileToCol = file => 'abcdefgh'.indexOf(file);

            const fromCol = isBlack ? 7 - fileToCol(uciMove[0]) : fileToCol(uciMove[0]);
            const fromRow = isBlack ? parseInt(uciMove[1]) - 1 : 8 - parseInt(uciMove[1]);
            const toCol = isBlack ? 7 - fileToCol(uciMove[2]) : fileToCol(uciMove[2]);
            const toRow = isBlack ? parseInt(uciMove[3]) - 1 : 8 - parseInt(uciMove[3]);

            const from = document.querySelector(`[data-row="${fromRow}"][data-col="${fromCol}"]`);
            const to = document.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`);

            if (from && to) {
                from.classList.add('last-move-highlight');
                to.classList.add('last-move-highlight');
            }
        };

        highlightLastMove();
    }, [gameState.fenHistory.length]);
}
