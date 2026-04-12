import { createRatedOpeningRow } from '../../../lib/openingsUserOpening';
import { createSupabaseAdmin } from '../../../lib/supabaseAdmin';
import { getRandomOpening, fetchNewTactic } from '../../../lib/userInit';

async function hashEmail(email) {
    const encoder = new TextEncoder();
    const data = encoder.encode(email);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const supabaseAdmin = createSupabaseAdmin();
    const { email, password, username } = req.body;

    if (!username?.trim()) return res.status(400).json({ error: 'Username is required' });

    // Double-check uniqueness server-side
    const { data: existingName } = await supabaseAdmin
        .from('User')
        .select('id')
        .eq('name', username.trim())
        .maybeSingle();

    if (existingName) return res.status(400).json({ error: 'Username already taken' });

    const { data, error } = await supabaseAdmin.auth.signUp({ email, password });
    if (error) return res.status(400).json({ error: error.message });

    const id = email ? await hashEmail(email) : null;
    const { data: existing } = await supabaseAdmin.from('User').select('id').eq('id', id).maybeSingle();

    if (!existing) {
        const { error: userError } = await supabaseAdmin.from('User').insert({ id, email, name: username.trim(), bio: '' });
        const ratings = ['bullet', 'blitz', 'rapid', 'classical', 'tactics', 'openings'].map(type => ({
            id: crypto.randomUUID(),
            userId: id,
            type,
            value: 1500,
        }));
        const { error: ratingError } = await supabaseAdmin.from('Rating').insert(ratings);

        let tacticId = null;
        try { tacticId = await fetchNewTactic(supabaseAdmin, id); } catch {}
        if (tacticId) {
            await supabaseAdmin.from('UserTactic').insert({
                id: crypto.randomUUID(),
                userId: id,
                tacticId,
            });
        }

        const { openingNr, color } = getRandomOpening();
        await supabaseAdmin.from('UserOpening').insert(
            createRatedOpeningRow({
                id: crypto.randomUUID(),
                userId: id,
                openingNr,
                color,
            })
        );
    }

    const needsEmailConfirmation = !data?.session;
    return res.status(200).json({ success: true, needsEmailConfirmation });
}