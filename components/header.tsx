'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Settings, LogOut, Shield, Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { backend } from '@/lib/api';

const NAV_LINKS = [
    { label: 'Accueil', href: '/dashboard' },
    { label: 'Mes Clubs', href: '/clubs' },
    { label: 'Ambassadeurs', href: '/ambassadors' },
    { label: 'Pneus', href: '/tires' },
    { label: 'Itinéraires', href: '/itineraires' },
    { label: 'Classement', href: '/classement' },
    { label: 'Calendrier', href: '/calendrier' },
];

const PUBLIC_NAV_LINKS = [
    { label: 'Ambassadeurs', href: '/ambassadors' },
    { label: 'Pneus', href: '/tires' },
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const supabase = createClient();

        const loadUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setIsLoggedIn(!!user);
            if (!user) return;

            setEmail(user.email ?? null);
            try {
                const data = await backend.cyclists.me();
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

    const activeLinks = isLoggedIn ? NAV_LINKS : PUBLIC_NAV_LINKS;

    return (
        <header className="relative bg-white mx-2 my-1 rounded-lg">
            <div className="flex flex-row items-center gap-4 px-4 py-2 md:gap-8 md:px-8">
                <Link href={isLoggedIn ? '/dashboard' : '/'}>
                    <img src="/medias/paceLine.png" alt="PaceLine" className="w-28 md:w-36" />
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex flex-row gap-6 items-center">
                    {activeLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Desktop right actions */}
                <div className="ml-auto hidden md:flex flex-row items-center gap-3">
                    {!isLoggedIn ? (
                        <>
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
                        </>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>

                {/* Mobile hamburger */}
                <button
                    type="button"
                    aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                    onClick={() => setMobileMenuOpen((o) => !o)}
                    className="ml-auto flex md:hidden items-center justify-center rounded-full p-2 text-foreground hover:bg-gray-100 transition-colors"
                >
                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile menu dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute left-0 right-0 top-full z-50 border-t border-gray-100 bg-white shadow-lg">
                    <nav className="flex flex-col px-4 py-2">
                        {activeLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border-b border-gray-50 last:border-0"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="flex flex-col gap-2 px-4 py-3 border-t border-gray-100">
                        {!isLoggedIn ? (
                            <>
                                <Link
                                    href="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="rounded-full px-4 py-2 text-center text-sm font-medium text-foreground transition-colors hover:bg-gray-100 border border-gray-200"
                                >
                                    Connexion
                                </Link>
                                <Link
                                    href="/signup"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="rounded-full bg-michelin-blue-dark px-4 py-2 text-center text-sm font-semibold text-michelin-yellow transition-opacity hover:opacity-90"
                                >
                                    Inscription
                                </Link>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 py-2">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-michelin-blue-dark text-sm font-semibold text-michelin-yellow">
                                        {initials}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-foreground">{fullName ?? 'Mon profil'}</p>
                                        {email && <p className="truncate text-xs text-muted-foreground">{email}</p>}
                                    </div>
                                </div>
                                {isAdmin && (
                                    <Link
                                        href="/admin"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-gray-50"
                                    >
                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                        Admin
                                    </Link>
                                )}
                                <Link
                                    href="/parametres"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-gray-50"
                                >
                                    <Settings className="h-4 w-4 text-muted-foreground" />
                                    Paramètres
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Déconnexion
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};
