import Head from 'next/head';

export default function PageTemplate({ title, session }) {
    return (
        <>
            <Head>
                <title>{'${title} - 960 Dojo'}</title>
            </Head>
            <main>
                {/* blank content */}
            </main>
        </>
    );
}