import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { supabase } from '../../../lib/supabase';
import { createHash } from 'crypto';

function getRandomOpening() {
    const openingNr = Math.floor(Math.random() * 960);
    const color = Math.random() < 0.5 ? 'white' : 'black';
    return { openingNr, color };
}

async function fetchNewTactic(userId) {
    // Step 1: Get user's tactics rating
    const { data: ratingRow, error: ratingError } = await supabase
        .from('Rating')
        .select('value')
        .eq('userId', userId)
        .eq('type', 'tactics')
        .single();

    if (ratingError || !ratingRow) throw new Error('Could not fetch user tactic rating');
    const baseRating = ratingRow.value;

    // Step 2: Get all tactics not yet finished by user
    const { data: finishedRows, error: finishedError } = await supabase
        .from('UserTactic')
        .select('tacticId')
        .eq('userId', userId)
        .not('finished', 'is', null);

    if (finishedError) throw new Error('Failed to fetch finished tactics');

    const finishedIds = finishedRows.map(row => row.tacticId);

    const { data: allTactics, error: allError } = await supabase
        .from('Tactic')
        .select('id, difficulty')
        .limit(1000);

    if (allError || !allTactics?.length) throw new Error('Failed to fetch tactics');

    const unfinished = allTactics.filter(t => !finishedIds.includes(t.id));
    if (unfinished.length === 0) throw new Error('No unfinished tactics left');

    // Step 3: Sort by distance to rating
    const sorted = unfinished
        .map(t => ({ id: t.id, diff: Math.abs(t.difficulty - baseRating) }))
        .sort((a, b) => a.diff - b.diff);

    return sorted[0].id;
}

export default NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        signIn: async ({ user }) => {
            try {
                console.log('[signIn] Incoming user:', user);

                const email = user.email;
                if (!email) return false;

                const id = createHash('sha256').update(email).digest('hex');
                console.log('[signIn] Hashed ID:', id);

                // Check if user already exists
                const { data: existingUser, error: fetchError } = await supabase
                    .from('User')
                    .select('id')
                    .eq('id', id)
                    .maybeSingle();

                if (fetchError) {
                    console.error('[signIn] Fetch error:', fetchError);
                    return false;
                }

                if (!existingUser) {
                    console.log('[signIn] Creating user and associated tables...');

                    // 1. Insert user
                    const { error: userInsertError } = await supabase.from('User').insert({
                        id,
                        email,
                        name: user.name || '',
                        image: user.image || '',
                        bio: '',
                    });

                    if (userInsertError) {
                        console.error('[signIn] User insert error:', userInsertError);
                        return false;
                    }

                    // 2. Insert default ratings
                    const ratings = ['blitz', 'rapid', 'tactics'].map(type => ({
                        userId: id,
                        type,
                        value: 1500,
                    }));

                    const { error: ratingError } = await supabase.from('Rating').insert(ratings);
                    if (ratingError) {
                        console.error('[signIn] Rating insert error:', ratingError);
                        return false;
                    }

                    // 3. Insert initial tactic
                    let tacticId;
                    try {
                        tacticId = await fetchNewTactic(id);
                    } catch (err) {
                        console.warn('[signIn] No tactic available yet:', err.message);
                        tacticId = null;
                    }

                    if (tacticId) {
                        const { error: tacticInsertError } = await supabase.from('UserTactic').insert({
                            userId: id,
                            tacticId,
                            finished: null,
                        });

                        if (tacticInsertError) {
                            console.error('[signIn] Tactic insert error:', tacticInsertError);
                            return false;
                        }
                    }

                    // 4. Insert starting opening
                    const { openingNr, color } = getRandomOpening();
                    const { error: openingError } = await supabase.from('UserOpening').insert({
                        userId: id,
                        openingNr,
                        color,
                        pgn: '',
                        evalCp: null,
                        finished: null,
                    });

                    if (openingError) {
                        console.error('[signIn] Opening insert error:', openingError);
                        return false;
                    }

                    console.log('[signIn] All initial data created');
                }

                return true;
            } catch (err) {
                console.error('[signIn] Exception thrown:', err);
                return false;
            }
        },

        async jwt({ token, user }) {
            if (user?.email && !token.id) {
                const id = createHash('sha256').update(user.email).digest('hex');
                token.id = id;
                token.email = user.email;
            }
            return token;
        },

        async session({ session, token }) {
            session.user.id = token.id;
            return session;
        }
    }
});
