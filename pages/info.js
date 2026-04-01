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
                        After getting introduced to Chess960 at the Grenke Chess Open 2025, I was hooked.
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
                </section>
            </main>
        </>
    );
}
