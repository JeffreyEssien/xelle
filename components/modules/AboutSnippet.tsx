"use client";

import { motion } from "framer-motion";

export default function AboutSnippet() {
    return (
        <section id="about" className="py-24 px-6">
            <div className="max-w-3xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="text-xs uppercase tracking-[0.25em] text-brand-purple mb-3">Our Story</p>
                    <h2 className="font-serif text-3xl md:text-4xl text-brand-dark mb-6">The Art of Less</h2>
                    <p className="text-brand-dark/60 leading-relaxed mb-4">
                        XELLÉ was born from the belief that true luxury lies not in excess, but in intention.
                        Every piece we curate embodies a commitment to quality, timelessness, and quiet elegance.
                    </p>
                    <p className="text-brand-dark/60 leading-relaxed">
                        We partner with artisans who share our philosophy — that the most beautiful things are
                        those designed to endure. From hand-stitched leather to ethically sourced gemstones,
                        each detail is considered, every material chosen with care.
                    </p>
                    <div className="mt-10 flex justify-center gap-12">
                        <Stat label="Years" value="5+" />
                        <Stat label="Artisans" value="40+" />
                        <Stat label="Countries" value="12" />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="font-serif text-2xl text-brand-dark">{value}</p>
            <p className="text-xs text-brand-dark/50 uppercase tracking-wider mt-1">{label}</p>
        </div>
    );
}
