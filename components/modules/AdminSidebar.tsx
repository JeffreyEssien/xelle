"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/cn";

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-brand-dark min-h-screen">
            <div className="px-6 py-6 border-b border-white/10">
                <Link href="/admin" className="font-serif text-xl text-white tracking-widest">
                    {SITE_NAME}
                </Link>
                <p className="text-xs text-white/40 mt-1">Admin Panel</p>
            </div>
            <nav className="flex-1 px-4 py-6">
                <ul className="space-y-1">
                    {ADMIN_NAV_LINKS.map((link) => {
                        const active = pathname === link.href;
                        return (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                                        active ? "bg-brand-purple text-white" : "text-white/60 hover:text-white hover:bg-white/5",
                                    )}
                                >
                                    <NavIcon name={link.icon} />
                                    {link.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            <div className="px-6 py-4 border-t border-white/10">
                <Link href="/" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                    ← Back to Store
                </Link>
            </div>
        </aside>
    );
}

function NavIcon({ name }: { name: string }) {
    const iconMap: Record<string, string> = { grid: "▦", package: "☐", clipboard: "📋" };
    return <span className="text-base">{iconMap[name] || "•"}</span>;
}
