import Head from 'next/head';
import Header from '../components/Header';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function OpeningsPage() {
    const { data: session } = useSession();

    return (
        <>
            <Head>
                <title>Openings - 960 Dojo</title>
            </Head>
            <main>
                {/* Blank content */}
            </main>
        </>
    );
}
