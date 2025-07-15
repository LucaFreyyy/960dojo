import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Dropdown from './Dropdown';

export default function Header() {
    const { data: session } = useSession();

    return (
        <header>
            <Link href="/" className="logo-container">
                <Image
                    src="/960_logo_red.png"
                    alt="960 Dojo Logo"
                    width={80}
                    height={60}
                    priority
                />
                <h1 className="logo-text">960<br></br>Dojo</h1>
            </Link>
            <input type="text" placeholder="Player Search..." className="search" />
            <Dropdown isAuthenticated={!!session} />
        </header>
    );
}
