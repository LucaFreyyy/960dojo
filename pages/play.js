import Head from 'next/head';
import { FaCoffee } from 'react-icons/fa';

export default function PlayPage() {
    return (
        <>
            <Head>
                <title>Play - 960 Dojo</title>
            </Head>
            <main className="page-shell--center">
                <h1 className="page-title">
                    Play feature coming not planned yet but will be here eventually!
                </h1>
                <p className="page-lead">
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
