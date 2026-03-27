import { createClient } from '@supabase/supabase-js';
import { parseFen, makeFen } from 'chessops/fen';
import { Chess as Chessops } from 'chessops/chess';
import { parseSan, makeSanAndPlay } from 'chessops/san';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function extractLichessGameId(linkToGame) {
  if (typeof linkToGame !== 'string') return null;
  try {
    const url = new URL(linkToGame);
    if (url.hostname !== 'lichess.org') return null;
    const parts = url.pathname.split('/').filter(Boolean);
    // /<gameId> or /<gameId>/<color>
    return parts[0] || null;
  } catch {
    // Might be a bare "lichess.org/xxxx" without scheme
    const m = linkToGame.match(/lichess\.org\/([A-Za-z0-9]{6,})/);
    return m?.[1] || null;
  }
}

async function fetchLichessPgn(gameId) {
  const url = `https://lichess.org/game/export/${encodeURIComponent(gameId)}.pgn?tags=true&moves=true&clocks=false&evals=false`;
  const resp = await fetch(url, {
    headers: {
      Accept: 'application/x-chess-pgn',
      'User-Agent': '960dojo (tactics)',
    },
  });
  if (!resp.ok) throw new Error(`Failed to fetch lichess PGN (${resp.status})`);
  return await resp.text();
}

async function fetchLichessJson(gameId) {
  const urls = [
    // Most reliable: explicit JSON with PGN included.
    `https://lichess.org/game/export/${encodeURIComponent(gameId)}?pgnInJson=true&tags=true&moves=true&clocks=false&evals=false`,
    // Some deployments accept extension
    `https://lichess.org/game/export/${encodeURIComponent(gameId)}.json?tags=true&moves=true&clocks=false&evals=false`,
    // Fallback attempt
    `https://lichess.org/game/export/${encodeURIComponent(gameId)}?tags=true&moves=true&clocks=false&evals=false`,
  ];

  let lastErr = null;
  for (const url of urls) {
    try {
      const resp = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': '960dojo (tactics)',
        },
      });
      if (!resp.ok) throw new Error(`status ${resp.status}`);
      const ct = resp.headers.get('content-type') || '';
      if (!ct.includes('application/json')) throw new Error(`non-json content-type: ${ct}`);
      return await resp.json();
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(`Failed to fetch lichess JSON (${lastErr?.message || 'unknown error'})`);
}

function extractPgnTag(pgn, tag) {
  const re = new RegExp(`^\\[${tag} \"(.*)\"\\]$`, 'm');
  const m = pgn.match(re);
  return m?.[1] || null;
}

function unwrapResult(r) {
  if (!r) return null;
  if (typeof r.unwrap === 'function') return r.unwrap();
  if ('value' in r) return r.value;
  return null;
}

function normalizeSanToken(san) {
  if (typeof san !== 'string') return '';
  return san
    .trim()
    .replace(/[?!]+/g, '')
    .replace(/[+#]+/g, '')
    .replace(/^0-0-0$/i, 'O-O-O')
    .replace(/^0-0$/i, 'O-O');
}

function fenAfterSanHalfmoves({ startFen, sanMoves, halfmoves }) {
  const setup = unwrapResult(parseFen(startFen));
  if (!setup) throw new Error('Invalid start FEN');

  const pos = unwrapResult(Chessops.fromSetup(setup));
  if (!pos) throw new Error('Illegal start position');

  const target = Math.max(0, Math.min(sanMoves.length, halfmoves));
  for (let i = 0; i < target; i++) {
    const token = normalizeSanToken(sanMoves[i]);
    const move = parseSan(pos, token);
    if (!move) throw new Error(`Invalid move: ${sanMoves[i]}`);
    makeSanAndPlay(pos, move);
  }

  return makeFen(pos.toSetup());
}

function parseSanMovesFromPgn(pgn) {
  // Remove tags
  const body = pgn
    .split('\n')
    .filter((line) => !line.startsWith('['))
    .join(' ')
    .trim();

  // Remove comments {}, variations (), and NAGs $...
  let s = body
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\$\d+/g, ' ');

  // Remove results
  s = s.replace(/\b1-0\b|\b0-1\b|\b1\/2-1\/2\b|\b\*\b/g, ' ');

  const tokens = s.split(/\s+/).filter(Boolean);
  const moves = [];
  function sanitize(token) {
    let t = token.trim();
    // Handle "12.O-O" or "12...O-O" (no space after move number)
    t = t.replace(/^\d+\.(\.\.)?/, '');
    t = t.replace(/^\d+\.\.\./, '');
    t = t.replace(/^\.+/, '');

    // Strip common suffix annotations and check/mate markers
    t = t.replace(/[?!]+/g, '');
    t = t.replace(/[+#]+/g, '');

    // Sometimes tokens end with move numbers due to malformed spacing
    t = t.replace(/^\d+$/, '');
    return t.trim();
  }
  for (const t of tokens) {
    // Skip move numbers like "12.", "12...", "12.."
    if (/^\d+\.(\.\.)?$/.test(t)) continue;
    if (/^\d+\.\.\.$/.test(t)) continue;
    const san = sanitize(t);
    if (!san) continue;
    moves.push(san);
  }
  return moves;
}

function computeFenAtHalfmoveFromPgn({ pgn, moveNrStart }) {
  const startFen = extractPgnTag(pgn, 'FEN');
  if (!startFen) throw new Error('PGN is missing FEN tag (Chess960 start position)');

  const gameMoves = parseSanMovesFromPgn(pgn); // SAN list
  // Your DB stores moveNrStart as "number of halfmoves denoting where in the game the puzzle starts".
  // To get the position *at* that start point, we must replay the preceding halfmoves.
  // This means we replay (moveNrStart - 1) moves if moveNrStart is 1-based.
  const startIndex = Math.max(0, (Number(moveNrStart) || 0) - 1);
  return fenAfterSanHalfmoves({ startFen, sanMoves: gameMoves, halfmoves: startIndex });
}

function computeFenAtHalfmoveFromLichessJson({ lichessGame, moveNrStart }) {
  // Lichess JSON uses initialFen for variants like Chess960.
  const startFen = lichessGame?.initialFen || lichessGame?.fen;
  if (!startFen || typeof startFen !== 'string') throw new Error('Lichess JSON is missing initialFen');

  const movesStr = lichessGame?.moves;
  if (typeof movesStr !== 'string') throw new Error('Lichess JSON is missing moves');
  // Note: Lichess JSON export provides SAN tokens (e.g. "f3", "O-O"), not UCI.
  const movesSan = movesStr.split(' ').map((s) => s.trim()).filter(Boolean);

  // moveNrStart is treated as 1-based halfmove index for puzzle start.
  const startIndex = Math.max(0, (Number(moveNrStart) || 0) - 1);
  return fenAfterSanHalfmoves({ startFen, sanMoves: movesSan, halfmoves: startIndex });
}

function parseDifficulty(difficulty) {
  // Difficulty is relative to user rating.
  // easy:   [-300, -100]
  // middle: [-100, +100]
  // hard:   [+100, +300]
  if (difficulty === 'easy') return { min: -300, max: -100 };
  if (difficulty === 'hard') return { min: 100, max: 300 };
  return { min: -100, max: 100 }; // middle (default)
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { userId, difficulty = 'middle' } = req.query || {};
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    const { data: ratingRow, error: ratingErr } = await supabaseAdmin
      .from('Rating')
      .select('value')
      .eq('userId', userId)
      .eq('type', 'tactics')
      .order('createdAt', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (ratingErr) return res.status(500).json({ error: ratingErr.message });
    const userRating = ratingRow?.value ?? 1500;

    const { min, max } = parseDifficulty(difficulty);
    const minRating = userRating + min;
    const maxRating = userRating + max;

    const { data: finishedRows, error: finishedErr } = await supabaseAdmin
      .from('UserTactic')
      .select('tacticId')
      .eq('userId', userId)
      .not('finished', 'is', null);
    if (finishedErr) return res.status(500).json({ error: finishedErr.message });
    const finishedIds = new Set((finishedRows || []).map((r) => r.tacticId));

    // 1) Try to find an unfinished tactic inside the desired rating band.
    const { data: bandTactics, error: bandErr } = await supabaseAdmin
      .from('Tactic')
      .select('id, rating, linkToGame, moveNrStart, moves, numTimesPlayed, disLikes')
      .gte('rating', minRating)
      .lte('rating', maxRating);
    if (bandErr) return res.status(500).json({ error: bandErr.message });

    const bandUnfinished = (bandTactics || []).filter((t) => !finishedIds.has(t.id));

    let chosen = null;
    if (bandUnfinished.length) {
      chosen = bandUnfinished[Math.floor(Math.random() * bandUnfinished.length)];
    } else {
      // 2) Fallback: pick closest unfinished tactic by rating diff.
      const { data: allTactics, error: allErr } = await supabaseAdmin
        .from('Tactic')
        .select('id, rating, linkToGame, moveNrStart, moves, numTimesPlayed, disLikes');
      if (allErr) return res.status(500).json({ error: allErr.message });

      const unfinished = (allTactics || []).filter((t) => !finishedIds.has(t.id));
      if (!unfinished.length) return res.status(404).json({ error: 'No unfinished tactics' });

      chosen = unfinished
        .map((t) => ({ t, diff: Math.abs((t.rating ?? 1500) - userRating) }))
        .sort((a, b) => a.diff - b.diff)[0].t;
    }

    // Ensure we have a UserTactic row on open, so the puzzle isn't "lost".
    const { data: existingProgress, error: progressErr } = await supabaseAdmin
      .from('UserTactic')
      .select('id, finished')
      .eq('userId', userId)
      .eq('tacticId', chosen.id)
      .maybeSingle();
    if (progressErr) return res.status(500).json({ error: progressErr.message });

    if (!existingProgress) {
      const { error: insertErr } = await supabaseAdmin.from('UserTactic').insert({
        id: crypto.randomUUID(),
        userId,
        tacticId: chosen.id,
        solved: false,
        finished: null,
      });
      if (insertErr) return res.status(500).json({ error: insertErr.message });
    }

    if (!chosen?.linkToGame) return res.status(500).json({ error: 'Tactic is missing linkToGame' });
    if (!Array.isArray(chosen?.moves)) return res.status(500).json({ error: 'Tactic is missing moves[]' });

    const gameId = extractLichessGameId(chosen.linkToGame);
    if (!gameId) return res.status(500).json({ error: 'Invalid linkToGame (must be lichess.org game link)' });

    let startFen = null;
    try {
      const lichessGame = await fetchLichessJson(gameId);
      startFen = computeFenAtHalfmoveFromLichessJson({ lichessGame, moveNrStart: chosen.moveNrStart });
    } catch (e) {
      // PGN fallback is known to be unreliable for Chess960 castling SAN (O-O/O-O-O).
      // Keep it only as a last resort with a clearer error message.
      try {
        const pgn = await fetchLichessPgn(gameId);
        startFen = computeFenAtHalfmoveFromPgn({ pgn, moveNrStart: chosen.moveNrStart });
      } catch (pgnErr) {
        throw new Error(
          `Failed to compute start position. JSON export error: ${e?.message || e}. PGN fallback error: ${pgnErr?.message || pgnErr}`
        );
      }
    }

    return res.status(200).json({
      tactic: {
        id: chosen.id,
        rating: chosen.rating,
        linkToGame: chosen.linkToGame,
        moveNrStart: chosen.moveNrStart,
        numTimesPlayed: chosen.numTimesPlayed,
        disLikes: chosen.disLikes,
        startFen,
        puzzleLine: chosen.moves, // SAN[] that user must follow from startFen
      },
      userRating,
    });
  } catch (e) {
    console.error('[api/tactics/next] error:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}

