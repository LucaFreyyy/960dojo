import { supabase } from './supabase';

export async function fetchUnfinishedOpening(userId) {
    if (!userId) throw new Error('Missing userId');

    const { data, error } = await supabase
        .from('UserOpening')
        .select('openingNr, color, pgn, evalHistory')
        .eq('userId', userId)
        .is('finished', null)
        .maybeSingle();

    if (error) {
        console.error('[fetchUnfinishedOpening] Supabase error:', error);
        throw new Error('Failed to fetch unfinished opening');
    }

    if (!data) {
        throw new Error('No unfinished opening found');
    }

    if (window.HALF_MOVE_THRESHOLD <= data.pgn.split('\n').length) {
        window.HALF_MOVE_THRESHOLD = Math.floor(Math.random() * (24 - data.pgn.split('\n').length)) + data.pgn.split('\n').length + 1;
    }

    return {
        openingNr: data.openingNr,
        color: data.color,
        pgn: data.pgn,
        evalHistory: data.evalHistory,
    };
}

export async function writeGameStateToDatabase(userId) {
    window.WRITING_INTO_DATABASE = true;
    if (!userId) throw new Error('Missing userId');

    const { data, error } = await supabase
        .from('UserOpening')
        .select('id')
        .eq('userId', userId)
        .is('finished', null)
        .maybeSingle();

    if (error || !data) {
        console.error('[writeGameStateToDatabase] Failed to find unfinished opening:', error || 'not found');
        return;
    }

    const openingId = data.id;

    const pgn = window.gameState.fenHistory
        .map((fen, i) => `${fen} ${window.gameState.moveHistoryUCI[i] || ''}`.trim())
        .join('\n');
    window.sessionUser.pgn = pgn;

    const { error: updateError } = await supabase
        .from('UserOpening')
        .update({ pgn })
        .eq('id', openingId);

    if (updateError) {
        console.error('[writeGameStateToDatabase] Failed to update PGN:', updateError);
    }
    window.WRITING_INTO_DATABASE = false;
}

export async function writeBackOldOpeningAndFetchNew(userId) {
    window.WRITING_INTO_DATABASE = true;
    if (!userId) throw new Error('Missing userId');

    const { data: unfinished, error } = await supabase
        .from('UserOpening')
        .select('id')
        .eq('userId', userId)
        .is('finished', null)
        .maybeSingle();

    if (error || !unfinished) {
        console.error('[writeBackOldOpeningAndFetchNew] Failed to find unfinished opening:', error || 'not found');
        return;
    }

    const openingId = unfinished.id;

    const evalCp = window.gameState.evaluations?.at(-1) ?? null;

    // Finish the old opening
    const { error: updateError } = await supabase
        .from('UserOpening')
        .update({
            pgn: null,
            evalCp,
            finished: new Date().toISOString(),
            evalHistory: [],
        })
        .eq('id', openingId);

    if (updateError) {
        console.error('[writeBackOldOpeningAndFetchNew] Failed to finish old opening:', updateError);
        return;
    }

    // Create new one
    const newOpening = {
        userId,
        openingNr: Math.floor(Math.random() * 960),
        color: Math.random() < 0.5 ? 'white' : 'black',
        pgn: '',
    };

    const { error: insertError } = await supabase
        .from('UserOpening')
        .insert(newOpening);

    window.sessionUser.openingNr = newOpening.openingNr;
    window.sessionUser.color = newOpening.color;
    window.sessionUser.pgn = newOpening.pgn;

    if (insertError) {
        console.error('[writeBackOldOpeningAndFetchNew] Failed to create new opening:', insertError);
    }
    window.WRITING_INTO_DATABASE = false;
}

export async function appendEvalToDatabase(userId, evalCp, fen) {
    window.WRITING_INTO_DATABASE = true;

    if (!userId) throw new Error('Missing userId');

    const { data, error } = await supabase
        .from('UserOpening')
        .select('id, evalHistory, pgn')
        .eq('userId', userId)
        .is('finished', null)
        .maybeSingle();

    if (error || !data) {
        console.error('[appendEvalToDatabase] Failed to find unfinished opening:', error || 'not found');
        window.WRITING_INTO_DATABASE = false;
        return;
    }

    const openingId = data.id;
    const pgnLines = (data.pgn || '').split('\n');
    const fenIndex = pgnLines.findIndex(line => line.startsWith(fen)) + 1;

    let updatedEvalHistory = Array.isArray(data.evalHistory) ? [...data.evalHistory] : [];
    // Extend array with nulls if needed
    while (updatedEvalHistory.length <= fenIndex) {
        updatedEvalHistory.push(null);
    }
    updatedEvalHistory[fenIndex] = evalCp;

    const { error: updateError } = await supabase
        .from('UserOpening')
        .update({ evalHistory: updatedEvalHistory })
        .eq('id', openingId);

    if (updateError) {
        console.error('[appendEvalToDatabase] Failed to update eval history:', updateError);
    }

    window.WRITING_INTO_DATABASE = false;
}

/*
model UserOpening {
  id             String    @id @default(cuid())
  userId         String
  openingNr      Int       // 0–959
  color          String    // "white" or "black"
  pgn            String
  evalCp         Int?      // Final eval in centipawns (e.g. +32, -10)
  evalHistory    Int[]?     // History of evaluations in centipawns
  finished       DateTime? @default(now())
  user           User      @relation(fields: [userId], references: [id])
}

window.gameState.position       // fen
window.gameState.userColor      // "black" or "white"
window.gameState.moveHistorySAN // array
window.gameState.moveHistoryUCI // array
window.gameState.fenHistory     // array
window.gameState.evaluations    // array
*/