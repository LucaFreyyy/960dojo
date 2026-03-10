import { createClient } from '@supabase/supabase-js';
import { getRandomOpening, fetchNewTactic } from '../../../lib/userInit';

async function hashEmail(email) {
    const encoder = new TextEncoder();
    const data = encoder.encode(email);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const { email, password } = req.body;

    const { data, error } = await supabaseAdmin.auth.signUp({ email, password });
    console.log('[signup] auth:', error ?? 'OK');
    if (error) return res.status(400).json({ error: error.message });

    const id = email ? await hashEmail(email) : null;
    const { data: existing } = await supabaseAdmin.from('User').select('id').eq('id', id).maybeSingle();
    console.log('[signup] existing:', existing ?? 'none');

    if (!existing) {
        const { error: userError } = await supabaseAdmin.from('User').insert({ id, email, name: '', bio: '' });
        console.log('[signup] user insert:', userError ?? 'OK');

        const ratings = ['bullet', 'blitz', 'rapid', 'classical', 'tactics', 'openings'].map(type => ({
            id: crypto.randomUUID(),
            userId: id,
            type,
            value: 1500,
        }));
        const { error: ratingError } = await supabaseAdmin.from('Rating').insert(ratings);
        console.log('[signup] rating insert:', ratingError ?? 'OK');

        let tacticId = null;
        try { tacticId = await fetchNewTactic(id); } catch {}
        if (tacticId) {
            const { error: tacticError } = await supabaseAdmin.from('UserTactic').insert({
                id: crypto.randomUUID(),
                userId: id,
                tacticId,
            });
            console.log('[signup] tactic insert:', tacticError ?? 'OK');
        }

        const { openingNr, color } = getRandomOpening();
        const { error: openingError } = await supabaseAdmin.from('UserOpening').insert({
            id: crypto.randomUUID(),
            userId: id,
            openingNr,
            color,
            pgn: '',
            evalCp: null,
            finished: null,
            evalHistory: [],
        });
        console.log('[signup] opening insert:', openingError ?? 'OK');
    }

    return res.status(200).json({ success: true });
}