"use client";

import Link from "next/link";
import Image from "next/image";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { useCartStore } from "@/lib/cartStore";
import CartDrawer from "@/components/modules/CartDrawer";
import { useState, useEffect } from "react";
import { getSiteSettings } from "@/lib/queries";
import type { SiteSettings } from "@/types";

export default function Header() {
    const { totalItems, toggle } = useCartStore();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [mounted, setMounted] = useState(false);
    const count = totalItems();

    useEffect(() => {
        setMounted(true);
        getSiteSettings().then(setSettings).catch(() => { });
    }, []);

    const displayName = settings?.siteName || SITE_NAME;

    return (
        <>
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-brand-lilac/20">
                <nav className="mx-auto max-w-7xl px-6 flex items-center justify-between h-16">
                    <Link href="/" className="font-serif text-2xl tracking-widest text-brand-dark flex items-center gap-2">
                        {settings?.logoUrl ? (
                            <div className="relative h-8 w-auto aspect-[3/1]">
                                <Image
                                    src={settings.logoUrl}
                                    alt={displayName}
                                    fill
                                    className="object-contain object-left"
                                    sizes="120px"
                                />
                            </div>
                        ) : (
                            displayName
                        )}
                    </Link>
                    <DesktopNav />
                    <div className="flex items-center gap-4">
                        <CartButton count={count} onClick={toggle} mounted={mounted} />
                        <MobileMenuButton open={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)} />
                    </div>
                </nav>
                {mobileOpen && <MobileNav onClose={() => setMobileOpen(false)} />}
            </header>
            <CartDrawer />
        </>
    );
}

function DesktopNav() {
    return (
        <ul className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
                <li key={link.href}>
                    <Link
                        href={link.href}
                        className="text-sm font-sans text-brand-dark/70 hover:text-brand-purple transition-colors"
                    >
                        {link.label}
                    </Link>
                </li>
            ))}
        </ul>
    );
}

function CartButton({ count, onClick, mounted }: { count: number; onClick: () => void; mounted: boolean }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="relative p-2 text-brand-dark hover:text-brand-purple transition-colors cursor-pointer"
            aria-label="Open cart"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            {mounted && count > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-brand-purple text-white text-[10px] flex items-center justify-center">
                    {count}
                </span>
            )}
        </button>
    );
}

function MobileMenuButton({ open, onClick }: { open: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="md:hidden p-2 text-brand-dark cursor-pointer"
            aria-label={open ? "Close menu" : "Open menu"}
        >
            {open ? "✕" : "☰"}
        </button>
    );
}

function MobileNav({ onClose }: { onClose: () => void }) {
    return (
        <div className="md:hidden border-t border-brand-lilac/20 bg-white px-6 py-4">
            <ul className="space-y-3">
                {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            onClick={onClose}
                            className="block text-brand-dark/70 hover:text-brand-purple transition-colors"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
