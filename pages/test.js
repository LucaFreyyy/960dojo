import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function TestPage() {
    useEffect(() => {
        async function runTest() {
            const { error } = await supabase.from('User').insert({
                id: 'test-user-id',
                email: 'test@example.com',
                name: 'Test User',
            });
            console.log("Manual insert error:", error);
        }

        runTest();
    }, []);

    return <div>Test Page</div>;
}
