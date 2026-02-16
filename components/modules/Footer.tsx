import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export default function Footer() {
    return (
        <footer className="border-t border-brand-lilac/20 bg-white">
            <div className="mx-auto max-w-7xl px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <BrandColumn />
                    <QuickLinks />
                    <ConnectColumn />
                </div>
                <div className="mt-12 pt-8 border-t border-brand-lilac/10 text-center">
                    <p className="text-sm text-brand-dark/40">
                        © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

function BrandColumn() {
    return (
        <div>
            <h3 className="font-serif text-xl text-brand-dark mb-3">{SITE_NAME}</h3>
            <p className="text-sm text-brand-dark/60 leading-relaxed">
                Curating timeless luxury for the modern lifestyle. Every piece tells a story.
            </p>
        </div>
    );
}

function QuickLinks() {
    const links = [
        { label: "Shop All", href: "/shop" },
        { label: "New Arrivals", href: "/shop?sort=newest" },
        { label: "About Us", href: "/#about" },
    ];

    return (
        <div>
            <h4 className="font-sans text-sm font-semibold text-brand-dark mb-3 uppercase tracking-wider">
                Quick Links
            </h4>
            <ul className="space-y-2">
                {links.map((l) => (
                    <li key={l.href}>
                        <Link href={l.href} className="text-sm text-brand-dark/60 hover:text-brand-purple transition-colors">
                            {l.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function ConnectColumn() {
    return (
        <div>
            <h4 className="font-sans text-sm font-semibold text-brand-dark mb-3 uppercase tracking-wider">
                Connect
            </h4>
            <p className="text-sm text-brand-dark/60">hello@xelle.com</p>
            <div className="flex gap-4 mt-4">
                {["Instagram", "Pinterest", "Twitter"].map((s) => (
                    <span key={s} className="text-xs text-brand-dark/40 hover:text-brand-purple transition-colors cursor-pointer">
                        {s}
                    </span>
                ))}
            </div>
        </div>
    );
}
