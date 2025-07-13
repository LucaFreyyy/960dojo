// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html>
            <Head>
                <link rel="icon" href="/favicon.ico" />
                <link rel="stylesheet" href="/legacy-site/css/base.css" />
                <link rel="stylesheet" href="/legacy-site/css/buttons.css" />
                <link rel="stylesheet" href="/legacy-site/css/dropdown.css" />
                <link rel="stylesheet" href="/legacy-site/css/chessboard.css" />
                <link rel="stylesheet" href="/legacy-site/css/selectors.css" />
                <link rel="stylesheet" href="/legacy-site/css/others.css" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Pacifico&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
