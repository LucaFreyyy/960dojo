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

// eventListeners.js
function initializeEventListeners() {
    document.getElementById("Category").addEventListener("change", () => toggleNumberSelect().catch(console.error));
    document.getElementById("numberSelect").addEventListener("change", () => onNumberSelectChange().catch(console.error));
    document.getElementById("ratedBtn").addEventListener("click", safeClick(() => selectMode("rated")));
    document.getElementById("trainingBtn").addEventListener("click", safeClick(() => selectMode("training")));
    document.getElementById("whiteBtn").addEventListener("click", safeClick(() => selectColor("white")));
    document.getElementById("blackBtn").addEventListener("click", safeClick(() => selectColor("black")));
    document.getElementById("randomBtn").addEventListener("click", safeClick(() => selectColor("random")));
    document.getElementById("startBtn").addEventListener("click", safeClick(() => startGame().catch(console.error)));
    document.getElementById("backButton").addEventListener("click", safeClick(backButtonClick));
    document.getElementById("browseback").addEventListener("click", safeClick(browseBackClick));
    document.getElementById("browseallthewayback").addEventListener("click", safeClick(browseAllTheWayBackClick));
    document.getElementById("browseforward").addEventListener("click", safeClick(browseForwardClick));
    document.getElementById("browseallthewayforward").addEventListener("click", safeClick(browseAllTheWayForwardClick));
    document.getElementById("PieceSelector").addEventListener("change", () => createPositionWithFixedPieces().catch(console.error));
    document.getElementById("SquareFixPieceSelector1").addEventListener("change", () => createPositionWithFixedPieces().catch(console.error));
    document.getElementById("SquareFixPieceSelector2").addEventListener("change", () => createPositionWithFixedPieces().catch(console.error));
    document.getElementById("playAgainBtn").addEventListener("click", safeClick(playAgain));

    document.getElementById("lichessBtn").addEventListener("click", safeClick(() => {
        getLichessAnalysisLink()
            .then(link => {
                if (link) window.open(link, "_blank");
                else alert("Failed to generate Lichess analysis link. Please try again later.");
            })
            .catch(console.error);
    }));

    document.querySelectorAll('.selectors select').forEach(select => {
        select.addEventListener('change', () => select.blur());
    });
}

function setupArrowDrawing() {
    const squares = document.querySelectorAll('.square');

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
            window.previewHighlightSquare(window.arrowStartSquare);
            e.preventDefault();
        });

        square.addEventListener('mouseenter', e => {
            if (!window.isRightClickDragging || !window.arrowStartSquare) return;

            const hoverSquare = square.getAttribute('data-square');
            clearCanvas();
            drawAllSavedArrows(document.getElementById('arrow-layer').getContext('2d'));

            if (hoverSquare !== window.arrowStartSquare) {
                drawSingleArrow(document.getElementById('arrow-layer').getContext('2d'), window.arrowStartSquare, hoverSquare, 'rgba(255,0,0,0.5)');
            }
        });

        square.addEventListener('mouseup', e => {
            if (e.button !== 2) return;

            window.isRightClickDragging = false;
            clearCanvas();

            const endSquare = square.getAttribute('data-square');
            if (window.arrowStartSquare === endSquare) {
                const sqElem = document.querySelector(`[data-square="${endSquare}"]`);
                if (e.ctrlKey || e.metaKey) sqElem.classList.toggle('right-highlight-second');
                else sqElem.classList.toggle('right-highlight');
            } else {
                const color = (e.ctrlKey || e.metaKey) ? 'green' : 'orange';
                const pair = `${window.arrowStartSquare},${endSquare},${color}`;
                if (window.savedArrows.has(pair)) window.savedArrows.delete(pair);
                else window.savedArrows.add(pair);
            }

            drawAllSavedArrows(document.getElementById('arrow-layer').getContext('2d'));

            window.arrowStartSquare = null;
            window.currentHoverSquare = null;
        });
    });
}
