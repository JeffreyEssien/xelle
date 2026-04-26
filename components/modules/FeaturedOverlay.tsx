"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { OverlayPosition, OverlayStyle, OverlayFont, OverlayGradient } from "@/types";

interface FeaturedOverlayProps {
    headline?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    position: OverlayPosition;
    style: OverlayStyle;
    textColor?: string;
    fontStyle?: OverlayFont;
    overlayGradient?: OverlayGradient;
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

const fontClasses: Record<OverlayFont, string> = {
    "serif": "font-serif",
    "sans": "font-sans",
    "mono": "font-mono",
};

const gradientClasses: Record<OverlayGradient, string> = {
    "none": "",
    "dark-bottom": "bg-gradient-to-t from-black/70 via-black/20 to-transparent",
    "dark-top": "bg-gradient-to-b from-black/70 via-black/20 to-transparent",
    "dark-full": "bg-black/40",
    "brand-bottom": "bg-gradient-to-t from-[#4B0082]/70 via-[#B665D2]/15 to-transparent",
    "brand-radial": "bg-[radial-gradient(ellipse_at_center,rgba(182,101,210,0.25)_0%,transparent_70%)]",
    "warm-bottom": "bg-gradient-to-t from-amber-900/60 via-orange-900/15 to-transparent",
    "cool-bottom": "bg-gradient-to-t from-slate-900/70 via-blue-900/15 to-transparent",
};

export default function FeaturedOverlay({
    headline,
    subtitle,
    ctaText,
    ctaLink,
    position,
    style,
    textColor,
    fontStyle = "serif",
    overlayGradient = "none",
}: FeaturedOverlayProps) {
    if (!headline && !subtitle && !ctaText) return null;

    const isGradient = style === "gradient";
    const hasBackground = style !== "none";
    const headingFont = fontClasses[fontStyle] || fontClasses.serif;

    // Determine text colors — custom or auto from style
    const headColor = textColor || (style === "light-glass" ? "var(--color-brand-dark, #4B0082)" : "white");
    const subColor = textColor
        ? `color-mix(in srgb, ${textColor} 70%, transparent)`
        : (style === "light-glass" ? "rgba(75, 0, 130, 0.7)" : "rgba(255,255,255,0.8)");

    return (
        <div className={`absolute inset-0 flex p-6 md:p-10 ${positionClasses[position]}`}>
            {/* Layer gradient */}
            {overlayGradient !== "none" && (
                <div className={`absolute inset-0 pointer-events-none ${gradientClasses[overlayGradient]}`} />
            )}
            {isGradient && overlayGradient === "none" && (
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
                        className={`${headingFont} text-xl md:text-3xl font-bold leading-tight mb-2`}
                        style={{ color: headColor }}
                    >
                        {headline}
                    </motion.h3>
                )}
                {subtitle && (
                    <motion.p
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.16, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className="text-sm md:text-base leading-relaxed mb-4"
                        style={{ color: subColor }}
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
