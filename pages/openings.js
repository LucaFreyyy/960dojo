import Head from 'next/head';

import LegacyLayout from '../components/legacy/LegacyLayout'; // renamed

export default function OpeningPage({ session }) {
    return (
        <>
            <Head>
                <title>960 Dojo</title>
                <link rel="icon" href="/legacy-site/favicon.ico" />
                <link rel="stylesheet" href="/legacy-site/css/base.css" />
                <link rel="stylesheet" href="/legacy-site/css/buttons.css" />
                <link rel="stylesheet" href="/legacy-site/css/dropdown.css" />
                <link rel="stylesheet" href="/legacy-site/css/chessboard.css" />
                <link rel="stylesheet" href="/legacy-site/css/selectors.css" />
                <link rel="stylesheet" href="/legacy-site/css/others.css" />
            </Head>

            <main>
                <LegacyLayout session={session} />
            </main>
        </>
    );
}
