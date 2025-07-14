function updateMoveListWithColor() {
    moveListLoadingAnimationStop();
    const moveListContainer = document.getElementById("moveListContainer");
    const browseButtonContainer = moveListContainer.querySelector("#browseButtonContainer");
    moveListContainer.innerHTML = "";
    if (browseButtonContainer) moveListContainer.appendChild(browseButtonContainer);

    // Add hover effect CSS if not already present
    if (!document.getElementById("move-list-hover-style")) {
        const style = document.createElement("style");
        style.id = "move-list-hover-style";
        style.innerHTML = `
            .move-list-move {
                cursor: pointer;
                transition: background 0.15s;
            }
            .move-list-move:hover {
                background:rgb(47, 178, 218) !important;
            }
            .move-list-move.disabled,
            .move-list-move.disabled:hover {
                cursor: default;
                background: none !important;
                color: #cccccc !important;
            }
        `;
        document.head.appendChild(style);
    }

    let html = `<div id="moveListScroll" style="display: flex; flex-direction: column; gap: 2px;">`;
    function getEvalColor(evalValue) {
        let v = Math.max(-500, Math.min(500, evalValue));
        if (window.gameState.userColor === 'black') v = -v;
        let t = Math.sign(v) * Math.pow(Math.abs(v) / 500, 0.6);
        if (t >= 0) {
            let r = Math.round(204 + (39 - 204) * t);
            let g = Math.round(204 + (230 - 204) * t);
            let b = Math.round(204 + (96 - 204) * t);
            return `rgb(${r},${g},${b})`;
        } else {
            let tAbs = Math.abs(t);
            let r = Math.round(204 + (231 - 204) * tAbs);
            let g = Math.round(204 + (76 - 204) * tAbs);
            let b = Math.round(204 + (60 - 204) * tAbs);
            return `rgb(${r},${g},${b})`;
        }
    }
    for (let i = 0; i < window.gameState.moveHistorySAN.length; i += 2) {
        const moveNumber = Math.floor(i / 2) + 1;
        const whiteMove = window.gameState.moveHistorySAN[i] || "";
        const blackMove = (i + 1 < window.gameState.moveHistorySAN.length ? window.gameState.moveHistorySAN[i + 1] : "") || "";
        const whiteEval = window.gameState.evaluations[i];
        const blackEval = window.gameState.evaluations[i + 1];
        const whiteColor = whiteEval !== undefined ? getEvalColor(whiteEval) : "#cccccc";
        const blackColor = blackEval !== undefined ? getEvalColor(blackEval) : "#cccccc";
        const whiteMark = (window.currentBrowsePosition === i) ? 'background:rgb(25, 70, 70); font-weight: bold;' : '';
        const blackMark = (window.currentBrowsePosition === i + 1) ? 'background:rgb(25, 70, 70); font-weight: bold;' : '';

        // If black move is not available, add 'disabled' class and remove pointer/hover
        const blackMoveClass = (i + 1 >= window.gameState.moveHistorySAN.length || !blackMove.trim()) ? 'move-list-move disabled' : 'move-list-move';
        const whiteMoveClass = whiteMove.trim() ? 'move-list-move' : 'move-list-move disabled';

        html += `
            <div style="display: flex; min-width: 220px;">
                <span style="flex: 0 0 10%; text-align: right; margin-right: 0.5em;">${moveNumber}.</span>
                <span class="${whiteMoveClass}" data-move-index="${i}" style="flex: 0 0 45%; text-align: left; margin-left:0.5em; color: ${whiteColor}; ${whiteMark}">&nbsp;${whiteMove}</span>
                <span class="${blackMoveClass}" data-move-index="${i + 1}" style="flex: 0 0 45%; text-align: left; margin-left:0.5em; color: ${blackColor}; ${blackMark}">&nbsp;${blackMove}</span>
            </div>
        `;
    }
    let currentEval = 0;
    if (window.currentBrowsePosition === -1) {
        currentEval = window.initialEval / 100;
    } else {
        currentEval = window.gameState.evaluations[window.currentBrowsePosition] / 100;
    }
    if (currentEval !== undefined) {
        const evalColor = getEvalColor(currentEval);
        html += `
        <div style="display: flex; align-items: center; justify-content: flex-start; min-width: 180px; margin-top: 18px; padding: 12px 0; border-radius: 10px; font-size: 1.35em; font-weight: bold;">
            <span style="width: 3.5em; text-align: right; margin-right: 1em; color: ${evalColor};">Eval:</span>
            <span style="color: ${evalColor}; font-size: 1.5em; letter-spacing: 1px;">${currentEval > 0 ? "+" : ""}${currentEval.toFixed(2)}</span>
        </div>
        `;
    }
    html += `</div>`;
    browseButtonContainer.insertAdjacentHTML("afterend", html);
    const moveListDiv = document.getElementById("moveListScroll");
    if (moveListDiv) moveListDiv.scrollTop = moveListDiv.scrollHeight;

    // Add click event listeners to move spans, but not to disabled ones
    moveListContainer.querySelectorAll('.move-list-move:not(.disabled)').forEach(span => {
        span.addEventListener('click', function () {
            const idx = parseInt(this.getAttribute('data-move-index'));
            if (!isNaN(idx) && idx < window.gameState.moveHistorySAN.length) {
                window.currentBrowsePosition = idx;
                updateMoveListWithColor();
                redrawBoard();
            }
        });
    });
}

function updateMoveList() {
    const moveListContainer = document.getElementById("moveListContainer");
    const browseButtonContainer = moveListContainer.querySelector("#browseButtonContainer");
    moveListContainer.innerHTML = "";
    if (browseButtonContainer) moveListContainer.appendChild(browseButtonContainer);

    // Add hover effect CSS if not already present
    if (!document.getElementById("move-list-hover-style")) {
        const style = document.createElement("style");
        style.id = "move-list-hover-style";
        style.innerHTML = `
            .move-list-move {
                cursor: pointer;
                transition: background 0.15s;
            }
            .move-list-move:hover {
                background:rgb(47, 178, 218) !important;
            }
            .move-list-move.disabled,
            .move-list-move.disabled:hover {
                cursor: default;
                background: none !important;
                color: #cccccc !important;
            }
        `;
        document.head.appendChild(style);
    }

    let html = `<div id="moveListScroll" style="display: flex; flex-direction: column; gap: 2px;">`;
    for (let i = 0; i < window.gameState.moveHistorySAN.length; i += 2) {
        const moveNumber = Math.floor(i / 2) + 1;
        const whiteMove = window.gameState.moveHistorySAN[i] || "";
        const blackMove = (i + 1 < window.gameState.moveHistorySAN.length ? window.gameState.moveHistorySAN[i + 1] : "") || "";
        const whiteMark = (window.currentBrowsePosition === i) ? 'background:rgb(25, 70, 70); font-weight: bold;' : '';
        const blackMark = (window.currentBrowsePosition === i + 1) ? 'background:rgb(25, 70, 70); font-weight: bold;' : '';

        // If black move is not available, add 'disabled' class and remove pointer/hover
        const blackMoveClass = (i + 1 >= window.gameState.moveHistorySAN.length || !blackMove.trim()) ? 'move-list-move disabled' : 'move-list-move';
        const whiteMoveClass = whiteMove.trim() ? 'move-list-move' : 'move-list-move disabled';

        html += `
            <div style="display: flex; min-width: 220px;">
            <span style="flex: 0 0 10%; text-align: right; margin-right: 0.5em;">${moveNumber}.</span>
            <span class="${whiteMoveClass}" data-move-index="${i}" style="flex: 0 0 45%; text-align: left; margin-left:0.5em; ${whiteMark}">&nbsp;${whiteMove}</span>
            <span class="${blackMoveClass}" data-move-index="${i + 1}" style="flex: 0 0 45%; text-align: left; margin-left:0.5em; ${blackMark}">&nbsp;${blackMove}</span>
            </div>
        `;
    }
    html += `</div>`;
    browseButtonContainer.insertAdjacentHTML("afterend", html);
    const moveListDiv = document.getElementById("moveListScroll");
    if (moveListDiv) moveListDiv.scrollTop = moveListDiv.scrollHeight;

    // Add click event listeners to move spans, but not to disabled ones
    moveListContainer.querySelectorAll('.move-list-move:not(.disabled)').forEach(span => {
        span.addEventListener('click', function (e) {
            const idx = parseInt(this.getAttribute('data-move-index'));
            if (!isNaN(idx) && idx < window.gameState.moveHistorySAN.length) {
                window.currentBrowsePosition = idx;
                updateMoveList();
                redrawBoard();
            }
        });
    });
}

function browseBackClick() {
    if (window.currentBrowsePosition > -1) {
        removeGameHighlights();
        window.currentBrowsePosition--;
        redrawBoard();
    }
}

function browseAllTheWayBackClick() {
    if (window.currentBrowsePosition !== -1) {
        removeGameHighlights();
        window.currentBrowsePosition = -1;
        redrawBoard();
    }
}

function browseForwardClick() {
    if (window.currentBrowsePosition < window.gameState.moveHistorySAN.length - 1) {
        removeGameHighlights();
        window.currentBrowsePosition++;
        redrawBoard();
    }
}

function browseAllTheWayForwardClick() {
    if (window.currentBrowsePosition !== window.gameState.moveHistorySAN.length - 1) {
        removeGameHighlights();
        window.currentBrowsePosition = window.gameState.moveHistorySAN.length - 1;
        redrawBoard();
    }
}

function moveListLoadingAnimationStart() {
    const moveListContainer = document.getElementById("moveListContainer");
    if (!moveListContainer) return;

    // Add background loader CSS if not already present
    if (!document.getElementById("move-list-loading-style")) {
        const style = document.createElement("style");
        style.id = "move-list-loading-style";
        style.innerHTML = `
            #moveListContainer.loading {
                position: relative;
                background: rgba(46, 164, 255, 0.08);
                pointer-events: none;
                user-select: none;
            }
            .move-list-chess-loader-bg {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                display: flex;
                gap: 0.2em;
                opacity: 0.7;
                pointer-events: none;
                z-index: 1;
                user-select: none;
                filter: drop-shadow(0 4px 12px rgba(46,164,255,0.25));
                white-space: nowrap;
            }
            .move-list-chess-loader-bg span {
                font-size: 2em;
                display: inline-block;
                animation: bouncePiece 1.2s infinite cubic-bezier(.68,-0.55,.27,1.55);
                filter: drop-shadow(0 2px 6px var(--bg-main, #222));
                color: var(--text-color-hover, #2ea4ff);
                text-shadow: 0 0 12px var(--bg-main, #222), 0 2px 16px var(--bg-highlight, #64c5fd80);
                opacity: 0.95;
            }
            /* Give each piece a slightly increasing animation delay */
            .move-list-chess-loader-bg span:nth-child(1) { animation-delay: 0s; }
            .move-list-chess-loader-bg span:nth-child(2) { animation-delay: 0.12s; color: var(--grad-start, #00b894); }
            .move-list-chess-loader-bg span:nth-child(3) { animation-delay: 0.24s; color: var(--grad-hover, #0984e3); }
            .move-list-chess-loader-bg span:nth-child(4) { animation-delay: 0.36s; color: var(--bg-right1, #fff018); }
            .move-list-chess-loader-bg span:nth-child(5) { animation-delay: 0.48s; color: var(--bg-last-move, #74ff62); }
            .move-list-chess-loader-bg span:nth-child(6) { animation-delay: 0.60s; }
            .move-list-chess-loader-bg span:nth-child(7) { animation-delay: 0.72s; }
            .move-list-chess-loader-bg span:nth-child(8) { animation-delay: 0.84s; }
            @keyframes bouncePiece {
                0%, 100% { transform: translateY(0) scale(1); }
                20% { transform: translateY(-14px) scale(1.10); }
                40% { transform: translateY(0) scale(1); }
                60% { transform: translateY(-7px) scale(1.04);}
                80% { transform: translateY(0) scale(1);}
            }
        `;
        document.head.appendChild(style);
    }

    moveListContainer.classList.add("loading");

    // Insert background loader with pieces from STARTING_POSITIONS based on selector value
    const numberSelector = document.getElementById("numberSelect");
    let posKey = numberSelector.value;
    const positionString = STARTING_POSITIONS[posKey] || "BBQNNRKR";
    // Map FEN letters to Unicode chess pieces (white)
    const pieceMap = {
        "K": "♔",
        "Q": "♕",
        "R": "♖",
        "B": "♗",
        "N": "♘"
    };
    // Pawns are not in the starting string, so fallback to ♙ for unknowns
    const pieces = positionString.split("").map(ch => pieceMap[ch] || "♙");
    if (window.gameState.userColor === "black") { pieces.reverse(); }
    if (!moveListContainer.querySelector(".move-list-chess-loader-bg")) {
        const loader = document.createElement("div");
        loader.className = "move-list-chess-loader-bg";
        loader.setAttribute("aria-label", "Loading moves...");
        loader.innerHTML = pieces.map(p => `<span>${p}</span>`).join("");
        moveListContainer.appendChild(loader);
    }
}

function moveListLoadingAnimationStop() {
    const moveListContainer = document.getElementById("moveListContainer");
    if (!moveListContainer) return;
    moveListContainer.classList.remove("loading");
    // Remove background loader if present
    const loader = moveListContainer.querySelector(".move-list-chess-loader-bg");
    if (loader) loader.remove();
}
