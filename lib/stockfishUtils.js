import { Chess } from 'chessops/chess';
import { parseFen, makeFen } from 'chessops/fen';
import { makeSan } from 'chessops/san';
import { algebraicToSquare, squareToAlgebraic } from './chessopsUtils';

// Stockfish worker - Module-level variables - persist for the lifetime of the app
let sfWorker = null;
let sfReady = false;
let sfJobQueue = [];
let sfJobRunning = false;

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
      console.log('🐟 Stockfish is READY!');
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
    console.log('🐟 New request for :', fen);
    const skillLevel = getRandomSkillLevel(rating);

    sfJob((engine, done) => {
      function onMessage(event) {
        const line = event.data;
        if (typeof line !== 'string') return;

        if (line.startsWith('bestmove')) {
          console.log('🐟 [JOB] Best move received:', line);
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

          console.log('🐟 Converted to SAN:', san);

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
 * Static analysis: centipawns from White's perspective (mate ≈ ±32000).
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
            const mateCp = mate > 0 ? 32000 : -32000;
            const forWhite = turn === 'w' ? mateCp : -mateCp;
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

