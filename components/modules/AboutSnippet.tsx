"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { getSiteSettings } from "@/lib/queries";
import type { SiteSettings } from "@/types";

export default function AboutSnippet() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);

    useEffect(() => {
        getSiteSettings().then(setSettings).catch(() => { });
    }, []);

    return (
        <section id="about" className="py-24 md:py-32 px-6 relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-lilac/[0.06] rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* Header */}
                    <div className="flex flex-col items-center mb-14">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-brand-purple mb-3 font-medium">Our Story</p>
                        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-brand-dark tracking-tight leading-tight max-w-2xl">
                            {settings?.ourStoryHeading ? settings.ourStoryHeading : (
                                <>The Comfort of <span className="text-gradient-luxury italic">Smart Living</span></>
                            )}
                        </h2>
                        <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="w-12 h-[1px] bg-brand-lilac/50 mt-8 origin-center"
                        />
                    </div>

                    {/* Paragraphs with stagger */}
                    <div className="space-y-6 max-w-2xl mx-auto md:text-center text-left">
                        {(settings?.ourStoryText ? settings.ourStoryText.split("\n\n") : [
                            "XELLÉ was created from a simple idea: everyday living should feel elevated without being expensive or complicated.",
                            "As a chronic online shopper, I was tired of buying from multiple stores and paying delivery fees over and over again. I wanted one space where you could find quality beauty products, chic accessories, home essentials, gadgets, and more — all carefully selected and reasonably priced.",
                            "At XELLÉ, we focus on high-end finds at affordable prices and everyday essentials that make life easier. Convenience you can rely on. Quality you can trust. Pieces that help you feel put together without the stress.",
                            "This is more than just a store.\nIt’s convenience.\nIt’s comfort.\nIt’s curated for everyday living."
                        ]).map((paragraph, idx) => (
                            <motion.p
                                key={idx}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 * (idx + 1), duration: 0.6 }}
                                className={`text-base md:text-lg text-brand-dark/55 leading-relaxed ${idx === 3 && !settings?.ourStoryText ? 'font-medium mt-4' : 'font-light'} whitespace-pre-line`}
                            >
                                {paragraph}
                            </motion.p>
                        ))}
                    </div>

                    {/* WHY XELLE */}
                    <div className="mt-20 border-t border-brand-lilac/15 pt-16 pb-4 text-left max-w-lg mx-auto">
                        <motion.h3
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-[13px] uppercase tracking-[0.25em] text-brand-dark mb-10 font-bold text-center"
                        >
                            {settings?.whyXelleHeading || "Why XELLÉ?"}
                        </motion.h3>
                        <ul className="space-y-6">
                            {(settings?.whyXelleFeatures ? settings.whyXelleFeatures.split("\n").filter(Boolean) : [
                                "High-end brands at affordable prices",
                                "Beauty, accessories, gadgets & home essentials in one place",
                                "One cart. One delivery fee",
                                "Curated for comfort and convenience"
                            ]).map((feature, idx) => (
                                <motion.li
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 * idx, duration: 0.5 }}
                                    className="flex items-start gap-4 text-brand-dark/70 text-base font-light"
                                >
                                    <span className="text-brand-purple flex-shrink-0 mt-0.5 font-bold">✔</span>
                                    <span>{feature}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
