import { freestyleNumberToFEN } from './freestyleLogic';
import { positionWithFixedPieces, get_position } from './chesslogic';
import { addDragDropHandlers } from './dragDropHandlers';
import { clearArrows } from './arrowUtils';

// Must be called with an instance of gameState
export function boardSetupAndDrawing(gameState, user) {
    let currentBrowsePosition = -1;
    let lastDrawnPosition = -1;

    async function setPositionByNumber(number, color = null) {
        if (!color) {
            const whiteBtn = document.getElementById('whiteBtn');
            const blackBtn = document.getElementById('blackBtn');
            color = whiteBtn?.classList.contains('active') ? 'white'
                : blackBtn?.classList.contains('active') ? 'black'
                    : (Math.random() > 0.5 ? 'white' : 'black');
        }

        const board = get_position(number, color);

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
            square.classList.remove('right-highlight', 'right-highlight-second');
        });

        clearArrows();

        gameState.position = freestyleNumberToFEN(number);
        gameState.userColor = color;
    }

    async function initializeBoard() {
        const numberSelect = document.getElementById('numberSelect');
        const options = Array.from(numberSelect.options).filter(opt => !opt.disabled);
        const randomOption = options[Math.floor(Math.random() * options.length)];
        const randomNumber = parseInt(randomOption.value);
        numberSelect.value = randomNumber;

        const color = document.getElementById('whiteBtn').classList.contains('active') ? 'white' : 'black';
        await setPositionByNumber(randomNumber, color);
    }

    function redrawBoard() {
        if (gameState.playing) {
            updateMoveList();
        } else {
            updateMoveListWithColor();
        }

        if (currentBrowsePosition === gameState.fenHistory.length - 2 && lastDrawnPosition === currentBrowsePosition) {
            currentBrowsePosition++;
            updateMoveList();
        }

        if (lastDrawnPosition === currentBrowsePosition) return;

        if (currentBrowsePosition === -1) {
            const startPositionNumber = document.getElementById('numberSelect').value;
            setPositionByNumber(startPositionNumber, gameState.userColor);
            lastDrawnPosition = currentBrowsePosition;
            document.querySelectorAll('.square').forEach(square => {
                square.classList.remove('last-move-highlight');
            });
            return;
        }

        lastDrawnPosition = currentBrowsePosition;
        const fen = gameState.fenHistory[currentBrowsePosition].split(' ')[0];
        const rows = fen.split('/');
        document.querySelectorAll('.square').forEach(square => {
            square.innerHTML = '';
            square.classList.remove('last-move-highlight');
        });

        const isBlack = gameState.userColor === 'black';

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

        const uciMove = gameState.moveHistoryUCI[currentBrowsePosition];
        if (uciMove) {
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
    }

    async function setupStartPosition() {
        const categorySelect = document.getElementById('Category');
        const numberSelect = document.getElementById('numberSelect');

        gameState.colorToMove = 'white';
        gameState.isRated = document.getElementById('ratedBtn').classList.contains('active');
        gameState.userRating = document.getElementById('ratingDisplay').textContent;

        if (gameState.isRated) {
            categorySelect.value = 'Random';

            gameState.userColor = user?.opening_color;
            numberSelect.value = user?.opening_position ?? 0;
            gameState.userRating = user?.rating_openings ?? 1500;
        } else {
            gameState.userColor = document.querySelector('.color .active')?.id?.replace('Btn', '') || 'white';
            if (gameState.userColor === 'random') {
                gameState.userColor = Math.random() > 0.5 ? 'white' : 'black';
            }

            if (categorySelect.value === 'Random') {
                numberSelect.value = Math.floor(Math.random() * 960);
            } else if (categorySelect.value === 'Fixed Piece') {
                const positions = positionWithFixedPieces(
                    document.getElementById('PieceSelector').value,
                    document.getElementById('SquareFixPieceSelector1').value,
                    document.getElementById('SquareFixPieceSelector2').value
                );

                if (positions.length === 0) {
                    backButtonClick(); // still legacy
                    return;
                }

                const randomNumber = positions[Math.floor(Math.random() * positions.length)];
                numberSelect.value = randomNumber;
            }
        }

        gameState.position = freestyleNumberToFEN(parseInt(numberSelect.value));
        await setPositionByNumber(parseInt(numberSelect.value), gameState.userColor);
    }

    return {
        setPositionByNumber,
        initializeBoard,
        redrawBoard,
        setupStartPosition,
    };
}

export function highlightLastMove(move, isBlack) {
    if (!move) return;

    const fileToCol = (file) => 'abcdefgh'.indexOf(file);

    const fromCol = isBlack ? 7 - fileToCol(move[0]) : fileToCol(move[0]);
    const fromRow = isBlack ? parseInt(move[1]) - 1 : 8 - parseInt(move[1]);
    const toCol = isBlack ? 7 - fileToCol(move[2]) : fileToCol(move[2]);
    const toRow = isBlack ? parseInt(move[3]) - 1 : 8 - parseInt(move[3]);

    const startSquareElem = document.querySelector(`.square[data-row="${fromRow}"][data-col="${fromCol}"]`);
    const endSquareElem = document.querySelector(`.square[data-row="${toRow}"][data-col="${toCol}"]`);

    if (startSquareElem && endSquareElem) {
        startSquareElem.classList.add('last-move-highlight');
        endSquareElem.classList.add('last-move-highlight');
    }
}