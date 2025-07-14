function makeSelectorsRed() {
    document.querySelectorAll('.selectors select').forEach(sel => {
        sel.classList.add('error');
    });
}

function makeSelectorsNormal() {
    document.querySelectorAll('.selectors select').forEach(sel => {
        sel.classList.remove('error');
    });
}

function chessNotation(square) {
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    let file, rank;
    if (window.gameState.userColor === 'black') {
        file = String.fromCharCode(97 + (7 - col));
        rank = row + 1;
    } else {
        file = String.fromCharCode(97 + col);
        rank = 8 - row;
    }
    return `${file}${rank}`;
}

function removeAllArrows() {
    window.savedArrows.clear(); // Clear the list of saved arrows
    const canvas = document.getElementById('arrow-layer');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear all drawings
}

function removeMarkings() {
    removeAllArrows();
    document.querySelectorAll('.square').forEach(square => {
        square.classList.remove('right-highlight');
        square.classList.remove('right-highlight-second');
        square.classList.remove('premove-highlight');
    });
}

function removeGameHighlights() {
    window.CURRENTLY_HIGHLIGHTED_SQUARE = null;
    window.gameState.premove = null;
    document.querySelectorAll('.square').forEach(square => {
        square.classList.remove('premove-highlight');
        square.classList.remove('highlight');
        square.classList.remove('can-move-highlight');
    });
}

function removeAllBoardHighlights() {
    removeMarkings();
    removeGameHighlights();
    document.querySelectorAll('.square').forEach(square => {
        square.classList.remove('last-move-highlight');
    });
}

async function playMoveSound(move) {
    let soundPath;
    switch (true) {
        case move.includes('#'):
            soundPath = '/legacy-site/sounds/Checkmate.mp3';
            break;
        case move.includes('+'):
            soundPath = '/legacy-site/sounds/Check.mp3';
            break;
        case move.includes('x'):
            soundPath = '/legacy-site/sounds/Capture.mp3';
            break;
        default:
            soundPath = '/legacy-site/sounds/Move.mp3';
    }
    const sound = new Audio(soundPath);
    try {
        await sound.play();
    } catch (error) {
        console.error('Error playing sound:', error);
    }
}

async function playSound(soundPath) {
    const sound = new Audio(soundPath);
    try {
        await sound.play();
    } catch (error) {
        console.error('Error playing sound:', error);
    }
}

function getAllPseudolegalMovesForOpponent(fen) {
    function parseFEN(fen) {
        const [piecePlacement, activeColor] = fen.split(' ');
        const rows = piecePlacement.split('/');
        const board = [];
        for (let r = 0; r < 8; r++) {
            const row = [];
            for (const char of rows[r]) {
                if (isNaN(char)) {
                    row.push(char);
                } else {
                    for (let i = 0; i < parseInt(char); i++) row.push(null);
                }
            }
            board.push(row);
        }
        return { board, activeColor };
    }

    function getPieceColor(piece) {
        if (!piece) return null;
        return piece === piece.toUpperCase() ? 'w' : 'b';
    }

    function toSquareString(row, col) {
        const file = String.fromCharCode(97 + col);
        const rank = 8 - row;
        return `${file}${rank}`;
    }

    const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    const bishopDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    const rookDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const queenDirs = bishopDirs.concat(rookDirs);
    const kingDirs = queenDirs;

    const { board, activeColor } = parseFEN(fen);
    const opponentColor = activeColor === 'w' ? 'b' : 'w';
    const moves = [];

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (!piece || getPieceColor(piece) !== opponentColor) continue;

            const lower = piece.toLowerCase();
            if (lower === 'p') {
                // Pawn: always allow forward one, forward two, and both captures
                const dir = opponentColor === 'w' ? -1 : 1;
                // Forward one
                if (r + dir >= 0 && r + dir < 8) {
                    moves.push(toSquareString(r, c) + toSquareString(r + dir, c));
                }
                // Forward two
                if (r + 2 * dir >= 0 && r + 2 * dir < 8) {
                    moves.push(toSquareString(r, c) + toSquareString(r + 2 * dir, c));
                }
                // Captures
                for (const dc of [-1, 1]) {
                    if (c + dc >= 0 && c + dc < 8 && r + dir >= 0 && r + dir < 8) {
                        moves.push(toSquareString(r, c) + toSquareString(r + dir, c + dc));
                    }
                }
            } else if (lower === 'n') {
                // Knight: all 8 possible moves
                for (const [dr, dc] of knightMoves) {
                    const nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                        moves.push(toSquareString(r, c) + toSquareString(nr, nc));
                    }
                }
            } else if (lower === 'b') {
                // Bishop: all diagonals
                for (const [dr, dc] of bishopDirs) {
                    for (let i = 1; i < 8; i++) {
                        const nr = r + dr * i, nc = c + dc * i;
                        if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;
                        moves.push(toSquareString(r, c) + toSquareString(nr, nc));
                    }
                }
            } else if (lower === 'r') {
                // Rook: all straight lines
                for (const [dr, dc] of rookDirs) {
                    for (let i = 1; i < 8; i++) {
                        const nr = r + dr * i, nc = c + dc * i;
                        if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;
                        moves.push(toSquareString(r, c) + toSquareString(nr, nc));
                    }
                }
            } else if (lower === 'q') {
                // Queen: all lines
                for (const [dr, dc] of queenDirs) {
                    for (let i = 1; i < 8; i++) {
                        const nr = r + dr * i, nc = c + dc * i;
                        if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;
                        moves.push(toSquareString(r, c) + toSquareString(nr, nc));
                    }
                }
            } else if (lower === 'k') {
                // King: all adjacent squares
                for (const [dr, dc] of kingDirs) {
                    const nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                        moves.push(toSquareString(r, c) + toSquareString(nr, nc));
                    }
                }
                // Castling logic (as before)
                const [, , castling] = fen.split(' ');
                const isWhite = opponentColor === 'w';
                const kingRow = r;
                for (let nc = 0; nc < 8; nc++) {
                    const rook = board[kingRow][nc];
                    if (rook && rook.toLowerCase() === 'r') {
                        if (
                            (isWhite && nc > c && castling.includes('K')) || // White kingside
                            (isWhite && nc < c && castling.includes('Q')) || // White queenside
                            (!isWhite && nc > c && castling.includes('k')) || // Black kingside
                            (!isWhite && nc < c && castling.includes('q'))    // Black queenside
                        ) {
                            moves.push(toSquareString(r, c) + toSquareString(r, nc));
                        }
                    }
                }
            }
        }
    }
    return moves;
}

function playAgain() {
    backButtonClick();
    startGame().catch(console.error);
}

function setupRatingControls() {
    function changeRating(delta) {
        const ratingDisplay = document.getElementById('ratingDisplay');
        let rating = parseInt(ratingDisplay.textContent, 10);
        rating = Math.max(100, rating + delta); // avoid going below 100
        ratingDisplay.textContent = rating;
    }

    function setupRatingButton(buttonId, delta) {
        const button = document.getElementById(buttonId);
        let intervalId = null;
        let timeoutId = null;
        let currentDelay = 80; // Initial delay in ms
        const minDelay = 1;    // Fastest speed
        const acceleration = 0.75; // How much to reduce delay each step

        function accelerateChange() {
            changeRating(delta);
            currentDelay = Math.max(minDelay, currentDelay * acceleration);
            intervalId = setTimeout(accelerateChange, currentDelay);
        }

        button.addEventListener('mousedown', () => {
            currentDelay = 80;
            changeRating(delta); // instant change
            intervalId = setTimeout(accelerateChange, currentDelay);
        });

        ['mouseup', 'mouseleave'].forEach(evt => {
            button.addEventListener(evt, () => {
                clearTimeout(intervalId);
            });
        });
    }
    setupRatingButton('ratingUp', +1);
    setupRatingButton('ratingDown', -1);
}

function deactivateMenu() {
    // hide elements
    document.getElementById('ratingChangeButtons').style.display = 'none';
    document.querySelector(".mode").style.display = "none";
    document.querySelector(".color").style.display = "none";
    document.querySelectorAll(".button-separator").forEach(el => el.style.display = "none");
    document.getElementById("startBtn").style.display = "none";
    document.getElementById("playAgainBtn").style.display = "none";
    // disable selectors
    document.getElementById("PieceSelector").disabled = true;
    document.getElementById("SquareFixPieceSelector1").disabled = true;
    document.getElementById("SquareFixPieceSelector2").disabled = true;
    document.getElementById("Category").disabled = true;
    document.getElementById("numberSelect").disabled = true;
    // show move list
    document.getElementById("moveListContainer").style.display = "flex";
}

function reactivateMenu() {
    document.querySelector(".mode").style.display = "";
    document.querySelector(".color").style.display = "";
    document.querySelectorAll(".button-separator").forEach(el => el.style.display = "");
    document.getElementById("startBtn").style.display = "";
    document.getElementById("playAgainBtn").style.display = "none";
    document.getElementById("moveListContainer").style.display = "none";
    const categorySelect = document.getElementById("Category");
    categorySelect.disabled = false;
    const numberSelect = document.getElementById("numberSelect");
    if (categorySelect.value === "Number Selection") {
        numberSelect.disabled = false;
    }
    document.getElementById("PieceSelector").disabled = false;
    document.getElementById("SquareFixPieceSelector1").disabled = false;
    document.getElementById("SquareFixPieceSelector2").disabled = false;
    if (document.getElementById('ratedBtn').classList.contains('active')) {
        document.getElementById('ratingChangeButtons').style.display = 'none';
    }
    else {
        document.getElementById('ratingChangeButtons').style.display = 'block';
    }
    const number = parseInt(numberSelect.value);
    setPositionByNumber(number).catch(console.error);
}

function resetGameState() {
    window.gameState.playing = false;
    window.gameState.position = null;
    window.gameState.userColor = null;
    window.gameState.colorToMove = null;
    window.gameState.isRated = false;
    window.gameState.userRating = null;
    window.gameState.halfMoveNumber = 0;
    window.gameState.moveHistorySAN = [];
    window.gameState.moveHistoryUCI = [];
    window.currentBrowsePosition = -1;
    window.lastDrawnPosition = -1;
    window.gameState.fenHistory = [];
    window.gameState.evaluations = [];
}