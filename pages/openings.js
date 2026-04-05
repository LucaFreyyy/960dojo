import Head from 'next/head';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from '../lib/chessCompat';
import { useSupabaseSession } from '../lib/SessionContext';
import Chessboard from '../components/Chessboard';
import MoveList from '../components/MoveList';
import RatingDisplay from '../components/RatingDisplay';
import { ESTABLISHED_RATING_MIN_ENTRIES } from '../lib/ratingConstants';
import { OpenInLichessBtn } from '../components/PostTacticDisplay';
import SectionTitle from '../components/SectionTitle';
import PositionSelector from '../components/PositionSelector';
import PositionDisplay from '../components/PositionDisplay';
import ModeSelector from '../components/ModeSelector';
import StartBtn from '../components/StartBtn';
import PlayAgainBtn from '../components/PlayAgainBtn';
import { positionNrToStartFen, randomInt } from '../lib/chess960';
import { buildPgnFromSans, replaySansFromStoredPgn } from '../lib/openingsPgn';
import { getOpponentSanAndFen } from '../lib/openingsOpponent';
import { evalFenDepthCpWhite } from '../lib/stockfishUtils';
import {
  OPENINGS_EVAL_DEPTH_FINAL,
  OPENINGS_EVAL_DEPTH_MOVE,
  buildMoveListEvalDataFromTrail,
} from '../lib/openingsEval';
import {
  applyBoardMoveToChessGame,
  computeFenTrail,
  countUserMovesFromSans,
  sideToMoveFromFen,
} from '../lib/openingsGame';
import { computeOpeningsRatingDelta } from '../lib/openingsRating';
import { createRatedOpeningRow } from '../lib/openingsUserOpening';
import {
  countOpeningsRatings,
  fetchLatestOpeningsRating,
  fetchUnfinishedOpeningRow,
  insertUserOpening,
  updateUserOpening,
} from '../lib/openingsDb';
import { hashEmail } from '../lib/hashEmail';

const USER_TARGET_MOVES = 11;

function buildOpeningsLichessUrl({ openingNr, startFen, pgnMovetext, orientation }) {
  if (!startFen || !pgnMovetext) return null;
  const color = orientation === 'black' ? 'black' : 'white';
  const pgn = [
    '[Event "960 Dojo Openings"]',
    '[Site "https://lichess.org"]',
    '[Variant "Chess960"]',
    `[FEN "${startFen}"]`,
    '[SetUp "1"]',
    `[Opening "Chess960 #${openingNr}"]`,
    '',
    pgnMovetext,
  ].join('\n');
  return `https://lichess.org/analysis/pgn/${encodeURIComponent(pgn)}?color=${color}`;
}

export default function OpeningsPage() {
  const session = useSupabaseSession();
  const [userId, setUserId] = useState(null);

  const [gameMode, setGameMode] = useState('training');
  const [colorChoice, setColorChoice] = useState('random');
  const [openingNr, setOpeningNr] = useState(0);
  const [infoMessage, setInfoMessage] = useState('');

  const [phase, setPhase] = useState('setup');
  const positionRef = useRef(null);

  const [userColor, setUserColor] = useState('white');
  const [startFen, setStartFen] = useState(null);
  const [openingRowId, setOpeningRowId] = useState(null);
  const [isRatedSession, setIsRatedSession] = useState(false);

  const [playedSans, setPlayedSans] = useState([]);
  const [currentFen, setCurrentFen] = useState(null);
  const [lastMove, setLastMove] = useState(undefined);

  const [browsePosition, setBrowsePosition] = useState({ index: -1, variationPath: [] });
  const [opponentBusy, setOpponentBusy] = useState(false);

  const [dbRating, setDbRating] = useState(1500);
  const [trainingRating, setTrainingRating] = useState(1500);
  const [ratingDelta, setRatingDelta] = useState(null);
  const [openingsRatingCount, setOpeningsRatingCount] = useState(0);

  const [moveListLoading, setMoveListLoading] = useState(false);
  const [moveListEvalData, setMoveListEvalData] = useState(null);

  const playedSansRef = useRef([]);
  const currentFenRef = useRef(null);
  const phaseRef = useRef('setup');
  const userColorRef = useRef('white');
  const userMovesDoneRef = useRef(0);
  const isRatedRef = useRef(false);
  const openingRowIdRef = useRef(null);
  const startFenRef = useRef(null);
  const userIdRef = useRef(null);
  const sessionAccessTokenRef = useRef(null);
  const gameModeRef = useRef('training');
  const trainingRatingRef = useRef(1500);
  const dbRatingRef = useRef(1500);
  /** Parallel to positions along the mainline; pawns from White POV, or ±(100+mateIn). */
  const evalHistoryTrailRef = useRef([]);
  const evalJobsRef = useRef([]);
  const opponentBusyRef = useRef(false);
  const isBrowsingLiveRef = useRef(true);
  const endingGameRef = useRef(false);
  const lastBoardMoveKeyRef = useRef('');

  useEffect(() => {
    if (!session?.user?.email) {
      setUserId(null);
      return;
    }
    hashEmail(session.user.email).then(setUserId).catch(() => setUserId(null));
  }, [session]);

  useEffect(() => {
    playedSansRef.current = playedSans;
  }, [playedSans]);
  useEffect(() => {
    isRatedRef.current = isRatedSession;
  }, [isRatedSession]);
  useEffect(() => {
    openingRowIdRef.current = openingRowId;
  }, [openingRowId]);
  useEffect(() => {
    startFenRef.current = startFen;
  }, [startFen]);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);
  useEffect(() => {
    sessionAccessTokenRef.current = session?.access_token ?? null;
  }, [session]);
  useEffect(() => {
    gameModeRef.current = gameMode;
  }, [gameMode]);
  useEffect(() => {
    trainingRatingRef.current = trainingRating;
  }, [trainingRating]);
  useEffect(() => {
    dbRatingRef.current = dbRating;
  }, [dbRating]);

  useEffect(() => {
    if (!userId) {
      setGameMode('training');
      return;
    }
    (async () => {
      const [r, c] = await Promise.all([
        fetchLatestOpeningsRating(userId),
        countOpeningsRatings(userId),
      ]);
      setDbRating(r);
      setTrainingRating(r);
      setOpeningsRatingCount(c);
      setGameMode('ranked');
    })();
  }, [userId]);

  const rankedMode = gameMode === 'ranked';
  const showSetup = phase === 'setup';
  const showMoveList = phase !== 'setup';

  const moveListPgn = useMemo(() => {
    if (!startFen) return '';
    return buildPgnFromSans(startFen, playedSans);
  }, [startFen, playedSans]);

  const openingsLichessUrl = useMemo(
    () =>
      buildOpeningsLichessUrl({
        openingNr,
        startFen,
        pgnMovetext: moveListPgn,
        orientation: userColor,
      }),
    [openingNr, startFen, moveListPgn, userColor]
  );

  const fenTrail = useMemo(
    () => (startFen ? computeFenTrail(startFen, playedSans) : []),
    [startFen, playedSans]
  );

  const fenByIndex = useMemo(() => fenTrail, [fenTrail]);

  const liveBrowseIndex = Math.max(-1, playedSans.length - 1);
  const isBrowsingLive =
    browsePosition.index === liveBrowseIndex && (browsePosition.variationPath?.length || 0) === 0;

  const displayedFen = useMemo(() => {
    if (phase === 'setup') {
      try {
        return positionNrToStartFen(openingNr);
      } catch {
        return null;
      }
    }
    const idx = Math.max(0, browsePosition.index + 1);
    return fenByIndex[idx] || currentFen || startFen;
  }, [phase, openingNr, browsePosition, fenByIndex, currentFen, startFen]);

  const opponentToMove = useMemo(() => {
    if (phase !== 'playing' || !isBrowsingLive || !displayedFen) return false;
    return sideToMoveFromFen(displayedFen) !== userColor;
  }, [phase, isBrowsingLive, displayedFen, userColor]);

  /** Refs read inside `onBoardMove` must match this render (that handler runs before useEffect). */
  if (typeof window !== 'undefined') {
    phaseRef.current = phase;
    currentFenRef.current = currentFen;
    userColorRef.current = userColor;
    opponentBusyRef.current = opponentBusy;
    isBrowsingLiveRef.current = isBrowsingLive;
  }

  const handleBrowsePositionChanged = useCallback((index, variationPath) => {
    setBrowsePosition((prev) => {
      const nextPath = Array.isArray(variationPath) ? variationPath : [];
      const sameIndex = prev.index === index;
      const samePath =
        prev.variationPath.length === nextPath.length &&
        prev.variationPath.every((x, i) => x === nextPath[i]);
      if (sameIndex && samePath) return prev;
      return { index, variationPath: nextPath };
    });
  }, []);

  const syncEvalHistoryToDb = useCallback(async (trailWhiteCp) => {
    const id = openingRowIdRef.current;
    if (!id || !isRatedRef.current) return;
    const payload = trailWhiteCp.map((x) => (Number.isFinite(x) ? Math.round(x) : 0));
    await updateUserOpening(id, { evalHistory: payload });
  }, []);

  const queuePositionEval = useCallback(
    (fen, index) => {
      const job = evalFenDepthCpWhite(fen, OPENINGS_EVAL_DEPTH_MOVE).then(async (cp) => {
        if (!Number.isFinite(cp)) return;
        const trail = evalHistoryTrailRef.current;
        while (trail.length <= index) trail.push(null);
        trail[index] = cp;
        evalHistoryTrailRef.current = trail;
        await syncEvalHistoryToDb(trail);
      });
      evalJobsRef.current.push(job);
    },
    [syncEvalHistoryToDb]
  );

  const finalizeGame = useCallback(async () => {
    if (endingGameRef.current) return;
    endingGameRef.current = true;
    try {
      setPhase('finishing');
      setMoveListLoading(true);
      setOpponentBusy(false);
      opponentBusyRef.current = false;

      await Promise.allSettled(evalJobsRef.current);
      evalJobsRef.current = [];

      const start = startFenRef.current;
      const sans = playedSansRef.current;
      if (!start) {
        setPhase('done');
        setMoveListLoading(false);
        return;
      }

      const trailFens = computeFenTrail(start, sans);
      const lastFen = trailFens[trailFens.length - 1] || start;
      const finalCp = await evalFenDepthCpWhite(lastFen, OPENINGS_EVAL_DEPTH_FINAL);

      const trail = [...evalHistoryTrailRef.current];
      while (trail.length < trailFens.length) trail.push(null);
      const lastIdx = trailFens.length - 1;
      if (Number.isFinite(finalCp)) trail[lastIdx] = finalCp;
      evalHistoryTrailRef.current = trail;

      const evalData = buildMoveListEvalDataFromTrail(start, sans, trail);
      setMoveListEvalData(evalData);

      const finishedAt = new Date().toISOString();
      const pgnText = buildPgnFromSans(start, sans);
      const rowId = openingRowIdRef.current;

      if (isRatedRef.current) {
        let targetRowId = rowId;
        if (!targetRowId && userIdRef.current) {
          const fallback = await fetchUnfinishedOpeningRow(userIdRef.current);
          targetRowId = fallback?.id || null;
        }

        const evalHistoryCp = trail.map((x) => (Number.isFinite(x) ? Math.round(x) : 0));

        if (targetRowId) {
          // Step 1: always stamp completion metadata even if eval payload fails.
          const wroteDone = await updateUserOpening(targetRowId, {
            pgn: pgnText,
            finished: finishedAt,
          });
          if (!wroteDone) {
            console.warn('[openings/finalizeGame] failed to mark finished opening row', { rowId: targetRowId });
          }

          // Step 2: store evalHistory. If decimal arrays are rejected by schema, fall back to integers.
          let wroteEval = await updateUserOpening(targetRowId, { evalHistory: evalHistoryCp });
          if (!wroteEval) {
            // If the DB rejects the array type for any reason, don't block the completion stamp.
            wroteEval = false;
          }
          if (!wroteEval) {
            console.warn('[openings/finalizeGame] failed to persist evalHistory', { rowId: targetRowId });
          }
        } else {
          console.warn('[openings/finalizeGame] missing row id for rated game');
        }

        if (userIdRef.current) {
          const nOpen = await countOpeningsRatings(userIdRef.current);
          const change = computeOpeningsRatingDelta(finalCp, userColorRef.current, nOpen);
          const newRating = Math.round(dbRatingRef.current + change);

          try {
            const token = sessionAccessTokenRef.current;
            if (!token) {
              console.warn('[openings/finalizeGame] missing session token for rating insert');
            } else {
              const res = await fetch('/api/createOpeningRating', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ id: userIdRef.current, newRating }),
              });
              const data = await res.json();
              if (data?.success) {
                setRatingDelta(change);
                setDbRating(newRating);
                setTrainingRating(newRating);
                const nextCount = await countOpeningsRatings(userIdRef.current);
                setOpeningsRatingCount(nextCount);
              }
            }
          } catch {}
        }
      }

      setMoveListLoading(false);
      setPhase('done');
    } finally {
      endingGameRef.current = false;
    }
  }, []);

  const playOpponentOnce = useCallback(async () => {
    const fen = currentFenRef.current;
    const ph = phaseRef.current;
    if (!fen || ph !== 'playing') return false;

    const rating =
      gameModeRef.current === 'ranked' ? dbRatingRef.current : trainingRatingRef.current;

    setOpponentBusy(true);
    opponentBusyRef.current = true;
    try {
      const g = new Chess(fen, { chess960: true });
      if (g.isGameOver()) return false;

      const res = await getOpponentSanAndFen(fen, rating);
      if (!res?.san || !res.newFen) return false;

      const newSans = [...playedSansRef.current, res.san];
      const newFen = res.newFen;

      const idx = newSans.length;
      queuePositionEval(newFen, idx);

      setPlayedSans(newSans);
      setCurrentFen(newFen);
      currentFenRef.current = newFen;
      setLastMove(res.lastMove || undefined);
      setBrowsePosition({ index: newSans.length - 1, variationPath: [] });

      if (isRatedRef.current && openingRowIdRef.current) {
        const pgnText = buildPgnFromSans(startFenRef.current, newSans);
        await updateUserOpening(openingRowIdRef.current, { pgn: pgnText });
      }

      const g2 = new Chess(newFen, { chess960: true });
      return !g2.isGameOver();
    } finally {
      setOpponentBusy(false);
      opponentBusyRef.current = false;
    }
  }, [queuePositionEval]);

  const runAfterUserMove = useCallback(
    async (userMoveCount) => {
      const ph = phaseRef.current;
      if (ph !== 'playing') return;

      const fen = currentFenRef.current;
      const g = new Chess(fen, { chess960: true });
      if (g.isGameOver()) {
        await finalizeGame();
        return;
      }

      if (userMoveCount >= USER_TARGET_MOVES) {
        await playOpponentOnce();
        await finalizeGame();
        return;
      }

      const cont = await playOpponentOnce();
      if (!cont) {
        await finalizeGame();
        return;
      }

      const fen2 = currentFenRef.current;
      const g2 = new Chess(fen2, { chess960: true });
      if (g2.isGameOver()) {
        await finalizeGame();
      }
    },
    [finalizeGame, playOpponentOnce]
  );

  const onBoardMove = useCallback(
    async ({ from, to, san }) => {
      const dbg = process.env.NODE_ENV === 'development';
      if (phaseRef.current !== 'playing' || opponentBusyRef.current || !isBrowsingLiveRef.current) {
        if (dbg) {
          console.warn('[openings/onBoardMove] blocked (phase/opponent/browse)', {
            phase: phaseRef.current,
            opponentBusy: opponentBusyRef.current,
            isBrowsingLive: isBrowsingLiveRef.current,
          });
        }
        return;
      }
      const ut =
        currentFenRef.current &&
        sideToMoveFromFen(currentFenRef.current) === userColorRef.current &&
        phaseRef.current === 'playing' &&
        !opponentBusyRef.current;
      if (!ut) {
        if (dbg) {
          console.warn('[openings/onBoardMove] blocked (not user turn / no fen)', {
            fen: currentFenRef.current?.slice(0, 80),
            userColor: userColorRef.current,
            side: currentFenRef.current && sideToMoveFromFen(currentFenRef.current),
          });
        }
        return;
      }

      const g = new Chess(currentFenRef.current, { chess960: true });
      const m = applyBoardMoveToChessGame(g, from, to, san);
      if (!m) {
        if (dbg) {
          console.warn('[openings/onBoardMove] applyBoardMoveToChessGame failed', { from, to, san });
        }
        return;
      }

      const newFen = g.fen();
      const moveKey = `${from}-${to}-${m.san}-${newFen}`;
      if (lastBoardMoveKeyRef.current === moveKey) return;
      lastBoardMoveKeyRef.current = moveKey;

      const newSans = [...playedSansRef.current, m.san];
      const idx = newSans.length;
      queuePositionEval(newFen, idx);

      setPlayedSans(newSans);
      setCurrentFen(newFen);
      currentFenRef.current = newFen;
      setLastMove([from, to]);
      setBrowsePosition({ index: newSans.length - 1, variationPath: [] });

      userMovesDoneRef.current += 1;
      const um = userMovesDoneRef.current;

      if (isRatedRef.current && openingRowIdRef.current) {
        const pgnText = buildPgnFromSans(startFenRef.current, newSans);
        await updateUserOpening(openingRowIdRef.current, { pgn: pgnText });
      }

      await runAfterUserMove(um);
    },
    [queuePositionEval, runAfterUserMove]
  );

  const startGame = useCallback(async () => {
    lastBoardMoveKeyRef.current = '';
    setInfoMessage('');
    setRatingDelta(null);
    setMoveListEvalData(null);
    evalJobsRef.current = [];
    evalHistoryTrailRef.current = [];

    if (gameMode === 'ranked' && !userId) {
      setInfoMessage('Log in to play ranked openings.');
      return;
    }

    const gen = positionRef.current?.generatePosition?.();
    const nr = gen?.openingNr ?? openingNr;
    const startPosFen = positionNrToStartFen(nr);
    setOpeningNr(nr);

    let uc = 'white';
    if (gameMode === 'ranked') {
      uc = Math.random() < 0.5 ? 'white' : 'black';
    } else if (colorChoice === 'random') {
      uc = Math.random() < 0.5 ? 'white' : 'black';
    } else {
      uc = colorChoice;
    }

    setUserColor(uc);
    userColorRef.current = uc;
    userMovesDoneRef.current = 0;

    let rowId = null;
    let rated = gameMode === 'ranked';

    if (rated && userId) {
      const row = await fetchUnfinishedOpeningRow(userId);
      if (row?.id) {
        rowId = row.id;
        const storedNr = Number(row.openingNr);
        const storedColor = row.color === 'black' ? 'black' : 'white';
        const sf = positionNrToStartFen(storedNr);
        const sans = replaySansFromStoredPgn(row.pgn || '', sf);
        setOpeningNr(storedNr);
        setStartFen(sf);
        startFenRef.current = sf;
        setUserColor(storedColor);
        userColorRef.current = storedColor;
        userMovesDoneRef.current = countUserMovesFromSans(sf, sans, storedColor);
        setPlayedSans(sans);
        const trail = computeFenTrail(sf, sans);
        setCurrentFen(trail[trail.length - 1] || sf);
        currentFenRef.current = trail[trail.length - 1] || sf;
        setLastMove(undefined);
        setBrowsePosition({ index: Math.max(-1, sans.length - 1), variationPath: [] });
        setOpeningRowId(rowId);
        openingRowIdRef.current = rowId;
        setIsRatedSession(true);
        isRatedRef.current = true;

        const eh = Array.isArray(row.evalHistory) ? row.evalHistory : [];
        evalHistoryTrailRef.current = eh.map((x) => (Number.isFinite(x) ? x : null));

        setPhase('playing');
        phaseRef.current = 'playing';
        queuePositionEval(trail[trail.length - 1] || sf, trail.length - 1);
        if (sideToMoveFromFen(currentFenRef.current) !== storedColor) {
          setOpponentBusy(true);
          opponentBusyRef.current = true;
          setTimeout(async () => {
            try {
              await playOpponentOnce();
            } finally {
              setOpponentBusy(false);
              opponentBusyRef.current = false;
            }
          }, 0);
        }
        return;
      }

      rowId = crypto.randomUUID();
      await insertUserOpening(
        createRatedOpeningRow({
          id: rowId,
          userId,
          openingNr: nr,
          color: uc,
        })
      );
      setOpeningRowId(rowId);
      openingRowIdRef.current = rowId;
    } else {
      setOpeningRowId(null);
      openingRowIdRef.current = null;
      setIsRatedSession(false);
      isRatedRef.current = false;
    }

    setIsRatedSession(rated);
    isRatedRef.current = rated;
    setStartFen(startPosFen);
    startFenRef.current = startPosFen;
    setPlayedSans([]);
    setCurrentFen(startPosFen);
    currentFenRef.current = startPosFen;
    setLastMove(undefined);
    setBrowsePosition({ index: -1, variationPath: [] });

    evalHistoryTrailRef.current = [];
    queuePositionEval(startPosFen, 0);

    setPhase('playing');
    phaseRef.current = 'playing';

    if (sideToMoveFromFen(startPosFen) !== uc) {
      setOpponentBusy(true);
      opponentBusyRef.current = true;
      setTimeout(async () => {
        try {
          await playOpponentOnce();
        } finally {
          setOpponentBusy(false);
          opponentBusyRef.current = false;
        }
      }, 0);
    }
  }, [
    gameMode,
    userId,
    openingNr,
    colorChoice,
    queuePositionEval,
    playOpponentOnce,
  ]);

  const playAgain = useCallback(async () => {
    lastBoardMoveKeyRef.current = '';
    setMoveListEvalData(null);
    setRatingDelta(null);
    evalJobsRef.current = [];
    evalHistoryTrailRef.current = [];
    setPlayedSans([]);
    setLastMove(undefined);
    setBrowsePosition({ index: -1, variationPath: [] });
    userMovesDoneRef.current = 0;

    const gen = positionRef.current?.generatePosition?.();
    // If PositionSelector were unmounted, gen would be missing and we'd repeat openingNr — see always-mounted selector below.
    const nr =
      gen?.openingNr ?? (rankedMode ? randomInt(960) : openingNr);
    setOpeningNr(nr);

    let uc = 'white';
    if (gameMode === 'ranked') {
      uc = Math.random() < 0.5 ? 'white' : 'black';
    } else if (colorChoice === 'random') {
      uc = Math.random() < 0.5 ? 'white' : 'black';
    } else {
      uc = colorChoice;
    }
    setUserColor(uc);
    userColorRef.current = uc;

    const sf = positionNrToStartFen(nr);
    setStartFen(sf);
    startFenRef.current = sf;
    setCurrentFen(sf);
    currentFenRef.current = sf;

    if (gameMode === 'ranked' && userId) {
      const rowId = crypto.randomUUID();
      await insertUserOpening(
        createRatedOpeningRow({
          id: rowId,
          userId,
          openingNr: nr,
          color: uc,
        })
      );
      setOpeningRowId(rowId);
      openingRowIdRef.current = rowId;
      setIsRatedSession(true);
      isRatedRef.current = true;
    } else {
      setOpeningRowId(null);
      openingRowIdRef.current = null;
      setIsRatedSession(false);
      isRatedRef.current = false;
    }

    setPhase('playing');
    phaseRef.current = 'playing';
    queuePositionEval(sf, 0);

    if (sideToMoveFromFen(sf) !== uc) {
      setOpponentBusy(true);
      opponentBusyRef.current = true;
      setTimeout(async () => {
        try {
          await playOpponentOnce();
        } finally {
          setOpponentBusy(false);
          opponentBusyRef.current = false;
        }
      }, 0);
    }
  }, [userId, gameMode, colorChoice, openingNr, rankedMode, queuePositionEval, playOpponentOnce]);

  const onTrainingNotice = useCallback(() => {
    setInfoMessage('Switch to training mode to customize.');
    setTimeout(() => setInfoMessage(''), 2400);
  }, []);

  return (
    <>
      <Head>
        <title>Openings - 960 Dojo</title>
      </Head>
      <main className="page-shell openings-page">
        <SectionTitle title="Openings" />

        <div className="openings-layout">
          <div className="openings-col-board">
            <div className="openings-board-head">
              <PositionDisplay value={openingNr} editable={false} />
              {opponentToMove ? (
                <div
                  className={[
                    'openings-opponent-thinking',
                    opponentBusy ? 'openings-opponent-thinking--busy' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  role="status"
                  aria-live="polite"
                  aria-label={opponentBusy ? 'Opponent is thinking' : 'Opponent to move'}
                  title={opponentBusy ? 'Opponent is thinking' : 'Opponent to move'}
                >
                  <span className="openings-opponent-thinking__mark" aria-hidden>
                    <svg
                      className="openings-opponent-thinking__cloud"
                      viewBox="0 0 44 34"
                      width="34"
                      height="26"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        className="openings-opponent-thinking__cloud-main"
                        d="M22 5.5c4.2-.8 8.6 1.1 10.8 4.8 2.4 4 1.8 9-1.4 12.2-2.2 2.2-5.4 3.2-8.6 2.8-3.8-.4-7-2.8-8.4-6.4-1-2.6-.6-5.6 1.2-7.8 1.8-2.2 4.6-3.4 7.4-3.6z"
                        fill="rgba(46, 164, 255, 0.14)"
                        strokeWidth="2.15"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <ellipse
                        className="openings-opponent-thinking__cloud-puff"
                        cx="13"
                        cy="21"
                        rx="5.2"
                        ry="4.6"
                        fill="rgba(255, 228, 196, 0.1)"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                      />
                      <circle
                        className="openings-opponent-thinking__cloud-dot"
                        cx="7"
                        cy="26.5"
                        r="2.4"
                        fill="none"
                        strokeWidth="1.65"
                        strokeLinecap="round"
                      />
                      <path
                        className="openings-opponent-thinking__cloud-tail"
                        d="M4.5 30.5l-2.2 2.8"
                        fill="none"
                        strokeWidth="1.55"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="openings-opponent-thinking__dots">
                      <span />
                      <span />
                      <span />
                    </span>
                  </span>
                </div>
              ) : null}
            </div>
            <div className="training-chessboard">
              <Chessboard
                fen={displayedFen}
                orientation={phase === 'setup' && colorChoice === 'black' ? 'black' : (userColor === 'black' ? 'black' : 'white')}
                onMove={onBoardMove}
                disabled={phase !== 'playing' || !isBrowsingLive}
                lastMove={lastMove}
                movableColor={userColor}
                premoveEnabled
              />
            </div>
            <RatingDisplay
              className="rating-display--panel"
              label="Your openings rating"
              rating={rankedMode ? dbRating : trainingRating}
              delta={ratingDelta}
              provisional={
                rankedMode && (openingsRatingCount || 0) < ESTABLISHED_RATING_MIN_ENTRIES
              }
            />
          </div>

          <div
            className={[
              'openings-col-side',
              showSetup ? '' : 'openings-col-side--playing',
              !showSetup && phase === 'done' ? 'openings-col-side--done' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {showSetup ? (
              <>
                <ModeSelector
                  mode={gameMode}
                  onModeChange={setGameMode}
                  colorChoice={colorChoice}
                  onColorChange={setColorChoice}
                  rankedLocked={!userId}
                />
              </>
            ) : (
              <>
                {phase === 'done' && openingsLichessUrl ? (
                  <div className="narrow-action">
                    <OpenInLichessBtn onClick={() => window.open(openingsLichessUrl, '_blank')} />
                  </div>
                ) : null}
                <MoveList
                  pgn={moveListPgn}
                  evalData={moveListEvalData}
                  userColor={userColor}
                  startTurn={startFen ? sideToMoveFromFen(startFen) : 'white'}
                  loading={moveListLoading}
                  onBrowsePositionChanged={handleBrowsePositionChanged}
                  selectedPosition={browsePosition}
                  resetSelectionOnPgnChange={false}
                />
                {phase === 'done' ? (
                  <div className="narrow-action">
                    <PlayAgainBtn onClick={playAgain} disabled={gameMode === 'ranked' && !userId} />
                  </div>
                ) : null}
              </>
            )}
            {/* Stay mounted while playing so positionRef.generatePosition works on Play again */}
            <PositionSelector
              ref={positionRef}
              minimal={!showSetup}
              rankedMode={rankedMode}
              openingNr={openingNr}
              onOpeningNrChange={setOpeningNr}
              onTrainingOnlyNotice={onTrainingNotice}
            />
            {showSetup ? (
              <>
                <StartBtn onClick={startGame} disabled={gameMode === 'ranked' && !userId} />
                {!rankedMode ? (
                  <label className="training-rating-field">
                    Training rating (used for Lichess explorer + Stockfish)
                    <input
                      type="number"
                      value={trainingRating}
                      onChange={(e) => setTrainingRating(Number(e.target.value) || 1500)}
                    />
                  </label>
                ) : null}
                {infoMessage ? (
                  <div className="text-warn">{infoMessage}</div>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </main>
    </>
  );
}
