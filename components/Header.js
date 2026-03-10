import Link from 'next/link';
import Image from 'next/image';
import Dropdown from './Dropdown';
import { FaCoffee } from 'react-icons/fa';
import { useSupabaseSession } from '../lib/SessionContext';

export default function Header() {
    const session = useSupabaseSession();

    return (
        <header>
            <a
                href="https://www.paypal.com/donate/?hosted_button_id=RJTRFEN2ZF4PJ"
                target="_blank"
                rel="noopener noreferrer"
                className="buy-coffee"
            >
                <FaCoffee className="coffee-icon" />
                Buy me a coffee
            </a>
            <Link href="/" className="logo-container">
                <Image
                    src="/960_logo_red.png"
                    alt="960 Dojo Logo"
                    width={80}
                    height={60}
                    priority
                />
                <h1 className="logo-text">960 DOJO</h1>
            </Link>
            <Dropdown />
        </header>
    );
}
