import { supabase } from './supabase';

export async function fetchUnfinishedOpening(userId) {
    if (!userId) throw new Error('Missing userId');

    const { data, error } = await supabase
        .from('UserOpening')
        .select('openingNr, color, pgn')
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

    return {
        openingNr: data.openingNr,
        color: data.color,
        pgn: data.pgn,
    };
}

export async function writeGameStateToDatabase(userId) {
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

    const { error: updateError } = await supabase
        .from('UserOpening')
        .update({ pgn })
        .eq('id', openingId);

    if (updateError) {
        console.error('[writeGameStateToDatabase] Failed to update PGN:', updateError);
    }
}

export async function writeBackOldOpeningAndFetchNew(userId) {
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

    if (insertError) {
        console.error('[writeBackOldOpeningAndFetchNew] Failed to create new opening:', insertError);
    }
}


/*
model UserOpening {
  id             String    @id @default(cuid())
  userId         String
  openingNr      Int       // 0–959
  color          String    // "white" or "black"
  pgn            String
  evalCp         Int?      // Final eval in centipawns (e.g. +32, -10)
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