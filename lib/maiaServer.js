import { spawn } from 'child_process';

const DEFAULT_MODEL_REL_PATH = 'maia_model/best.pt';
const DEFAULT_SCRIPT_REL_PATH = 'maia_model/predict_move.py';

function parseJsonLine(raw) {
  if (!raw || typeof raw !== 'string') return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function getMaiaMoveFromFen({ fen, rating, opponentRating }) {
  const payload = JSON.stringify({
    fen,
    rating: Number.isFinite(Number(rating)) ? Number(rating) : 1500,
    opponentRating: Number.isFinite(Number(opponentRating)) ? Number(opponentRating) : Number.isFinite(Number(rating)) ? Number(rating) : 1500,
    modelPath: process.env.MAIA_MODEL_PATH || DEFAULT_MODEL_REL_PATH,
  });

  const pythonBin = process.env.MAIA_PYTHON_BIN || 'python';
  const scriptPath = process.env.MAIA_PREDICT_SCRIPT || DEFAULT_SCRIPT_REL_PATH;

  return new Promise((resolve) => {
    const child = spawn(pythonBin, [scriptPath], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';
    let settled = false;

    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill();
      resolve({
        ok: false,
        error: 'maia timeout',
      });
    }, 15000);

    child.stdout.on('data', (chunk) => {
      stdout += String(chunk || '');
    });
    child.stderr.on('data', (chunk) => {
      stderr += String(chunk || '');
    });

    child.on('error', (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve({
        ok: false,
        error: err?.message || 'failed to start maia process',
      });
    });

    child.on('close', () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      const line = stdout
        .split(/\r?\n/)
        .map((x) => x.trim())
        .filter(Boolean)
        .at(-1);
      const parsed = parseJsonLine(line);
      if (parsed?.ok && (parsed?.uci || parsed?.san)) {
        resolve({
          ok: true,
          uci: parsed.uci || null,
          san: parsed.san || null,
        });
        return;
      }
      resolve({
        ok: false,
        error:
          parsed?.error ||
          stderr.trim() ||
          'maia process returned invalid output',
      });
    });

    child.stdin.write(payload);
    child.stdin.end();
  });
}