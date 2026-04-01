import Head from 'next/head';
import Link from 'next/link';

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
                    <p className="legal-page__meta">Last updated: April 1, 2026</p>
                </section>
            </main>
        </>
    );
}
