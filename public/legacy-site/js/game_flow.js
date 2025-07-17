async function startGame() {
    window.HALF_MOVE_THRESHOLD = Math.floor(Math.random() * 8) + 17;
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

    removeMarkings();
    if (window.ENGINE_RUNNING) return;
    deactivateMenu();
    await setupStartPosition();

    if (window.gameState.userColor === window.gameState.colorToMove) {
        js_data = get_legal_moves(window.gameState.position);
        window.legalMoves = js_data.uci;
        window.legalSans = js_data.san;
        window.fenResults = js_data.fen;
        window.moveIsMate = js_data.isMate;
        window.initialEval = getCentipawnLoss(window.gameState.position);
        window.gameState.playing = true;
    } else {
        window.legalMoves = getAllPseudolegalMovesForOpponent(window.gameState.position);
        window.gameState.playing = true;
        try {
            await dataBaseMove();
            window.gameState.evaluations = window.gameState.evaluations.slice(1);
        } catch (e) {
            console.error('dataBaseMove error:', e);
        }
    }
}

async function dataBaseMove() {
    if (window.ENGINE_RUNNING) return;
    window.ENGINE_RUNNING = true;
    startLoadingAnimation();
    window.gameState.halfMoveNumber++;
    js_lichess_move = await fetch_lichess_data(window.gameState.position);
    new_position = js_lichess_move.resultFen;
    js_data = get_legal_moves(new_position);
    window.legalMoves = js_data.uci;
    window.legalSans = js_data.san;
    window.fenResults = js_data.fen;
    window.moveIsMate = js_data.isMate;
    move = js_lichess_move.moveSan;
    window.gameState.evaluations.push(getCentipawnLoss(window.gameState.position));
    window.gameState.evaluations.push(getCentipawnLoss(new_position));
    if (window.gameState.playing === false) {
        window.ENGINE_RUNNING = false;
        return;
    }
    window.gameState.moveHistorySAN.push(move);
    window.gameState.fenHistory.push(new_position);
    window.gameState.moveHistoryUCI.push(js_lichess_move.startSquare + js_lichess_move.endSquare);
    playMoveSound(move);
    window.gameState.position = new_position;
    redrawBoard();

    window.gameState.colorToMove = window.gameState.colorToMove === 'white' ? 'black' : 'white';
    window.ENGINE_RUNNING = false;
    stopLoadingAnimation();
    if (window.gameState.isRated) {
        window.writeGameStateToDatabase(window.sessionUser.id);
    }
    if (window.gameState.halfMoveNumber >= window.HALF_MOVE_THRESHOLD || js_lichess_move.isMate) {
        endGame();
        return;
    }
    if (window.gameState.premove !== null) {
        document.querySelectorAll('.square').forEach(square => {
            square.classList.remove('can-move-highlight');
            square.classList.remove('premove-highlight');
        });
        tryMove(window.gameState.premove[0], window.gameState.premove[1], premove = true);
        window.gameState.premove = null;
    }
    // if a piece is selected, reselect it to highlight the real legal moves
    if (window.CURRENTLY_HIGHLIGHTED_SQUARE) {
        // remove can-move-highlight from all squares
        document.querySelectorAll('.square').forEach(square => {
            square.classList.remove('can-move-highlight');
        });
        const square = chessNotation(window.CURRENTLY_HIGHLIGHTED_SQUARE);
        window.legalMovesCopy = window.legalMoves.slice();
        for (const move of window.legalMoves) {
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
    if (window.gameState && window.gameState.userColor === 'black') {
        row = 7 - row;
        col = 7 - col;
    }
    return [row, col];
}

async function endGame() {
    removeGameHighlights();
    moveListLoadingAnimationStart();
    let finalEval = await getCentipawnLoss(window.gameState.position, 25);
    window.gameState.evaluations = await Promise.all(window.gameState.evaluations);
    window.gameState.evaluations[window.gameState.evaluations.length - 1] = finalEval;
    finalEval = finalEval / 100;

    updateMoveListWithColor();
    window.gameState.playing = false;

    if (window.gameState.isRated) {
        writeBackOldOpeningAndFetchNew(window.sessionUser.id);
        finalEval = Math.max(-5, Math.min(5, finalEval));
        let ratingChange = Math.round(finalEval * 10);
        if (window.gameState.userColor === 'black') ratingChange *= -1;

        if (ratingChange < 0) {
            playSound('legacy-site/sounds/Defeat.mp3');
        } else if (ratingChange > 0) {
            playSound('legacy-site/sounds/Victory.mp3');
        } else {
            playSound('legacy-site/sounds/Draw.mp3');
        }

        const newRating = parseInt(window.gameState.userRating) + ratingChange;

        fetch('/api/createOpeningRating', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: window.sessionUser.id,
                newRating,
            }),
        })
            .then(res => res.json())
            .then(data => {
                if (!data.success) {
                    console.error("Rating update failed:", data.error);
                }
            })
            .catch(console.error);

        const ratingDisplay = document.getElementById("ratingDisplay");
        const oldRating = parseInt(ratingDisplay?.textContent || 0, 10);
        const finalRating = newRating;
        const duration = 2000;
        const stepTime = 20;
        const steps = Math.floor(duration / stepTime);
        let currentStep = 0;
        const diff = finalRating - oldRating;

        if (ratingDisplay) {
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
                ratingDisplay.textContent = `${finalRating}`;
            } else {
                const animate = () => {
                    currentStep++;
                    const progress = Math.min(currentStep / steps, 1);
                    const value = Math.round(oldRating + diff * progress);
                    ratingDisplay.textContent = `${value}`;
                    if (progress < 1) setTimeout(animate, stepTime);
                };
                animate();
            }

            setTimeout(() => {
                if (ratingChangeElem) ratingChangeElem.textContent = "";
            }, 3000);
        }
    }

    const playAgainBtn = document.getElementById("playAgainBtn");
    if (playAgainBtn) playAgainBtn.style.display = "block";

    window.CURRENTLY_HIGHLIGHTED_SQUARE = null;
    document.querySelectorAll('.square').forEach(square => {
        square.classList.remove('highlight');
        square.classList.remove('can-move-highlight');
    });

    const lichessBtn = document.getElementById("lichessBtn");
    if (lichessBtn) lichessBtn.style.display = "block";
}

async function backButtonClick() {
    document.getElementById("fullScreenLoadingOverlay").style.display = "flex";
    while (window.ENGINE_RUNNING || window.WRITING_INTO_DATABASE) {
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    stopLoadingAnimation();
    reactivateMenu();
    resetGameState();
    updateMoveList();
    removeAllBoardHighlights();
    document.getElementById("lichessBtn").style.display = "none";
    document.getElementById("fullScreenLoadingOverlay").style.display = "none";
}