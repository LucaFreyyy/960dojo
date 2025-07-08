import Head from 'next/head';

export default function PageTemplate({ title }) {
    return (
        <>
            <Head>
                <title>{title} - 960 Dojo</title>
            </Head>
            <header>
                <Link href="/" className="logo-container">
                    <Image
                        src="/logo.png"
                        alt="960 Dojo Logo"
                        width={60}
                        height={60}
                        priority
                    />
                </Link>
                <input type="text" placeholder="Player Search..." className="search" />
                <Dropdown isAuthenticated={!!session} />
            </header>
            <main>
                {/* blank content */}
            </main>
        </>
    );
}