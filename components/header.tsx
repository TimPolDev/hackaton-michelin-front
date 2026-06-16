'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Settings, LogOut, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { api } from '@/lib/api/client';

const NAV_LINKS = [
    { label: 'Accueil', href: '/dashboard' },
    { label: 'Mes Clubs', href: '/clubs' },
    { label: 'Ambassadeurs', href: '/ambassadors' },
    { label: 'Itinéraires', href: '/itineraires' },
    { label: 'Classement', href: '/classement' },
    { label: 'Calendrier', href: '/calendrier' },
];

const PUBLIC_NAV_LINKS = [
    { label: 'Ambassadeurs', href: '/ambassadors' },
];

function getInitials(name?: string | null): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const Header = () => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [initials, setInitials] = useState('?');
    const [fullName, setFullName] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const supabase = createClient();

        const loadUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setIsLoggedIn(!!user);
            if (!user) return;

            setEmail(user.email ?? null);
            try {
                const { data } = await api.get('/cyclists/me');
                setFullName(data?.fullName ?? null);
                setIsAdmin(!!data?.isAdmin);
                setInitials(getInitials(data?.fullName || user.email));
            } catch {
                setFullName(null);
                setIsAdmin(false);
                setInitials(getInitials(user.email));
            }
        };

        loadUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                loadUser();
            } else {
                setIsLoggedIn(false);
                setInitials('?');
                setFullName(null);
                setEmail(null);
                setIsAdmin(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (!menuOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [menuOpen]);

    const handleLogout = async () => {
        setMenuOpen(false);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <div className="flex flex-row items-center gap-8 px-8 py-2">
            <Link href={isLoggedIn ? '/dashboard' : '/'}>
                <img src="/medias/paceLine.png" alt="PaceLine" width={100}/>
            </Link>
            {!isLoggedIn && (
                <>
                    <nav className="flex flex-row gap-6">
                        {PUBLIC_NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="ml-auto flex flex-row items-center gap-3">
                        <Link
                            href="/login"
                            className="rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-gray-100"
                        >
                            Connexion
                        </Link>
                        <Link
                            href="/signup"
                            className="rounded-full bg-michelin-blue-dark px-4 py-2 text-sm font-semibold text-michelin-yellow transition-opacity hover:opacity-90"
                        >
                            Inscription
                        </Link>
                    </div>
                </>
            )}
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
                        <div className="relative" ref={menuRef}>
                            <button
                                type="button"
                                aria-label="Profil"
                                aria-haspopup="menu"
                                aria-expanded={menuOpen}
                                onClick={() => setMenuOpen((o) => !o)}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-michelin-blue-dark text-sm font-semibold text-michelin-yellow transition-opacity hover:opacity-90"
                            >
                                {initials}
                            </button>

                            {menuOpen && (
                                <div
                                    role="menu"
                                    className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg z-50"
                                >
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="truncate text-sm font-semibold text-foreground">
                                            {fullName ?? 'Mon profil'}
                                        </p>
                                        {email && (
                                            <p className="truncate text-xs text-muted-foreground">{email}</p>
                                        )}
                                    </div>
                                    {isAdmin && (
                                        <Link
                                            href="/admin"
                                            role="menuitem"
                                            onClick={() => setMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-sm text-foreground transition-colors hover:bg-gray-50"
                                        >
                                            <Shield className="h-4 w-4 text-muted-foreground" />
                                            Admin
                                        </Link>
                                    )}
                                    <Link
                                        href="/parametres"
                                        role="menuitem"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-foreground transition-colors hover:bg-gray-50"
                                    >
                                        <Settings className="h-4 w-4 text-muted-foreground" />
                                        Paramètres
                                    </Link>
                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Déconnexion
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
