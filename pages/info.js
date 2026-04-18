import Head from 'next/head';

export default function InfoPage() {
    return (
        <>
            <Head>
                <title>Info - 960 Dojo</title>
            </Head>
            <main className="info-page">
                <section className="info-content">
                    <p>Hi! I&apos;m Luca, the creator of 960 Dojo.</p>
                    <p>
                        After getting introduced to Chess960 at the Grenke Chess Open 2025, I was hooked by it.
                    </p>
                    <p>
                        Unfortunately I couldn&apos;t find any resources on the web to properly practice specifically
                        for the variant.
                        <br />
                        No tool for practicing the openings, nor tactics.
                    </p>
                    <p>This is why I started building this website in the summer of &apos;25.</p>
                    <p>
                        Now, in &apos;26, I finally finished a satisfying version for both tools—just as the next
                        Grenke tournament begins.
                    </p>
                    <p>I hope you enjoy my website and that it helps you improve your Chess960 skills!</p>
                    <p>For video resources to study Chess960, I recommend <a href="https://www.youtube.com/playlist?list=PLU8ZSPKBpOES_D-1RumtqGco1n5LIj3Kq" target="_blank" rel="noopener noreferrer">this</a> playlist by ChessOnFire</p>
                    <p>If you want to reach out to me, you can do so via email at <a href="mailto:lucafreyq@gmail.com">lucafreyq@gmail.com</a></p>
                </section>
            </main>
        </>
    );
}
