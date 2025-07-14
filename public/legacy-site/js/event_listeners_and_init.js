function initializeUI() {
    const mode = window.sessionUser?.id ? 'ranked' : 'training';
    selectMode(mode);
    selectColor('random');
}

// eventListeners.js
function initializeEventListeners() {
    document.getElementById("Category").addEventListener("change", () => toggleNumberSelect().catch(console.error));
    document.getElementById("numberSelect").addEventListener("change", () => onNumberSelectChange().catch(console.error));
    document.getElementById("ratedBtn").addEventListener("click", () => selectMode("rated"));
    document.getElementById("trainingBtn").addEventListener("click", () => selectMode("training"));
    document.getElementById("whiteBtn").addEventListener("click", () => selectColor("white"));
    document.getElementById("blackBtn").addEventListener("click", () => selectColor("black"));
    document.getElementById("randomBtn").addEventListener("click", () => selectColor("random"));
    document.getElementById("startBtn").addEventListener("click", () => startGame().catch(console.error));
    document.getElementById("backButton").addEventListener("click", backButtonClick);
    document.getElementById("browseback").addEventListener("click", browseBackClick);
    document.getElementById("browseallthewayback").addEventListener("click", browseAllTheWayBackClick);
    document.getElementById("browseforward").addEventListener("click", browseForwardClick);
    document.getElementById("browseallthewayforward").addEventListener("click", browseAllTheWayForwardClick);
    document.getElementById("PieceSelector").addEventListener("change", () => createPositionWithFixedPieces().catch(console.error));
    document.getElementById("SquareFixPieceSelector1").addEventListener("change", () => createPositionWithFixedPieces().catch(console.error));
    document.getElementById("SquareFixPieceSelector2").addEventListener("change", () => createPositionWithFixedPieces().catch(console.error));
    document.getElementById("playAgainBtn").addEventListener("click", playAgain);

    document.getElementById("lichessBtn").addEventListener("click", () => {
        getLichessAnalysisLink()
            .then(link => {
                if (link) window.open(link, "_blank");
                else alert("Failed to generate Lichess analysis link. Please try again later.");
            })
            .catch(console.error);
    });

    document.querySelectorAll('.selectors select').forEach(select => {
        select.addEventListener('change', () => select.blur());
    });
}

// arrowDrawing.js
function setupArrowDrawing() {
    const squares = document.querySelectorAll('.square');

    squares.forEach(square => {
        square.addEventListener('click', async (e) => {
            if (e.button === 0) await square_clicked(square);
        });
        square.addEventListener('contextmenu', e => e.preventDefault());

        // Right click arrow drawing handlers
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

