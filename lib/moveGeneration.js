import { getStockfishMove } from "./stockfishUtils";

async function fetchLichessExplorerChoice(fen, rating, { variant = "standard" } = {}) {
  const ratingMin = rating - 200;
  const ratingMax = rating + 200;

  const requestUrl = `/api/lichess_explorer?fen=${encodeURIComponent(fen)}&ratingMin=${ratingMin}&ratingMax=${ratingMax}&variant=${encodeURIComponent(variant)}`;
  try {
    const response = await fetch(requestUrl);
    if (!response.ok) {
      console.error("Lichess API error", response.status);
      return null;
    }
    const data = await response.json();
    if (!data.moves || data.moves.length === 0) {
      return null;
    }

    const totalGames = data.total || data.moves.reduce((sum, m) => sum + (m.white + m.draws + m.black), 0);
    if (totalGames === 0) {
      return null;
    }

    const movesWithProb = data.moves.map((move) => {
      const count = move.white + move.draws + move.black;
      return { uci: move.uci, san: move.san, probability: count / totalGames };
    });

    const rand = Math.random();
    let cumulative = 0;
    let chosenMove = movesWithProb[movesWithProb.length - 1];
    for (const move of movesWithProb) {
      cumulative += move.probability;
      if (rand < cumulative) {
        chosenMove = move;
        break;
      }
    }

    return { san: chosenMove.san, uci: chosenMove.uci };
  } catch (err) {
    console.error("Error fetching lichess data:", err);
    return null;
  }
}

/** @returns {{ san: string, uci: string } | null} */
export async function getDatabaseMoveWithMeta(fen, rating, options = {}) {
  return fetchLichessExplorerChoice(fen, rating, options);
}

// This function fetches all lichess games in the database for given FEN and rating
// -> Returns a weighted random selected next move (san format) if exists
// -> Returns null if error or no database entry
export async function getDatabaseMove(fen, rating, options = {}) {
  const choice = await fetchLichessExplorerChoice(fen, rating, options);
  return choice?.san ?? null;
}

// This function gets a move from the database or else from stockfish as a SAN
export async function getMove(fen, rating) {
  const databaseMove = await getDatabaseMove(fen, rating);
  if (databaseMove != null) {
    return databaseMove;
  }
  const stockfishMove = await getStockfishMove(fen, rating);
  return stockfishMove;
}
