import { Chess } from 'chessops/chess';
import { parseFen, makeFen } from 'chessops/fen';
import { makeSan } from 'chessops/san';
import { algebraicToSquare, squareToAlgebraic } from './chessopsUtils';

/** @typedef {{ worker: Worker|null, ready: boolean, jobQueue: Array<Function>, jobRunning: boolean, warmPromise: Promise<void>|null }} SfState */

const SF_STATE_KEY = '__960dojoStockfishState';

/** Persist on `globalThis` so Next.js Fast Refresh does not reset module `let`s and orphan the worker or spawn a second one. */
function getSfState() {
  const g = typeof globalThis !== 'undefined' ? globalThis : {};
  if (!g[SF_STATE_KEY]) {
    g[SF_STATE_KEY] = {
      worker: null,
      ready: false,
      jobQueue: [],
      jobRunning: false,
      warmPromise: null,
    };
  }
  return /** @type {SfState} */ (g[SF_STATE_KEY]);
}

/**
 * Start the Stockfish worker early. First activation otherwise pays a large one-time cost
 * (fetching ~100MB+ WASM/NNUE and compiling it) before any `go` command runs.
 * One worker stays in memory for the tab; warming only moves that work earlier.
 * Safe to call from any page; no-op on the server.
 */
export function warmStockfish() {
  if (typeof window === 'undefined') return Promise.resolve();
  const s = getSfState();
  if (s.ready) return Promise.resolve();
  if (!s.warmPromise) {
    getSfWorker();
    s.warmPromise = new Promise((resolve) => {
      if (s.ready) {
        resolve();
        return;
      }
      const engine = s.worker;
      const onMsg = (e) => {
        if (e.data === 'readyok') {
          engine.removeEventListener('message', onMsg);
          resolve();
        }
      };
      engine.addEventListener('message', onMsg);
    });
  }
  return s.warmPromise;
}

function getSfWorker() {
  const s = getSfState();
  if (s.worker) return s.worker;

  s.worker = new Worker("/stockfish-18.js");

  s.worker.addEventListener('message', function init(event) {
    const line = event.data;
    if (typeof line !== 'string') return;

    if (line === 'uciok') {
      const threads = Math.min(navigator.hardwareConcurrency || 2, 8);
      const memory = navigator.deviceMemory || 4;
      const hashSize = Math.min(Math.floor(memory * 32), 512);
      s.worker.postMessage(`setoption name Threads value ${threads}`);
      s.worker.postMessage(`setoption name Hash value ${hashSize}`);
      s.worker.postMessage(`setoption name UCI_Chess960 value true`);
      s.worker.postMessage('isready');
    }

    if (line === 'readyok') {
      console.log('Stockfish is READY!');
      s.ready = true;
      s.worker.removeEventListener('message', init);
    }
  });

  s.worker.postMessage('uci');
  return s.worker;
}

// Enqueue a job. Each job is a function that receives the engine and a `done`
// callback it MUST call when it receives `bestmove`, so the next job can start.
function sfJob(jobFn) {
  const s = getSfState();
  s.jobQueue.push(jobFn);
  sfFlushQueue();
}

function sfFlushQueue() {
  const s = getSfState();
  if (s.jobRunning || s.jobQueue.length === 0) return;

  const engine = getSfWorker();
  if (!s.ready) {
    engine.addEventListener('message', function waitReady(event) {
      if (event.data === 'readyok') {
        engine.removeEventListener('message', waitReady);
        sfFlushQueue();
      }
    });
    return;
  }

  s.jobRunning = true;
  const jobFn = s.jobQueue.shift();
  jobFn(engine, function done() {
    s.jobRunning = false;
    sfFlushQueue();
  });
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
  return closest;
}

export function getStockfishMove(fen, rating) {
  return new Promise((resolve) => {
    console.log('New request for :', fen);
    const skillLevel = getRandomSkillLevel(rating);

    sfJob((engine, done) => {
      function onMessage(event) {
        const line = event.data;
        if (typeof line !== 'string') return;

        if (line.startsWith('bestmove')) {
          console.log('[JOB] Best move received:', line);
          engine.removeEventListener('message', onMessage);
          done();

          const parts = line.split(' ');
          const bestMove = parts[1];
          if (!bestMove || bestMove.length < 4) return resolve(null);

          // Use chessops to convert UCI to SAN
          const setup = parseFen(fen);
          if (setup.isErr) return resolve(null);

          const posResult = Chess.fromSetup(setup.value);
          if (posResult.isErr) return resolve(null);

          const position = posResult.unwrap();

          const from = bestMove.slice(0, 2);
          const to = bestMove.slice(2, 4);

          const fromIdx = algebraicToSquare(from);
          const toIdx = algebraicToSquare(to);
          const move = { from: fromIdx, to: toIdx };

          // Get SAN
          const san = makeSan(position, move);

          // Play move to get result FEN
          position.play(move);
          const resultFen = makeFen(position.toSetup());

          console.log('Converted to SAN:', san);

          return resolve({
            san,
            resultFen,
            startSquare: from,
            endSquare: to
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

/**
 * Static analysis from White's perspective.
 * - Non-mate: centipawns (e.g. +34, -120)
 * - Mate: centipawns encoding ±((100 + movesToMate) * 100).
 *   This keeps `evalHistory` an `int[]` in Supabase, while the frontend can still detect mate
 *   after converting to pawns: \(|eval|/100 > 100\).
 */
export function evalFenDepthCpWhite(fen, depth) {
  return new Promise((resolve) => {
    const parts = fen.split(/\s+/);
    const turn = parts[1] === 'b' ? 'b' : 'w';

    sfJob((engine, done) => {
      let lastDepth = 0;
      let cp = null;
      let mate = null;

      function onMessage(event) {
        const line = event.data;
        if (typeof line !== 'string') return;

        if (line.startsWith('info') && /\bdepth\b/.test(line)) {
          const dM = line.match(/\bdepth (\d+)/);
          const d = dM ? parseInt(dM[1], 10) : 0;
          if (d < lastDepth) return;
          const cpM = line.match(/score cp (-?\d+)/);
          const mateM = line.match(/score mate (-?\d+)/);
          if (mateM) {
            lastDepth = d;
            mate = parseInt(mateM[1], 10);
            cp = null;
          } else if (cpM) {
            lastDepth = d;
            cp = parseInt(cpM[1], 10);
            mate = null;
          }
        }

        if (line.startsWith('bestmove')) {
          engine.removeEventListener('message', onMessage);
          done();

          if (mate !== null) {
            const absMate = Math.abs(mate);
            const mateEncodedForStm = (mate > 0 ? 1 : -1) * (100 + absMate) * 100;
            const forWhite = turn === 'w' ? mateEncodedForStm : -mateEncodedForStm;
            resolve(forWhite);
            return;
          }
          if (cp === null) {
            resolve(null);
            return;
          }
          const stmCp = turn === 'w' ? cp : -cp;
          resolve(stmCp);
        }
      }

      engine.addEventListener('message', onMessage);
      engine.postMessage('setoption name Skill Level value 20');
      engine.postMessage(`position fen ${fen}`);
      engine.postMessage(`go depth ${depth}`);
    });
  });
}

/**
 * Analyze a position up to `depth` and stream intermediate depth/score updates.
 * Returns a cancel function.
 */
export function analyzeFenCpWhiteStream(fen, depth, { onInfo, onDone } = {}) {
  let cancelled = false;
  let engineRef = null;

  sfJob((engine, done) => {
    if (cancelled) {
      done();
      return;
    }
    engineRef = engine;
    const parts = fen.split(/\s+/);
    const turn = parts[1] === 'b' ? 'b' : 'w';
    let lastDepth = 0;
    let cp = null;
    let mate = null;

    function scoreForWhite() {
      if (mate !== null) {
        const absMate = Math.abs(mate);
        const mateEncodedForStm = (mate > 0 ? 1 : -1) * (100 + absMate) * 100;
        return turn === 'w' ? mateEncodedForStm : -mateEncodedForStm;
      }
      if (!Number.isFinite(cp)) return null;
      return turn === 'w' ? cp : -cp;
    }

    function onMessage(event) {
      const line = event.data;
      if (typeof line !== 'string') return;

      if (line.startsWith('info') && /\bdepth\b/.test(line)) {
        const dM = line.match(/\bdepth (\d+)/);
        const d = dM ? parseInt(dM[1], 10) : 0;
        if (d < lastDepth) return;
        const cpM = line.match(/score cp (-?\d+)/);
        const mateM = line.match(/score mate (-?\d+)/);
        if (mateM) {
          lastDepth = d;
          mate = parseInt(mateM[1], 10);
          cp = null;
        } else if (cpM) {
          lastDepth = d;
          cp = parseInt(cpM[1], 10);
          mate = null;
        }
        if (!cancelled && onInfo) {
          onInfo({ depth: lastDepth, cpWhite: scoreForWhite() });
        }
      }

      if (line.startsWith('bestmove')) {
        engine.removeEventListener('message', onMessage);
        done();
        if (!cancelled && onDone) {
          onDone({ depth: lastDepth, cpWhite: scoreForWhite() });
        }
      }
    }

    engine.addEventListener('message', onMessage);
    engine.postMessage('setoption name Skill Level value 20');
    engine.postMessage(`position fen ${fen}`);
    engine.postMessage(`go depth ${depth}`);
  });

  return () => {
    cancelled = true;
    if (engineRef) {
      engineRef.postMessage('stop');
    }
  };
}

function uciTokenToMove(uci) {
  if (!uci || typeof uci !== 'string' || uci.length < 4) return null;
  const from = algebraicToSquare(uci.slice(0, 2));
  const to = algebraicToSquare(uci.slice(2, 4));
  if (from === undefined || to === undefined) return null;
  const move = { from, to };
  if (uci.length >= 5) {
    const c = uci[4].toLowerCase();
    const prom = { q: 'queen', r: 'rook', b: 'bishop', n: 'knight' }[c];
    if (prom) move.promotion = prom;
  }
  return move;
}

/** Convert a principal-variation UCI list (from a FEN) to SAN movetext for display. */
export function uciPvToSanString(startFen, uciPlies, maxPlies = 14) {
  if (!startFen || !Array.isArray(uciPlies) || uciPlies.length === 0) return '';
  const parsed = parseFen(startFen.trim());
  if (parsed.isErr) return '';
  const cr = Chess.fromSetup(parsed.value);
  if (cr.isErr) return '';
  const pos = cr.unwrap();
  const sans = [];
  const n = Math.min(uciPlies.length, maxPlies);
  for (let i = 0; i < n; i += 1) {
    const move = uciTokenToMove(uciPlies[i]);
    if (!move) break;
    const ctx = pos.ctx();
    if (!pos.isLegal(move, ctx)) break;
    sans.push(makeSan(pos, move));
    pos.play(move);
  }
  return sans.join(' ');
}

/**
 * MultiPV analysis: streams best `multipv` lines with UCI PVs. Resets MultiPV to 1 after the job.
 * `onInfo` receives `{ depth, cpWhite, lines }` where `lines` are sorted by multipv rank (1 = best).
 * Each line: `{ multipv, depth, cpWhite, pvUci, firstFrom, firstTo }`.
 */
export function analyzeFenMultipvStream(fen, depth, { multipv = 5, onInfo, onDone } = {}) {
  let cancelled = false;
  let engineRef = null;
  const pvCount = Math.min(5, Math.max(1, multipv | 0));

  sfJob((engine, done) => {
    if (cancelled) {
      done();
      return;
    }
    engineRef = engine;
    const parts = fen.split(/\s+/);
    const turn = parts[1] === 'b' ? 'b' : 'w';

    function lineScoreForWhite(cp, mate) {
      if (mate !== null && mate !== undefined) {
        const absMate = Math.abs(mate);
        const mateEncodedForStm = (mate > 0 ? 1 : -1) * (100 + absMate) * 100;
        return turn === 'w' ? mateEncodedForStm : -mateEncodedForStm;
      }
      if (!Number.isFinite(cp)) return null;
      return turn === 'w' ? cp : -cp;
    }

    /** @type {Map<number, { depth: number, cp: number|null, mate: number|null, pv: string[] }>} */
    const byRank = new Map();

    function buildLines() {
      const lines = [];
      for (let r = 1; r <= pvCount; r += 1) {
        const row = byRank.get(r);
        if (!row?.pv?.length) continue;
        const uci0 = row.pv[0];
        if (!uci0 || uci0.length < 4) continue;
        const firstFrom = uci0.slice(0, 2);
        const firstTo = uci0.slice(2, 4);
        lines.push({
          multipv: r,
          depth: row.depth,
          cpWhite: lineScoreForWhite(row.cp, row.mate),
          pvUci: row.pv,
          firstFrom,
          firstTo,
        });
      }
      return lines;
    }

    function onMessage(event) {
      const line = event.data;
      if (typeof line !== 'string') return;

      if (line.startsWith('info') && /\bmultipv\b/.test(line) && /\bpv\b/.test(line)) {
        if (/\bupperbound\b|\blowerbound\b/.test(line)) return;

        const dM = line.match(/\bdepth (\d+)/);
        const d = dM ? parseInt(dM[1], 10) : 0;
        const mpM = line.match(/\bmultipv (\d+)/);
        const mp = mpM ? parseInt(mpM[1], 10) : 1;
        if (mp < 1 || mp > pvCount) return;

        let cp = null;
        let mate = null;
        const mateM = line.match(/\bscore mate (-?\d+)/);
        const cpM = line.match(/\bscore cp (-?\d+)/);
        if (mateM) mate = parseInt(mateM[1], 10);
        else if (cpM) cp = parseInt(cpM[1], 10);
        else return;

        const pvMatch = line.match(/\bpv (.+)$/);
        const pvStr = pvMatch ? pvMatch[1].trim() : '';
        const pv = pvStr.split(/\s+/).filter(Boolean);
        if (!pv.length) return;

        const prev = byRank.get(mp);
        if (prev && d < prev.depth) return;

        byRank.set(mp, { depth: d, cp, mate, pv });

        if (!cancelled && onInfo) {
          const lines = buildLines();
          const first = byRank.get(1);
          const cpWhite1 = first ? lineScoreForWhite(first.cp, first.mate) : null;
          const depths = [...byRank.values()].map((x) => x.depth);
          const maxDepth = depths.length ? Math.max(...depths) : 0;
          onInfo({ depth: maxDepth, cpWhite: cpWhite1, lines });
        }
      }

      if (line.startsWith('bestmove')) {
        engine.removeEventListener('message', onMessage);
        engine.postMessage('setoption name MultiPV value 1');
        done();
        if (!cancelled && onDone) {
          const first = byRank.get(1);
          const cpWhite1 = first ? lineScoreForWhite(first.cp, first.mate) : null;
          const depths = [...byRank.values()].map((x) => x.depth);
          const maxDepth = depths.length ? Math.max(...depths) : 0;
          const lines = buildLines();
          onDone({ depth: maxDepth, cpWhite: cpWhite1, lines });
        }
      }
    }

    engine.addEventListener('message', onMessage);
    engine.postMessage('setoption name Skill Level value 20');
    engine.postMessage(`setoption name MultiPV value ${pvCount}`);
    engine.postMessage(`position fen ${fen}`);
    engine.postMessage(`go depth ${depth}`);
  });

  return () => {
    cancelled = true;
    if (engineRef) {
      engineRef.postMessage('stop');
    }
  };
}

