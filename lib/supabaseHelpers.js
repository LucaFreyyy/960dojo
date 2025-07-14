import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getUserById(id) {
    const { data, error } = await supabase
        .from('User')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}

export async function updateUserRating(id, newRating) {
    const { error } = await supabase
        .from('User')
        .update({ rating_openings: newRating })
        .eq('id', id);

    if (error) throw error;
}

export async function insertGameRecord(gameData) {
    const { error } = await supabase
        .from('Game')
        .insert([gameData]);

    if (error) throw error;
}
