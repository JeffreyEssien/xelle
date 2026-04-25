"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { OverlayPosition, OverlayStyle } from "@/types";

interface FeaturedOverlayProps {
    headline?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    position: OverlayPosition;
    style: OverlayStyle;
}

const positionClasses: Record<OverlayPosition, string> = {
    "bottom-left": "items-end justify-start text-left",
    "bottom-right": "items-end justify-end text-right",
    "center": "items-center justify-center text-center",
    "top-left": "items-start justify-start text-left",
    "top-right": "items-start justify-end text-right",
};

const styleClasses: Record<OverlayStyle, string> = {
    "dark-glass": "bg-black/40 backdrop-blur-md",
    "light-glass": "bg-white/30 backdrop-blur-md",
    "gradient": "bg-gradient-to-t from-black/70 via-black/20 to-transparent",
    "none": "",
};

export default function FeaturedOverlay({
    headline,
    subtitle,
    ctaText,
    ctaLink,
    position,
    style,
}: FeaturedOverlayProps) {
    if (!headline && !subtitle && !ctaText) return null;

    const isGradient = style === "gradient";
    const hasBackground = style !== "none";

    return (
        <div className={`absolute inset-0 flex p-6 md:p-10 ${positionClasses[position]}`}>
            {isGradient && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
            )}
            <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
                className={`relative z-10 max-w-md ${
                    hasBackground && !isGradient ? `${styleClasses[style]} rounded-2xl p-5 md:p-6` : ""
                }`}
            >
                {headline && (
                    <motion.h3
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className={`font-serif text-xl md:text-3xl font-bold leading-tight mb-2 ${
                            style === "light-glass" ? "text-brand-dark" : "text-white"
                        }`}
                    >
                        {headline}
                    </motion.h3>
                )}
                {subtitle && (
                    <motion.p
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.16, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className={`text-sm md:text-base leading-relaxed mb-4 ${
                            style === "light-glass" ? "text-brand-dark/70" : "text-white/80"
                        }`}
                    >
                        {subtitle}
                    </motion.p>
                )}
                {ctaText && ctaLink && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.24, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    >
                        <Link
                            href={ctaLink}
                            className="overlay-cta inline-block px-6 py-2.5 rounded-full text-sm font-semibold bg-white text-brand-dark"
                        >
                            {ctaText}
                        </Link>
                    </motion.div>
                )}
            </motion.div>
            <style jsx>{`
                .overlay-cta {
                    transition: background-color 200ms cubic-bezier(0.23, 1, 0.32, 1),
                                color 200ms cubic-bezier(0.23, 1, 0.32, 1),
                                transform 160ms cubic-bezier(0.23, 1, 0.32, 1);
                }
                .overlay-cta:hover {
                    background-color: var(--color-brand-purple, #B665D2);
                    color: white;
                }
                .overlay-cta:active {
                    transform: scale(0.97);
                }
            `}</style>
        </div>
    );
}
