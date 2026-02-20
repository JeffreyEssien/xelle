"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";

export default function AboutSnippet() {
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
                            The Art of{" "}
                            <span className="text-gradient-luxury italic">Less</span>
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
                    <div className="space-y-6 max-w-2xl mx-auto">
                        <motion.p
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1, duration: 0.6 }}
                            className="text-base md:text-lg text-brand-dark/55 leading-relaxed font-light"
                        >
                            XELLÉ was born from the belief that true luxury lies not in excess, but in intention.
                            Every piece we curate embodies a commitment to quality, timelessness, and quiet elegance.
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="text-base md:text-lg text-brand-dark/55 leading-relaxed font-light"
                        >
                            We partner with artisans who share our philosophy — that the most beautiful things are
                            those designed to endure. From hand-stitched leather to ethically sourced gemstones,
                            each detail is considered, every material chosen with care.
                        </motion.p>
                    </div>

                    {/* Stats with animated counters */}
                    <div className="mt-20 grid grid-cols-3 gap-6 sm:gap-12 border-y border-brand-lilac/15 py-12">
                        <AnimatedStat value={5} suffix="+" label="Years" delay={0} />
                        <AnimatedStat value={40} suffix="+" label="Artisans" delay={0.15} />
                        <AnimatedStat value={12} suffix="" label="Countries" delay={0.3} />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

function AnimatedStat({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: number }) {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (v) => Math.round(v));
    const ref = useRef<HTMLSpanElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    animate(count, value, {
                        duration: 1.5,
                        delay,
                        ease: [0.16, 1, 0.3, 1],
                    });
                }
            },
            { threshold: 0.5 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [count, value, delay]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center"
        >
            <span ref={ref} className="font-serif text-3xl sm:text-4xl md:text-5xl text-brand-dark mb-2 tracking-tight">
                <motion.span>{rounded}</motion.span>
                {suffix}
            </span>
            <p className="text-[10px] sm:text-[11px] text-brand-dark/45 uppercase tracking-[0.25em] font-medium">{label}</p>
        </motion.div>
    );
}
