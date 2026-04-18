import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    const setInitialThemeScript = `
(() => {
  try {
    const raw = localStorage.getItem('dojo.boardVisuals.v1');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const style = typeof parsed?.uiStyle === 'string' ? parsed.uiStyle : '';
    if (!style) return;
    document.documentElement.setAttribute('data-ui-style', style);
  } catch {}
})();
`;
    return (
        <Html>
            <Head>
                <link rel="icon" href="/favicon-32x32.png" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Pacifico&display=swap"
                    rel="stylesheet"
                />
                <script dangerouslySetInnerHTML={{ __html: setInitialThemeScript }} />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
