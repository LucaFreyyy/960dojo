import Link from 'next/link';
import Dropdown from './Dropdown';
import UserStreakHeaderBadge from './UserStreakHeaderBadge';
import { FaCoffee } from 'react-icons/fa';
import { useSupabaseSession } from '../lib/SessionContext';

export default function Header() {
    useSupabaseSession();

    return (
        <header>
            <a
                href="https://www.paypal.com/donate/?hosted_button_id=RJTRFEN2ZF4PJ"
                target="_blank"
                rel="noopener noreferrer"
                className="buy-coffee header-buy-coffee"
                aria-label="Buy me a coffee"
            >
                <FaCoffee className="coffee-icon" aria-hidden />
                <span className="buy-coffee__label">Buy me a coffee</span>
            </a>
            <Link href="/" className="logo-container">
                <img
                    src="/960_logo_red.png"
                    alt="960 Dojo"
                    className="logo-img"
                />
                <h1 className="logo-text">960 DOJO</h1>
            </Link>
            <div className="header-right-cluster">
                <UserStreakHeaderBadge />
                <div className="header-dropdown-wrap">
                    <Dropdown />
                </div>
            </div>
        </header>
    );
}
