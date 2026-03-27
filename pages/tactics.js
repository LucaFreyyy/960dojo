import Head from 'next/head';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { useSupabaseSession } from '../lib/SessionContext';
async function hashEmail(email) {
  const encoder = new TextEncoder();
  const data = encoder.encode(email);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
function pieceToAsset(piece) {
  if (!piece) return null;
  const color = piece.color === 'w' ? 'w' : 'b';
  const map = { p: 'P', n: 'N', b: 'B', r: 'R', q: 'Q', k: 'K' };
  return `/legacy-site/pieces/${color}_${map[piece.type]}.svg`;
}
function parseLine(raw) {
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw === 'string') return raw.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
  return [];
}

function normalizeSan(san) {
  if (typeof san !== 'string') return '';
  return san
    .replace(/[?!]+/g, '')
    .replace(/[+#]+/g, '')
    .replace(/^0-0-0$/i, 'O-O-O')
    .replace(/^0-0$/i, 'O-O')
    .trim();
}

function playSanOnBoard(chess, san) {
  const target = normalizeSan(san);
  const verbose = chess.moves({ verbose: true });
  const isKingCastle = target === 'O-O';
  const isQueenCastle = target === 'O-O-O';
  const match =
    verbose.find((m) => normalizeSan(m.san) === target) ||
    (isKingCastle ? verbose.find((m) => String(m.flags || '').includes('k')) : null) ||
    (isQueenCastle ? verbose.find((m) => String(m.flags || '').includes('q')) : null) ||
    ((isKingCastle || isQueenCastle) ? verbose.find((m) => normalizeSan(m.san).startsWith(target)) : null);
  if (match) return chess.move({ from: match.from, to: match.to, promotion: match.promotion });
  return chess.move(san, { sloppy: true });
}

function lichessGameUrlAtPly(linkToGame, ply) {
  if (typeof linkToGame !== 'string' || !linkToGame) return null;
  const p = Number(ply);
  // Keep consistent with backend: moveNrStart is treated as 1-based halfmove index.
  const safePly = Number.isFinite(p) && p >= 1 ? Math.floor(p) - 1 : 0;
  return linkToGame.split('#')[0] + `#${safePly}`;
}

function squareFromDisplay({ r, f, flip }) {
  const files = 'abcdefgh';
  if (!flip) return `${files[f]}${8 - r}`;
  return `${files[7 - f]}${r + 1}`;
}

function displayFromSquare({ square, flip }) {
  const files = 'abcdefgh';
  const f = files.indexOf(square[0]);
  const rank = Number(square[1]);
  if (!flip) return { r: 8 - rank, f };
  return { r: rank - 1, f: 7 - f };
}

function drawArrow(ctx, x1, y1, x2, y2, color) {
  const headLen = 14;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const angle = Math.atan2(dy, dx);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}

export default function TacticsPage() {
  const session = useSupabaseSession();
  const [userId, setUserId] = useState(null);
  const [difficulty, setDifficulty] = useState('middle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userRating, setUserRating] = useState(1500);
  const [tactic, setTactic] = useState(null);
  const [tacticRating, setTacticRating] = useState(null);
  const [puzzleLineSan, setPuzzleLineSan] = useState([]);
  const [chess, setChess] = useState(null);
  const [selected, setSelected] = useState(null);
  const [legalTargets, setLegalTargets] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [plyIndex, setPlyIndex] = useState(0);
  const [movesSanPlayed, setMovesSanPlayed] = useState([]);
  const [fenHistory, setFenHistory] = useState([]);
  const [viewIndex, setViewIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [solved, setSolved] = useState(false);
  const [ratingDelta, setRatingDelta] = useState(null);
  const [gameLinkAtStart, setGameLinkAtStart] = useState(null);
  const [likeChoice, setLikeChoice] = useState(null); // true | false | null
  const [playerColor, setPlayerColor] = useState('white'); // orientation: side to move at puzzle start
  const [dragFrom, setDragFrom] = useState(null);
  const [highlights, setHighlights] = useState(() => ({})); // square -> 'y' | 'b'
  const [arrows, setArrows] = useState([]); // {from,to,color}
  const [arrowStart, setArrowStart] = useState(null);
  const [arrowCtrl, setArrowCtrl] = useState(false);
  const [arrowHover, setArrowHover] = useState(null);

  const boardRef = useRef(null);
  const flip = playerColor === 'black';

  useEffect(() => {
    const canvas = document.getElementById('tactics-arrow-layer');
    const container = boardRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width));
    canvas.height = Math.max(1, Math.floor(rect.height));
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const center = (sq) => {
      const { r, f } = displayFromSquare({ square: sq, flip });
      const size = canvas.width / 8;
      return { x: (f + 0.5) * size, y: (r + 0.5) * size };
    };

    for (const a of arrows) {
      const p1 = center(a.from);
      const p2 = center(a.to);
      drawArrow(ctx, p1.x, p1.y, p2.x, p2.y, a.color || '#f59e0b');
    }

    if (arrowStart && arrowHover && arrowStart !== arrowHover) {
      const p1 = center(arrowStart);
      const p2 = center(arrowHover);
      drawArrow(ctx, p1.x, p1.y, p2.x, p2.y, arrowCtrl ? '#60a5fa' : '#f59e0b');
    }
  }, [arrows, arrowStart, arrowHover, arrowCtrl, flip]);

  useEffect(() => {
    // Resize/redraw arrows on resize
    const onResize = () => {
      // trigger redraw by updating hover to itself
      setArrowHover((h) => h);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  useEffect(() => {
    if (!session?.user?.email) return setUserId(null);
    hashEmail(session.user.email).then(setUserId).catch(() => setUserId(null));
  }, [session]);
  const board = useMemo(() => (chess ? chess.board() : []), [chess, chess?.fen()]);
  const displayFen = useMemo(() => {
    if (!chess) return null;
    if (!finished) return chess.fen();
    return fenHistory[viewIndex] || chess.fen();
  }, [chess, finished, fenHistory, viewIndex]);

  const displayChess = useMemo(() => {
    if (!displayFen) return null;
    return new Chess(displayFen, { chess960: true });
  }, [displayFen]);

  const displayBoard = useMemo(() => (displayChess ? displayChess.board() : []), [displayChess, displayChess?.fen()]);

  useEffect(() => {
    if (!finished) return;
    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft') setViewIndex((v) => Math.max(0, v - 1));
      if (e.key === 'ArrowRight') setViewIndex((v) => Math.min((fenHistory?.length || 1) - 1, v + 1));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [finished, fenHistory?.length]);
  function resetUiForNewPuzzle() {
    setError('');
    setFinished(false);
    setSolved(false);
    setRatingDelta(null);
    setGameLinkAtStart(null);
    setLikeChoice(null);
    setSelected(null);
    setLegalTargets([]);
    setLastMove(null);
    setMovesSanPlayed([]);
    setPlyIndex(0);
    setFenHistory([]);
    setViewIndex(0);
    setPlayerColor('white');
    setDragFrom(null);
    setHighlights({});
    setArrows([]);
    setArrowStart(null);
    setArrowCtrl(false);
    setArrowHover(null);
  }
  async function loadNext() {
    if (!userId) {
      setError('Log in to play tactics rated.');
      return;
    }
    setLoading(true);
    resetUiForNewPuzzle();
    try {
      const res = await fetch(
        `/api/tactics/next?userId=${encodeURIComponent(userId)}&difficulty=${encodeURIComponent(difficulty)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to load tactic');

      const nextTactic = data?.tactic;
      const startFen = nextTactic?.startFen;
      const line = nextTactic?.puzzleLine;
      if (!startFen || typeof startFen !== 'string') {
        setChess(null);
        setTactic(nextTactic || null);
        setTacticRating(nextTactic?.rating ?? null);
        setUserRating(data.userRating ?? 1500);
        setPuzzleLineSan([]);
        throw new Error('Failed to compute Chess960 start position for this tactic.');
      }

      if (!Array.isArray(line) || !line.length) {
        setChess(null);
        setTactic(nextTactic || null);
        setTacticRating(nextTactic?.rating ?? null);
        setUserRating(data.userRating ?? 1500);
        setPuzzleLineSan([]);
        throw new Error('Tactic is missing puzzleLine moves.');
      }

      setUserRating(data.userRating ?? 1500);
      setTactic(nextTactic);
      setTacticRating(nextTactic?.rating ?? null);
      setPuzzleLineSan(parseLine(line));
      const c = new Chess(startFen, { chess960: true });
      setChess(c);
      setFenHistory([c.fen()]);
      setViewIndex(0);
      setPlayerColor(c.turn() === 'b' ? 'black' : 'white');
      setGameLinkAtStart(lichessGameUrlAtPly(nextTactic?.linkToGame, nextTactic?.moveNrStart));
    } catch (e) {
      setError(e?.message || 'Error');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (!userId) return;
    loadNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
  function computeLegalTargets(from) {
    if (!chess) return [];
    return chess.moves({ square: from, verbose: true }).map((m) => m.to);
  }
  async function finishPuzzle(didSolve) {
    if (!tactic) return;
    setFinished(true);
    setSolved(didSolve);
    try {
      const res = await fetch('/api/tactics/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tacticId: tactic.id, solved: didSolve, liked: likeChoice }),
      });
      const data = await res.json();
      if (res.ok) {
        setUserRating(data.userRating ?? userRating);
        setTacticRating(data.tacticRating ?? tacticRating);
        setRatingDelta(data.delta ?? null);
      }
    } catch {}
    try {
    } catch {}
  }
  function attemptMove(from, to) {
    if (!chess || finished || loading) return;
    const mv = chess.move({ from, to, promotion: 'q' });
    if (!mv) return;

    setChess(new Chess(chess.fen(), { chess960: true }));
    setSelected(null);
    setLegalTargets([]);
    setLastMove({ from, to });
    setMovesSanPlayed((prev) => [...prev, mv.san]);
    setFenHistory((prev) => [...prev, chess.fen()]);
    if (finished) return;

    const expected = puzzleLineSan[plyIndex];
    if (!expected || normalizeSan(expected) !== normalizeSan(mv.san)) {
      finishPuzzle(false);
      return;
    }

    const nextPly = plyIndex + 1;
    setPlyIndex(nextPly);
    const reply = puzzleLineSan[nextPly];
    if (!reply) {
      finishPuzzle(true);
      return;
    }
    setTimeout(() => {
      const rmove = playSanOnBoard(chess, reply);
      if (!rmove) return finishPuzzle(true);
      setChess(new Chess(chess.fen(), { chess960: true }));
      setLastMove({ from: rmove.from, to: rmove.to });
      setMovesSanPlayed((prev) => [...prev, rmove.san]);
      setFenHistory((prev) => [...prev, chess.fen()]);
      setPlyIndex((prev) => prev + 1);
      if (!puzzleLineSan[nextPly + 1]) finishPuzzle(true);
    }, 250);
  }

  async function onSquareClick(square) {
    if (!chess || finished || loading) return;
    if (!selected) {
      const p = chess.get(square);
      if (!p) return;
      setSelected(square);
      setLegalTargets(computeLegalTargets(square));
      return;
    }
    if (square === selected) {
      setSelected(null);
      setLegalTargets([]);
      return;
    }
    if (!legalTargets.includes(square)) {
      const p = chess.get(square);
      if (!p) return;
      setSelected(square);
      setLegalTargets(computeLegalTargets(square));
      return;
    }
    const from = selected;
    const to = square;
    attemptMove(from, to);
  }
  return (
    <>
      <Head>
        <title>Tactics - 960 Dojo</title>
      </Head>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0 }}>Tactics</h1>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ background: '#111827', color: '#e5e7eb', padding: '0.45rem 0.75rem', borderRadius: 10 }}>
              User: {userRating}
              {typeof ratingDelta === 'number' ? ` (${ratingDelta >= 0 ? '+' : ''}${ratingDelta})` : ''}
            </span>
            <span style={{ background: '#111827', color: '#e5e7eb', padding: '0.45rem 0.75rem', borderRadius: 10 }}>
              Puzzle: {tacticRating ?? '—'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {['easy', 'middle', 'hard'].map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              disabled={loading}
              style={{
                padding: '0.5rem 0.9rem',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                background: difficulty === d ? '#3b82f6' : '#1f2937',
                color: difficulty === d ? 'white' : '#e5e7eb',
                fontWeight: 700,
              }}
            >
              {d}
            </button>
          ))}
          <button
            onClick={loadNext}
            disabled={loading || !userId}
            style={{
              marginLeft: 'auto',
              padding: '0.6rem 1rem',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              background: '#10b981',
              color: 'white',
              fontWeight: 800,
            }}
          >
            Next puzzle
          </button>
        </div>
        {error ? <div style={{ marginTop: '1rem', color: '#ef4444', fontWeight: 600 }}>{error}</div> : null}
        {!userId ? <div style={{ marginTop: '1rem', color: '#6b7280' }}>Log in to play tactics rated.</div> : null}
        {tactic?.startFen ? (
          <div style={{ marginTop: '0.75rem', color: '#6b7280', fontSize: '0.9rem', wordBreak: 'break-word' }}>
            Tactic #{tactic.id} · moveNrStart: {tactic.moveNrStart ?? '—'} · startFEN: {tactic.startFen} · link: {tactic.linkToGame}
          </div>
        ) : null}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 600px) 1fr', gap: '2rem', marginTop: '1.25rem' }}>
          <section className="chessboard-container" style={{ maxWidth: 600 }} ref={boardRef}>
            <div className="chessboard">
              {Array.from({ length: 8 }).map((_, r) => {
                const rr = flip ? 7 - r : r;
                const row = displayBoard[rr] || [];
                return (
                  <div className="chessboard-row" key={r}>
                    {Array.from({ length: 8 }).map((_, f) => {
                      const ff = flip ? 7 - f : f;
                      const square = squareFromDisplay({ r, f, flip });
                      const isLight = (r + f) % 2 === 0;
                      const piece = row[ff];
                      const isSelected = selected === square;
                      const isTarget = legalTargets.includes(square);
                      const isLast = lastMove && (lastMove.from === square || lastMove.to === square);
                      const hl = highlights?.[square];
                      const cls = [
                        'chessboard-square',
                        isLight ? 'light' : 'dark',
                        isSelected || isTarget ? 'highlighted' : '',
                        isLast ? 'last-move' : '',
                      ]
                        .filter(Boolean)
                        .join(' ');
                      return (
                        <div
                          key={`${r}-${f}`}
                          className={cls}
                          onClick={() => onSquareClick(square)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (dragFrom) attemptMove(dragFrom, square);
                            setDragFrom(null);
                          }}
                          onContextMenu={(e) => e.preventDefault()}
                          onMouseDown={(e) => {
                            if (e.button !== 2) return;
                            setArrowStart(square);
                            setArrowHover(square);
                            setArrowCtrl(!!e.ctrlKey);
                          }}
                          onMouseEnter={() => {
                            if (!arrowStart) return;
                            setArrowHover(square);
                          }}
                          onMouseUp={(e) => {
                            if (e.button !== 2) return;
                            if (!arrowStart) return;
                            const from = arrowStart;
                            const to = square;
                            const color = arrowCtrl ? '#60a5fa' : '#f59e0b';
                            if (from === to) {
                              setHighlights((prev) => {
                                const next = { ...(prev || {}) };
                                const cur = next[from];
                                const want = arrowCtrl ? 'b' : 'y';
                                if (cur === want) delete next[from];
                                else next[from] = want;
                                return next;
                              });
                            } else {
                              setArrows((prev) => [...prev, { from, to, color }]);
                            }
                            setArrowStart(null);
                            setArrowHover(null);
                            setArrowCtrl(false);
                          }}
                          role="button"
                          tabIndex={0}
                          aria-label={square}
                          style={
                            hl
                              ? {
                                  boxShadow:
                                    hl === 'b'
                                      ? 'inset 0 0 0 4px rgba(96,165,250,0.7)'
                                      : 'inset 0 0 0 4px rgba(245,158,11,0.7)',
                                }
                              : undefined
                          }
                        >
                          {piece ? (
                            <img
                              className="chessboard-piece"
                              alt=""
                              src={pieceToAsset(piece)}
                              draggable={!finished}
                              onDragStart={() => setDragFrom(square)}
                              onDragEnd={() => setDragFrom(null)}
                            />
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            <canvas
              id="tactics-arrow-layer"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 20 }}
            />
          </section>
          <section style={{ minWidth: 260 }}>
            <div style={{ background: '#0b1220', color: '#e5e7eb', padding: '1rem', borderRadius: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Status</div>
              <div style={{ color: '#cbd5e1' }}>
                {loading ? 'Loading puzzle…' : finished ? (solved ? 'Solved' : 'Failed') : 'Your move'}
              </div>
              <div style={{ marginTop: '0.75rem', color: '#cbd5e1' }}>
                Progress: {plyIndex}/{puzzleLineSan.length || 0}
              </div>
            </div>
            {finished ? (
              <div style={{ marginTop: '1rem', background: '#111827', color: '#e5e7eb', padding: '1rem', borderRadius: 12 }}>
                {gameLinkAtStart ? (
                  <button
                    onClick={() => window.open(gameLinkAtStart, '_blank')}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.9rem',
                      borderRadius: 10,
                      border: 'none',
                      cursor: 'pointer',
                      background: '#10b981',
                      color: 'white',
                      fontWeight: 900,
                      marginBottom: '0.75rem',
                    }}
                  >
                    Open game at puzzle start
                  </button>
                ) : null}
                {/* Lichess Analysis button removed; use "Open game at puzzle start" above */}
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.75rem' }}>
                  <button
                    onClick={() => setLikeChoice(true)}
                    style={{ flex: 1, padding: '0.55rem 0.9rem', borderRadius: 10, border: 'none', cursor: 'pointer', background: likeChoice === true ? '#10b981' : '#1f2937', color: 'white', fontWeight: 800 }}
                  >
                    👍
                  </button>
                  <button
                    onClick={() => setLikeChoice(false)}
                    style={{ flex: 1, padding: '0.55rem 0.9rem', borderRadius: 10, border: 'none', cursor: 'pointer', background: likeChoice === false ? '#ef4444' : '#1f2937', color: 'white', fontWeight: 800 }}
                  >
                    👎
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.75rem' }}>
                  <button
                    onClick={() => setViewIndex((v) => Math.max(0, v - 1))}
                    style={{ flex: 1, padding: '0.55rem 0.9rem', borderRadius: 10, border: 'none', cursor: 'pointer', background: '#1f2937', color: 'white', fontWeight: 800 }}
                  >
                    ◀ Prev
                  </button>
                  <button
                    onClick={() => setViewIndex((v) => Math.min((fenHistory.length || 1) - 1, v + 1))}
                    style={{ flex: 1, padding: '0.55rem 0.9rem', borderRadius: 10, border: 'none', cursor: 'pointer', background: '#1f2937', color: 'white', fontWeight: 800 }}
                  >
                    Next ▶
                  </button>
                </div>
                <div style={{ marginTop: '0.5rem', color: '#9ca3af', fontSize: '0.85rem' }}>
                  Tip: use ← / → to browse moves.
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </main>
    </>
  );
}

// This page depends on authenticated client state and browser interactions (drag/drop, right-click),
// so we opt out of static prerendering to avoid build-time execution issues.
export async function getServerSideProps() {
  return { props: {} };
}