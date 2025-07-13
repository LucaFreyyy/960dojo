async function tryMove(startSquareElem, endSquareElem, premove = false) {
    // if it is not the user's turn, store premove
    if (gameState.userColor !== gameState.colorToMove && endSquareElem.classList.contains('can-move-highlight')) {
        unhighlightSquare();
        gameState.premove = [startSquareElem, endSquareElem];
        startSquareElem.classList.add('premove-highlight');
        endSquareElem.classList.add('premove-highlight');
        return;
    }
    if (gameState.halfMoveNumber >= HALF_MOVE_THRESHOLD) {
        return;
    }
    if (MOVE_IN_PROGRESS) return;
    MOVE_IN_PROGRESS = true;

    const startSquare = chessNotation(startSquareElem);
    const endSquare = chessNotation(endSquareElem);
    unhighlightSquare();

    if (legalMoves.includes(startSquare + endSquare)) {
        gameState.halfMoveNumber++;
        squareMoves = startSquare + endSquare;
        idx = legalMoves.indexOf(squareMoves);
        move = legalSans[idx];
        resultFen = fenResults[idx];

        gameState.position = resultFen;

        legalMoves = getAllPseudoLegalMovesForOpponent(gameState.position);

        gameState.moveHistorySAN.push(move);
        gameState.moveHistoryUCI.push(startSquare + endSquare);
        gameState.fenHistory.push(resultFen);
        redrawBoard();
        playMoveSound(move);
        CURRENTLY_HIGHLIGHTED_SQUARE = null;

        MOVE_IN_PROGRESS = false;

        if (moveIsMate[idx]) {
            updateMoveListWithColor();
            gameState.playing = false;
        } else {
            gameState.colorToMove = 'white' === gameState.colorToMove ? 'black' : 'white';
            dataBaseMove();
        }
        return;
    } else {
        if (isUserPiece(endSquareElem) && !premove) {
            highlightSquare(endSquareElem);
        } else {
            playSound('/legacy-site/sounds/Error.mp3');
        }
        MOVE_IN_PROGRESS = false;
        return;
    }
}


function isUserPiece(squareElem) {
    if (gameState.userColor === null) return false;
    const img = squareElem.querySelector('img');
    return img && img.src.includes('/' + gameState.userColor[0] + '_');
}

async function highlightSquare(squareElem) {
    document.querySelectorAll('.square').forEach(square => {
        square.classList.remove('right-highlight');
        square.classList.remove('right-highlight-second');
    });
    removeAllArrows();
    CURRENTLY_HIGHLIGHTED_SQUARE = squareElem;
    squareElem.classList.add('highlight');
    playSound('/legacy-site/sounds/Select.mp3');
    // Get legal moves for the highlighted square
    const square = chessNotation(squareElem);
    legalMovesCopy = legalMoves.slice();
    for (const move of legalMoves) {
        if (move[0] + move[1] !== square) continue;
        const indices = chessNotationToIndices(move[2] + move[3]);
        const targetSquare = document.querySelector(`.square[data-row="${indices[0]}"][data-col="${indices[1]}"]`);
        if (targetSquare) {
            targetSquare.classList.add('can-move-highlight');
        }
    }
    if (CURRENTLY_HIGHLIGHTED_SQUARE === null) {
        unhighlightSquare();
    }
}

function unhighlightSquare() {
    CURRENTLY_HIGHLIGHTED_SQUARE = null;
    document.querySelectorAll('.square').forEach(square => {
        square.classList.remove('right-highlight');
        square.classList.remove('right-highlight-second');
        square.classList.remove('highlight');
        square.classList.remove('can-move-highlight');
    });
    removeAllArrows();
}

async function square_clicked(square) {
    removeMarkings();
    gameState.premove = null;
    if (!gameState.playing || currentBrowsePosition !== gameState.moveHistorySAN.length - 1 || gameState.halfMoveNumber >= HALF_MOVE_THRESHOLD) return;

    if (square === CURRENTLY_HIGHLIGHTED_SQUARE) {
        unhighlightSquare();
    } else if (CURRENTLY_HIGHLIGHTED_SQUARE) {
        await tryMove(CURRENTLY_HIGHLIGHTED_SQUARE, square);
    } else {
        if (isUserPiece(square)) {
            highlightSquare(square);
        }
    }
}


function addDragDropHandlers() {
    document.querySelectorAll('.square .piece').forEach(img => {
        const parentSquare = img.parentElement;
        const isUser = isUserPiece(parentSquare);
        img.setAttribute('draggable', isUser ? 'true' : 'false');

        img.addEventListener('dragstart', event => {
            removeMarkings();
            gameState.premove = null;

            if (!gameState.playing || !isUser || currentBrowsePosition !== gameState.moveHistorySAN.length - 1 || gameState.halfMoveNumber >= HALF_MOVE_THRESHOLD) {
                event.preventDefault();
                return;
            }

            if (CURRENTLY_HIGHLIGHTED_SQUARE) {
                unhighlightSquare();
            }

            DRAG_START_SQUARE = parentSquare;
            highlightSquare(DRAG_START_SQUARE);

            event.dataTransfer.setData('text/plain', '');

            const clone = img.cloneNode(true);

            // Create wrapper div to apply styles
            const wrapper = document.createElement('div');
            wrapper.style.position = 'absolute';
            wrapper.style.top = '-1000px';
            wrapper.style.left = '-1000px';
            wrapper.style.width = '64px';  // your custom size
            wrapper.style.height = '64px';
            wrapper.style.opacity = '1';  // your custom opacity
            wrapper.style.pointerEvents = 'none';
            wrapper.style.display = 'flex';
            wrapper.style.alignItems = 'center';
            wrapper.style.justifyContent = 'center';

            clone.style.width = '100%';
            clone.style.height = '100%';

            // Append and use as drag image
            wrapper.appendChild(clone);
            document.body.appendChild(wrapper);
            event.dataTransfer.setDragImage(wrapper, 32, 32);  // center of 64x64

            // Clean up later
            img.addEventListener('dragend', () => {
                img.style.visibility = 'visible';
                wrapper.remove();
            }, { once: true });

            img.style.visibility = 'hidden';


            img.addEventListener('dragend', () => {
                img.style.visibility = 'visible';
                if (clone.parentElement) {
                    clone.remove();
                }
            }, { once: true });
        });
    });

    document.querySelectorAll('.square').forEach(square => {
        square.addEventListener('dragover', event => {
            if (gameState.playing) event.preventDefault();
        });

        square.addEventListener('drop', async event => {
            event.preventDefault();
            if (!gameState.playing || !DRAG_START_SQUARE || !isUserPiece(DRAG_START_SQUARE) || DRAG_START_SQUARE === square) return;

            const moved = await tryMove(DRAG_START_SQUARE, square);
            unhighlightSquare();
            DRAG_START_SQUARE = null;
        });
    });
}


function resizeArrowCanvas() {
    const board = document.getElementById('chessboard');
    const canvas = document.getElementById('arrow-layer');
    canvas.width = board.offsetWidth;
    canvas.height = board.offsetHeight;
}

function drawArrow(from, to, color, isPreview = false) {
    const canvas = document.getElementById('arrow-layer');
    const ctx = canvas.getContext('2d');

    if (!isPreview) savedArrows.add([from, to, color]); // store permanent arrows

    resizeArrowCanvas(); // if needed

    clearCanvas(); // clear all arrows
    drawAllSavedArrows(ctx);

    if (isPreview) {
        drawSingleArrow(ctx, from, to, 'orange');
    }
}


function squareToCoords(square, size) {
    const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
    const rank = 8 - parseInt(square[1]);
    return [file * size, rank * size];
}

function clearPreview() {
    if (previewArrow) {
        previewArrow.remove(); // or clear the canvas if using 1 canvas
        previewArrow = null;
    }
    if (previewHighlight) {
        previewHighlight.classList.remove('preview-highlight');
        previewHighlight = null;
    }
}

function previewHighlightSquare(squareName) {
    const squareEl = document.querySelector(`[data-square="${squareName}"]`);
    previewHighlight = squareEl;
}

function clearCanvas() {
    const canvas = document.getElementById('arrow-layer');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawAllSavedArrows(ctx) {
    clearCanvas();
    for (const pair of savedArrows) {
        const [from, to, color] = pair.split(',');
        drawSingleArrow(ctx, from, to, color);
    }
}

function drawSingleArrow(ctx, from, to, color = 'orange', alpha = 0.7) {
    const startSquare = document.querySelector(`[data-square="${from}"]`);
    const endSquare = document.querySelector(`[data-square="${to}"]`);
    if (!startSquare || !endSquare) return;

    const rect1 = startSquare.getBoundingClientRect();
    const rect2 = endSquare.getBoundingClientRect();

    const startX = rect1.left + rect1.width / 2;
    const startY = rect1.top + rect1.height / 2;
    const endX = rect2.left + rect2.width / 2;
    const endY = rect2.top + rect2.height / 2;

    const canvas = document.getElementById('arrow-layer');
    const canvasRect = canvas.getBoundingClientRect();
    const x1 = startX - canvasRect.left;
    const y1 = startY - canvasRect.top;
    const x2 = endX - canvasRect.left;
    const y2 = endY - canvasRect.top;

    const headlen = 35;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const angle = Math.atan2(dy, dx);

    // Shorten the arrow so it doesn't go all the way to the end square
    const shorten = rect2.width / 2;
    const newX2 = x2 - Math.cos(angle) * shorten;
    const newY2 = y2 - Math.sin(angle) * shorten;

    ctx.save();
    ctx.globalAlpha = alpha; // Set transparency

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 10;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(newX2, newY2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(x2, y2);
    ctx.fill();

    ctx.restore();
}
