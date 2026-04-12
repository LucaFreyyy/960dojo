import Head from 'next/head';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Chess } from '../lib/chessCompat';
import { useSupabaseSession } from '../lib/SessionContext';
import Chessboard from '../components/Chessboard';
import MoveList from '../components/MoveList';
import DifficultySelector from '../components/DifficultySelector';
import PostTacticDisplay from '../components/PostTacticDisplay';
import TacticsPuzzleOverlay from '../components/TacticsPuzzleOverlay';
import RatingDisplay from '../components/RatingDisplay';
import { ESTABLISHED_RATING_MIN_ENTRIES } from '../lib/ratingConstants';
import SectionTitle from '../components/SectionTitle';
import { stashPgnAndOpenAnalysis } from '../lib/analysisSessionImport';
import { createPosition } from '../lib/chessopsUtils';
import { playChessMove, playLoseSound, playWinSound } from '../lib/soundEffects';

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
    try {
      game.move(san, { sloppy: true });
    } catch {
      break;
    }
  }

  return tokens.join(' ');
}

/** Minimal Chess960 PGN for our analysis page: puzzle start + only the played puzzle line (linear). */
function buildPuzzleOnlyPgnForAnalysis(startFen, solutionSans, solved, playedSans, failedVariation) {
  if (!startFen || !Array.isArray(solutionSans) || solutionSans.length === 0) return null;
  let sans;
  if (solved) {
    sans = [...solutionSans];
  } else {
    sans = Array.isArray(playedSans) ? [...playedSans] : [];
    if (failedVariation?.san) sans.push(failedVariation.san);
  }
  const movetext = buildPgnFromSan(startFen, sans, null);
  if (!movetext.trim()) return null;
  return [
    '[Event "960 Dojo tactics puzzle"]',
    '[Variant "Chess960"]',
    `[FEN "${startFen}"]`,
    '[SetUp "1"]',
    '',
    movetext.trim(),
  ].join('\n');
}

function getVariationKey(path) {
  return `${(path || []).join('|')}:0`;
}

/**
 * Lichess game URL at a ply; POV is `/black` or `/white` after the game id (Lichess convention).
 */
function lichessGameUrlAtPly(rawUrl, ply, boardOrientation = 'white') {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) return null;
  const p = Number(ply);
  const hashPly = Number.isFinite(p) && p >= 1 ? Math.floor(p) : 0;
  const side = boardOrientation === 'black' ? 'black' : 'white';
  try {
    const u = new URL(rawUrl.trim().split('#')[0], 'https://lichess.org');
    const host = u.hostname.replace(/^www\./i, '');
    if (host === 'lichess.org') {
      const parts = u.pathname.split('/').filter(Boolean);
      const id = parts[0];
      if (id && /^[a-zA-Z0-9]{8}$/.test(id)) {
        u.pathname = `/${id}/${side}`;
        u.search = '';
        return `${u.href}#${hashPly}`;
      }
    }
    return `${u.origin}${u.pathname}${u.search}#${hashPly}`;
  } catch {
    return null;
  }
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
  const finishRatingPromiseRef = useRef(null);
  const [ratingSavePending, setRatingSavePending] = useState(false);

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
    const pendingRating = finishRatingPromiseRef.current;
    if (pendingRating) {
      await pendingRating;
    }
    setWaitingForReply(false);
    setLoading(true);
    setError('');
    setInfoMessage('');
    setFinished(false);
    setSolved(false);
    setLikeChoice(null);
    setFailedVariation(null);
    setPlayedSans([]);
    setLastMove(undefined);
    setUserDelta(null);
    setPuzzleDelta(null);
    setSolutionSans([]);

    try {
      tlog('loadNextPuzzle:start', { userId: userId || 'guest', difficulty });
      const q = userId
        ? `userId=${encodeURIComponent(userId)}&difficulty=${encodeURIComponent(difficulty)}`
        : `difficulty=${encodeURIComponent(difficulty)}`;
      const res = await fetch(`/api/tactics/next?${q}`);
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
    if (didSolve) playWinSound();
    else playLoseSound();
    if (replyTimerRef.current) {
      clearTimeout(replyTimerRef.current);
      replyTimerRef.current = null;
    }
    setWaitingForReply(false);

    const ratingSnap = {
      userId,
      tacticId: tactic?.id,
      puzzleRating,
      userRating,
      userFinishedCount,
      tacticTimesPlayed,
    };

    if (ratingSnap.userId && ratingSnap.tacticId) {
      setRatingSavePending(true);
      const finishWork = (async () => {
        try {
          const res = await fetch('/api/tactics/finish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: ratingSnap.userId,
              tacticId: ratingSnap.tacticId,
              solved: didSolve,
              liked: null,
            }),
          });
          const data = await res.json();
          if (!res.ok) return;
          setUserDelta(data?.delta ?? null);
          setPuzzleDelta(
            Number.isFinite(ratingSnap.puzzleRating) && Number.isFinite(data?.tacticRating)
              ? data.tacticRating - ratingSnap.puzzleRating
              : null
          );
          setUserRating(data?.userRating ?? ratingSnap.userRating);
          setPuzzleRating(data?.tacticRating ?? ratingSnap.puzzleRating);
          setUserFinishedCount(data?.userFinishedCount ?? ratingSnap.userFinishedCount);
          setTacticTimesPlayed(data?.tacticTimesPlayed ?? ratingSnap.tacticTimesPlayed);
          tlog('finishPuzzle:rating', {
            delta: data?.delta,
            userRating: data?.userRating,
            tacticRating: data?.tacticRating,
          });
        } catch {
        } finally {
          setRatingSavePending(false);
        }
      })();
      finishRatingPromiseRef.current = finishWork;
      finishWork.finally(() => {
        if (finishRatingPromiseRef.current === finishWork) {
          finishRatingPromiseRef.current = null;
        }
      });
    }

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
      const posAfter = createPosition(afterReply);
      playChessMove({ inCheck: Boolean(posAfter?.isCheck()) });
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
    if (!tactic?.id || !finished || !userId) return;

    if (likeChoice === nextLike) {
      const prevLike = likeChoice;
      setLikeChoice(null);
      try {
        await fetch('/api/tactics/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            tacticId: tactic.id,
            solved,
            removeOnly: true,
            prevLiked: prevLike,
          }),
        });
      } catch {}
      return;
    }

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
          prevLiked: typeof prevLike === 'boolean' ? prevLike : undefined,
        }),
      });
    } catch {}
  }

  /** Original Lichess game URL at the puzzle ply (not the analysis board). */
  const lichessGameUrl = useMemo(
    () => lichessGameUrlAtPly(tactic?.linkToGame, tactic?.puzzleStartPly, orientation),
    [tactic?.linkToGame, tactic?.puzzleStartPly, orientation]
  );

  const puzzleOnlyPgnForAnalysis = useMemo(
    () => buildPuzzleOnlyPgnForAnalysis(startFen, solutionSans, solved, playedSans, failedVariation),
    [startFen, solutionSans, solved, playedSans, failedVariation]
  );

  return (
    <>
      <Head>
        <title>Tactics - 960 Dojo</title>
      </Head>
      <main className="page-shell tactics-page">
        <SectionTitle title="Tactics" />

        {error ? <div className="alert alert--error mb-sm">{error}</div> : null}
        {infoMessage ? <div className="alert alert--info mb-sm">{infoMessage}</div> : null}
        {!userId ? (
          <div className="tactics-login-hint mb-md">
            <strong>Playing as guest (no rating/progress saved)</strong>
            <Link href="/login" className="btn btn--primary btn--sm">
              Log in
            </Link>
          </div>
        ) : null}

        <div className="tactics-layout">
          <section>
            <RatingDisplay
              className="rating-display--panel"
              label={tactic?.id != null ? `Puzzle #${tactic.id}` : 'Puzzle'}
              rating={puzzleRating}
              delta={puzzleDelta}
              provisional={(tacticTimesPlayed || 0) < ESTABLISHED_RATING_MIN_ENTRIES}
            />
            <div className="board-stack">
              <div className="training-chessboard tactics-board-wrap">
                <Chessboard
                  fen={displayedFen || currentFen || startFen}
                  orientation={orientation}
                  onMove={onBoardMove}
                  disabled={finished || loading || waitingForReply || !isBrowsingLive}
                  lastMove={lastMove}
                />
                <TacticsPuzzleOverlay visible={finished} solved={solved} />
              </div>
            </div>
            <div className="board-stack">
              <RatingDisplay
                className="rating-display--panel"
                label="You"
                rating={userRating}
                delta={userDelta}
                provisional={(userFinishedCount || 0) < ESTABLISHED_RATING_MIN_ENTRIES}
              />
            </div>
          </section>

          <section className="tactics-col-side">
            <DifficultySelector value={difficulty} onChange={setDifficulty} disabled={loading} />
            <MoveList
              className="move-list--tactics"
              pgn={moveListPgn}
              evalData={[]}
              userColor={orientation}
              loading={loading}
              loadingMessage="Loading puzzle..."
              selectedPosition={moveListSelectedPosition}
              resetSelectionOnPgnChange={false}
              onBrowsePositionChanged={handleBrowsePositionChanged}
            />
            <PostTacticDisplay
              visible={finished}
              solved={solved}
              likeChoice={likeChoice}
              showFeedbackButtons={!!userId}
              canOpenInAnalysis={Boolean(puzzleOnlyPgnForAnalysis)}
              lichessGameUrl={lichessGameUrl}
              onLike={() => submitFeedback(true)}
              onDislike={() => submitFeedback(false)}
              onOpenInAnalysis={() => puzzleOnlyPgnForAnalysis && stashPgnAndOpenAnalysis(puzzleOnlyPgnForAnalysis)}
              onOpenGame={() => lichessGameUrl && window.open(lichessGameUrl, '_blank', 'noopener,noreferrer')}
              onNextPuzzle={loadNextPuzzle}
              disabled={loading || ratingSavePending}
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

