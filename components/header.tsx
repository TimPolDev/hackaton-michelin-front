'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { getMe } from '@/lib/auth';

const NAV_LINKS = [
    { label: 'Accueil', href: '/dashboard' },
    { label: 'Mon Club', href: '/clubs' },
    { label: 'Itinéraires', href: '/itineraires' },
    { label: 'Classement', href: '/classement' },
    { label: 'Calendrier', href: '/calendrier' },
];

function getInitials(name?: string | null): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [initials, setInitials] = useState('?');

    useEffect(() => {
        const loadUser = async () => {
            const user = await getMe();
            setIsLoggedIn(!!user);
            if (!user) {
                setInitials('?');
                return;
            }
            setInitials(getInitials(user.fullName || user.email));
        };

        loadUser();
    }, []);

    return (
        <div className="flex flex-row items-center gap-8 px-8 py-2">
            <img src="/medias/paceLine.png" alt="Pace Line" width={100}/>
            {isLoggedIn && (
                <>
                    <nav className="flex flex-row gap-6">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="ml-auto flex flex-row items-center gap-4">
                        <button
                            type="button"
                            aria-label="Notifications"
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-yellow-500 transition-colors hover:bg-gray-50"
                        >
                            <Bell className="h-5 w-5" fill="currentColor" />
                        </button>
                        <div
                            aria-label="Profil"
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-michelin-blue-dark text-sm font-semibold text-michelin-yellow"
                        >
                            {initials}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
