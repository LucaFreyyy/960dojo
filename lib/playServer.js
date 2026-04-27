import { createSupabaseAdmin } from './supabaseAdmin';
import { applyPlayMoveOrThrow, compatFromState, fenCoreForCompare } from './playMoveResolution';
import { buildArchivePgn } from './playPgn';
import { getRedisClient } from './playRedis';
import { refreshUserStreakInDb } from './streakServer';
import {
  getTimeControlByValue,
  PLAY_ACTIVE_GAME_TTL_SECONDS,
  PLAY_GAME_TTL_SECONDS,
  PLAY_NOTIFICATION_KIND_REMATCH,
  PLAY_QUEUE_TTL_SECONDS,
  PLAY_TIME_CONTROLS,
} from './playConstants';
import { positionNrToStartFen } from './chess960';

const GLICKO_SCALE = 173.7178;
const GLICKO_DEFAULT_RATING = 1500;
const GLICKO_DEFAULT_RD = 350;
const GLICKO_DEFAULT_VOLATILITY = 0.06;
const GLICKO_TAU = 0.5;
const MAX_TIMEOUT_GRACE_MS = 1000;
const GAME_HANDSHAKE_TIMEOUT_MS = 10_000;
const GAME_DISCONNECT_GRACE_MS = 20_000;
const PLAY_WATCHDOG_INTERVAL_MS = 5_000;
const PLAY_WATCHDOG_LOCK_KEY = 'play:watchdog:lock';

let playWatchdogStarted = false;

async function publishUserStatusEvent(redis, userId, statusPatch) {
  await redis.publish(
    `play:user:${userId}:status`,
    JSON.stringify({ type: 'status_update', ...statusPatch })
  );
}

function queueKey(time) {
  return `play:queue:format:${time}`;
}

function queueUserKey(userId) {
  return `play:queue:user:${userId}`;
}

function activeGameKey(userId) {
  return `play:user:${userId}:active-game`;
}

function gameStateKey(gameId) {
  return `play:game:${gameId}:state`;
}

function gameChannel(gameId) {
  return `play:game:${gameId}`;
}

function matchLockKey(time) {
  return `play:lock:match:${time}`;
}

function nowIso() {
  return new Date().toISOString();
}

function isLiveGameStatus(status) {
  return status === 'active' || status === 'awaiting_handshake';
}

function calculateDisconnectDeadlineIso() {
  return new Date(Date.now() + GAME_DISCONNECT_GRACE_MS).toISOString();
}

function formatPgnDate(iso) {
  const d = new Date(iso || Date.now());
  if (Number.isNaN(d.getTime())) return '????.??.??';
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

function formatPgnTime(iso) {
  const d = new Date(iso || Date.now());
  if (Number.isNaN(d.getTime())) return '??:??:??';
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  const ss = String(d.getUTCSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function formatPgnTimeControl(timeControl) {
  const initialSeconds = Math.max(0, Math.floor((Number(timeControl?.initialMs) || 0) / 1000));
  const incrementSeconds = Math.max(0, Math.floor((Number(timeControl?.incrementMs) || 0) / 1000));
  return `${initialSeconds}+${incrementSeconds}`;
}

function colorForUser(game, userId) {
  if (game.whiteId === userId) return 'white';
  if (game.blackId === userId) return 'black';
  return null;
}

function oppositeColor(color) {
  return color === 'white' ? 'black' : 'white';
}

function oppositeUserId(game, userId) {
  return game.whiteId === userId ? game.blackId : game.whiteId;
}

function normalizeJsonObject(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  if (typeof value === 'object') return value;
  return fallback;
}

function clampClock(ms) {
  return Math.max(0, Math.floor(Number(ms) || 0));
}

function calculateDisplayClocks(game, atMs = Date.now()) {
  const whiteMs = clampClock(game.clock?.whiteMs);
  const blackMs = clampClock(game.clock?.blackMs);
  if (game.status !== 'active') {
    return {
      whiteMs,
      blackMs,
      activeColor: game.clock?.activeColor || 'white',
      runningSince: game.clock?.runningSince || game.updatedAt || game.createdAt,
    };
  }
  const activeColor = game.clock?.activeColor || 'white';
  const runningSinceMs = Date.parse(game.clock?.runningSince || game.updatedAt || game.createdAt || nowIso());
  const elapsed = Math.max(0, atMs - (Number.isFinite(runningSinceMs) ? runningSinceMs : atMs));
  return {
    whiteMs: activeColor === 'white' ? clampClock(whiteMs - elapsed) : whiteMs,
    blackMs: activeColor === 'black' ? clampClock(blackMs - elapsed) : blackMs,
    activeColor,
    runningSince: game.clock?.runningSince || game.updatedAt || game.createdAt,
  };
}

function serializeGameForClient(game) {
  return {
    ...game,
    serverNowMs: Date.now(),
    displayClock: calculateDisplayClocks(game),
  };
}

async function publishGameEvent(redis, gameId, payload) {
  await redis.publish(gameChannel(gameId), JSON.stringify(payload));
}

async function saveGameState(redis, game) {
  const pipeline = redis.pipeline();
  pipeline.set(gameStateKey(game.id), JSON.stringify(game), { ex: PLAY_GAME_TTL_SECONDS });
  if (isLiveGameStatus(game.status)) {
    pipeline.set(activeGameKey(game.whiteId), game.id, { ex: PLAY_ACTIVE_GAME_TTL_SECONDS });
    pipeline.set(activeGameKey(game.blackId), game.id, { ex: PLAY_ACTIVE_GAME_TTL_SECONDS });
  }
  await pipeline.exec();
}

async function clearActiveGame(redis, game) {
  await redis.del([activeGameKey(game.whiteId), activeGameKey(game.blackId)]);
}

async function getStoredGame(gameId) {
  const redis = getRedisClient();
  const raw = await redis.get(gameStateKey(gameId));
  if (!raw) return null;
  return normalizeJsonObject(raw, null);
}

async function loadUsersByIds(userIds) {
  const supabaseAdmin = createSupabaseAdmin();
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  if (!uniqueIds.length) return new Map();
  const { data } = await supabaseAdmin.from('User').select('id, name').in('id', uniqueIds);
  return new Map((data || []).map((row) => [row.id, row]));
}

async function getOrCreatePlayRatingState(userId, ratingType) {
  const supabaseAdmin = createSupabaseAdmin();
  const { data: existing } = await supabaseAdmin
    .from('PlayRatingState')
    .select('userId, type, rating, rd, volatility, gamesPlayed')
    .eq('userId', userId)
    .eq('type', ratingType)
    .maybeSingle();
  if (existing) {
    return {
      userId,
      type: ratingType,
      rating: Number(existing.rating) || GLICKO_DEFAULT_RATING,
      rd: Number(existing.rd) || GLICKO_DEFAULT_RD,
      volatility: Number(existing.volatility) || GLICKO_DEFAULT_VOLATILITY,
      gamesPlayed: Number(existing.gamesPlayed) || 0,
    };
  }
  const { data: latest } = await supabaseAdmin
    .from('Rating')
    .select('value')
    .eq('userId', userId)
    .eq('type', ratingType)
    .order('createdAt', { ascending: false })
    .limit(1)
    .maybeSingle();
  return {
    userId,
    type: ratingType,
    rating: Number(latest?.value) || GLICKO_DEFAULT_RATING,
    rd: GLICKO_DEFAULT_RD,
    volatility: GLICKO_DEFAULT_VOLATILITY,
    gamesPlayed: 0,
  };
}

function g(phi) {
  return 1 / Math.sqrt(1 + (3 * phi * phi) / (Math.PI * Math.PI));
}

function expected(mu, muJ, phiJ) {
  return 1 / (1 + Math.exp(-g(phiJ) * (mu - muJ)));
}

function computeNewVolatility(phi, sigma, delta, variance, tau = GLICKO_TAU) {
  const alpha = Math.log(sigma * sigma);
  const f = (x) => {
    const ex = Math.exp(x);
    const num = ex * (delta * delta - phi * phi - variance - ex);
    const den = 2 * Math.pow(phi * phi + variance + ex, 2);
    return num / den - (x - alpha) / (tau * tau);
  };

  let a = alpha;
  let b;
  if (delta * delta > phi * phi + variance) {
    b = Math.log(delta * delta - phi * phi - variance);
  } else {
    let k = 1;
    b = alpha - k * tau;
    while (f(b) < 0) {
      k += 1;
      b = alpha - k * tau;
    }
  }

  let fa = f(a);
  let fb = f(b);
  while (Math.abs(b - a) > 1e-6) {
    const c = a + ((a - b) * fa) / (fb - fa);
    const fc = f(c);
    if (fc * fb < 0) {
      a = b;
      fa = fb;
    } else {
      fa /= 2;
    }
    b = c;
    fb = fc;
  }
  return Math.exp(a / 2);
}

function applyGlicko2(player, opponent, score) {
  const mu = (player.rating - 1500) / GLICKO_SCALE;
  const phi = player.rd / GLICKO_SCALE;
  const muJ = (opponent.rating - 1500) / GLICKO_SCALE;
  const phiJ = opponent.rd / GLICKO_SCALE;
  const gPhi = g(phiJ);
  const eVal = expected(mu, muJ, phiJ);
  const variance = 1 / (gPhi * gPhi * eVal * (1 - eVal));
  const delta = variance * gPhi * (score - eVal);
  const sigmaPrime = computeNewVolatility(phi, player.volatility, delta, variance);
  const phiStar = Math.sqrt(phi * phi + sigmaPrime * sigmaPrime);
  const phiPrime = 1 / Math.sqrt((1 / (phiStar * phiStar)) + (1 / variance));
  const muPrime = mu + phiPrime * phiPrime * gPhi * (score - eVal);
  return {
    rating: Math.round(muPrime * GLICKO_SCALE + 1500),
    rd: Math.max(30, Math.round(phiPrime * GLICKO_SCALE)),
    volatility: sigmaPrime,
  };
}

async function persistRatingState(userId, ratingType, nextState) {
  const supabaseAdmin = createSupabaseAdmin();
  const createdAt = nowIso();
  await supabaseAdmin.from('PlayRatingState').upsert(
    {
      userId,
      type: ratingType,
      rating: nextState.rating,
      rd: nextState.rd,
      volatility: nextState.volatility,
      gamesPlayed: nextState.gamesPlayed,
      updatedAt: createdAt,
    },
    { onConflict: 'userId,type' }
  );
  await supabaseAdmin.from('Rating').insert({
    id: crypto.randomUUID(),
    userId,
    type: ratingType,
    value: nextState.rating,
    createdAt,
  });
}

async function getQueueEntryForUser(redis, userId) {
  const time = await redis.get(queueUserKey(userId));
  return time ? { time } : null;
}

async function removeUserFromQueue(redis, userId, time = null) {
  const queueTime = time || (await redis.get(queueUserKey(userId)));
  if (!queueTime) return false;
  await redis.pipeline()
    .lrem(queueKey(queueTime), 0, userId)
    .del(queueUserKey(userId))
    .exec();
  return true;
}

async function ensureNoActiveGame(redis, userId) {
  const activeGameId = await redis.get(activeGameKey(userId));
  if (!activeGameId) return null;
  const game = await getStoredGame(activeGameId);
  if (!game) {
    await redis.del(activeGameKey(userId));
    return null;
  }
  return game;
}

async function createGameFromMatch(time, whiteId, blackId) {
  const redis = getRedisClient();
  const timeControl = getTimeControlByValue(time);
  if (!timeControl) throw new Error('Unsupported time control');

  const userMap = await loadUsersByIds([whiteId, blackId]);
  const [whiteRatingState, blackRatingState] = await Promise.all([
    getOrCreatePlayRatingState(whiteId, timeControl.ratingType),
    getOrCreatePlayRatingState(blackId, timeControl.ratingType),
  ]);
  const openingNr = Math.floor(Math.random() * 960);
  const initialFen = positionNrToStartFen(openingNr);
  const createdAt = nowIso();
  const handshakeDeadlineAt = new Date(Date.parse(createdAt) + GAME_HANDSHAKE_TIMEOUT_MS).toISOString();
  const game = {
    id: crypto.randomUUID(),
    time,
    ratingType: timeControl.ratingType,
    timeControl: {
      label: timeControl.label,
      initialMs: timeControl.initialMs,
      incrementMs: timeControl.incrementMs,
      ratingType: timeControl.ratingType,
    },
    openingNr,
    initialFen,
    status: 'awaiting_handshake',
    resultCode: '*',
    resultText: 'Waiting for both players to connect...',
    winnerColor: null,
    whiteId,
    blackId,
    whiteName: userMap.get(whiteId)?.name || 'White',
    blackName: userMap.get(blackId)?.name || 'Black',
    whiteRating: whiteRatingState.rating || GLICKO_DEFAULT_RATING,
    blackRating: blackRatingState.rating || GLICKO_DEFAULT_RATING,
    moves: [],
    lastMoveSquares: null,
    drawOffer: null,
    createdAt,
    updatedAt: createdAt,
    finishedAt: null,
    clock: {
      whiteMs: timeControl.initialMs,
      blackMs: timeControl.initialMs,
      activeColor: 'white',
      runningSince: null,
    },
    handshake: {
      deadlineAt: handshakeDeadlineAt,
      whiteReady: false,
      blackReady: false,
    },
    connection: {
      whiteOnline: false,
      blackOnline: false,
      disconnectedColor: null,
      deadlineAt: null,
    },
    ratingDelta: null,
  };

  await saveGameState(redis, game);
  await publishGameEvent(redis, game.id, { type: 'game_created', game: serializeGameForClient(game) });
  return game;
}

async function tryMatchQueue(time) {
  const redis = getRedisClient();
  const lock = await redis.set(matchLockKey(time), crypto.randomUUID(), { nx: true, ex: 5 });
  if (!lock) return null;
  try {
    while (true) {
      const first = await redis.lpop(queueKey(time));
      if (!first) return null;
      const firstQueueTime = await redis.get(queueUserKey(first));
      if (firstQueueTime !== time) continue;

      const second = await redis.lpop(queueKey(time));
      if (!second) {
        await redis.lpush(queueKey(time), first);
        return null;
      }

      const secondQueueTime = await redis.get(queueUserKey(second));
      if (first === second || secondQueueTime !== time) {
        await redis.lpush(queueKey(time), first);
        continue;
      }

      await redis.pipeline()
        .del(queueUserKey(first))
        .del(queueUserKey(second))
        .exec();

      const whiteId = Math.random() < 0.5 ? first : second;
      const blackId = whiteId === first ? second : first;
      return createGameFromMatch(time, whiteId, blackId);
    }
  } finally {
    await redis.del(matchLockKey(time));
  }
}

async function cleanupFinishedGame(game, reasonText, resultCode, winnerColor = null) {
  const redis = getRedisClient();
  const finishedAt = nowIso();
  const finalGame = {
    ...game,
    status: resultCode === '1/2-1/2' ? 'draw' : 'finished',
    resultCode,
    resultText: reasonText,
    winnerColor,
    finishedAt,
    updatedAt: finishedAt,
    drawOffer: null,
    handshake: null,
  };

  const whiteScore = resultCode === '1-0' ? 1 : resultCode === '0-1' ? 0 : 0.5;
  const blackScore = 1 - whiteScore;
  const whiteState = await getOrCreatePlayRatingState(finalGame.whiteId, finalGame.ratingType);
  const blackState = await getOrCreatePlayRatingState(finalGame.blackId, finalGame.ratingType);
  const nextWhite = applyGlicko2(whiteState, blackState, whiteScore);
  const nextBlack = applyGlicko2(blackState, whiteState, blackScore);
  const persistedWhite = { ...nextWhite, gamesPlayed: whiteState.gamesPlayed + 1 };
  const persistedBlack = { ...nextBlack, gamesPlayed: blackState.gamesPlayed + 1 };
  await persistRatingState(finalGame.whiteId, finalGame.ratingType, persistedWhite);
  await persistRatingState(finalGame.blackId, finalGame.ratingType, persistedBlack);

  finalGame.ratingDelta = {
    white: persistedWhite.rating - finalGame.whiteRating,
    black: persistedBlack.rating - finalGame.blackRating,
    whiteAfter: persistedWhite.rating,
    blackAfter: persistedBlack.rating,
  };

  const pgnText = buildArchivePgn(finalGame, {
    Event: '960 Dojo Live Game',
    Site: '960dojo',
    Date: formatPgnDate(finalGame.createdAt),
    UTCDate: formatPgnDate(finalGame.createdAt),
    UTCTime: formatPgnTime(finalGame.createdAt),
    Round: '-',
    Variant: 'Chess960',
    SetUp: '1',
    FEN: finalGame.initialFen,
    TimeControl: formatPgnTimeControl(finalGame.timeControl),
    Control: String(finalGame.time || ''),
    OpeningNr: String(finalGame.openingNr),
    White: finalGame.whiteName,
    Black: finalGame.blackName,
    WhiteId: finalGame.whiteId,
    BlackId: finalGame.blackId,
    WhiteElo: String(finalGame.whiteRating),
    BlackElo: String(finalGame.blackRating),
    Termination: reasonText,
    Result: resultCode,
  });

  const supabaseAdmin = createSupabaseAdmin();
  await Promise.all([
    refreshUserStreakInDb(supabaseAdmin, finalGame.whiteId),
    refreshUserStreakInDb(supabaseAdmin, finalGame.blackId),
  ]);
  const { error: insertGameError } = await supabaseAdmin.from('Game').insert({
    id: finalGame.id,
    whiteId: finalGame.whiteId,
    blackId: finalGame.blackId,
    whiteRating: finalGame.whiteRating,
    blackRating: finalGame.blackRating,
    type: finalGame.ratingType,
    isRated: true,
    playedAt: finalGame.createdAt,
    pgn: pgnText,
    openingNr: finalGame.openingNr,
    result: resultCode,
  });
  if (insertGameError) {
    throw new Error(insertGameError.message || 'Failed to archive finished game');
  }

  await saveGameState(redis, finalGame);
  await clearActiveGame(redis, finalGame);
  await cancelRematchNotificationsForGame(finalGame.id);
  await publishGameEvent(redis, finalGame.id, { type: 'game_finished', game: serializeGameForClient(finalGame) });
  await Promise.all([
    publishUserStatusEvent(redis, finalGame.whiteId, { activeGame: null }),
    publishUserStatusEvent(redis, finalGame.blackId, { activeGame: null }),
  ]);
  return finalGame;
}

async function abortGameDueToConnection(game) {
  const redis = getRedisClient();
  const whiteReady = Boolean(game?.handshake?.whiteReady);
  const blackReady = Boolean(game?.handshake?.blackReady);
  const problematicColor = !whiteReady ? 'white' : !blackReady ? 'black' : 'white';
  const problematicName = problematicColor === 'white' ? game.whiteName : game.blackName;
  const message = `${problematicName} has connection issues. game aborted.`;
  const abortedAt = nowIso();
  const abortedGame = {
    ...game,
    status: 'aborted',
    resultCode: '*',
    resultText: message,
    finishedAt: abortedAt,
    updatedAt: abortedAt,
    drawOffer: null,
    handshake: null,
  };
  await saveGameState(redis, abortedGame);
  await clearActiveGame(redis, abortedGame);
  await publishGameEvent(redis, abortedGame.id, {
    type: 'game_aborted',
    message,
    game: serializeGameForClient(abortedGame),
  });
  await Promise.all([
    publishUserStatusEvent(redis, abortedGame.whiteId, { activeGame: null }),
    publishUserStatusEvent(redis, abortedGame.blackId, { activeGame: null }),
  ]);
  return abortedGame;
}

async function abortGameDueToDisconnect(game, disconnectedColor) {
  const redis = getRedisClient();
  const disconnectedName = disconnectedColor === 'white' ? game.whiteName : game.blackName;
  const message = `${disconnectedName} disconnected. game aborted.`;
  const abortedAt = nowIso();
  const abortedGame = {
    ...game,
    status: 'aborted',
    resultCode: '*',
    resultText: message,
    finishedAt: abortedAt,
    updatedAt: abortedAt,
    drawOffer: null,
    handshake: null,
    connection: {
      whiteOnline: false,
      blackOnline: false,
      disconnectedColor,
      deadlineAt: null,
    },
  };
  await saveGameState(redis, abortedGame);
  await clearActiveGame(redis, abortedGame);
  await publishGameEvent(redis, abortedGame.id, {
    type: 'game_aborted',
    message,
    game: serializeGameForClient(abortedGame),
  });
  await Promise.all([
    publishUserStatusEvent(redis, abortedGame.whiteId, { activeGame: null }),
    publishUserStatusEvent(redis, abortedGame.blackId, { activeGame: null }),
  ]);
  return abortedGame;
}

async function activateGameFromHandshake(game) {
  const redis = getRedisClient();
  const startedAt = nowIso();
  const activeGame = {
    ...game,
    status: 'active',
    resultText: 'Game in progress',
    updatedAt: startedAt,
    handshake: null,
    clock: {
      ...game.clock,
      activeColor: 'white',
      runningSince: startedAt,
    },
  };
  await saveGameState(redis, activeGame);
  await publishGameEvent(redis, activeGame.id, { type: 'game_started', game: serializeGameForClient(activeGame) });
  return activeGame;
}

async function resolveHandshakeIfNeeded(game) {
  if (!game || game.status !== 'awaiting_handshake') return game;
  const whiteReady = Boolean(game?.handshake?.whiteReady);
  const blackReady = Boolean(game?.handshake?.blackReady);
  if (whiteReady && blackReady) {
    return activateGameFromHandshake(game);
  }
  const deadlineMs = Date.parse(game?.handshake?.deadlineAt || '');
  if (!Number.isFinite(deadlineMs) || Date.now() <= deadlineMs) {
    return game;
  }
  return abortGameDueToConnection(game);
}

async function resolveDisconnectIfNeeded(game) {
  if (!game || game.status !== 'active') return game;
  const deadlineMs = Date.parse(game?.connection?.deadlineAt || '');
  const disconnectedColor = game?.connection?.disconnectedColor;
  if (!disconnectedColor || !Number.isFinite(deadlineMs)) return game;
  if (Date.now() <= deadlineMs) return game;
  return abortGameDueToDisconnect(game, disconnectedColor);
}

async function resolveTimeoutIfNeeded(game) {
  if (!game || game.status !== 'active') return game;
  const clocks = calculateDisplayClocks(game);
  if (clocks.whiteMs > MAX_TIMEOUT_GRACE_MS && clocks.blackMs > MAX_TIMEOUT_GRACE_MS) return game;
  const board = compatFromState(game);
  if (clocks.whiteMs <= MAX_TIMEOUT_GRACE_MS) {
    const result = board.isInsufficientMaterial() ? '1/2-1/2' : '0-1';
    const text = result === '1/2-1/2' ? 'Draw by timeout with insufficient material' : 'Black won on time';
    return cleanupFinishedGame(
      {
        ...game,
        clock: {
          ...clocks,
          whiteMs: 0,
        },
      },
      text,
      result,
      result === '0-1' ? 'black' : null
    );
  }
  const result = board.isInsufficientMaterial() ? '1/2-1/2' : '1-0';
  const text = result === '1/2-1/2' ? 'Draw by timeout with insufficient material' : 'White won on time';
  return cleanupFinishedGame(
    {
      ...game,
      clock: {
        ...clocks,
        blackMs: 0,
      },
    },
    text,
    result,
    result === '1-0' ? 'white' : null
  );
}

async function resolveBoardOutcomeIfNeeded(game) {
  if (!game || game.status !== 'active') return game;
  const board = compatFromState(game);
  if (board.isCheckmate()) {
    const winnerColor = board.turn() === 'w' ? 'black' : 'white';
    const resultCode = winnerColor === 'white' ? '1-0' : '0-1';
    return cleanupFinishedGame(game, `Checkmate, ${winnerColor} won`, resultCode, winnerColor);
  }
  if (board.isDraw()) {
    return cleanupFinishedGame(game, 'Game drawn', '1/2-1/2', null);
  }
  return game;
}

async function getGameForUser(gameId, userId) {
  const raw = await getStoredGame(gameId);
  if (!raw) return null;
  if (raw.whiteId !== userId && raw.blackId !== userId) return null;
  const postHandshake = await resolveHandshakeIfNeeded(raw);
  const postDisconnect = await resolveDisconnectIfNeeded(postHandshake);
  const postBoardOutcome = await resolveBoardOutcomeIfNeeded(postDisconnect);
  return resolveTimeoutIfNeeded(postBoardOutcome);
}

export async function getPlayStatus(userId) {
  const redis = getRedisClient();
  const controls = Array.isArray(PLAY_TIME_CONTROLS) ? PLAY_TIME_CONTROLS : [];

  const [queueTime, activeGameId] = await redis.mget(
    queueUserKey(userId),
    activeGameKey(userId),
  );

  const pipeline = redis.pipeline();
  for (const { time } of controls) {
    if (time) pipeline.llen(queueKey(time));
  }

  const [activeGame, lengths] = await Promise.all([
    activeGameId ? getGameForUser(activeGameId, userId) : Promise.resolve(null),
    pipeline.exec(),
  ]);
  const serializedLiveGame =
    activeGame && isLiveGameStatus(activeGame.status) ? serializeGameForClient(activeGame) : null;

  const queuePresence = {};
  controls.forEach(({ time }, i) => {
    if (time) queuePresence[time] = Number(lengths[i]) || 0;
  });

  return {
    queue: queueTime ? { time: queueTime } : null,
    activeGame: serializedLiveGame,
    queuePresence,
  };
}

export async function joinPlayQueue(userId, time) {
  const redis = getRedisClient();
  const timeControl = getTimeControlByValue(time);
  if (!timeControl) throw new Error('Unsupported time control');

  const [activeGameId, currentQueueTime] = await redis.mget(
    activeGameKey(userId),
    queueUserKey(userId),
  );

  if (activeGameId) {
    const game = await getGameForUser(activeGameId, userId);
    if (game && isLiveGameStatus(game.status)) {
      return { queue: null, game, matched: true };
    }
    if (game) {
      await clearActiveGame(redis, game);
    }
    await redis.del(activeGameKey(userId));
  }

  if (currentQueueTime && currentQueueTime !== time) {
    await removeUserFromQueue(redis, userId, currentQueueTime);
  }

  if (currentQueueTime !== time) {
    await redis.pipeline()
      .rpush(queueKey(time), userId)
      .expire(queueKey(time), PLAY_QUEUE_TTL_SECONDS)
      .set(queueUserKey(userId), time, { ex: PLAY_QUEUE_TTL_SECONDS })
      .exec();
  }

  const matchedGame = await tryMatchQueue(time);

  // Notify both users via SSE if matched
  if (matchedGame) {
    await Promise.all([
      publishUserStatusEvent(redis, matchedGame.whiteId, {
        queue: null,
        activeGame: serializeGameForClient(matchedGame),
      }),
      publishUserStatusEvent(redis, matchedGame.blackId, {
        queue: null,
        activeGame: serializeGameForClient(matchedGame),
      }),
    ]);
  } else {
    await publishUserStatusEvent(redis, userId, { queue: { time } });
  }

  return {
    queue: matchedGame ? null : { time },
    game: matchedGame,
    matched: Boolean(matchedGame),
  };
}

export async function cancelPlayQueue(userId) {
  const redis = getRedisClient();
  const removed = await removeUserFromQueue(redis, userId);
  if (removed) {
    await publishUserStatusEvent(redis, userId, { queue: null });
  }
  return { cancelled: removed };
}

export async function getGameSnapshot(gameId, userId) {
  const game = await getGameForUser(gameId, userId);
  return game ? serializeGameForClient(game) : null;
}

export async function submitMove({
  gameId,
  userId,
  clientFen = null,
  from,
  to,
  san,
  promotion = null,
}) {
  const redis = getRedisClient();
  const game = await getGameForUser(gameId, userId);
  if (!game) throw new Error('Game not found');
  if (game.status !== 'active') throw new Error('Game is already over');
  const color = colorForUser(game, userId);
  if (!color) throw new Error('Not a participant');
  if ((game.clock?.activeColor || 'white') !== color) throw new Error('Not your turn');

  const clocks = calculateDisplayClocks(game);
  const { applied, uci, compat } = applyPlayMoveOrThrow(game, { from, to, promotion });
  const fen = compat.fen();
  if (clientFen && fenCoreForCompare(clientFen) !== fenCoreForCompare(fen)) {
    console.warn('[play] client fen core mismatch after move', { gameId, userId, clientFen, serverFen: fen });
  }

  const movingColor = color;
  const newMove = {
    uci,
    san: applied.san,
    color: movingColor,
    at: nowIso(),
  };
  let drawResolution = null;
  if (game.drawOffer && game.drawOffer.fromColor !== movingColor) {
    drawResolution = { type: 'draw_declined', by: movingColor };
  }

  const timestamp = nowIso();
  const updatedGame = {
    ...game,
    updatedAt: timestamp,
    moves: [...(game.moves || []), newMove],
    lastMoveSquares: [applied.from, applied.to],
    drawOffer: null,
    clock: {
      whiteMs: movingColor === 'white' ? clampClock(clocks.whiteMs + game.timeControl.incrementMs) : clocks.whiteMs,
      blackMs: movingColor === 'black' ? clampClock(clocks.blackMs + game.timeControl.incrementMs) : clocks.blackMs,
      activeColor: oppositeColor(movingColor),
      runningSince: timestamp,
    },
  };

  if (compat.isCheckmate()) {
    const resultCode = movingColor === 'white' ? '1-0' : '0-1';
    const finishedGame = await cleanupFinishedGame(updatedGame, `Checkmate, ${movingColor} won`, resultCode, movingColor);
    return { game: serializeGameForClient(finishedGame), eventType: 'game_finished' };
  }

  if (compat.isDraw()) {
    const finishedGame = await cleanupFinishedGame(updatedGame, 'Game drawn', '1/2-1/2', null);
    return { game: serializeGameForClient(finishedGame), eventType: 'game_finished' };
  }

  await saveGameState(redis, updatedGame);
  await publishGameEvent(redis, gameId, {
    type: 'move',
    move: newMove,
    drawResolution,
    game: serializeGameForClient(updatedGame),
  });
  return { game: serializeGameForClient(updatedGame), eventType: 'move' };
}

export async function resignGame(gameId, userId) {
  const game = await getGameForUser(gameId, userId);
  if (!game) throw new Error('Game not found');
  if (game.status !== 'active') return serializeGameForClient(game);
  const color = colorForUser(game, userId);
  const winnerColor = oppositeColor(color);
  const resultCode = winnerColor === 'white' ? '1-0' : '0-1';
  const finishedGame = await cleanupFinishedGame(game, `${winnerColor} won by resignation`, resultCode, winnerColor);
  return serializeGameForClient(finishedGame);
}

export async function offerDraw(gameId, userId) {
  const redis = getRedisClient();
  const game = await getGameForUser(gameId, userId);
  if (!game) throw new Error('Game not found');
  if (game.status !== 'active') throw new Error('Game is already over');
  const color = colorForUser(game, userId);
  if (game.drawOffer) {
    if (game.drawOffer.fromColor === color) {
      return serializeGameForClient(game);
    }
    const finishedGame = await cleanupFinishedGame(game, 'Game drawn by mutual draw offer', '1/2-1/2', null);
    return serializeGameForClient(finishedGame);
  }
  const updatedGame = {
    ...game,
    drawOffer: {
      fromColor: color,
      byUserId: userId,
      createdAt: nowIso(),
    },
    updatedAt: nowIso(),
  };
  await saveGameState(redis, updatedGame);
  await publishGameEvent(redis, gameId, {
    type: 'draw_offered',
    drawOffer: updatedGame.drawOffer,
    game: serializeGameForClient(updatedGame),
  });
  return serializeGameForClient(updatedGame);
}

export async function cancelDrawOffer(gameId, userId) {
  const redis = getRedisClient();
  const game = await getGameForUser(gameId, userId);
  if (!game) throw new Error('Game not found');
  if (game.status !== 'active') throw new Error('Game is already over');
  if (!game.drawOffer) return serializeGameForClient(game);
  const color = colorForUser(game, userId);
  if (game.drawOffer.fromColor !== color) {
    throw new Error('Only the offering player can cancel the draw offer');
  }
  const updatedGame = {
    ...game,
    drawOffer: null,
    updatedAt: nowIso(),
  };
  await saveGameState(redis, updatedGame);
  await publishGameEvent(redis, gameId, {
    type: 'draw_offer_cancelled',
    by: color,
    game: serializeGameForClient(updatedGame),
  });
  return serializeGameForClient(updatedGame);
}

export async function respondToDraw(gameId, userId, accept) {
  const redis = getRedisClient();
  const game = await getGameForUser(gameId, userId);
  if (!game) throw new Error('Game not found');
  if (!game.drawOffer) throw new Error('No pending draw offer');
  const color = colorForUser(game, userId);
  if (game.drawOffer.fromColor === color) throw new Error('Cannot respond to your own draw offer');

  if (accept) {
    const finishedGame = await cleanupFinishedGame(game, 'Game drawn by agreement', '1/2-1/2', null);
    return serializeGameForClient(finishedGame);
  }

  const updatedGame = {
    ...game,
    drawOffer: null,
    updatedAt: nowIso(),
  };
  await saveGameState(redis, updatedGame);
  await publishGameEvent(redis, gameId, {
    type: 'draw_declined',
    by: color,
    game: serializeGameForClient(updatedGame),
  });
  return serializeGameForClient(updatedGame);
}

async function deleteNotification(id) {
  const supabaseAdmin = createSupabaseAdmin();
  await supabaseAdmin.from('PlayNotification').delete().eq('id', id);
}

export async function cancelRematchNotificationsForGame(gameId, actorUserId = null) {
  const supabaseAdmin = createSupabaseAdmin();
  let query = supabaseAdmin
    .from('PlayNotification')
    .delete()
    .eq('kind', PLAY_NOTIFICATION_KIND_REMATCH)
    .eq('status', 'pending')
    .eq('gameId', gameId);
  if (actorUserId) {
    query = query.or(`userId.eq.${actorUserId},senderId.eq.${actorUserId}`);
  }
  await query;
}

export async function requestRematch(gameId, userId) {
  const game = await getGameForUser(gameId, userId);
  if (!game) throw new Error('Game not found');
  if (!game.finishedAt) throw new Error('Rematch is only available after the game ends');
  const opponentId = oppositeUserId(game, userId);
  await cancelRematchNotificationsForGame(gameId);
  const supabaseAdmin = createSupabaseAdmin();
  const notification = {
    id: crypto.randomUUID(),
    userId: opponentId,
    senderId: userId,
    gameId,
    kind: PLAY_NOTIFICATION_KIND_REMATCH,
    status: 'pending',
    payload: {
      time: game.time,
      ratingType: game.ratingType,
      whiteId: game.whiteId,
      blackId: game.blackId,
    },
    createdAt: nowIso(),
    read: false,
  };
  const { error: insertNotificationError } = await supabaseAdmin.from('PlayNotification').insert(notification);
  if (insertNotificationError) {
    throw new Error(insertNotificationError.message || 'Could not create rematch notification');
  }
  return notification;
}

export async function listPlayNotifications(userId) {
  const supabaseAdmin = createSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from('PlayNotification')
    .select('id, userId, senderId, gameId, kind, status, payload, createdAt, read')
    .eq('userId', userId)
    .eq('status', 'pending')
    .order('createdAt', { ascending: false });
  if (error) {
    throw new Error(error.message || 'Could not load play notifications');
  }
  return (data || []).map((row) => ({
    ...row,
    payload: normalizeJsonObject(row.payload, {}),
  }));
}

export async function countUnreadPlayNotifications(userId) {
  const supabaseAdmin = createSupabaseAdmin();
  const { count, error } = await supabaseAdmin
    .from('PlayNotification')
    .select('id', { count: 'exact', head: true })
    .eq('userId', userId)
    .eq('status', 'pending')
    .eq('read', false);
  if (error) {
    console.error('[play/countUnreadPlayNotifications]', error);
    return 0;
  }
  return count || 0;
}

export async function markPlayNotificationRead(notificationId, userId, read) {
  const supabaseAdmin = createSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from('PlayNotification')
    .update({ read: Boolean(read) })
    .eq('id', notificationId)
    .eq('userId', userId)
    .select('id, read')
    .maybeSingle();
  if (error) {
    throw new Error(error.message || 'Could not update play notification');
  }
  return data || null;
}

export async function markPlayerConnected(gameId, userId) {
  const redis = getRedisClient();
  const game = await getGameForUser(gameId, userId);
  if (!game) throw new Error('Game not found');
  if (game.status === 'aborted' || game.status === 'finished' || game.status === 'draw') {
    return serializeGameForClient(game);
  }
  const color = colorForUser(game, userId);
  if (!color) throw new Error('Not a participant');

  if (game.status === 'active') {
    const updated = {
      ...game,
      updatedAt: nowIso(),
      connection: {
        whiteOnline: color === 'white' ? true : Boolean(game.connection?.whiteOnline),
        blackOnline: color === 'black' ? true : Boolean(game.connection?.blackOnline),
        disconnectedColor: null,
        deadlineAt: null,
      },
    };
    await saveGameState(redis, updated);
    await publishGameEvent(redis, gameId, {
      type: 'connection_update',
      game: serializeGameForClient(updated),
    });
    return serializeGameForClient(updated);
  }

  if (game.status !== 'awaiting_handshake') {
    return serializeGameForClient(game);
  }

  const updated = {
    ...game,
    updatedAt: nowIso(),
    handshake: {
      deadlineAt: game.handshake?.deadlineAt || new Date(Date.now() + GAME_HANDSHAKE_TIMEOUT_MS).toISOString(),
      whiteReady: color === 'white' ? true : Boolean(game.handshake?.whiteReady),
      blackReady: color === 'black' ? true : Boolean(game.handshake?.blackReady),
    },
    connection: {
      whiteOnline: color === 'white' ? true : Boolean(game.connection?.whiteOnline),
      blackOnline: color === 'black' ? true : Boolean(game.connection?.blackOnline),
      disconnectedColor: null,
      deadlineAt: null,
    },
  };
  await saveGameState(redis, updated);
  await publishGameEvent(redis, gameId, {
    type: 'handshake_update',
    game: serializeGameForClient(updated),
  });
  const resolved = await resolveHandshakeIfNeeded(updated);
  return serializeGameForClient(resolved);
}

export async function markPlayerDisconnected(gameId, userId) {
  const redis = getRedisClient();
  const game = await getStoredGame(gameId);
  if (!game) return null;
  const color = colorForUser(game, userId);
  if (!color) return null;
  if (!isLiveGameStatus(game.status)) return serializeGameForClient(game);

  const wasOnline =
    color === 'white' ? Boolean(game.connection?.whiteOnline) : Boolean(game.connection?.blackOnline);
  if (!wasOnline && game.status === 'active' && game.connection?.disconnectedColor === color) {
    return serializeGameForClient(game);
  }

  const updatedConnection = {
    whiteOnline: color === 'white' ? false : Boolean(game.connection?.whiteOnline),
    blackOnline: color === 'black' ? false : Boolean(game.connection?.blackOnline),
    disconnectedColor: game.status === 'active' ? color : null,
    deadlineAt: game.status === 'active' ? calculateDisconnectDeadlineIso() : null,
  };
  const updated = {
    ...game,
    updatedAt: nowIso(),
    connection: updatedConnection,
  };
  await saveGameState(redis, updated);
  await publishGameEvent(redis, gameId, {
    type: 'connection_update',
    game: serializeGameForClient(updated),
  });
  return serializeGameForClient(updated);
}

async function runPlayWatchdogTick() {
  const redis = getRedisClient();
  const lock = await redis.set(PLAY_WATCHDOG_LOCK_KEY, crypto.randomUUID(), { nx: true, ex: 4 });
  if (!lock) return;
  try {
    const activeKeys = [];
    let cursor = '0';
    do {
      const reply = await redis.scan(cursor, { match: 'play:user:*:active-game', count: 200 });
      cursor = String(reply?.cursor || '0');
      const keys = Array.isArray(reply?.keys) ? reply.keys : [];
      activeKeys.push(...keys);
    } while (cursor !== '0');
    if (!activeKeys.length) return;
    const gameIdsRaw = await Promise.all(activeKeys.map((key) => redis.get(key)));
    const gameIds = [...new Set(gameIdsRaw.filter(Boolean))];
    await Promise.all(
      gameIds.map(async (gameId) => {
        const raw = await getStoredGame(gameId);
        if (!raw) return;
        const postHandshake = await resolveHandshakeIfNeeded(raw);
        const postDisconnect = await resolveDisconnectIfNeeded(postHandshake);
        const postBoardOutcome = await resolveBoardOutcomeIfNeeded(postDisconnect);
        await resolveTimeoutIfNeeded(postBoardOutcome);
      })
    );
  } catch (error) {
    console.error('[play/watchdog]', error);
  } finally {
    try {
      await redis.del(PLAY_WATCHDOG_LOCK_KEY);
    } catch {}
  }
}

export function startPlayServerWatchdog() {
  if (playWatchdogStarted) return;
  playWatchdogStarted = true;
  const timer = setInterval(() => {
    void runPlayWatchdogTick();
  }, PLAY_WATCHDOG_INTERVAL_MS);
  if (typeof timer.unref === 'function') {
    timer.unref();
  }
}

export async function respondToRematch(notificationId, userId, accept) {
  const supabaseAdmin = createSupabaseAdmin();
  const { data } = await supabaseAdmin
    .from('PlayNotification')
    .select('id, userId, senderId, gameId, kind, status, payload')
    .eq('id', notificationId)
    .eq('userId', userId)
    .maybeSingle();
  if (!data || data.kind !== PLAY_NOTIFICATION_KIND_REMATCH || data.status !== 'pending') {
    throw new Error('Rematch request not found');
  }
  const payload = normalizeJsonObject(data.payload, {});
  if (!accept) {
    await deleteNotification(notificationId);
    return { accepted: false, game: null };
  }
  const previousGame = await getStoredGame(data.gameId);
  if (!previousGame) {
    await deleteNotification(notificationId);
    throw new Error('Original game is no longer available');
  }
  await cancelRematchNotificationsForGame(data.gameId);
  const whiteId = Math.random() < 0.5 ? data.senderId : data.userId;
  const blackId = whiteId === data.senderId ? data.userId : data.senderId;
  const game = await createGameFromMatch(payload.time || previousGame.time, whiteId, blackId);
  return { accepted: true, game: serializeGameForClient(game) };
}
