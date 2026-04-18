import Head from 'next/head';
import Link from 'next/link';

function ExternalLink({ href, children }) {
    return (
        <a href={href} className="link legal-page__external" target="_blank" rel="noopener noreferrer">
            {children}
        </a>
    );
}

export default function LegalPage() {
    return (
        <>
            <Head>
                <title>Legal - 960 Dojo</title>
            </Head>
            <main className="info-page">
                <section className="info-content">
                    <h1 className="legal-page__title">Legal</h1>

                    <h2 className="legal-page__subtitle">Privacy policy</h2>
                    <p>
                        This policy describes how personal information is handled when the 960 Dojo website is used.
                    </p>
                    <p>
                        <strong><u>What is collected.</u></strong> Only <strong>email addresses</strong> of registered users are
                        stored, for account creation, sign-in, and essential account-related communication. Other
                        categories of personal data are not collected.
                    </p>
                    <p>
                        <strong><u>How it is used.</u></strong> Email addresses are used to identify accounts, authenticate
                        users, and operate the service. Email addresses are not sold or used for third-party
                        marketing.
                    </p>
                    <p>
                        <strong><u>Service providers.</u></strong> Sign-in and related infrastructure may be processed by
                        trusted providers (for example authentication and database hosting). Only what is needed to run
                        the site is shared with them; those providers are bound by appropriate agreements or terms.
                    </p>
                    <p>
                        <strong><u>Cookies and similar technologies.</u></strong> Cookies or local storage may be used as
                        needed for sessions and basic site functionality.
                    </p>
                    <p>
                        <strong><u>Retention.</u></strong> Email addresses are retained for as long as the account exists or as
                        needed to meet legal obligations. Deletion of an account and associated data may be requested
                        where applicable (for example via the Feedback page).
                    </p>
                    <p>
                        <strong><u>Contact.</u></strong> Privacy questions or requests may be submitted through the{' '}
                        <Link href="/feedback" className="link">
                            Feedback
                        </Link>{' '}
                        page.
                    </p>
                    <p>
                        <strong><u>Changes.</u></strong> This policy may be updated from time to time. The date of the latest
                        version is shown at the bottom of this page.
                    </p>

                    <h2 className="legal-page__subtitle">Open source &amp; third-party software</h2>
                    <p>
                        960 Dojo is built with open-source and third-party libraries. License texts:{' '}
                        <ExternalLink href="https://www.gnu.org/licenses/gpl-3.0.html">GPL-3.0</ExternalLink>,{' '}
                        <ExternalLink href="https://opensource.org/licenses/MIT">MIT</ExternalLink>,{' '}
                        <ExternalLink href="https://scripts.sil.org/OFL">SIL Open Font License (OFL)</ExternalLink>.
                    </p>
                    <p>
                        <strong>GPL-3.0-or-later</strong> (GPLv3 for bundled engine binaries)
                    </p>
                    <ul className="legal-page__list">
                        <li>
                            <ExternalLink href="https://github.com/lichess-org/chessground">Chessground</ExternalLink> —
                            chessboard UI (Thibault Duplessis / Lichess contributors).
                        </li>
                        <li>
                            <ExternalLink href="https://github.com/niklasf/chessops">chessops</ExternalLink> — chess rules,
                            FEN/PGN, UCI (Niklas Fiekas).
                        </li>
                        <li>
                            <ExternalLink href="https://github.com/nmrugg/stockfish.js">Stockfish.js</ExternalLink> —
                            in-browser engine (derived from{' '}
                            <ExternalLink href="https://github.com/official-stockfish/Stockfish">Stockfish</ExternalLink>;
                            see notices in the upstream projects). The site loads Stockfish as WebAssembly for analysis
                            and opening play.
                        </li>
                    </ul>
                    <p>
                        <strong>MIT and similar permissive licenses:</strong> Next.js, React, Supabase client libraries,
                        Redis client, Recharts, React DnD, React Icons, and other dependencies listed in the{' '}
                        <ExternalLink href="https://github.com/LucaFreyyy/960dojo/blob/main/package.json">
                            package manifest
                        </ExternalLink>{' '}
                        on GitHub.
                    </p>
                    <p>
                        <strong>Tactics puzzles.</strong> Positions used in the tactics training were generated offline
                        using a self-modified version based on{' '}
                        <ExternalLink href="https://github.com/vitogit/pgn-tactics-generator">
                            vitogit/pgn-tactics-generator
                        </ExternalLink>{' '}
                        (MIT License). Source games include Chess960 games played on{' '}
                        <ExternalLink href="https://lichess.org/">Lichess</ExternalLink>, and Chess960 opening sessions
                        played on 960 Dojo by this site&apos;s users. That tooling is not shipped with the website; it
                        was only used to produce puzzle data.
                    </p>
                    <p>
                        <strong>Fonts.</strong> Montserrat and Pacifico are loaded from{' '}
                        <ExternalLink href="https://fonts.google.com/">Google Fonts</ExternalLink>; they are
                        typically licensed under the OFL. Chess piece and board artwork under <code>public/lichess-assets/</code>{' '}
                        are sourced from the Lichess ecosystem; individual sets may have separate credits in upstream
                        repositories.
                    </p>

                    <h2 className="legal-page__subtitle">Third-party services</h2>
                    <ul className="legal-page__list">
                        <li>
                            <strong>Lichess opening explorer</strong> — aggregated statistics are requested from Lichess
                            infrastructure (
                            <ExternalLink href="https://explorer.lichess.ovh/">explorer.lichess.ovh</ExternalLink>) in line
                            with the <ExternalLink href="https://lichess.org/api">Lichess API</ExternalLink> documentation
                            (including rate limits). 960 Dojo
                            is not affiliated with or endorsed by Lichess.
                        </li>
                        <li>
                            <strong>Supabase</strong> — database and authentication (
                            <ExternalLink href="https://supabase.com/">supabase.com</ExternalLink>).
                        </li>
                        <li>
                            <strong>Redis</strong> — live play queues and real-time updates.
                        </li>
                    </ul>

                    <h2 className="legal-page__subtitle">Trademarks &amp; independence</h2>
                    <p>
                        &quot;Lichess&quot; and related marks are trademarks of their respective owners. &quot;Stockfish&quot; refers to
                        the open-source engine project. References here are for attribution only. 960 Dojo is an
                        independent project and is not sponsored by or affiliated with Lichess, Stockfish, Google,
                        Supabase, or other named services except as users of their public APIs or products.
                    </p>

                    <h2 className="legal-page__subtitle">Source code</h2>
                    <p>
                        The 960 Dojo application source code is available at{' '}
                        <ExternalLink href="https://github.com/LucaFreyyy/960dojo">github.com/LucaFreyyy/960dojo</ExternalLink>.
                        The project includes components under GPL-3.0 (Chessground, chessops, Stockfish); see the repository
                        for the complete tree and dependency notices.
                    </p>

                    <p className="legal-page__meta">Last updated: April 18, 2026</p>
                </section>
            </main>
        </>
    );
}
