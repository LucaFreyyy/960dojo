async function startGame() {
    // Check if the user selected a valid position
    const mode = document.getElementById('Category');
    if (mode.classList.contains('error')) {
        let msg = document.createElement('div');
        msg.textContent = "Invalid piece positioning!";
        msg.className = 'error-message';
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 1800);
        return;
    }
    const loadingOverlay = document.getElementById('fullScreenLoadingOverlay');
    loadingOverlay.style.display = 'flex';

    removeMarkings();
    if (ENGINE_RUNNING) return;
    deactivateMenu();
    await setupStartPosition();

    if (gameState.userColor === 'black') {
        legalMoves = getAllPseudoLegalMovesForOpponent(gameState.position);
        gameState.playing = true;
        loadingOverlay.style.display = 'none';
        await dataBaseMove();
        gameState.evaluations = gameState.evaluations.slice(1);
    } else {
        js_data = get_legal_moves(gameState.position);
        legalMoves = js_data.uci;
        legalSans = js_data.san;
        fenResults = js_data.fen;
        moveIsMate = js_data.isMate;
        initialEval = getCentipawnLoss(gameState.position);
        gameState.playing = true;
        loadingOverlay.style.display = 'none';
    }
}

async function dataBaseMove() {
    startLoadingAnimation();
    ENGINE_RUNNING = true;
    gameState.halfMoveNumber++;
    js_lichess_move = await fetch_lichess_data(gameState.position);
    new_position = js_lichess_move.resultFen;
    js_data = get_legal_moves(new_position);
    legalMoves = js_data.uci;
    legalSans = js_data.san;
    fenResults = js_data.fen;
    moveIsMate = js_data.isMate;
    move = js_lichess_move.moveSan;
    gameState.evaluations.push(getCentipawnLoss(gameState.position));
    gameState.evaluations.push(getCentipawnLoss(new_position));
    if (gameState.playing === false) {
        ENGINE_RUNNING = false;
        return;
    }
    gameState.moveHistorySAN.push(move);
    gameState.fenHistory.push(new_position);
    gameState.moveHistoryUCI.push(js_lichess_move.startSquare + js_lichess_move.endSquare);
    playMoveSound(move);
    gameState.position = new_position;
    redrawBoard();

    gameState.colorToMove = gameState.colorToMove === 'white' ? 'black' : 'white';
    ENGINE_RUNNING = false;
    stopLoadingAnimation();
    if (gameState.halfMoveNumber >= HALF_MOVE_THRESHOLD || js_lichess_move.isMate) {
        endGame();
        return;
    }
    if (gameState.premove !== null) {
        document.querySelectorAll('.square').forEach(square => {
            square.classList.remove('can-move-highlight');
            square.classList.remove('premove-highlight');
        });
        tryMove(gameState.premove[0], gameState.premove[1], premove = true);
        gameState.premove = null;
    }
    // if a piece is selected, reselect it to highlight the real legal moves
    if (CURRENTLY_HIGHLIGHTED_SQUARE) {
        // remove can-move-highlight from all squares
        document.querySelectorAll('.square').forEach(square => {
            square.classList.remove('can-move-highlight');
        });
        const square = chessNotation(CURRENTLY_HIGHLIGHTED_SQUARE);
        legalMovesCopy = legalMoves.slice();
        for (const move of legalMoves) {
            if (move[0] + move[1] !== square) continue;
            const indices = chessNotationToIndices(move[2] + move[3]);
            const targetSquare = document.querySelector(`.square[data-row="${indices[0]}"][data-col="${indices[1]}"]`);
            if (targetSquare) {
                targetSquare.classList.add('can-move-highlight');
            }
        }
    }
}

function startLoadingAnimation() {
    document.getElementById("loading-circle").style.display = "block";
}

function stopLoadingAnimation() {
    document.getElementById("loading-circle").style.display = "none";
}

function chessNotationToIndices(square) {
    const file = square[0]; // 'a' to 'h'
    const rank = square[1]; // '1' to '8'
    let col = file.charCodeAt(0) - 'a'.charCodeAt(0); // 'a' = 0, ..., 'h' = 7
    let row = 8 - parseInt(rank); // rank 8 = row 0, rank 1 = row 7

    // Reverse for black
    if (gameState && gameState.userColor === 'black') {
        row = 7 - row;
        col = 7 - col;
    }
    return [row, col];
}

async function endGame() {
    // remove premove highlights
    removeGameHighlights();
    moveListLoadingAnimationStart();
    gameState.evaluations = await Promise.all(gameState.evaluations);

    updateMoveListWithColor();
    gameState.playing = false;
    // delete first eval, because we do not have a corresponding move for it
    if (gameState.isRated) {
        eval = gameState.evaluations[gameState.evaluations.length - 1] / 100;
        eval = Math.max(-5, Math.min(5, eval));
        let ratingChange = Math.round(eval * 10);
        if (gameState.userColor === 'black') ratingChange *= -1;
        if (ratingChange < 0) {
            playSound('legacy-site/sounds/Defeat.mp3');
        } else if (ratingChange > 0) {
            playSound('legacy-site/sounds/Victory.mp3');
        } else {
            playSound('legacy-site/sounds/Draw.mp3');
        }
        const newRating = parseInt(gameState.userRating) + ratingChange;
        const newPosition = Math.floor(Math.random() * 960);
        const newColor = Math.random() > 0.5 ? "white" : "black";
        fetch("/update_user_data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rating: newRating, position: newPosition, color: newColor })
        }).then(res => res.json()).then(data => {
            if (data.success) {
                gameState.userRating = newRating;
                document.getElementById("ratingDisplay").textContent = `${newRating}`;
            } else {
                console.error("Failed to update rating/position:", data.error);
            }
        }).catch(console.error);
        const ratingDisplay = document.getElementById("ratingDisplay");
        const start = parseInt(ratingDisplay.textContent) || 0;
        const end = newRating;
        const duration = 2000;
        const stepTime = 20;
        const steps = Math.floor(duration / stepTime);
        let currentStep = 0;
        const diff = end - start;
        let ratingChangeElem = document.getElementById("ratingChangeDisplay");
        if (!ratingChangeElem) {
            ratingChangeElem = document.createElement("span");
            ratingChangeElem.id = "ratingChangeDisplay";
            ratingDisplay.parentNode.insertBefore(ratingChangeElem, ratingDisplay.nextSibling);
        }
        ratingChangeElem.style.marginLeft = "10px";
        ratingChangeElem.style.fontWeight = "bold";
        ratingChangeElem.style.fontSize = "1.1em";
        ratingChangeElem.textContent = diff > 0 ? `+${diff}` : `${diff}`;
        ratingChangeElem.style.color = diff > 0 ? "#2ecc40" : (diff < 0 ? "#ff4136" : "#888");
        if (diff === 0) {
            ratingDisplay.textContent = `${end}`;
        } else {
            const animate = () => {
                currentStep++;
                const progress = Math.min(currentStep / steps, 1);
                const value = Math.round(start + diff * progress);
                ratingDisplay.textContent = `${value}`;
                if (progress < 1) setTimeout(animate, stepTime);
            };
            animate();
        }
        setTimeout(() => {
            if (ratingChangeElem) ratingChangeElem.textContent = "";
        }, 3000);
    }
    document.getElementById("playAgainBtn").style.display = "block";
    CURRENTLY_HIGHLIGHTED_SQUARE = null;
    document.querySelectorAll('.square').forEach(square => {
        square.classList.remove('highlight');
        square.classList.remove('can-move-highlight');
    });
    document.getElementById("lichessBtn").style.display = "block";
}

function backButtonClick() {
    stopLoadingAnimation();
    reactivateMenu();
    resetGameState();
    updateMoveList();
    removeAllBoardHighlights();
    document.getElementById("lichessBtn").style.display = "none";
}