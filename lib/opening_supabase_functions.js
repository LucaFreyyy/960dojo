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
        console.log('[fetchUnfinishedOpening] No unfinished opening found for userId:', userId);
        const openingNr = Math.floor(Math.random() * 960);
        const color = Math.random() < 0.5 ? 'white' : 'black';
        return { openingNr, color, pgn: '', evalHistory: [] };
    }

    const pgnLines = data.pgn.split('\n');
    if (window.HALF_MOVE_THRESHOLD <= pgnLines.length) {
        window.HALF_MOVE_THRESHOLD = Math.floor(Math.random() * (24 - pgnLines.length)) + pgnLines.length + 1;
    }

    return {
        openingNr: data.openingNr,
        color: data.color,
        pgn: data.pgn,
        evalHistory: data.evalHistory,
    };
}

export async function writeGameStateToDatabase(userId) {
    if (window.WRITING_INTO_DATABASE) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return writeGameStateToDatabase(userId);
    }
    window.WRITING_INTO_DATABASE = true;
    if (!userId) throw new Error('Missing userId');

    try {
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

        const pgn = window.gameState.fenHistory
            .map((fen, i) => `${fen} ${window.gameState.moveHistoryUCI[i] || ''}`.trim())
            .join('\n');
        window.sessionUser.pgn = pgn;

        const { error: updateError } = await supabase
            .from('UserOpening')
            .update({ pgn })
            .eq('id', data.id)
            .is('finished', null);

        if (updateError) {
            console.error('[writeGameStateToDatabase] Failed to update PGN:', updateError);
        }
    } finally {
        window.WRITING_INTO_DATABASE = false;
    }
}

export async function getFinishedGameCount(userId) {
    if (!userId) return 0;

    const { count, error } = await supabase
        .from('UserOpening')
        .select('id', { count: 'exact', head: true })
        .eq('userId', userId)
        .not('finished', 'is', null);

    if (error) {
        console.error('[getFinishedGameCount] Error:', error);
        return 0;
    }
    return count || 0;
}

export async function writeBackOldOpeningAndFetchNew(userId) {
    if (window.WRITING_INTO_DATABASE) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return writeBackOldOpeningAndFetchNew(userId);
    }
    window.WRITING_INTO_DATABASE = true;
    if (!userId) throw new Error('Missing userId');

    try {
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

        const evalCp = window.gameState.evaluations?.at(-1) ?? null;

        const { error: updateError } = await supabase
            .from('UserOpening')
            .update({
                pgn: null,
                evalCp,
                finished: new Date().toISOString(),
                evalHistory: [],
            })
            .eq('id', unfinished.id)
            .is('finished', null); // guard: only finish if not already finished

        if (updateError) {
            console.error('[writeBackOldOpeningAndFetchNew] Failed to finish old opening:', updateError);
            return;
        }

        const newOpening = {
            id: crypto.randomUUID(),
            userId,
            openingNr: Math.floor(Math.random() * 960),
            color: Math.random() < 0.5 ? 'white' : 'black',
            pgn: '',
            evalCp: null,
            finished: null,
            evalHistory: [],
        };

        const { error: insertError } = await supabase
            .from('UserOpening')
            .insert(newOpening);

        if (insertError) {
            console.error('[writeBackOldOpeningAndFetchNew] Failed to create new opening:', insertError);
            return;
        }

        window.sessionUser.openingNr = newOpening.openingNr;
        window.sessionUser.color = newOpening.color;
        window.sessionUser.pgn = newOpening.pgn;
    } finally {
        window.WRITING_INTO_DATABASE = false;
    }
}

export async function appendEvalToDatabase(userId, evalCp, fen) {
    if (window.WRITING_INTO_DATABASE) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return appendEvalToDatabase(userId, evalCp, fen);
    }
    window.WRITING_INTO_DATABASE = true;

    if (!userId) throw new Error('Missing userId');

    try {
        const { data, error } = await supabase
            .from('UserOpening')
            .select('id, evalHistory, pgn')
            .eq('userId', userId)
            .is('finished', null)
            .maybeSingle();

        if (error || !data) {
            console.info('[appendEvalToDatabase] Failed to find unfinished opening:', error || 'not found');
            return;
        }

        const pgnLines = (data.pgn || '').split('\n').filter(Boolean);
        const lineFen = (line) => {
            const lastSpace = line.lastIndexOf(' ');
            return lastSpace !== -1 ? line.substring(0, lastSpace) : line;
        };
        const idx = pgnLines.findIndex((line) => lineFen(line) === fen || line.startsWith(fen));
        if (idx < 0) {
            console.warn('[appendEvalToDatabase] FEN not found in PGN, skipping eval write:', fen?.slice(0, 80));
            return;
        }
        const fenIndex = idx + 1;

        const updatedEvalHistory = Array.isArray(data.evalHistory) ? [...data.evalHistory] : [];
        while (updatedEvalHistory.length <= fenIndex) {
            updatedEvalHistory.push(null);
        }
        updatedEvalHistory[fenIndex] = evalCp;

        const { error: updateError } = await supabase
            .from('UserOpening')
            .update({ evalHistory: updatedEvalHistory })
            .eq('id', data.id)
            .is('finished', null); // guard: never write to a finished opening

        if (updateError) {
            console.error('[appendEvalToDatabase] Failed to update eval history:', updateError);
        }
    } finally {
        window.WRITING_INTO_DATABASE = false;
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