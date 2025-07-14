import { useEffect, useRef } from 'react';

export function useArrowDrawing(canvasId = 'arrow-layer') {
    const arrowStartSquare = useRef(null);
    const isDragging = useRef(false);
    const savedArrows = useRef(new Set());

    useEffect(() => {
        const squares = document.querySelectorAll('.square');
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        function drawSingleArrow(ctx, from, to, color = 'rgba(255,0,0,0.5)') {
            // Basic drawing implementation placeholder
            // Replace this with actual arrow drawing logic
        }

        function drawAllSavedArrows(ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const pair of savedArrows.current) {
                const [from, to, color] = pair.split(',');
                drawSingleArrow(ctx, from, to, color);
            }
        }

        function clearCanvas() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        function previewHighlightSquare(square) {
            // Optional visual feedback on hover
        }

        squares.forEach(square => {
            square.addEventListener('mousedown', e => {
                if (e.button !== 2) return;
                arrowStartSquare.current = square.getAttribute('data-square');
                isDragging.current = true;
                previewHighlightSquare(arrowStartSquare.current);
                e.preventDefault();
            });

            square.addEventListener('mouseenter', e => {
                if (!isDragging.current || !arrowStartSquare.current) return;
                const hoverSquare = square.getAttribute('data-square');
                clearCanvas();
                drawAllSavedArrows(ctx);
                if (hoverSquare !== arrowStartSquare.current) {
                    drawSingleArrow(ctx, arrowStartSquare.current, hoverSquare, 'rgba(255,0,0,0.5)');
                }
            });

            square.addEventListener('mouseup', e => {
                if (e.button !== 2) return;
                isDragging.current = false;
                clearCanvas();

                const endSquare = square.getAttribute('data-square');
                const from = arrowStartSquare.current;
                if (!from || !endSquare) return;

                if (from === endSquare) {
                    const sqElem = document.querySelector(`[data-square="${endSquare}"]`);
                    if (e.ctrlKey || e.metaKey) {
                        sqElem.classList.toggle('right-highlight-second');
                    } else {
                        sqElem.classList.toggle('right-highlight');
                    }
                } else {
                    const color = e.ctrlKey || e.metaKey ? 'green' : 'orange';
                    const pair = `${from},${endSquare},${color}`;
                    if (savedArrows.current.has(pair)) {
                        savedArrows.current.delete(pair);
                    } else {
                        savedArrows.current.add(pair);
                    }
                }

                drawAllSavedArrows(ctx);
                arrowStartSquare.current = null;
            });
        });
    }, [canvasId]);
} 
