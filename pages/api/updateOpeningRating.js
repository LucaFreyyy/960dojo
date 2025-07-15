import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const { id, newRating } = req.body;
    console.log('API called with:', { id, newRating });

    const { error } = await supabase
        .from('Rating')
        .insert({
            userId: id,
            type: 'openings',
            value: newRating,
        });

    if (error) {
        console.error('Supabase insert error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(200).json({ success: true });
}
