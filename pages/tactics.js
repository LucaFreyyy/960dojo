import Head from 'next/head';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Chess } from '../lib/chessCompat';
import { useSupabaseSession } from '../lib/SessionContext';
import Chessboard from '../components/Chessboard';
import MoveList from '../components/MoveList';
import DifficultySelector from '../components/DifficultySelector';
import PostTacticDisplay from '../components/PostTacticDisplay';
import RatingDisplay from '../components/RatingDisplay';
import SectionTitle from '../components/SectionTitle';

const TACTICS_DEBUG = true;
function tlog(...args) {
  if (!TACTICS_DEBUG) return;
  console.log('[tactics]', ...args);
}

async function hashEmail(email) {
  const encoder = new TextEncoder();
  const data = encoder.encode(email);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function normalizeSan(san) {
  if (typeof san !== 'string') return '';
  return san.replace(/[?!]+/g, '').replace(/[+#]+/g, '').replace(/^0-0-0$/i, 'O-O-O').replace(/^0-0$/i, 'O-O').trim();
}

function parsePgnMoves(rawPgn) {
  if (typeof rawPgn !== 'string') return [];
  const body = rawPgn
    .split('\n')
    .filter((line) => !line.startsWith('['))
    .join(' ')
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\$\d+/g, ' ')
    .replace(/\b1-0\b|\b0-1\b|\b1\/2-1\/2\b|\*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return body
    .split(' ')
    .map((t) => t.replace(/^\d+\.(\.\.)?/, '').replace(/^\d+\.\.\./, '').trim())
    .filter((t) => t && !/^\d+$/.test(t));
}

function buildPgnFromSan(startFen, mainlineSans, failedVariation = null) {
  const game = new Chess(startFen, { chess960: true });
  const tokens = [];

  for (let i = 0; i < mainlineSans.length; i += 1) {
    const san = mainlineSans[i];
    const moveNo = game.moveNumber();
    if (game.turn() === 'w') tokens.push(`${moveNo}. ${san}`);
    else tokens.push(`${moveNo}... ${san}`);

    if (failedVariation && failedVariation.anchorIndex === i) {
      tokens.push(`(${moveNo}${game.turn() === 'w' ? '.' : '...'} ${failedVariation.san})`);
    }
    try { game.move(san); } catch { break; }
  }

  return tokens.join(' ');
}

function getVariationKey(path) {
  return `${(path || []).join('|')}:0`;
}

function lichessUrlAtPly(url, ply, orientation = 'white') {
  if (typeof url !== 'string' || !url) return null;
  const p = Number(ply);
  const hashPly = Number.isFinite(p) && p >= 1 ? Math.floor(p) : 0;
  const base = url.split('#')[0];
  const color = orientation === 'black' ? 'black' : 'white';
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}color=${color}#${hashPly}`;
}

export default function TacticsPage() {
  const session = useSupabaseSession();
  const [userId, setUserId] = useState(null);
  const [difficulty, setDifficulty] = useState('middle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const [tactic, setTactic] = useState(null);
  const [solutionSans, setSolutionSans] = useState([]);
  const [startFen, setStartFen] = useState(null);
  const [orientation, setOrientation] = useState('white');

  const [userRating, setUserRating] = useState(1500);
  const [puzzleRating, setPuzzleRating] = useState(null);
  const [userDelta, setUserDelta] = useState(null);
  const [puzzleDelta, setPuzzleDelta] = useState(null);
  const [userFinishedCount, setUserFinishedCount] = useState(0);
  const [tacticTimesPlayed, setTacticTimesPlayed] = useState(0);

  const [playedSans, setPlayedSans] = useState([]);
  const [currentFen, setCurrentFen] = useState(null);
  const [lastMove, setLastMove] = useState(undefined);

  const [finished, setFinished] = useState(false);
  const [solved, setSolved] = useState(false);
  const [failedVariation, setFailedVariation] = useState(null);
  const [likeChoice, setLikeChoice] = useState(null);

  const [browsePosition, setBrowsePosition] = useState({ index: -1, variationPath: [] });
  const [waitingForReply, setWaitingForReply] = useState(false);
  const replyTimerRef = useRef(null);
  const playedSansRef = useRef([]);
  const solutionSansRef = useRef([]);
  const currentFenRef = useRef(null);
  const loadingRef = useRef(false);
  const finishedRef = useRef(false);
  const waitingForReplyRef = useRef(false);
  const isBrowsingLiveRef = useRef(true);
  const lastProcessedMoveRef = useRef('');

  useEffect(() => {
    if (!session?.user?.email) return setUserId(null);
    hashEmail(session.user.email).then(setUserId).catch(() => setUserId(null));
  }, [session]);

  const lineForDisplay = useMemo(() => (finished ? solutionSans : playedSans), [finished, solutionSans, playedSans]);

  const moveListPgn = useMemo(() => {
    if (!startFen) return '';
    return buildPgnFromSan(startFen, lineForDisplay, finished && !solved ? failedVariation : null);
  }, [startFen, lineForDisplay, finished, solved, failedVariation]);

  const fenByIndex = useMemo(() => {
    if (!startFen) return [''];
    const game = new Chess(startFen, { chess960: true });
    const fens = [game.fen()];
    for (const san of lineForDisplay) {
      try {
        const mv = game.move(san, { sloppy: true });
        if (!mv) break;
        fens.push(game.fen());
      } catch {
        break;
      }
    }
    return fens;
  }, [startFen, lineForDisplay]);

  const failedVariationFenByKey = useMemo(() => {
    const map = new Map();
    if (!startFen || !failedVariation) return map;
    const game = new Chess(startFen, { chess960: true });
    const anchorHalfmoveCount = Math.max(0, failedVariation.anchorIndex + 1);
    for (let i = 0; i < anchorHalfmoveCount && i < lineForDisplay.length; i += 1) {
      try { game.move(lineForDisplay[i], { sloppy: true }); } catch {}
    }
    try {
      const mv = game.move(failedVariation.san, { sloppy: true });
      if (mv) map.set(getVariationKey(failedVariation.path), game.fen());
    } catch {}
    return map;
  }, [startFen, failedVariation, lineForDisplay]);

  const liveBrowseIndex = finished ? Math.max(-1, lineForDisplay.length - 1) : Math.max(-1, playedSans.length - 1);
  const isBrowsingLive = browsePosition.index === liveBrowseIndex && (browsePosition.variationPath?.length || 0) === 0;
  const moveListSelectedPosition = useMemo(
    () => browsePosition,
    [browsePosition]
  );

  const handleBrowsePositionChanged = useCallback((index, variationPath) => {
    setBrowsePosition((prev) => {
      const nextPath = Array.isArray(variationPath) ? variationPath : [];
      const sameIndex = prev.index === index;
      const samePath = prev.variationPath.length === nextPath.length
        && prev.variationPath.every((x, i) => x === nextPath[i]);
      if (sameIndex && samePath) return prev;
      return { index, variationPath: nextPath };
    });
  }, []);

  const displayedFen = useMemo(() => {
    if (!finished) {
      return fenByIndex[Math.max(0, browsePosition.index + 1)] || currentFen || startFen;
    }
    if (browsePosition.variationPath?.length) {
      const key = getVariationKey(browsePosition.variationPath);
      return failedVariationFenByKey.get(key) || fenByIndex[Math.max(0, browsePosition.index + 1)] || currentFen;
    }
    return fenByIndex[Math.max(0, browsePosition.index + 1)] || currentFen;
  }, [finished, currentFen, startFen, browsePosition, fenByIndex, failedVariationFenByKey]);

  useEffect(() => { playedSansRef.current = playedSans; }, [playedSans]);
  useEffect(() => { solutionSansRef.current = solutionSans; }, [solutionSans]);
  useEffect(() => { currentFenRef.current = currentFen; }, [currentFen]);
  useEffect(() => { loadingRef.current = loading; }, [loading]);
  useEffect(() => { finishedRef.current = finished; }, [finished]);
  useEffect(() => { waitingForReplyRef.current = waitingForReply; }, [waitingForReply]);
  useEffect(() => { isBrowsingLiveRef.current = isBrowsingLive; }, [isBrowsingLive]);

  async function loadNextPuzzle() {
    if (replyTimerRef.current) {
      clearTimeout(replyTimerRef.current);
      replyTimerRef.current = null;
    }
    setWaitingForReply(false);
    if (!userId) {
      setError('Log in to play tactics.');
      return;
    }
    setLoading(true);
    setError('');
    setInfoMessage('');
    setFinished(false);
    setSolved(false);
    setLikeChoice(null);
    setFailedVariation(null);
    setPlayedSans([]);
    setBrowsePosition({ index: -1, variationPath: [] });
    setLastMove(undefined);
    setUserDelta(null);
    setPuzzleDelta(null);

    try {
      tlog('loadNextPuzzle:start', { userId, difficulty });
      const res = await fetch(`/api/tactics/next?userId=${encodeURIComponent(userId)}&difficulty=${encodeURIComponent(difficulty)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to load puzzle');

      const nextTactic = data?.tactic || null;
      const parsedLine = Array.isArray(nextTactic?.puzzleLine)
        ? nextTactic.puzzleLine
        : parsePgnMoves(nextTactic?.pgn || '');
      const nextFen = nextTactic?.startFen || null;
      if (!nextFen || !parsedLine.length) throw new Error('Puzzle data incomplete (missing start position or moves).');

      const game = new Chess(nextFen, { chess960: true });
      // Puzzle lines are stored as: opponent move first, then user move, etc.
      // So we immediately play the first move before user interaction starts.
      const firstMove = game.move(parsedLine[0], { sloppy: true });
      if (!firstMove) throw new Error('Invalid puzzle line: first (opponent) move is illegal from startFen.');

      setOrientation(game.turn() === 'b' ? 'black' : 'white');
      setCurrentFen(game.fen());
      setPlayedSans([firstMove.san]);
      setLastMove([firstMove.from, firstMove.to]);
      setBrowsePosition({ index: 0, variationPath: [] });
      setStartFen(nextFen);
      setSolutionSans(parsedLine);
      setTactic(nextTactic);
      setUserRating(data?.userRating ?? 1500);
      setPuzzleRating(nextTactic?.rating ?? null);
      setUserFinishedCount(data?.userFinishedCount ?? 0);
      setTacticTimesPlayed(data?.tacticTimesPlayed ?? 0);
      setInfoMessage(data?.infoMessage || '');
      tlog('loadNextPuzzle:ready', {
        tacticId: nextTactic?.id,
        solutionLen: parsedLine.length,
        firstOpponentMove: parsedLine[0],
        fenAfterFirst: game.fen(),
      });
    } catch (e) {
      tlog('loadNextPuzzle:error', e?.message || e);
      setError(e?.message || 'Failed to load puzzle');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!userId) return;
    loadNextPuzzle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, difficulty]);

  async function finishPuzzle(didSolve, opts = {}) {
    const { freezeFen = null } = opts;
    tlog('finishPuzzle', {
      didSolve,
      freezeFen,
      playedLen: playedSansRef.current.length,
      solutionLen: solutionSansRef.current.length,
    });
    if (replyTimerRef.current) {
      clearTimeout(replyTimerRef.current);
      replyTimerRef.current = null;
    }
    setWaitingForReply(false);
    setFinished(true);
    setSolved(didSolve);
    if (didSolve) {
      setBrowsePosition({ index: solutionSansRef.current.length - 1, variationPath: [] });
    } else {
      setBrowsePosition({ index: Math.max(-1, playedSansRef.current.length - 1), variationPath: [] });
    }
    if (!didSolve && freezeFen) {
      setCurrentFen(freezeFen);
    } else if (startFen) {
      const game = new Chess(startFen, { chess960: true });
      for (const san of solutionSansRef.current) {
        try { game.move(san, { sloppy: true }); } catch {}
      }
      setCurrentFen(game.fen());
    }

    try {
      const res = await fetch('/api/tactics/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          tacticId: tactic?.id,
          solved: didSolve,
          liked: null,
        }),
      });
      const data = await res.json();
      if (!res.ok) return;
      setUserDelta(data?.delta ?? null);
      setPuzzleDelta(
        Number.isFinite(puzzleRating) && Number.isFinite(data?.tacticRating)
          ? data.tacticRating - puzzleRating
          : null
      );
      setUserRating(data?.userRating ?? userRating);
      setPuzzleRating(data?.tacticRating ?? puzzleRating);
      setUserFinishedCount(data?.userFinishedCount ?? userFinishedCount);
      setTacticTimesPlayed(data?.tacticTimesPlayed ?? tacticTimesPlayed);
      tlog('finishPuzzle:rating', {
        delta: data?.delta,
        userRating: data?.userRating,
        tacticRating: data?.tacticRating,
      });
    } catch {}
  }

  async function onBoardMove({ from, to, san, newFen }) {
    if (loadingRef.current || finishedRef.current || !isBrowsingLiveRef.current || waitingForReplyRef.current) {
      tlog('onBoardMove:ignored-lock', {
        from, to, san,
        loading: loadingRef.current,
        finished: finishedRef.current,
        browsingLive: isBrowsingLiveRef.current,
        waiting: waitingForReplyRef.current,
      });
      return;
    }
    if (newFen && newFen === currentFenRef.current) {
      tlog('onBoardMove:ignored-same-fen', { from, to, san });
      return;
    }

    const moveKey = `${from}-${to}-${san}-${newFen}`;
    if (lastProcessedMoveRef.current === moveKey) {
      tlog('onBoardMove:ignored-duplicate', { moveKey });
      return;
    }
    lastProcessedMoveRef.current = moveKey;

    const played = playedSansRef.current;
    const solution = solutionSansRef.current;
    const expected = solution[played.length];
    tlog('onBoardMove:validate', {
      from,
      to,
      playedLen: played.length,
      san,
      expected,
      sanNorm: normalizeSan(san),
      expectedNorm: normalizeSan(expected),
    });

    if (!expected || normalizeSan(expected) !== normalizeSan(san)) {
      const anchorIndex = Math.max(0, played.length - 1);
      const anchorPath = [`${anchorIndex}:${0}`];
      setFailedVariation({ san, anchorIndex, path: anchorPath });
      tlog('onBoardMove:fail', { san, expected, anchorIndex, freezeFen: newFen });
      await finishPuzzle(false, { freezeFen: newFen });
      return;
    }

    const newPlayed = [...played, san];
    setPlayedSans(newPlayed);
    setCurrentFen(newFen);
    setLastMove([from, to]);
    setBrowsePosition({ index: newPlayed.length - 1, variationPath: [] });

    const reply = solution[newPlayed.length];
    if (!reply) {
      tlog('onBoardMove:solved-no-reply', { finalMove: san, playedLen: newPlayed.length });
      await finishPuzzle(true);
      return;
    }

    setWaitingForReply(true);
    tlog('onBoardMove:reply-scheduled', { reply, afterPlayedLen: newPlayed.length });
    replyTimerRef.current = setTimeout(async () => {
      const game = new Chess(newFen, { chess960: true });
      const rm = game.move(reply, { sloppy: true });
      if (!rm) {
        replyTimerRef.current = null;
        setWaitingForReply(false);
        tlog('onBoardMove:reply-illegal-mark-solved', { reply });
        await finishPuzzle(true);
        return;
      }
      const afterReply = game.fen();
      const afterPlayed = [...newPlayed, rm.san];
      setPlayedSans(afterPlayed);
      setCurrentFen(afterReply);
      setLastMove([rm.from, rm.to]);
      setBrowsePosition({ index: afterPlayed.length - 1, variationPath: [] });
      replyTimerRef.current = null;
      setWaitingForReply(false);
      tlog('onBoardMove:reply-played', { replySan: rm.san, afterPlayedLen: afterPlayed.length });
      if (!solution[afterPlayed.length]) await finishPuzzle(true);
    }, 220);
  }

  async function submitFeedback(nextLike) {
    if (!tactic?.id || !finished || likeChoice === nextLike) return;
    const prevLike = likeChoice;
    setLikeChoice(nextLike);
    try {
      await fetch('/api/tactics/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          tacticId: tactic.id,
          solved,
          liked: nextLike,
          prevLiked: prevLike,
        }),
      });
    } catch {}
  }

  const puzzleLink = useMemo(
    () => lichessUrlAtPly(tactic?.linkToGame, tactic?.puzzleStartPly, orientation),
    [tactic?.linkToGame, tactic?.puzzleStartPly, orientation]
  );

  return (
    <>
      <Head>
        <title>Tactics - 960 Dojo</title>
      </Head>
      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '1.25rem 1rem 2rem' }}>
        <SectionTitle title="Tactics" />

        {error ? <div style={{ color: '#ef4444', marginBottom: 10 }}>{error}</div> : null}
        {infoMessage ? <div style={{ color: '#93c5fd', marginBottom: 10 }}>{infoMessage}</div> : null}
        {!userId ? (
          <div
            style={{
              marginBottom: 14,
              padding: '0.9rem 1rem',
              borderRadius: 12,
              border: '1px solid #334155',
              background: '#0f172a',
              color: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontWeight: 700 }}>Log in to play puzzles</span>
            <Link
              href="/login"
              style={{
                display: 'inline-block',
                padding: '0.5rem 0.9rem',
                borderRadius: 10,
                background: '#2563eb',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 800,
              }}
            >
              Log in
            </Link>
          </div>
        ) : null}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 600px) minmax(320px, 1fr)', gap: 18 }}>
          <section>
            <RatingDisplay
              label="Puzzle"
              rating={puzzleRating}
              delta={puzzleDelta}
              provisional={(tacticTimesPlayed || 0) < 10}
            />
            <div style={{ marginTop: 8 }}>
              <Chessboard
                fen={displayedFen || currentFen || startFen}
                orientation={orientation}
                onMove={onBoardMove}
                disabled={finished || loading || waitingForReply || !isBrowsingLive}
                lastMove={lastMove}
              />
            </div>
            <div style={{ marginTop: 8 }}>
              <RatingDisplay
                label="You"
                rating={userRating}
                delta={userDelta}
                provisional={(userFinishedCount || 0) < 10}
              />
            </div>
          </section>

          <section>
            <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'flex-start' }}>
              <DifficultySelector value={difficulty} onChange={setDifficulty} disabled={loading} />
            </div>
            <MoveList
              pgn={moveListPgn}
              evalData={[]}
              userColor={orientation}
              loading={loading}
              selectedPosition={moveListSelectedPosition}
              resetSelectionOnPgnChange={false}
              onBrowsePositionChanged={handleBrowsePositionChanged}
            />
            <PostTacticDisplay
              visible={finished}
              solved={solved}
              likeChoice={likeChoice}
              lichessUrl={puzzleLink}
              onLike={() => submitFeedback(true)}
              onDislike={() => submitFeedback(false)}
              onOpenInLichess={() => window.open(puzzleLink, '_blank')}
              onNextPuzzle={loadNextPuzzle}
              disabled={loading}
            />
          </section>
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}

