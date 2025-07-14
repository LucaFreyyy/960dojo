import { useEffect } from 'react';

export function useRatingControls(gameState, globals) {
    useEffect(() => {
        const upBtn = document.getElementById('ratingUp');
        const downBtn = document.getElementById('ratingDown');
        const ratingDisplay = document.getElementById('ratingDisplay');

        const adjustRating = (delta) => {
            let rating = parseInt(ratingDisplay.textContent, 10);
            rating = Math.max(100, Math.min(3000, rating + delta));
            ratingDisplay.textContent = rating;
            gameState.userRating = rating;
        };

        const handleUp = () => adjustRating(50);
        const handleDown = () => adjustRating(-50);

        if (upBtn) upBtn.addEventListener('click', handleUp);
        if (downBtn) downBtn.addEventListener('click', handleDown);

        return () => {
            if (upBtn) upBtn.removeEventListener('click', handleUp);
            if (downBtn) downBtn.removeEventListener('click', handleDown);
        };
    }, [gameState]);
}
