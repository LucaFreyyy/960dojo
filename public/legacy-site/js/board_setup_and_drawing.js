async function setPositionByNumber(number, color = null) {
    if (!color) {
        if (document.getElementById('whiteBtn').classList.contains('active')) {
            color = 'white';
        } else if (document.getElementById('blackBtn').classList.contains('active')) {
            color = 'black';
        } else {
            color = Math.random() > 0.5 ? 'white' : 'black';
        }
    }
    board = get_position(number, color);
    document.querySelectorAll('.square').forEach(square => {
        square.innerHTML = '';
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const piece = board[row][col];
        if (piece) {
            const img = document.createElement('img');
            img.src = `legacy-site/pieces/${piece}.svg`;
            img.className = 'piece';
            square.appendChild(img);
        }
    });
    addDragDropHandlers();
    document.querySelectorAll('.square').forEach(square => {
        square.classList.remove('right-highlight');
        square.classList.remove('right-highlight-second');
    });
    removeAllArrows();
}
function redrawBoard() {
    if (window.gameState.playing) {
        updateMoveList();
    } else {
        updateMoveListWithColor();
    }
    if (window.currentBrowsePosition === window.gameState.fenHistory.length - 2 && window.lastDrawnPosition === window.currentBrowsePosition) { // one move behind
        window.currentBrowsePosition++;
        updateMoveList();
    }
    if (window.lastDrawnPosition === window.currentBrowsePosition) {
        return; // No need to redraw if the position hasn't changed
    }
    if (window.currentBrowsePosition === -1) {
        const startPositionNumber = document.getElementById('numberSelect').value;
        setPositionByNumber(startPositionNumber, window.gameState.userColor);
        window.lastDrawnPosition = window.currentBrowsePosition;
        document.querySelectorAll('.square').forEach(square => {
            square.classList.remove('last-move-highlight');
        });
        return;
    }
    window.lastDrawnPosition = window.currentBrowsePosition;
    const fen = window.gameState.fenHistory[window.currentBrowsePosition].split(' ')[0];
    const rows = fen.split('/');
    document.querySelectorAll('.square').forEach(square => {
        square.innerHTML = '';
        square.classList.remove('last-move-highlight');
    });
    const isBlack = window.gameState.userColor === 'black';
    for (let row = 0; row < 8; row++) {
        let col = 0;
        for (const char of rows[row]) {
            if (isNaN(char)) {
                const piece = char;
                const boardRow = isBlack ? 7 - row : row;
                const boardCol = isBlack ? 7 - col : col;
                const square = document.querySelector(`.square[data-row="${boardRow}"][data-col="${boardCol}"]`);
                if (square) {
                    const img = document.createElement('img');
                    const colorPrefix = piece === piece.toUpperCase() ? 'w' : 'b';
                    const pieceLetter = piece.toUpperCase();
                    img.src = `legacy-site/pieces/${colorPrefix}_${pieceLetter}.svg`;
                    img.className = 'piece';
                    square.appendChild(img);
                }
                col++;
            } else {
                col += parseInt(char);
            }
        }
    }
    addDragDropHandlers();

    // Highlight the last move
    const uciMove = window.gameState.moveHistoryUCI[window.currentBrowsePosition];
    // uciMove: [fromRow, fromCol, toRow, toCol] in 0-based board coordinates
    const fileToCol = file => 'abcdefgh'.indexOf(file);
    const fromCol = isBlack ? 7 - fileToCol(uciMove[0]) : fileToCol(uciMove[0]);
    const fromRow = isBlack ? parseInt(uciMove[1]) - 1 : 8 - parseInt(uciMove[1]);
    const toCol = isBlack ? 7 - fileToCol(uciMove[2]) : fileToCol(uciMove[2]);
    const toRow = isBlack ? parseInt(uciMove[3]) - 1 : 8 - parseInt(uciMove[3]);
    const startSquareElem = document.querySelector(`.square[data-row="${fromRow}"][data-col="${fromCol}"]`);
    const endSquareElem = document.querySelector(`.square[data-row="${toRow}"][data-col="${toCol}"]`);
    if (startSquareElem && endSquareElem) {
        startSquareElem.classList.add('last-move-highlight');
        endSquareElem.classList.add('last-move-highlight');
    }
}
async function initializeBoard() {
    const numberSelect = document.getElementById('numberSelect');
    const options = Array.from(numberSelect.options);
    const enabledOptions = options.filter(opt => !opt.disabled);
    const randomOption = enabledOptions[Math.floor(Math.random() * enabledOptions.length)];
    const randomNumber = parseInt(randomOption.value);
    numberSelect.value = randomNumber;
    const color = document.getElementById('whiteBtn').classList.contains('active') ? 'white' : 'black';
    await setPositionByNumber(randomNumber, color);
}

async function setupStartPosition() {
    const categorySelect = document.getElementById('Category');
    const numberSelect = document.getElementById('numberSelect');
    window.gameState.colorToMove = 'white';
    window.gameState.isRated = document.getElementById('ratedBtn').classList.contains('active');
    window.gameState.userRating = document.getElementById('ratingDisplay').textContent;
    if (window.gameState.isRated) {
        categorySelect.value = "Random";
        const user = window.user;
        window.gameState.userColor = user.opening_color;
        numberSelect.value = user.opening_position;
        window.gameState.userRating = user.rating_openings;
    } else {
        window.gameState.userColor = document.querySelector('.color .active').id.replace('Btn', '');
        if (window.gameState.userColor === 'random') {
            window.gameState.userColor = Math.random() > 0.5 ? 'white' : 'black';
        }
        if (categorySelect.value === 'Random') {
            const randomNumber = Math.floor(Math.random() * 960);
            numberSelect.value = randomNumber;
        } else if (categorySelect.value === 'Fixed Piece') {
            const positions = position_with_fixed_pieces(document.getElementById('PieceSelector').value, document.getElementById('SquareFixPieceSelector1').value, document.getElementById('SquareFixPieceSelector2').value);
            const startPosNumbers = positions;
            if (startPosNumbers.length === 0) {
                backButtonClick();
                return;
            }
            const startPosNumbersInt = startPosNumbers.map(n => parseInt(n, 10));
            const randomNumber = startPosNumbersInt[Math.floor(Math.random() * startPosNumbersInt.length)];
            numberSelect.value = randomNumber;
        }
    }
    window.gameState.position = freestyleNumberToFEN(parseInt(numberSelect.value));
    setPositionByNumber(parseInt(numberSelect.value), window.gameState.userColor).catch(console.error);
}