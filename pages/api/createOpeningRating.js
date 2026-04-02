import { createClient } from '@supabase/supabase-js';
import { hashEmail } from '../../lib/hashEmail';
import { createSupabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const token = authHeader.slice(7);

    const supabaseAuth = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const { data: { user }, error: authErr } = await supabaseAuth.auth.getUser(token);
    if (authErr || !user?.email) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id, newRating } = req.body;

    if (!id || typeof newRating !== 'number') {
        return res.status(400).json({ success: false, error: 'Missing or invalid parameters' });
    }

    const expectedId = await hashEmail(user.email);
    if (id !== expectedId) {
        return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    try {
        const supabaseAdmin = createSupabaseAdmin();
        const { error } = await supabaseAdmin
            .from('Rating')
            .insert({
                id: crypto.randomUUID(),
                userId: id,
                type: 'openings',
                value: newRating,
            });

        if (error) {
            console.error('Supabase insert error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        return res.status(200).json({ success: true });
    } catch (e) {
        console.error('createOpeningRating:', e);
        return res.status(500).json({ success: false, error: e.message || 'Server error' });
    }
}
