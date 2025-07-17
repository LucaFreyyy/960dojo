import Head from 'next/head';
import { FaCoffee } from 'react-icons/fa';

export default function PlayPage() {
    return (
        <>
            <Head>
                <title>Play - 960 Dojo</title>
            </Head>
            <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '4rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>
                    Play feature coming late! (Not on my list yet 😅)
                </h1>
                <p style={{ fontSize: '1.25rem', marginBottom: '2rem', textAlign: 'center', maxWidth: '600px' }}>
                    Help accelerate development with a boost of caffeine!
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
            </main>
        </>
    );
}
