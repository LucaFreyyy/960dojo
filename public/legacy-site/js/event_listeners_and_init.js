window.clickLockUntil = 0;

function safeClick(handler, delay = 50) {
    return (...args) => {
        const now = Date.now();
        if (now < window.clickLockUntil) return;
        window.clickLockUntil = now + delay;
        handler(...args);
    };
}

function initializeUI() {
    const mode = window.sessionUser?.id ? 'ranked' : 'training';
    selectMode(mode);
    selectColor('random');
}

function safeAddListener(id, event, handler) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
}

function initializeEventListeners() {
    if (document.body.dataset.listeners === 'true') return;
    document.body.dataset.listeners = 'true';
    safeAddListener("Category", "change", () => toggleNumberSelect().catch(console.error));
    safeAddListener("numberSelect", "change", () => onNumberSelectChange().catch(console.error));
    safeAddListener("ratedBtn", "click", safeClick(() => selectMode("rated")));
    safeAddListener("trainingBtn", "click", safeClick(() => selectMode("training")));
    safeAddListener("whiteBtn", "click", safeClick(() => selectColor("white")));
    safeAddListener("blackBtn", "click", safeClick(() => selectColor("black")));
    safeAddListener("randomBtn", "click", safeClick(() => selectColor("random")));
    safeAddListener("startBtn", "click", safeClick(() => startGame().catch(console.error)));
    safeAddListener("backButton", "click", safeClick(backButtonClick));
    safeAddListener("browseback", "click", safeClick(browseBackClick));
    safeAddListener("browseallthewayback", "click", safeClick(browseAllTheWayBackClick));
    safeAddListener("browseforward", "click", safeClick(browseForwardClick));
    safeAddListener("browseallthewayforward", "click", safeClick(browseAllTheWayForwardClick));
    safeAddListener("PieceSelector", "change", () => createPositionWithFixedPieces().catch(console.error));
    safeAddListener("SquareFixPieceSelector1", "change", () => createPositionWithFixedPieces().catch(console.error));
    safeAddListener("SquareFixPieceSelector2", "change", () => createPositionWithFixedPieces().catch(console.error));
    safeAddListener("playAgainBtn", "click", safeClick(playAgain));

    const lichessBtn = document.getElementById("lichessBtn");
    if (lichessBtn) {
        lichessBtn.addEventListener("click", safeClick(() => {
            getLichessAnalysisLink()
                .then(link => {
                    if (link) window.open(link, "_blank");
                    else alert("Failed to generate Lichess analysis link. Please try again later.");
                })
                .catch(console.error);
        }));
    }

    document.querySelectorAll('.selectors select').forEach(select => {
        select.addEventListener('change', () => select.blur());
    });
}

function setupArrowDrawing() {
    const squares = document.querySelectorAll('.square');
    if (!squares.length) return;

    squares.forEach(square => {
        square.addEventListener('click', safeClick(async (e) => {
            if (e.button === 0) await square_clicked(square);
        }));

        square.addEventListener('contextmenu', e => e.preventDefault());

        square.addEventListener('mousedown', e => {
            if (e.button !== 2) return;
            window.arrowStartSquare = square.getAttribute('data-square');
            window.isRightClickDragging = true;
            window.currentHoverSquare = window.arrowStartSquare;
            window.previewHighlightSquare?.(window.arrowStartSquare);
            e.preventDefault();
        });

        square.addEventListener('mouseenter', e => {
            if (!window.isRightClickDragging || !window.arrowStartSquare) return;

            const hoverSquare = square.getAttribute('data-square');
            const ctx = document.getElementById('arrow-layer')?.getContext('2d');
            if (!ctx) return;

            clearCanvas();
            drawAllSavedArrows(ctx);

            if (hoverSquare !== window.arrowStartSquare) {
                drawSingleArrow(ctx, window.arrowStartSquare, hoverSquare, 'rgba(180, 12, 12, 0.39)');
            }
        });

        square.addEventListener('mouseup', e => {
            if (e.button !== 2) return;

            window.isRightClickDragging = false;
            clearCanvas();

            const endSquare = square.getAttribute('data-square');
            const ctx = document.getElementById('arrow-layer')?.getContext('2d');
            if (!ctx) return;

            if (window.arrowStartSquare === endSquare) {
                const sqElem = document.querySelector(`[data-square="${endSquare}"]`);
                if (sqElem) {
                    if (e.ctrlKey || e.metaKey) sqElem.classList.toggle('right-highlight-second');
                    else sqElem.classList.toggle('right-highlight');
                }
            } else {
                const color = (e.ctrlKey || e.metaKey) ? '#0fb626cc' : '#00ccffbb';
                const pair = `${window.arrowStartSquare},${endSquare},${color}`;
                if (window.savedArrows.has(pair)) window.savedArrows.delete(pair);
                else window.savedArrows.add(pair);
            }

            drawAllSavedArrows(ctx);

            window.arrowStartSquare = null;
            window.currentHoverSquare = null;
        });
    });
}
