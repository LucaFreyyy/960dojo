import { useEffect } from 'react';

export default function LegacyScriptLoader() {
    useEffect(() => {
        const checkReady = () => {
            if (
                window.__legacyScriptsReady &&
                document.getElementById('chessboard') &&
                document.getElementById('ratingDisplay')
            ) {
                try {
                    initializeUI();
                    console.log('UI ready');

                    initializeEventListeners();
                    console.log('Listeners attached');

                    setupRatingControls();
                    setupArrowDrawing();
                    initializeBoard();
                    resizeArrowCanvas();

                    window.addEventListener('resize', resizeArrowCanvas);
                } catch (err) {
                    console.error('Error initializing legacy UI:', err);
                }
            } else {
                requestAnimationFrame(checkReady);
            }
        };

        checkReady();
    }, []);

    return null; // Logic-only component
}
