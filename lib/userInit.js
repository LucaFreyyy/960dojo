export function getRandomOpening() {
    const openingNr = Math.floor(Math.random() * 960);
    const color = Math.random() < 0.5 ? 'white' : 'black';
    return { openingNr, color };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabaseClient
 * @param {string} userId
 */
export async function fetchNewTactic(supabaseClient, userId) {
    const { data: ratingRow } = await supabaseClient
        .from('Rating').select('value').eq('userId', userId).eq('type', 'tactics').single();
    const baseRating = ratingRow.value;

    const { data: allTactics } = await supabaseClient.from('Tactic').select('id, rating');
    const { data: finishedRows } = await supabaseClient
        .from('UserTactic').select('tacticId').eq('userId', userId).not('finished', 'is', null);

    const finishedIds = new Set(finishedRows?.map(r => r.tacticId));
    const unfinished = allTactics.filter(t => !finishedIds.has(t.id));
    if (!unfinished.length) throw new Error('No unfinished tactics');

    const sorted = unfinished.map(t => ({ id: t.id, diff: Math.abs(t.rating - baseRating) }))
        .sort((a, b) => a.diff - b.diff);
    return sorted[0].id;
}