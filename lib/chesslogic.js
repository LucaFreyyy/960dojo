import { Chess } from 'chessops/chess';
import { parseFen, makeFen } from 'chessops/fen';
import { makeSan, parseSan, makeSanAndPlay } from 'chessops/san';
import { makePgn } from 'chessops/pgn';
import { STARTING_POSITIONS } from './startingPositions';

export function freestyleNumberToFEN(number) {
    const key = number.toString().padStart(3, '0');
    const frontRank = STARTING_POSITIONS[key];
    if (!frontRank) throw new Error("Invalid position number: " + number);
    return frontRank.toLowerCase() + '/pppppppp/8/8/8/8/PPPPPPPP/' + frontRank + ' w KQkq - 0 1';
}

export function getLegalMoves(fen) {
    const setupResult = parseFen(fen);
    if (setupResult.isErr) throw setupResult.error;

    const posResult = Chess.fromSetup(setupResult.value);
    if (posResult.isErr) throw posResult.error;

    const position = posResult.value;
    const ctx = position.ctx();
    const allDests = position.allDests(ctx);

    const uci = [], san = [], fenAfter = [], isMate = [];

    const file = (sq) => String.fromCharCode('a'.charCodeAt(0) + (sq & 7));
    const rank = (sq) => (Math.floor(sq / 8) + 1).toString();
    const squareToAlg = (sq) => file(sq) + rank(sq);

    for (const [from, toSquares] of allDests.entries()) {
        for (const to of toSquares) {
            const move = { from, to };
            const clone = position.clone();
            clone.play(move);
            uci.push(squareToAlg(from) + squareToAlg(to));
            san.push(makeSan(position, move));
            fenAfter.push(makeFen(clone.toSetup()));
            isMate.push(clone.isCheckmate());
        }
    }

    return { uci, san, fen: fenAfter, isMate };
}

export function positionWithFixedPieces(piece, first, second) {
    const map = { king: 'K', queen: 'Q', rook: 'R', bishop: 'B', knight: 'N' };
    const letter = map[piece.toLowerCase()];
    if (!letter) throw new Error("Unknown piece: " + piece);

    const f2i = (f) => f.charCodeAt(0) - 'a'.charCodeAt(0);
    const firstIdx = f2i(first);
    const secondIdx = second !== '-' ? f2i(second) : null;

    return Object.entries(STARTING_POSITIONS)
        .filter(([_, pos]) => {
            const indices = [...pos].map((p, i) => (p === letter ? i : -1)).filter(i => i !== -1);
            if (!indices.includes(firstIdx)) return false;
            if (secondIdx !== null && (!indices.includes(secondIdx) || secondIdx === firstIdx)) return false;
            return true;
        })
        .map(([key]) => key);
}

export function getCentipawnLoss(fen) {
    return new Promise((resolve) => {
        const engine = new Worker('/legacy-site/js/stockfish.js');
        let bestEval = null;
        const turn = fen.split(' ')[1];

        engine.onmessage = (event) => {
            const line = event.data;
            if (typeof line === 'string' && line.includes("score cp")) {
                const match = line.match(/score cp (-?\d+)/);
                if (match) {
                    const cp = parseInt(match[1], 10);
                    bestEval = turn === 'w' ? cp : -cp;
                }
            }
            if (line.startsWith('bestmove')) {
                engine.terminate();
                resolve(bestEval);
            }
        };

        engine.postMessage('uci');
        setTimeout(() => {
            engine.postMessage(`position fen ${fen}`);
            engine.postMessage('go depth 12');
        }, 100);
    });
}

export async function fetchLichessMove(fen, rating) {
    const ratingMin = rating - 200;
    const ratingMax = rating + 200;
    const time = 'bullet,blitz,rapid,classical';

    const url = `https://explorer.lichess.ovh/lichess?fen=${encodeURIComponent(fen)}&ratingMin=${ratingMin}&ratingMax=${ratingMax}&time=${time}`;

    try {
        const response = await fetch(url);
        if (!response.ok) return fetchStockfishMove(fen, rating);

        const data = await response.json();
        const total = data.total || data.moves.reduce((a, m) => a + m.white + m.draws + m.black, 0);
        if (!total) return fetchStockfishMove(fen, rating);

        const weighted = data.moves.map(m => ({
            ...m,
            probability: (m.white + m.draws + m.black) / total
        }));

        let r = Math.random(), acc = 0, chosen = weighted.at(-1);
        for (const m of weighted) {
            acc += m.probability;
            if (r < acc) {
                chosen = m;
                break;
            }
        }

        const pos = Chess.fromSetup(parseFen(fen).value).value;
        const clone = pos.clone();

        const toIndex = (sq) => (parseInt(sq[1]) - 1) * 8 + (sq.charCodeAt(0) - 'a'.charCodeAt(0));
        const move = { from: toIndex(chosen.uci.slice(0, 2)), to: toIndex(chosen.uci.slice(2, 4)) };
        clone.play(move);

        return {
            resultFen: makeFen(clone.toSetup()),
            moveSan: chosen.san,
            isMate: clone.isCheckmate(),
            startSquare: chosen.uci.slice(0, 2),
            endSquare: chosen.uci.slice(2, 4),
        };

    } catch (err) {
        console.error('Lichess fetch error:', err);
        return fetchStockfishMove(fen, rating);
    }
}

export function fetchStockfishMove(fen, rating) {
    return new Promise((resolve) => {
        const engine = new Worker('/legacy-site/js/stockfish.js');
        const skill = Math.max(0, Math.min(20, Math.round((rating - 800) / 80)));

        const setup = parseFen(fen);
        const pos = Chess.fromSetup(setup.value).value;
        const clone = pos.clone();

        engine.onmessage = (event) => {
            const line = event.data;
            if (!line.startsWith('bestmove')) return;

            const [_, best] = line.split(' ');
            if (!best || best.length < 4) return resolve(null);

            const from = best.slice(0, 2), to = best.slice(2, 4);
            const toIndex = (sq) => (parseInt(sq[1]) - 1) * 8 + (sq.charCodeAt(0) - 'a'.charCodeAt(0));
            const move = { from: toIndex(from), to: toIndex(to) };

            clone.play(move);

            resolve({
                resultFen: makeFen(clone.toSetup()),
                moveSan: makeSan(pos, move),
                isMate: clone.isCheckmate(),
                startSquare: from,
                endSquare: to,
            });

            engine.terminate();
        };

        engine.postMessage('uci');
        engine.postMessage(`setoption name Skill Level value ${skill}`);
        engine.postMessage(`position fen ${fen}`);
        engine.postMessage('go depth 12');
    });
}

export function generatePGN({ fen, moveHistorySAN, userColor, username }) {
    const game = defaultGame();
    const user = username || 'Guest';

    game.headers = new Map([
        ['Event', '960 Opening Practice'],
        ['Site', 'https://nine60openingpractice.onrender.com'],
        ['White', userColor === 'white' ? user : 'Somebody'],
        ['Black', userColor === 'black' ? user : 'Somebody'],
        ['Variant', 'Chess960'],
        ['SetUp', '1'],
        ['FEN', fen],
        ['Date', new Date().toISOString().split('T')[0].replace(/-/g, '.')],
    ]);

    const setup = parseFen(fen).value;
    const pos = Chess.fromSetup(setup).value;
    let node = game.moves;

    for (const san of moveHistorySAN) {
        const move = parseSan(pos, san);
        if (!move) break;
        const actualSan = makeSanAndPlay(pos, move);
        const child = new ChildNode({ san: actualSan });
        node.children.push(child);
        node = child;
    }

    return makePgn(game);
}

export function get_position(number, color = 'white') {
    const fen = freestyleNumberToFEN(number);
    const rows = fen.split(' ')[0].split('/');
    const board = Array.from({ length: 8 }, () => Array(8).fill(null));

    for (let r = 0; r < 8; r++) {
        let c = 0;
        for (const char of rows[r]) {
            if (!isNaN(char)) {
                c += parseInt(char);
            } else {
                board[r][c] = (color === 'white' ? char : char.toLowerCase());
                c++;
            }
        }
    }
}
