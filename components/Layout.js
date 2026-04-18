import Header from './Header';
import PlayStatusBanner from './PlayStatusBanner';
import UiSounds from './UiSounds';

export default function Layout({ children }) {
    return (
        <>
            <PlayStatusBanner />
            <Header />
            <UiSounds />
            <main>{children}</main>
        </>
    );
}
