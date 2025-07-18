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

    if (ratingError || !ratingRow) {
        console.error('[fetchNewTactic] Rating fetch failed:', ratingError, ratingRow);
        throw new Error('Could not fetch user tactic rating');
    }

    const baseRating = ratingRow.value;

    // Step 2: Get all tactics
    const { data: allTactics, error: allTacticsError } = await supabase
        .from('Tactic')
        .select('id, rating');

    if (allTacticsError || !allTactics?.length) {
        console.error('[fetchNewTactic] Tactic fetch failed:', allTacticsError, allTactics);
        throw new Error('No tactics found in table');
    }

    // Step 3: Get finished tactic IDs
    const { data: finishedRows, error: finishedError } = await supabase
        .from('UserTactic')
        .select('tacticId')
        .eq('userId', userId)
        .not('finished', 'is', null);

    if (finishedError) {
        console.error('[fetchNewTactic] Finished tactics fetch failed:', finishedError);
        throw new Error('Could not fetch finished tactics');
    }

    const finishedIds = new Set(finishedRows?.map(r => r.tacticId));

    // Step 4: Filter out finished ones
    const unfinishedTactics = allTactics.filter(t => !finishedIds.has(t.id));

    if (!unfinishedTactics.length) throw new Error('No unfinished tactics available');

    // Step 5: Sort by rating distance
    const sorted = unfinishedTactics
        .map(t => ({ id: t.id, diff: Math.abs(t.rating - baseRating) }))
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
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        signIn: async ({ user }) => {
            try {
                const email = user.email;
                if (!email) return false;

                const id = createHash('sha256').update(email).digest('hex');

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
                    // 1. Insert user
                    const { error: userInsertError } = await supabase.from('User').insert({
                        id,
                        email,
                        name: user.name || '',
                        bio: '',
                    });

                    if (userInsertError) {
                        console.error('[signIn] User insert error:', userInsertError);
                        return false;
                    }

                    // 2. Insert default ratings
                    const ratings = ['bullet', 'blitz', 'rapid', 'classical', 'tactics', 'openings'].map(type => ({
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
                        const { data: tacticInsertData, error: tacticInsertError } = await supabase
                            .from('UserTactic')
                            .insert({
                                userId: id,
                                tacticId,
                            })
                            .select(); // This will force Supabase to return the inserted row(s)

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
