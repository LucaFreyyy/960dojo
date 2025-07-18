import '@/styles/globals.css';
import '@/styles/info.css';
import '@/styles/profile.css';
import { SessionProvider } from 'next-auth/react';
import Layout from '../components/Layout';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
    return (
        <SessionProvider session={session}>
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </SessionProvider>
    );
}
