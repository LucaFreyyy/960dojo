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