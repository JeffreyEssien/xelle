"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSiteSettings } from "@/lib/queries";
import type { SiteSettings } from "@/types";
import { SITE_NAME, SITE_EMAIL } from "@/lib/constants";
import { Instagram, Twitter, Music2, Facebook, Mail, ArrowUpRight } from "lucide-react";

export default function Footer() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);

    useEffect(() => {
        getSiteSettings().then(setSettings).catch(() => { });
    }, []);

    const displayName = settings?.siteName || SITE_NAME;
    const tagline = settings?.footerTagline || "Curating smart finds for modern, everyday living.";

    const socialLinks = [
        { icon: Instagram, url: settings?.socialInstagram, label: "Instagram" },
        { icon: Twitter, url: settings?.socialTwitter, label: "Twitter" },
        { icon: Music2, url: settings?.socialTiktok, label: "TikTok" },
        { icon: Facebook, url: settings?.socialFacebook, label: "Facebook" },
    ].filter(s => s.url);

    return (
        <footer className="relative bg-brand-white overflow-hidden pt-24 md:pt-32 pb-8 border-t border-brand-lilac/20">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-brand-purple/20 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-gradient-to-b from-brand-purple/[0.02] to-transparent pointer-events-none blur-3xl rounded-full" />

            <div className="mx-auto max-w-[1400px] px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-y-16 gap-x-12 mb-20 md:mb-32">
                    {/* Brand Section */}
                    <div className="md:col-span-4 flex flex-col justify-between">
                        <div>
                            <Link href="/" className="inline-block font-serif text-3xl md:text-4xl text-brand-dark mb-6 tracking-wide group relative">
                                {displayName}
                                <span className="absolute -bottom-1 left-0 w-0 group-hover:w-full h-[1px] bg-brand-purple transition-all duration-500 ease-out" />
                            </Link>
                            <p className="text-sm text-brand-dark/60 leading-relaxed max-w-xs font-light">
                                {tagline}
                            </p>
                        </div>
                    </div>

                    {/* Explore Links */}
                    <div className="md:col-span-2 md:col-start-6">
                        <h4 className="text-[10px] font-semibold text-brand-dark/40 uppercase tracking-[0.25em] mb-8">
                            Explore
                        </h4>
                        <ul className="space-y-5">
                            {[
                                { label: "Shop Collection", href: "/shop" },
                                { label: "New Arrivals", href: "/shop?sort=newest" },
                                { label: "Track Order", href: "/track" },
                                { label: "Our Story", href: "/#about" },
                            ].map((l) => (
                                <li key={l.href}>
                                    <Link href={l.href} className="text-sm text-brand-dark/70 hover:text-brand-purple transition-colors inline-flex group font-light">
                                        <span className="relative overflow-hidden inline-flex">
                                            <span className="inline-block transition-transform duration-[400ms] group-hover:-translate-y-full">{l.label}</span>
                                            <span className="absolute top-0 left-0 inline-block translate-y-full transition-transform duration-[400ms] group-hover:translate-y-0 text-brand-purple">{l.label}</span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div className="md:col-span-3">
                        <h4 className="text-[10px] font-semibold text-brand-dark/40 uppercase tracking-[0.25em] mb-8">
                            Get in Touch
                        </h4>
                        <div className="space-y-5">
                            <a href={`mailto:${SITE_EMAIL}`} className="inline-flex items-center gap-3 text-sm text-brand-dark/70 hover:text-brand-purple transition-all duration-300 font-light group">
                                <span className="p-2.5 rounded-full border border-brand-dark/10 group-hover:border-brand-purple/30 group-hover:bg-brand-purple/5 transition-all duration-300">
                                    <Mail size={14} strokeWidth={1.5} className="group-hover:text-brand-purple text-brand-dark/50 transition-colors" />
                                </span>
                                <span className="relative overflow-hidden inline-flex">
                                    <span className="inline-block transition-transform duration-[400ms] group-hover:-translate-y-full">{SITE_EMAIL}</span>
                                    <span className="absolute top-0 left-0 inline-block translate-y-full transition-transform duration-[400ms] group-hover:translate-y-0 text-brand-purple">{SITE_EMAIL}</span>
                                </span>
                            </a>
                            {settings?.businessPhone && (
                                <p className="text-sm text-brand-dark/60 font-light pl-[46px]">{settings.businessPhone}</p>
                            )}
                            {settings?.businessAddress && (
                                <p className="text-sm text-brand-dark/50 leading-relaxed font-light pl-[46px] max-w-[220px]">{settings.businessAddress}</p>
                            )}
                        </div>
                    </div>

                    {/* Socials & Newsletter */}
                    <div className="md:col-span-3">
                        <h4 className="text-[10px] font-semibold text-brand-dark/40 uppercase tracking-[0.25em] mb-8">
                            Newsletter
                        </h4>
                        <div className="relative group/input mb-12">
                            <input
                                type="email"
                                placeholder="Subscribe for updates"
                                className="w-full bg-transparent border-b border-brand-dark/15 pb-4 text-sm text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:border-brand-purple transition-colors font-light"
                            />
                            <button aria-label="Subscribe" className="absolute right-0 top-1 text-brand-dark/40 group-hover/input:text-brand-purple transition-colors">
                                <ArrowUpRight size={18} strokeWidth={1.5} className="group-hover/input:translate-x-1 group-hover/input:-translate-y-1 transition-transform duration-300" />
                            </button>
                        </div>

                        {socialLinks.length > 0 && (
                            <div>
                                <h4 className="text-[10px] font-semibold text-brand-dark/40 uppercase tracking-[0.25em] mb-6">
                                    Follow Us
                                </h4>
                                <div className="flex gap-4">
                                    {socialLinks.map(s => (
                                        <a
                                            key={s.label}
                                            href={s.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 rounded-full border border-brand-dark/10 hover:border-brand-purple hover:bg-brand-purple text-brand-dark/40 hover:text-white transition-all duration-500 group"
                                            aria-label={s.label}
                                        >
                                            <s.icon size={16} strokeWidth={1.5} className="group-hover:scale-110 transition-transform duration-300" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-brand-dark/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-[10px] text-brand-dark/40 tracking-[0.25em] font-light uppercase order-2 md:order-1 select-none flex items-center gap-2">
                        <span>© {new Date().getFullYear()} {displayName}.</span>
                        <span className="hidden md:inline">ALL RIGHTS RESERVED.</span>
                    </p>
                    <div className="flex gap-8 text-[10px] text-brand-dark/40 tracking-[0.2em] font-light uppercase order-1 md:order-2">
                        {["Privacy Policy", "Terms of Service"].map((item) => (
                            <span key={item} className="hover:text-brand-purple transition-colors cursor-pointer relative overflow-hidden inline-flex group">
                                <span className="inline-block transition-transform duration-[400ms] group-hover:-translate-y-full">{item}</span>
                                <span className="absolute top-0 left-0 inline-block translate-y-full transition-transform duration-[400ms] group-hover:translate-y-0 text-brand-purple">{item}</span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
