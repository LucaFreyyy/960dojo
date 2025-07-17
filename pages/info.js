import Head from 'next/head';
import { FaCoffee } from 'react-icons/fa';

export default function InfoPage() {
    return (
        <>
            <Head>
                <title>Info - 960 Dojo</title>
            </Head>
            <main className="info-page">
                <section className="info-content">
                    <p>
                        Hi!
                    </p>
                    <p>
                        I'm Luca, the sole creator of 960 Dojo.
                    </p>
                    <p>
                        In April 2025 I played at the Grenke Open in Karlsruhe, where I first encountered Chess960.
                        Even I just saw it the first time, I switched to the Freestyle section of the tournament and played my first games.
                        I was immediately hooked and wanted to play and study more of 960.
                        Unfortunately, I couldn't find many sources online to improve the Openings and Tactics.
                    </p>
                    <p>
                        First, I thought about creating a Youtube channel myself, but it seemed difficult to me. Instead, I decided to create this website to have some practice tools instead of just content to consume.
                        If you are looking for a Yt-Channel to teach you the principles of Chess960, I recommend checking out <a href='https://www.youtube.com/@ChessOnFire' target='blank' rel='noopener noreferrer' className="link">ChessOnFire</a>.
                    </p>
                    <p>
                        I hope you enjoy my website and it helps you improve your Chess960 skills!
                    </p>
                    <p>
                        I want to keep this platform free for everyone—no ads,
                        no subscriptions, just pure 960.
                        This first started as a hobby project, but by now almost consumed an entire semester. I will try to keep enhancing it as much as I can and I am happy to hear your feedback and support.
                    </p>

                    <a
                        href="https://www.paypal.com/donate/?hosted_button_id=RJTRFEN2ZF4PJ"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="buy-coffee"
                    >
                        <FaCoffee className="coffee-icon" />
                        Buy me a coffee
                    </a>

                    <p>My profile on this website: <a href="/profile/ef54c3891d0fd3ec1e42b326141a44d8365c1539e3c04fb04c8504fc30b0c8f9" className="link">OneEggIsUnOeuf</a></p>
                </section>
            </main>
        </>
    );
}
