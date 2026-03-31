import { getStockfishMove } from "./stockfishUtils";


// This function gets a move from the database or else from stockfish as a SAN
export async function getMove(fen, rating) {
  const databaseMove = await getDatabaseMove(fen, rating)
  if (databaseMove != null) {
    return databaseMove;
  }
  const stockfishMove = await getStockfishMove(fen, rating)
  return stockfishMove;
}

// This function fetches all lichess games in the database for given FEN and rating
// -> Returns a weighted random selected next move (san format) if exists
// -> Returns null if error or no database entry
export async function getDatabaseMove(fen, rating) {
  const ratingMin = rating - 200;
  const ratingMax = rating + 200;
  console.log(`Fetching Lichess data for FEN: ${fen} with rating range ${ratingMin}-${ratingMax}`);


  const requestUrl = `/api/lichess_explorer?fen=${encodeURIComponent(fen)}&ratingMin=${ratingMin}&ratingMax=${ratingMax}`;
  try {
    const response = await fetch(requestUrl);
    if (!response.ok) {
      console.error('Lichess API error', response.status);
      return null;
    }
    const data = await response.json();
    if (!data.moves || data.moves.length === 0) {
      console.log("Database moves are null, chosen move: null");
      return null;
    }

    const totalGames = data.total || data.moves.reduce((sum, m) => sum + (m.white + m.draws + m.black), 0);
    if (totalGames === 0) {
      console.log("Database total games are 0, chosen move: null");
      return null;
    }

    // All checks are done, select a random move
    const movesWithProb = data.moves.map(move => {
      const count = move.white + move.draws + move.black;
      return { uci: move.uci, san: move.san, probability: count / totalGames };
    });

    const rand = Math.random();
    let cumulative = 0;
    let chosenMove = movesWithProb[movesWithProb.length - 1]; // fallback
    for (const move of movesWithProb) {
      cumulative += move.probability;
      if (rand < cumulative) { chosenMove = move; break; }
    }

    console.log("Database chosen move: " + chosenMove.san)
    return chosenMove.san;

  } catch (err) {
    console.error('Error fetching lichess data:', err);
    return null;
  }
}

