import Header from './Header';
import UiSounds from './UiSounds';

export default function Layout({ children }) {
    return (
        <>
            <Header />
            <UiSounds />
            <main>{children}</main>
        </>
    );
}
