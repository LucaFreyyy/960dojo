import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            try {
                const email = user.email;
                const id = createHash('sha256').update(email).digest('hex');
                console.log('Signing in user:', email, id);

                const { data, error } = await supabase
                    .from('User')
                    .select('id')
                    .eq('id', id)
                    .maybeSingle();

                if (error) {
                    console.error('Fetch error:', error);
                    return false;
                }

                if (!data) {
                    const { error: insertError } = await supabase.from('User').insert({
                        id,
                        email,
                        name: user.name || '',
                        image: user.image || '',
                        bio: '',
                    });

                    if (insertError) {
                        console.error('Insert error:', insertError);
                        return false;
                    }
                }

                return true;
            } catch (err) {
                console.error('Sign-in error:', err);
                return false;
            }
        }
    }
});