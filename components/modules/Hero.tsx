"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { getSiteSettings } from "@/lib/queries";
import type { SiteSettings } from "@/types";
import Image from "next/image";

export default function Hero() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);

    useEffect(() => {
        getSiteSettings().then(setSettings).catch(() => { });
    }, []);

    const heading = settings?.heroHeading || (
        <>
            Simple. Elegant.
            <br />
            <span className="text-brand-purple">Classy.</span>
        </>
    );
    const subheading = settings?.heroSubheading || "Curated collections designed for those who appreciate the art of understated luxury.";
    const ctaText = settings?.heroCtaText || "Shop Collection";
    const ctaLink = settings?.heroCtaLink || "/shop";

    return (
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-brand-lilac/10 to-brand-purple/10">
            {settings?.heroImage && (
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-white/80 z-10" />
                    <Image
                        src={settings.heroImage}
                        alt="Hero Background"
                        fill
                        className="object-cover opacity-50"
                        priority
                    />
                </div>
            )}

            <div className="absolute inset-0 opacity-[0.03] z-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #4B0082 1px, transparent 0)", backgroundSize: "40px 40px" }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 text-center px-6 max-w-3xl mx-auto"
            >
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-sm uppercase tracking-[0.3em] text-brand-purple mb-6"
                >
                    Luxury Redefined
                </motion.p>
                <h1 className="font-serif text-5xl md:text-7xl text-brand-dark leading-tight mb-6">
                    {heading}
                </h1>
                <p className="text-lg text-brand-dark/60 mb-10 max-w-xl mx-auto leading-relaxed">
                    {subheading}
                </p>
                <div className="flex gap-4 justify-center">
                    <Link href={ctaLink}>
                        <Button size="lg">{ctaText}</Button>
                    </Link>
                    <Link href="/#about">
                        <Button variant="outline" size="lg">Our Story</Button>
                    </Link>
                </div>
            </motion.div>
        </section>
    );
}
