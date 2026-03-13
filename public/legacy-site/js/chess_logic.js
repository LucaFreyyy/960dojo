// ─── Single Persistent Stockfish Worker ────────────────────────────────────

var sfWorker = sfWorker || null;
var sfReady = sfReady || false;
var sfJobQueue = sfJobQueue || [];
var sfJobRunning = sfJobRunning || false;

function getSfWorker() {
    if (sfWorker) return sfWorker;

    sfWorker = new Worker("/stockfish-18.js");

    sfWorker.addEventListener('message', function init(event) {
        const line = event.data;
        if (typeof line !== 'string') return;

        if (line === 'uciok') {
            const threads = Math.min(navigator.hardwareConcurrency || 2, 8);
            const memory = navigator.deviceMemory || 4;
            const hashSize = Math.min(Math.floor(memory * 32), 512);
            sfWorker.postMessage(`setoption name Threads value ${threads}`);
            sfWorker.postMessage(`setoption name Hash value ${hashSize}`);
            sfWorker.postMessage(`setoption name UCI_Chess960 value true`);
            sfWorker.postMessage('isready');
        }

        if (line === 'readyok') {
            sfReady = true;
            sfWorker.removeEventListener('message', init);
        }
    });

    sfWorker.postMessage('uci');
    return sfWorker;
}

// Enqueue a job. Each job is a function that receives the engine and a `done`
// callback it MUST call when it receives `bestmove`, so the next job can start.
function sfJob(jobFn) {
    sfJobQueue.push(jobFn);
    sfFlushQueue();
}

function sfFlushQueue() {
    if (sfJobRunning || sfJobQueue.length === 0) return;

    const engine = getSfWorker();
    if (!sfReady) {
        engine.addEventListener('message', function waitReady(event) {
            if (event.data === 'readyok') {
                engine.removeEventListener('message', waitReady);
                sfFlushQueue();
            }
        });
        return;
    }

    sfJobRunning = true;
    const jobFn = sfJobQueue.shift();
    jobFn(engine, function done() {
        sfJobRunning = false;
        sfFlushQueue();
    });
}

// ─── Chess Logic ────────────────────────────────────────────────────────────

function get_position(number, color) {
    var key = number.toString().padStart(3, '0');
    var frontRank = STARTING_POSITIONS[key];
    if (!frontRank) throw new Error("Invalid position number: " + number);

    const pieceMap = { 'K': 'K', 'Q': 'Q', 'R': 'R', 'B': 'B', 'N': 'N' };

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

    let board = [];
    board.push(backRank.split('').map(piece => mapPiece(pieceMap[piece], color === 'black' ? 'w' : 'b')));
    board.push(Array(8).fill(mapPiece('P', color === 'black' ? 'w' : 'b')));
    for (let i = 0; i < 4; i++) board.push(Array(8).fill(''));
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

    const uciMoves = [], sanMoves = [], fenMoves = [], isMateMoves = [];

    const file = (sq) => String.fromCharCode('a'.charCodeAt(0) + (sq & 7));
    const rank = (sq) => (Math.floor(sq / 8) + 1).toString();
    const squareToAlgebraic = (sq) => file(sq) + rank(sq);

    for (const [from, toSquares] of allDests.entries()) {
        for (const to of toSquares) {
            const move = { from, to };
            const clonePos = position.clone();
            clonePos.play(move);
            uciMoves.push(squareToAlgebraic(move.from) + squareToAlgebraic(move.to));
            sanMoves.push(makeSan(position, move));
            fenMoves.push(makeFen(clonePos.toSetup()));
            isMateMoves.push(clonePos.isCheckmate());
        }
    }

    return { uci: uciMoves, san: sanMoves, fen: fenMoves, isMate: isMateMoves };
}

function oldCentipawnLossFunction(fen, movetime = 1500, depth = 16) {
    return new Promise((resolve) => {
        const turn = fen.split(" ")[1];
        let bestEval = null;
        sfJob((engine, done) => {
            function onMessage(event) {
                const line = event.data;
                if (typeof line !== 'string') return;
                if (line.startsWith('info')) {
                    if (line.includes('score cp')) {
                        const match = line.match(/score cp (-?\d+)/);
                        if (match) {
                            const evalCp = parseInt(match[1], 10);
                            bestEval = turn === 'w' ? evalCp : -evalCp;
                        }
                    } else if (line.includes('score mate')) {
                        const match = line.match(/score mate (-?\d+)/);
                        if (match) {
                            const mateMoves = parseInt(match[1], 10);
                            const mateEval = mateMoves > 0 ? 9999 : -9999;
                            bestEval = turn === 'w' ? mateEval : -mateEval;
                        }
                    }
                }
                if (line.startsWith('bestmove')) {
                    engine.removeEventListener('message', onMessage);
                    done();
                    resolve(bestEval);
                }
            }
            engine.addEventListener('message', onMessage);
            engine.postMessage(`position fen ${fen}`);
            engine.postMessage(`go movetime ${movetime}`);
        });
    });
}

async function getCentipawnLoss(fen) {
    const turn = fen.split(" ")[1];
    let evalCp;

    try {
        const evalData = await fetchLichessEval(fen);
        evalCp = evalData?.pvs?.[0]?.cp;
    } catch (err) {
        console.info("Lichess eval fetch error:", err);
    }

    let evaluation;
    if (typeof evalCp !== "number") {
        evaluation = await oldCentipawnLossFunction(fen, movetime = 4000);
    } else {
        evaluation = turn === 'w' ? evalCp : -evalCp; // TODO: verify this makes sense
    }

    if (window.gameState.isRated) {
        window.appendEvalToDatabase(window.sessionUser.id, evaluation, fen);
    }
    return evaluation;
}

async function fetchLichessEval(fen) {
    const encodedFen = encodeURIComponent(fen);
    const url = `https://lichess.org/api/cloud-eval?fen=${encodedFen}`;

    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });

    if (!res.ok) {
        console.log(url);
        return null;
    }

    console.log("Fetched Lichess eval for FEN:", fen);
    return await res.json();
}

async function fetch_lichess_data(fen, rating) {
    const ratingMin = rating - 200;
    const ratingMax = rating + 200;
    console.log(`Fetching Lichess data for FEN: ${fen} with rating range ${ratingMin}-${ratingMax}`);

    const url = `/api/lichess_explorer?fen=${encodeURIComponent(fen)}&ratingMin=${ratingMin}&ratingMax=${ratingMax}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error('Lichess API error', response.status);
            return fetch_stockfish_move(fen, rating);
        }

        const data = await response.json();
        if (!data.moves || data.moves.length === 0) return fetch_stockfish_move(fen, rating);

        const totalGames = data.total || data.moves.reduce((sum, m) => sum + (m.white + m.draws + m.black), 0);
        if (totalGames === 0) return fetch_stockfish_move(fen, rating);

        const movesWithProb = data.moves.map(move => {
            const count = move.white + move.draws + move.black;
            return { uci: move.uci, san: move.san, probability: count / totalGames };
        });

        const rand = Math.random();
        let cumulative = 0;
        let chosenMove = movesWithProb[movesWithProb.length - 1];
        for (const move of movesWithProb) {
            cumulative += move.probability;
            if (rand < cumulative) { chosenMove = move; break; }
        }

        const setupResult = parseFen(fen);
        if (setupResult.isErr) return fetch_stockfish_move(fen, rating);
        const posResult = Chess.fromSetup(setupResult.value);
        if (posResult.isErr) return fetch_stockfish_move(fen, rating);
        const position = posResult.value;

        // Use parseUci from chessops so castling/promotion are handled correctly
        const moveObj = parseUci(chosenMove.uci);
        if (!moveObj) return fetch_stockfish_move(fen, rating);

        const clonePos = position.clone();
        clonePos.play(moveObj);

        const startSquare = chosenMove.uci.slice(0, 2);
        const endSquare = chosenMove.uci.slice(2, 4);

        return {
            resultFen: makeFen(clonePos.toSetup()),
            moveSan: chosenMove.san,
            isMate: clonePos.isCheckmate(),
            startSquare,
            endSquare,
        };

    } catch (err) {
        console.error('Error fetching lichess data:', err);
        return fetch_stockfish_move(fen, rating);
    }
}

function getRandomSkillLevel(rating) {
    const ratingMap = {
        0: 1347, 1: 1490, 2: 1597, 3: 1694, 4: 1785, 5: 1871,
        6: 1954, 7: 2035, 8: 2113, 9: 2198, 10: 2264, 11: 2337,
        12: 2409, 13: 2480, 14: 2550, 15: 2619, 16: 2686, 17: 2754,
        18: 2820, 19: 2886
    };

    // Box-Muller transform for normal distribution
    const u1 = Math.random(), u2 = Math.random();
    const randNormal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const sampledRating = rating + randNormal * 200;

    // Find closest skill level
    let closest = 0;
    let minDiff = Infinity;
    for (const [level, mappedRating] of Object.entries(ratingMap)) {
        const diff = Math.abs(mappedRating - sampledRating);
        if (diff < minDiff) {
            minDiff = diff;
            closest = parseInt(level);
        }
    }
    console.log(`Sampled opponent rating: ${Math.round(sampledRating)}, mapped skill level: ${closest}`);
    return closest;
}

function fetch_stockfish_move(fen, rating, movetime = 2000) {
    return new Promise((resolve) => {
        const skillLevel = getRandomSkillLevel(rating);

        const setup = parseFen(fen);
        if (setup.isErr) return resolve(null);
        const posResult = Chess.fromSetup(setup.value);
        if (posResult.isErr) return resolve(null);
        const position = posResult.value;
        const clone = position.clone();

        sfJob((engine, done) => {
            function onMessage(event) {
                const line = event.data;
                if (typeof line !== 'string') return;

                if (line.startsWith('bestmove')) {
                    engine.removeEventListener('message', onMessage);
                    done();

                    const parts = line.split(' ');
                    const bestMove = parts[1];
                    if (!bestMove || bestMove.length < 4) return resolve(null);

                    // Use parseUci so castling/promotion are handled correctly
                    const move = parseUci(bestMove);
                    if (!move) return resolve(null);

                    const from = bestMove.slice(0, 2);
                    const to = bestMove.slice(2, 4);

                    clone.play(move);

                    resolve({
                        resultFen: makeFen(clone.toSetup()),
                        moveSan: makeSan(position, move),
                        isMate: clone.isCheckmate(),
                        startSquare: from,
                        endSquare: to,
                    });
                }
            }

            engine.addEventListener('message', onMessage);
            engine.postMessage(`setoption name Skill Level value ${skillLevel}`);
            engine.postMessage(`position fen ${fen}`);
            engine.postMessage(`go depth 15`);
        });
    });
}

function position_with_fixed_pieces(piece, first, second) {
    const pieceLetterMap = { 'king': 'K', 'queen': 'Q', 'rook': 'R', 'bishop': 'B', 'knight': 'N' };
    const letter = pieceLetterMap[piece.toLowerCase()];
    if (!letter) throw new Error("Unknown piece: " + piece);

    function fileToIndex(file) { return file.charCodeAt(0) - 'a'.charCodeAt(0); }
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
    const startPositionNr = document.getElementById('numberSelect').value;
    const user = window.sessionUser?.name || 'Guest';
    const history = window.gameState.moveHistorySAN;
    const userColor = window.gameState.userColor;

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
            body: new URLSearchParams({ pgn, color: userColor.toLowerCase() })
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