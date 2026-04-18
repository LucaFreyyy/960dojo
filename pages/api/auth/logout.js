import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
    await supabase.auth.signOut();
    return res.status(200).json({ success: true });
}