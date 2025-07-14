import { useEffect } from 'react';

export function useEventListeners({
    onRatedClick,
    onTrainingClick,
    onColorSelect,
    onStart,
    onBack,
    onBrowseBack,
    onBrowseAllBack,
    onBrowseForward,
    onBrowseAllForward,
    onPieceSelectorChange,
    onPlayAgain,
    onLichessClick,
}) {
    useEffect(() => {
        const listeners = [
            ['Category', 'change', () => toggleNumberSelect().catch(console.error)],
            ['numberSelect', 'change', () => onNumberSelectChange().catch(console.error)],
            ['ratedBtn', 'click', onRatedClick],
            ['trainingBtn', 'click', onTrainingClick],
            ['whiteBtn', 'click', () => onColorSelect('white')],
            ['blackBtn', 'click', () => onColorSelect('black')],
            ['randomBtn', 'click', () => onColorSelect('random')],
            ['startBtn', 'click', onStart],
            ['backButton', 'click', onBack],
            ['browseback', 'click', onBrowseBack],
            ['browseallthewayback', 'click', onBrowseAllBack],
            ['browseforward', 'click', onBrowseForward],
            ['browseallthewayforward', 'click', onBrowseAllForward],
            ['PieceSelector', 'change', () => onPieceSelectorChange?.().catch(console.error)],
            ['SquareFixPieceSelector1', 'change', () => onPieceSelectorChange?.().catch(console.error)],
            ['SquareFixPieceSelector2', 'change', () => onPieceSelectorChange?.().catch(console.error)],
            ['playAgainBtn', 'click', onPlayAgain],
            ['lichessBtn', 'click', () => {
                onLichessClick?.();
            }],
        ];

        listeners.forEach(([id, event, handler]) => {
            const el = document.getElementById(id);
            if (el && handler) el.addEventListener(event, handler);
        });

        document.querySelectorAll('.selectors select').forEach(select => {
            select.addEventListener('change', () => select.blur());
        });

        return () => {
            listeners.forEach(([id, event, handler]) => {
                const el = document.getElementById(id);
                if (el && handler) el.removeEventListener(event, handler);
            });
        };
    }, [
        onRatedClick,
        onTrainingClick,
        onColorSelect,
        onStart,
        onBack,
        onBrowseBack,
        onBrowseAllBack,
        onBrowseForward,
        onBrowseAllForward,
        onPieceSelectorChange,
        onPlayAgain,
        onLichessClick,
    ]);
}
