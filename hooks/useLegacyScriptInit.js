import { useEffect } from 'react';
import { useEventListeners } from './useEventListeners';
import { useArrowDrawing } from './useArrowDrawing';
import { useRatingControls } from './useRatingControls';
import { useBoardSetup } from './useBoardSetup';

export default function useLegacyScriptInit() {
    useEffect(() => {
        const checkReady = () => {
            const ready =
                document.getElementById('chessboard') &&
                document.getElementById('ratingDisplay');

            if (ready) {
                try {
                    // Init logic (runs once DOM is ready)
                    useBoardSetup();
                    useEventListeners();
                    useArrowDrawing();
                    useRatingControls();

                    window.addEventListener('resize', () => {
                        const canvas = document.getElementById('arrow-layer');
                        if (canvas) canvas.width = canvas.offsetWidth;
                    });
                } catch (err) {
                    console.error('Error initializing legacy logic:', err);
                }
            } else {
                requestAnimationFrame(checkReady);
            }
        };

        checkReady();
    }, []);
}
