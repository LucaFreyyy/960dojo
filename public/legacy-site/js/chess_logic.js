function get_position(number, color) {
    var key = number.toString().padStart(3, '0');
    var frontRank = STARTING_POSITIONS[key];
    if (!frontRank) throw new Error("Invalid position number: " + number);

    // Piece mapping
    const pieceMap = {
        'K': 'K', 'Q': 'Q', 'R': 'R', 'B': 'B', 'N': 'N'
    };

    function mapPiece(piece, color) {
        return color + '_' + piece;
    }

    let backRank, frontRankFinal, pawnColor, emptyRanks = [];
    if (color === 'black') {
        frontRank = frontRank.split('').reverse().join('');
        backRank = frontRank;
        frontRankFinal = frontRank;
        pawnColor = 'b';
    } else {
        backRank = frontRank;
        frontRankFinal = frontRank;
        pawnColor = 'w';
    }

    // Build the 2D array: [backRank, pawns, empty, empty, empty, empty, pawns, frontRank]
    let board = [];
    board.push(backRank.split('').map(piece => mapPiece(pieceMap[piece], color === 'black' ? 'w' : 'b')));
    board.push(Array(8).fill(mapPiece('P', color === 'black' ? 'w' : 'b')));
    for (let i = 0; i < 4; i++) board.push(Array(8).fill('')); // 6th-3rd ranks empty
    board.push(Array(8).fill(mapPiece('P', color === 'black' ? 'b' : 'w')));
    board.push(frontRankFinal.split('').map(piece => mapPiece(pieceMap[piece], color === 'black' ? 'b' : 'w')));

    return board;
}


function freestyleNumberToFEN(number) {
    var key = number.toString().padStart(3, '0');
    var frontRank = STARTING_POSITIONS[key];
    if (!frontRank) throw new Error("Invalid position number: " + number);
    fen = frontRank.toLowerCase() + '/pppppppp/8/8/8/8/PPPPPPPP/' + frontRank + ' w KQkq - 0 1';
    return fen;
}

function get_legal_moves(fen) {
    const setupResult = parseFen(fen);
    if (setupResult.isErr) throw setupResult.error;

    const posResult = Chess.fromSetup(setupResult.value);
    if (posResult.isErr) throw posResult.error;

    const position = posResult.value;
    const ctx = position.ctx();
    const allDests = position.allDests(ctx);

    // Four arrays for each category
    const uciMoves = [];
    const sanMoves = [];
    const fenMoves = [];
    const isMateMoves = [];

    const file = (sq) => String.fromCharCode('a'.charCodeAt(0) + (sq & 7));
    const rank = (sq) => (Math.floor(sq / 8) + 1).toString();
    const squareToAlgebraic = (sq) => file(sq) + rank(sq);

    for (const [from, toSquares] of allDests.entries()) {
        for (const to of toSquares) {
            const move = { from, to };

            // Clone position to play without mutating original
            const clonePos = position.clone();
            clonePos.play(move);

            uciMoves.push(squareToAlgebraic(move.from) + squareToAlgebraic(move.to));
            sanMoves.push(makeSan(position, move));
            fenMoves.push(makeFen(clonePos.toSetup()));
            isMateMoves.push(clonePos.isCheckmate());
        }
    }

    return {
        uci: uciMoves,
        san: sanMoves,
        fen: fenMoves,
        isMate: isMateMoves
    };
}

function getCentipawnLoss(fen, depth = 15) {
    return new Promise((resolve) => {
        const engine = new Worker("/legacy-site/js/stockfish.js");

        let bestEval = null;
        let turn = fen.split(" ")[1]; // 'w' or 'b'

        engine.onmessage = function (event) {
            const line = event.data;
            if (typeof line !== "string") return;

            if (line.startsWith("info") && line.includes("score cp")) {
                const match = line.match(/score cp (-?\d+)/);
                if (match) {
                    let evalCp = parseInt(match[1], 10);
                    // Always positive if white is better, negative if black is better
                    bestEval = turn === "w" ? evalCp : -evalCp;
                }
            }

            if (line.startsWith("bestmove")) {
                engine.terminate();
                resolve(bestEval);
            }
        };

        engine.postMessage("uci");
        setTimeout(() => {
            engine.postMessage(`position fen ${fen}`);
            engine.postMessage("go depth " + depth);
        }, 100);
    });
}

async function fetch_lichess_data(fen, rating) {
    const ratingMin = rating - 200;
    const ratingMax = rating + 200;
    const timeControls = ['blitz', 'rapid', 'classical'].join(',');

    const url = `https://explorer.lichess.ovh/lichess?fen=${encodeURIComponent(fen)}&ratingMin=${ratingMin}&ratingMax=${ratingMax}&time=${timeControls}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error('Lichess API error', response.status);
            return fetch_stockfish_move(fen, rating);
        }

        const data = await response.json();

        if (!data.moves || data.moves.length === 0) {
            return fetch_stockfish_move(fen, rating);
        }

        const totalGames = data.total || data.moves.reduce((sum, m) => sum + (m.white + m.draws + m.black), 0);
        if (totalGames === 0) return fetch_stockfish_move(fen, rating);

        const movesWithProb = data.moves.map(move => {
            const count = move.white + move.draws + move.black;
            return {
                uci: move.uci,
                san: move.san,
                probability: count / totalGames
            };
        });

        // Pick a move randomly weighted by probability
        const rand = Math.random();
        let cumulative = 0;
        let chosenMove = movesWithProb[movesWithProb.length - 1];
        for (const move of movesWithProb) {
            cumulative += move.probability;
            if (rand < cumulative) {
                chosenMove = move;
                break;
            }
        }

        // Use chessops to play the move and get result FEN, isMate, start/end squares
        const setupResult = parseFen(fen);
        if (setupResult.isErr) return fetch_stockfish_move(fen, rating);
        const posResult = Chess.fromSetup(setupResult.value);
        if (posResult.isErr) return fetch_stockfish_move(fen, rating);
        const position = posResult.value;

        // Parse UCI move (e.g. e2e4)
        const uci = chosenMove.uci;
        const startSquare = uci.slice(0, 2);
        const endSquare = uci.slice(2, 4);

        // Convert algebraic squares to 0-63 indices
        function algebraicToIndex(sq) {
            return (parseInt(sq[1], 10) - 1) * 8 + (sq.charCodeAt(0) - 'a'.charCodeAt(0));
        }
        const moveObj = {
            from: algebraicToIndex(startSquare),
            to: algebraicToIndex(endSquare)
        };

        // Play the move
        const clonePos = position.clone();
        clonePos.play(moveObj);

        const resultFen = makeFen(clonePos.toSetup());
        const isMate = clonePos.isCheckmate();
        const moveSan = chosenMove.san;

        return {
            resultFen,
            moveSan,
            isMate,
            startSquare,
            endSquare
        };

    } catch (err) {
        console.error('Error fetching lichess data:', err);
        return fetch_stockfish_move(fen, rating);
    }
}

function fetch_stockfish_move(fen, rating) {
    return new Promise((resolve) => {
        const engine = new Worker("/legacy-site/js/stockfish.js");

        const skillLevel = Math.max(0, Math.min(20, Math.round((rating - 800) / 80))); // Clamp between 0-20

        const setup = parseFen(fen);
        if (setup.isErr) return resolve(null);
        const posResult = Chess.fromSetup(setup.value);
        if (posResult.isErr) return resolve(null);
        const position = posResult.value;
        const clone = position.clone();

        let bestMove = null;

        engine.onmessage = (event) => {
            const line = event.data;

            if (typeof line === "string") {
                if (line.startsWith("bestmove")) {
                    const parts = line.split(" ");
                    bestMove = parts[1];
                    engine.terminate();

                    if (!bestMove || bestMove.length < 4) return resolve(null);

                    const from = bestMove.slice(0, 2);
                    const to = bestMove.slice(2, 4);

                    function algebraicToIndex(sq) {
                        return (parseInt(sq[1], 10) - 1) * 8 + (sq.charCodeAt(0) - 'a'.charCodeAt(0));
                    }

                    const move = {
                        from: algebraicToIndex(from),
                        to: algebraicToIndex(to),
                    };
                    clone.play(move);

                    const resultFen = makeFen(clone.toSetup());
                    const moveSan = makeSan(position, move);
                    const isMate = clone.isCheckmate();

                    return resolve({
                        resultFen,
                        moveSan,
                        isMate,
                        startSquare: from,
                        endSquare: to
                    });
                }
            }
        };

        engine.postMessage("uci");
        engine.postMessage("setoption name Skill Level value " + skillLevel);
        engine.postMessage("go movetime 1000");

        setTimeout(() => {
            engine.postMessage(`position fen ${fen}`);
            engine.postMessage("go depth 15");
        }, 50);
    });
}

function position_with_fixed_pieces(piece, first, second) {
    const pieceLetterMap = {
        'king': 'K',
        'queen': 'Q',
        'rook': 'R',
        'bishop': 'B',
        'knight': 'N'
    };
    const letter = pieceLetterMap[piece.toLowerCase()];
    if (!letter) throw new Error("Unknown piece: " + piece);

    function fileToIndex(file) {
        return file.charCodeAt(0) - 'a'.charCodeAt(0);
    }
    const firstIdx = fileToIndex(first);
    const secondIdx = second !== '-' ? fileToIndex(second) : null;

    const results = [];
    for (const [key, pos] of Object.entries(STARTING_POSITIONS)) {
        const indices = [];
        for (let i = 0; i < pos.length; i++) {
            if (pos[i] === letter) indices.push(i);
        }
        if (indices.length === 0) continue;
        if (!indices.includes(firstIdx)) continue;
        if (secondIdx !== null) {
            if (indices.length < 2) continue;
            if (!indices.includes(secondIdx) || secondIdx === firstIdx) continue;
        }
        results.push(key);
    }
    return results;
}

async function getLichessAnalysisLink() {
    // Grab values from DOM / global variables here:
    const startPositionNr = document.getElementById('numberSelect').value;
    const user = window.sessionUser?.name || 'Guest';
    const history = window.gameState.moveHistorySAN;
    const userColor = window.gameState.userColor;

    // (Then the rest of your function unchanged but using these variables)

    const fen = freestyleNumberToFEN(startPositionNr);
    const game = window.defaultGame();

    game.headers = new Map([
        ["Event", "960 Opening Practice"],
        ["Site", "https://nine60openingpractice.onrender.com"],
        ["White", userColor.toLowerCase() === "white" ? user : "Somebody"],
        ["Black", userColor.toLowerCase() === "black" ? user : "Somebody"],
        ["Variant", "Chess960"],
        ["SetUp", "1"],
        ["FEN", fen],
        ["Date", new Date().toISOString().split("T")[0].replace(/-/g, ".")]
    ]);

    const setup = parseFen(fen).value;
    const pos = Chess.fromSetup(setup).value;

    let node = game.moves;
    for (const san of history) {
        const move = parseSan(pos, san);
        if (!move) break;
        const actualSan = makeSanAndPlay(pos, move);
        const child = new window.ChildNode({ san: actualSan });
        node.children.push(child);
        node = child;
    }

    const pgn = window.makePgn(game);

    try {
        const response = await fetch("https://lichess.org/api/import", {
            method: "POST",
            headers: { "Accept": "application/json" },
            body: new URLSearchParams({
                pgn,
                color: userColor.toLowerCase()
            })
        });

        if (!response.ok) {
            console.error("Lichess import failed", response.status);
            return null;
        }

        const data = await response.json();
        return `${data.url}/${userColor.toLowerCase()}`;

    } catch (err) {
        console.error("Error uploading PGN:", err);
        return null;
    }
}
