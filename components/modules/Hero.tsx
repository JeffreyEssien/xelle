"use client";

import { motion, useScroll, useTransform, useReducedMotion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import type { SiteSettings, Media, FeaturedSlide } from "@/types";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight, ArrowDown } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import FeaturedOverlay from "@/components/modules/FeaturedOverlay";

/* ── Custom easing curves (Emil Kowalski) ── */
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
const EASE_IN_OUT: [number, number, number, number] = [0.77, 0, 0.175, 1];

/* ── Smooth entrance variants ── */
const wordPull = {
    hidden: { y: "100%", opacity: 0 },
    show: (i: number) => ({
        y: 0,
        opacity: 1,
        transition: { delay: 0.35 + i * 0.09, duration: 0.7, ease: EASE_OUT },
    }),
};

const rise = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.55, ease: EASE_OUT },
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HERO
   Always 50/50 split — text left, visual right.
   Right panel: featured slides > slideshow > single > video > fallback
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface HeroProps {
    settings?: SiteSettings | null;
    resolvedMedia?: Media[];
    featuredSlides?: FeaturedSlide[];
}

export default function Hero({ settings, resolvedMedia = [], featuredSlides = [] }: HeroProps) {
    const ref = useRef<HTMLElement>(null);
    const shouldReduceMotion = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
    const textY = useTransform(scrollYProgress, [0, 0.6], [0, shouldReduceMotion ? 0 : -60]);
    const textOp = useTransform(scrollYProgress, [0, 0.45], [1, shouldReduceMotion ? 1 : 0]);
    const imgScale = useTransform(scrollYProgress, [0, 1], [1, shouldReduceMotion ? 1 : 1.04]);

    /* Text values */
    const heading   = settings?.heroHeading || "Smart. Comfortable. Intentional.";
    const words     = heading.split(" ");
    const sub       = settings?.heroSubheading || "Thoughtfully curated beauty products, accessories, home essentials, gadgets, and lifestyle finds — all in one place.";
    const eyebrow   = settings?.heroEyebrow || "CURATED FOR EVERYDAY LIVING";
    const cta       = settings?.heroCtaText || "Shop Now";
    const ctaHref   = settings?.heroCtaLink || "/shop";
    const cta2      = settings?.heroCtaSecondaryText || "Our Story";
    const cta2Href  = settings?.heroCtaSecondaryLink || "/#about";
    const badges    = settings?.heroTrustBadges?.length ? settings.heroTrustBadges : ["QUALITY GUARANTEED", "FAST DELIVERY", "CURATED SELECTION"];

    /* Display mode */
    const dc = settings?.heroDisplayConfig;
    const activeSlides = (featuredSlides || []).filter((s) => s.isActive);
    const useFeatured  = dc?.useFeaturedSlides && activeSlides.length > 0;
    const mode = useFeatured ? "featured" : dc?.mode || "single";
    const interval = dc?.slideshowInterval || 5;

    return (
        <section ref={ref} className="relative h-dvh overflow-hidden bg-white">
            <div className="h-full flex flex-col lg:grid lg:grid-cols-2">

                {/* ── LEFT ── text panel ── */}
                <motion.div
                    style={{ y: textY, opacity: textOp }}
                    className="relative z-10 flex items-center order-2 lg:order-1 flex-1 lg:flex-none"
                >
                    <div className="w-full px-7 sm:px-10 md:px-14 lg:px-16 xl:px-[4.5rem] py-16 sm:py-20 lg:py-0">
                        <div className="max-w-[480px]">

                            {/* Eyebrow */}
                            <motion.div {...rise(0.15)} className="flex items-center gap-4 mb-10 lg:mb-12">
                                <motion.span
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ delay: 0.1, duration: 0.6, ease: EASE_OUT }}
                                    className="block w-11 h-[1.5px] bg-brand-dark/25 origin-left"
                                />
                                <span className="text-[10.5px] sm:text-[11px] uppercase tracking-[0.28em] text-brand-dark/40 font-medium leading-none">
                                    {eyebrow}
                                </span>
                            </motion.div>

                            {/* Heading */}
                            <h1 className="font-serif text-[2.65rem] leading-[1.05] sm:text-[3.2rem] lg:text-[3.4rem] xl:text-[3.9rem] text-brand-dark tracking-[-0.015em] mb-6 lg:mb-7">
                                {words.map((w, i) => (
                                    <span key={i} className="inline-block overflow-hidden mr-[0.22em] last:mr-0">
                                        <motion.span
                                            custom={i}
                                            variants={wordPull}
                                            initial="hidden"
                                            animate="show"
                                            className={`inline-block font-extrabold ${i === words.length - 1 ? "italic text-brand-purple" : ""}`}
                                        >
                                            {w}
                                        </motion.span>
                                    </span>
                                ))}
                            </h1>

                            {/* Body */}
                            <motion.p
                                {...rise(0.75)}
                                className="text-[14.5px] sm:text-[15px] leading-[1.75] text-brand-dark/40 font-light mb-9 lg:mb-10 max-w-[420px]"
                            >
                                {sub}
                            </motion.p>

                            {/* CTAs */}
                            <motion.div {...rise(0.9)} className="flex items-center gap-7 mb-16 lg:mb-20">
                                <Link href={ctaHref} className="group">
                                    <span className="hero-cta-primary inline-flex items-center gap-2.5 bg-brand-dark text-white pl-7 pr-6 py-[14px] rounded-full text-[13px] font-semibold tracking-[0.04em] shadow-lg shadow-brand-dark/10 cursor-pointer">
                                        {cta}
                                        <ArrowRight size={15} strokeWidth={2.5} className="hero-cta-arrow" />
                                    </span>
                                </Link>
                                <Link
                                    href={cta2Href}
                                    className="hero-cta-secondary group text-[12.5px] sm:text-[13px] uppercase tracking-[0.18em] font-bold text-brand-dark/55 relative"
                                >
                                    {cta2}
                                    <span className="absolute -bottom-1 left-0 w-full h-[1.5px] bg-brand-purple origin-left scale-x-0 group-hover:scale-x-100 hero-underline" />
                                </Link>
                            </motion.div>

                            {/* Trust badges — staggered */}
                            <motion.div {...rise(1.05)} className="flex flex-wrap items-center gap-x-6 sm:gap-x-7 gap-y-2.5">
                                {badges.map((b, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1.15 + i * 0.06, duration: 0.4, ease: EASE_OUT }}
                                        className="inline-flex items-center gap-2"
                                    >
                                        <span className="w-[5px] h-[5px] rounded-full border border-brand-dark/15" />
                                        <span className="text-[9.5px] sm:text-[10px] uppercase tracking-[0.2em] text-brand-dark/25 font-medium leading-none">
                                            {b}
                                        </span>
                                    </motion.span>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* ── RIGHT ── visual panel ── */}
                <div className="relative order-1 lg:order-2 min-h-[42vh] sm:min-h-[48vh] lg:min-h-0 lg:h-full overflow-hidden">
                    <motion.div style={{ scale: imgScale }} className="absolute inset-0 origin-center">
                        {useFeatured ? (
                            <FeaturedPanel slides={activeSlides} interval={interval} />
                        ) : (
                            <MediaPanel
                                mode={mode}
                                media={resolvedMedia}
                                fallback={settings?.heroImage}
                                interval={interval}
                            />
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Scroll cue — desktop only, subtle fade-in, no bouncing */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 0.6 }}
                onClick={() => ref.current?.nextElementSibling?.scrollIntoView({ behavior: "smooth" })}
                className="hero-scroll-cue absolute bottom-5 left-1/2 -translate-x-1/2 z-20 hidden lg:flex flex-col items-center gap-1 text-brand-dark/15 cursor-pointer"
            >
                <span className="text-[8px] uppercase tracking-[0.4em] font-medium">Scroll</span>
                <ArrowDown size={12} strokeWidth={1.5} className="hero-scroll-arrow" />
            </motion.button>

            {/* Scoped styles — using CSS for interruptible, hardware-accelerated transitions */}
            <style jsx>{`
                .hero-cta-primary {
                    transition: background-color 200ms cubic-bezier(0.23, 1, 0.32, 1),
                                box-shadow 200ms cubic-bezier(0.23, 1, 0.32, 1),
                                transform 160ms cubic-bezier(0.23, 1, 0.32, 1);
                }
                .hero-cta-primary:hover {
                    background-color: var(--color-brand-purple, #B665D2);
                    box-shadow: 0 10px 25px -5px rgba(182, 101, 210, 0.15);
                }
                .hero-cta-primary:active {
                    transform: scale(0.97);
                }
                .hero-cta-arrow {
                    transition: transform 200ms cubic-bezier(0.23, 1, 0.32, 1);
                }
                .group:hover .hero-cta-arrow {
                    transform: translateX(2px);
                }
                .hero-cta-secondary {
                    transition: color 200ms ease;
                }
                .hero-cta-secondary:hover {
                    color: var(--color-brand-dark, #4B0082);
                }
                .hero-cta-secondary:active {
                    transform: scale(0.97);
                }
                .hero-underline {
                    transition: transform 250ms cubic-bezier(0.23, 1, 0.32, 1);
                }
                .hero-scroll-cue {
                    transition: color 200ms ease;
                }
                .hero-scroll-cue:hover {
                    color: rgba(182, 101, 210, 0.4);
                }
                .hero-scroll-arrow {
                    animation: scrollPulse 2.5s ease-in-out infinite;
                }
                @keyframes scrollPulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
                @media (prefers-reduced-motion: reduce) {
                    .hero-cta-primary,
                    .hero-cta-secondary,
                    .hero-underline,
                    .hero-cta-arrow {
                        transition: none;
                    }
                    .hero-scroll-arrow {
                        animation: none;
                    }
                }
            `}</style>
        </section>
    );
}


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MEDIA PANEL
   single · slideshow · video · fallback
   Crossfade with blur bridge — no dead frames between slides
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function MediaPanel({ mode, media, fallback, interval }: {
    mode: string; media: Media[]; fallback?: string; interval: number;
}) {
    const [idx, setIdx] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (mode !== "slideshow" || media.length <= 1 || paused) return;
        const t = setInterval(() => setIdx((p) => (p + 1) % media.length), interval * 1000);
        return () => clearInterval(t);
    }, [mode, media.length, interval, paused]);

    const nav = useCallback((dir: 1 | -1) => {
        setIdx((p) => (p + dir + media.length) % media.length);
        setPaused(true);
        setTimeout(() => setPaused(false), interval * 1000);
    }, [media.length, interval]);

    /* Video */
    if (mode === "video" && media[0]?.type === "video") {
        return (
            <video src={media[0].url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
        );
    }

    /* Slideshow — crossfade, not mode="wait" (avoids dead frame) */
    if (mode === "slideshow" && media.length > 0) {
        return (
            <>
                <AnimatePresence initial={false}>
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 1.02, filter: "blur(4px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, filter: "blur(2px)" }}
                        transition={{ duration: 0.6, ease: EASE_OUT }}
                        className="absolute inset-0"
                    >
                        <Image src={media[idx].url} alt={media[idx].name || ""} fill className="object-cover" priority={idx === 0} sizes="(max-width:1024px) 100vw, 50vw" />
                    </motion.div>
                </AnimatePresence>
                <Arrows count={media.length} onPrev={() => nav(-1)} onNext={() => nav(1)} />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
                    <Dots count={media.length} current={idx} onDot={(i) => { setIdx(i); setPaused(true); setTimeout(() => setPaused(false), interval * 1000); }} />
                </div>
            </>
        );
    }

    /* Single */
    if (media.length > 0) {
        return <Image src={media[0].url} alt={media[0].name || ""} fill className="object-cover" priority sizes="(max-width:1024px) 100vw, 50vw" />;
    }

    /* Fallback image */
    if (fallback) {
        return <Image src={fallback} alt="" fill className="object-cover" priority sizes="(max-width:1024px) 100vw, 50vw" />;
    }

    /* Gradient fallback */
    return (
        <div className="w-full h-full bg-gradient-to-br from-brand-lilac/20 via-white to-brand-purple/8 flex items-center justify-center">
            <span className="font-serif text-7xl text-brand-purple/[0.04] tracking-[0.25em] select-none">XELLÉ</span>
        </div>
    );
}


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FEATURED PANEL
   Slides with product info overlay
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function FeaturedPanel({ slides, interval }: { slides: FeaturedSlide[]; interval: number }) {
    const [idx, setIdx] = useState(0);
    const [paused, setPaused] = useState(false);
    const [progress, setProgress] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef(0);
    const touchStartTime = useRef(0);

    const goTo = useCallback((i: number) => {
        setIdx(i);
        setProgress(0);
        setPaused(true);
        setTimeout(() => setPaused(false), interval * 1000);
    }, [interval]);

    const goNext = useCallback(() => {
        goTo((idx + 1) % slides.length);
    }, [idx, slides.length, goTo]);

    const goPrev = useCallback(() => {
        goTo((idx - 1 + slides.length) % slides.length);
    }, [idx, slides.length, goTo]);

    /* Auto-advance with progress bar */
    useEffect(() => {
        if (slides.length <= 1 || paused) { setProgress(0); return; }
        const step = 50; // ms per tick
        const total = interval * 1000;
        let elapsed = 0;
        const t = setInterval(() => {
            elapsed += step;
            setProgress(elapsed / total);
            if (elapsed >= total) {
                setIdx((p) => (p + 1) % slides.length);
                elapsed = 0;
                setProgress(0);
            }
        }, step);
        return () => clearInterval(t);
    }, [slides.length, interval, paused, idx]);

    /* Keyboard nav */
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") goNext();
            if (e.key === "ArrowLeft") goPrev();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [goNext, goPrev]);

    /* Touch swipe with momentum */
    const onTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartTime.current = Date.now();
    }, []);

    const onTouchEnd = useCallback((e: React.TouchEvent) => {
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const dt = Date.now() - touchStartTime.current;
        const velocity = Math.abs(dx) / dt;
        if (Math.abs(dx) > 50 || velocity > 0.3) {
            if (dx < 0) goNext();
            else goPrev();
        }
    }, [goNext, goPrev]);

    /* Pause on hover */
    const onMouseEnter = useCallback(() => setPaused(true), []);
    const onMouseLeave = useCallback(() => setPaused(false), []);

    const slide = slides[idx];
    const hasOverlayContent = !!(slide.headline || slide.subtitle || slide.ctaText || slide.productName);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* Image — crossfade with blur bridge */}
            <AnimatePresence initial={false}>
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 1.02, filter: "blur(4px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(2px)" }}
                    transition={{ duration: 0.65, ease: EASE_OUT }}
                    className="absolute inset-0"
                >
                    {slide.videoUrl ? (
                        <video src={slide.videoUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                    ) : slide.imageUrl ? (
                        <Image src={slide.imageUrl} alt={slide.headline || slide.productName || ""} fill className="object-cover" priority={idx === 0} sizes="(max-width:1024px) 100vw, 50vw" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-dark to-brand-purple" />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Overlay — uses FeaturedOverlay for proper position/style support */}
            <AnimatePresence initial={false} mode="wait">
                <motion.div
                    key={`overlay-${idx}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE_OUT }}
                    className="absolute inset-0 z-10"
                >
                    {hasOverlayContent && (
                        <FeaturedOverlay
                            headline={slide.productName || slide.headline}
                            subtitle={slide.productName
                                ? (slide.productPrice != null ? formatCurrency(slide.productPrice) : undefined)
                                : slide.subtitle
                            }
                            ctaText={slide.ctaText}
                            ctaLink={slide.productSlug ? `/product/${slide.productSlug}` : slide.ctaLink}
                            position={slide.overlayPosition}
                            style={slide.overlayStyle}
                        />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Nav */}
            <Arrows count={slides.length} onPrev={goPrev} onNext={goNext} />

            {/* Bottom bar: progress + dots + counter */}
            {slides.length > 1 && (
                <div className="absolute bottom-0 inset-x-0 z-20">
                    {/* Progress bar */}
                    <div className="h-[2px] bg-white/10 mx-4 mb-3 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white/60 rounded-full"
                            style={{
                                width: `${progress * 100}%`,
                                transition: progress === 0 ? "none" : "width 50ms linear",
                            }}
                        />
                    </div>
                    <div className="flex items-center justify-between px-5 pb-4">
                        <Dots count={slides.length} current={idx} onDot={goTo} />
                        {/* Slide counter */}
                        <span className="text-[10px] font-medium text-white/40 tracking-wider tabular-nums">
                            {String(idx + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}


/* ── Shared arrow buttons — with :active press feedback ── */
function Arrows({ count, onPrev, onNext }: { count: number; onPrev: () => void; onNext: () => void }) {
    if (count <= 1) return null;
    return (
        <>
            <button
                onClick={onPrev}
                aria-label="Previous"
                className="hero-arrow absolute top-1/2 -translate-y-1/2 z-20 left-3 sm:left-4 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-black/15 backdrop-blur-sm text-white/75 cursor-pointer"
            >
                <ChevronLeft size={18} strokeWidth={2} />
            </button>
            <button
                onClick={onNext}
                aria-label="Next"
                className="hero-arrow absolute top-1/2 -translate-y-1/2 z-20 right-3 sm:right-4 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-black/15 backdrop-blur-sm text-white/75 cursor-pointer"
            >
                <ChevronRight size={18} strokeWidth={2} />
            </button>
            <style jsx>{`
                .hero-arrow {
                    transition: background-color 150ms ease-out,
                                color 150ms ease-out,
                                transform 120ms cubic-bezier(0.23, 1, 0.32, 1);
                }
                .hero-arrow:hover {
                    background-color: rgba(0,0,0,0.3);
                    color: white;
                }
                .hero-arrow:active {
                    transform: translateY(-50%) scale(0.92);
                }
                @media (prefers-reduced-motion: reduce) {
                    .hero-arrow { transition: none; }
                }
            `}</style>
        </>
    );
}

/* ── Shared dots — CSS transitions for interruptibility ── */
function Dots({ count, current, onDot }: { count: number; current: number; onDot: (i: number) => void }) {
    if (count <= 1) return null;
    return (
        <div className="flex items-center gap-1.5">
            {Array.from({ length: count }).map((_, i) => (
                <button
                    key={i}
                    onClick={() => onDot(i)}
                    aria-label={`Slide ${i + 1}`}
                    style={{ width: i === current ? 24 : 6 }}
                    className={`hero-dot h-[6px] rounded-full cursor-pointer ${
                        i === current ? "bg-white" : "bg-white/35"
                    }`}
                />
            ))}
            <style jsx>{`
                .hero-dot {
                    transition: width 250ms cubic-bezier(0.23, 1, 0.32, 1),
                                background-color 200ms ease;
                }
                .hero-dot:hover {
                    background-color: rgba(255,255,255,0.6);
                }
                .hero-dot:active {
                    transform: scale(0.85);
                }
                @media (prefers-reduced-motion: reduce) {
                    .hero-dot { transition: none; }
                }
            `}</style>
        </div>
    );
}
