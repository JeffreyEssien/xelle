"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSiteSettings, updateSiteSettings, getProducts } from "@/lib/queries";
import type { SiteSettings, FeaturedSlide, OverlayPosition, OverlayStyle, OverlayFont, OverlayGradient, Product } from "@/types";
import type { Media } from "@/types";
import MediaPicker from "@/components/modules/MediaPicker";
import FeaturedOverlay from "@/components/modules/FeaturedOverlay";
import Image from "next/image";
import { toast } from "sonner";
import {
    Plus, GripVertical, Trash2, Copy, Eye, EyeOff, Save,
    Package, Image as ImageIcon, Megaphone, ChevronDown, ChevronUp,
    Play, X, Layers, ToggleRight, Film, ArrowRight
} from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";

const OVERLAY_POSITIONS: { value: OverlayPosition; label: string }[] = [
    { value: "bottom-left", label: "Bottom Left" },
    { value: "bottom-right", label: "Bottom Right" },
    { value: "center", label: "Center" },
    { value: "top-left", label: "Top Left" },
    { value: "top-right", label: "Top Right" },
];

const OVERLAY_STYLES: { value: OverlayStyle; label: string }[] = [
    { value: "dark-glass", label: "Dark Glass" },
    { value: "light-glass", label: "Light Glass" },
    { value: "gradient", label: "Gradient" },
    { value: "none", label: "None" },
];

const OVERLAY_FONTS: { value: OverlayFont; label: string; preview: string }[] = [
    { value: "serif", label: "Serif", preview: "font-serif" },
    { value: "sans", label: "Sans", preview: "font-sans" },
    { value: "mono", label: "Mono", preview: "font-mono" },
];

const OVERLAY_GRADIENTS: { value: OverlayGradient; label: string; swatch: string }[] = [
    { value: "none", label: "None", swatch: "bg-gray-100" },
    { value: "dark-bottom", label: "Dark ↑", swatch: "bg-gradient-to-t from-gray-900 to-gray-400" },
    { value: "dark-top", label: "Dark ↓", swatch: "bg-gradient-to-b from-gray-900 to-gray-400" },
    { value: "dark-full", label: "Dark Full", swatch: "bg-gray-700" },
    { value: "brand-bottom", label: "Brand ↑", swatch: "bg-gradient-to-t from-[#4B0082] to-[#B665D2]" },
    { value: "brand-radial", label: "Brand Glow", swatch: "bg-[radial-gradient(circle,#B665D2_0%,transparent_70%)]" },
    { value: "warm-bottom", label: "Warm ↑", swatch: "bg-gradient-to-t from-amber-900 to-orange-400" },
    { value: "cool-bottom", label: "Cool ↑", swatch: "bg-gradient-to-t from-slate-900 to-blue-400" },
];

const TEXT_COLOR_PRESETS = [
    { value: "#ffffff", label: "White" },
    { value: "#4B0082", label: "Brand Dark" },
    { value: "#B665D2", label: "Brand Purple" },
    { value: "#C8A2C8", label: "Lilac" },
    { value: "#F5F5DC", label: "Cream" },
    { value: "#1a1a1a", label: "Black" },
    { value: "#D4AF37", label: "Gold" },
    { value: "#E8CEBF", label: "Blush" },
];

function generateId() {
    return `slide-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function AdminFeaturedPage() {
    const [settings, setSettings] = useState<Partial<SiteSettings>>({});
    const [slides, setSlides] = useState<FeaturedSlide[]>([]);
    const [useFeatured, setUseFeatured] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [expandedSlide, setExpandedSlide] = useState<string | null>(null);
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [mediaPickerTarget, setMediaPickerTarget] = useState<string | null>(null);
    const [previewSlide, setPreviewSlide] = useState<FeaturedSlide | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [settingsData, productsData] = await Promise.all([
                getSiteSettings(),
                getProducts(),
            ]);
            if (settingsData) {
                setSettings(settingsData);
                setSlides(settingsData.featuredSlides || []);
                setUseFeatured(settingsData.heroDisplayConfig?.useFeaturedSlides || false);
            }
            setProducts(productsData);
        } catch {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateSiteSettings({
                ...settings,
                featuredSlides: slides,
                heroDisplayConfig: {
                    ...(settings.heroDisplayConfig || { mode: "single", mediaIds: [], slideshowInterval: 5 }),
                    useFeaturedSlides: useFeatured,
                },
            });
            toast.success("Featured slides saved!");
        } catch {
            toast.error("Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const addSlide = (type: FeaturedSlide["type"]) => {
        const newSlide: FeaturedSlide = {
            id: generateId(),
            type,
            isActive: true,
            sortOrder: slides.length,
            overlayPosition: "bottom-left",
            overlayStyle: "gradient",
        };
        setSlides((prev) => [...prev, newSlide]);
        setExpandedSlide(newSlide.id);
    };

    const updateSlide = (id: string, updates: Partial<FeaturedSlide>) => {
        setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    };

    const deleteSlide = (id: string) => {
        if (!confirm("Delete this slide?")) return;
        setSlides((prev) => prev.filter((s) => s.id !== id));
        if (expandedSlide === id) setExpandedSlide(null);
    };

    const duplicateSlide = (slide: FeaturedSlide) => {
        const dup: FeaturedSlide = { ...slide, id: generateId(), sortOrder: slides.length };
        setSlides((prev) => [...prev, dup]);
    };

    const moveSlide = (id: string, direction: "up" | "down") => {
        setSlides((prev) => {
            const idx = prev.findIndex((s) => s.id === id);
            if (idx < 0) return prev;
            const swapIdx = direction === "up" ? idx - 1 : idx + 1;
            if (swapIdx < 0 || swapIdx >= prev.length) return prev;
            const next = [...prev];
            [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
            return next.map((s, i) => ({ ...s, sortOrder: i }));
        });
    };

    const handleProductSelect = (slideId: string, productId: string) => {
        const product = products.find((p) => p.id === productId);
        if (!product) return;
        updateSlide(slideId, {
            productId: product.id,
            productName: product.name,
            productPrice: product.price,
            productSlug: product.slug,
            imageUrl: product.images[0] || undefined,
            ctaLink: `/product/${product.slug}`,
            ctaText: "Shop Now",
        });
    };

    const openMediaPickerForSlide = (slideId: string) => {
        setMediaPickerTarget(slideId);
        setMediaPickerOpen(true);
    };

    const handleMediaSelectForSlide = (selected: Media[]) => {
        if (!mediaPickerTarget || selected.length === 0) return;
        const media = selected[0];
        updateSlide(mediaPickerTarget, {
            imageUrl: media.type === "image" ? media.url : undefined,
            videoUrl: media.type === "video" ? media.url : undefined,
            mediaId: media.id,
        });
    };

    if (loading) {
        return (
            <div className="max-w-4xl">
                <h1 className="text-2xl font-serif text-brand-dark mb-6">Featured Slides</h1>
                <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-white rounded-xl border border-gray-100" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-serif text-brand-dark">Featured Slides</h1>
                    <p className="text-sm text-brand-dark/40 mt-1">Build curated slides for the hero section.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-dark text-white text-sm font-medium disabled:opacity-50 cursor-pointer transition-[background-color,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-brand-purple active:scale-[0.97]"
                >
                    <Save size={14} />
                    {saving ? "Saving..." : "Save All"}
                </button>
            </div>

            {/* Toggle */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-100 mb-6">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={useFeatured}
                        onChange={(e) => setUseFeatured(e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-brand-purple transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </label>
                <div>
                    <p className="text-sm font-medium text-brand-dark">Use Featured Slides in Hero</p>
                    <p className="text-xs text-brand-dark/40">When ON, overrides the basic display mode in Settings.</p>
                </div>
            </div>

            {/* Stats bar */}
            {slides.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                        { label: "Total", value: slides.length, icon: Layers, color: "text-brand-purple" },
                        { label: "Active", value: slides.filter((s) => s.isActive).length, icon: ToggleRight, color: "text-green-600" },
                        { label: "With Media", value: slides.filter((s) => s.imageUrl || s.videoUrl).length, icon: Film, color: "text-blue-600" },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-100">
                            <Icon size={16} className={color} />
                            <div>
                                <p className="text-lg font-semibold text-brand-dark leading-none">{value}</p>
                                <p className="text-[10px] text-brand-dark/35 uppercase tracking-wider mt-0.5">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Slide Buttons */}
            <div className="flex gap-2 mb-6">
                {([
                    { type: "product" as const, icon: Package, label: "Product Slide" },
                    { type: "media" as const, icon: ImageIcon, label: "Media Slide" },
                    { type: "promo" as const, icon: Megaphone, label: "Promo Slide" },
                ]).map(({ type, icon: Icon, label }) => (
                    <button
                        key={type}
                        onClick={() => addSlide(type)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-dashed border-brand-lilac/30 text-sm text-brand-purple hover:bg-brand-purple/5 active:scale-[0.97] transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer"
                    >
                        <Plus size={14} />
                        <Icon size={14} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Slides List */}
            {slides.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <ImageIcon size={32} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-brand-dark/40 text-sm">No slides yet. Add one above to get started.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {slides.map((slide, index) => {
                        const isExpanded = expandedSlide === slide.id;

                        return (
                            <div
                                key={slide.id}
                                className={`rounded-xl bg-white border transition-[opacity,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-brand-lilac/30 hover:shadow-sm ${
                                    !slide.isActive ? "opacity-50 border-gray-100" : "border-gray-100"
                                }`}
                            >
                                {/* Slide Header */}
                                <div className="flex items-center gap-3 px-4 py-3">
                                    {/* Reorder */}
                                    <div className="flex flex-col gap-0.5">
                                        <button onClick={() => moveSlide(slide.id, "up")} disabled={index === 0} className="text-gray-300 hover:text-brand-purple disabled:opacity-30 cursor-pointer"><ChevronUp size={14} /></button>
                                        <button onClick={() => moveSlide(slide.id, "down")} disabled={index === slides.length - 1} className="text-gray-300 hover:text-brand-purple disabled:opacity-30 cursor-pointer"><ChevronDown size={14} /></button>
                                    </div>

                                    {/* Thumbnail */}
                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                        {slide.imageUrl ? (
                                            <Image src={slide.imageUrl} alt="" width={48} height={48} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                {slide.type === "product" ? <Package size={16} className="text-gray-300" /> :
                                                 slide.videoUrl ? <Play size={16} className="text-gray-300" /> :
                                                 <ImageIcon size={16} className="text-gray-300" />}
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                                                slide.type === "product" ? "bg-blue-50 text-blue-600" :
                                                slide.type === "media" ? "bg-purple-50 text-purple-600" :
                                                "bg-amber-50 text-amber-600"
                                            }`}>
                                                {slide.type}
                                            </span>
                                            <span className="text-sm text-brand-dark truncate">
                                                {slide.headline || slide.productName || "Untitled Slide"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setPreviewSlide(slide)} className="p-2 text-gray-400 hover:text-brand-purple cursor-pointer" title="Preview"><Eye size={14} /></button>
                                        <button onClick={() => updateSlide(slide.id, { isActive: !slide.isActive })} className="p-2 text-gray-400 hover:text-brand-purple cursor-pointer" title={slide.isActive ? "Deactivate" : "Activate"}>
                                            {slide.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                        <button onClick={() => duplicateSlide(slide)} className="p-2 text-gray-400 hover:text-brand-purple cursor-pointer" title="Duplicate"><Copy size={14} /></button>
                                        <button onClick={() => deleteSlide(slide.id)} className="p-2 text-gray-400 hover:text-red-500 cursor-pointer" title="Delete"><Trash2 size={14} /></button>
                                        <button
                                            onClick={() => setExpandedSlide(isExpanded ? null : slide.id)}
                                            className="p-2 text-gray-400 hover:text-brand-dark cursor-pointer"
                                        >
                                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Editor — animated open/close */}
                                <AnimatePresence initial={false}>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                                        className="overflow-hidden"
                                    >
                                    <div className="px-4 pb-4 pt-2 border-t border-gray-50 space-y-4">
                                        {/* Inline mini preview */}
                                        {(slide.imageUrl || slide.videoUrl) && (
                                            <div className="relative w-full aspect-[16/7] rounded-lg overflow-hidden bg-gray-900">
                                                {slide.imageUrl && (
                                                    <Image src={slide.imageUrl} alt="" fill className="object-cover" sizes="600px" />
                                                )}
                                                {slide.videoUrl && !slide.imageUrl && (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                                        <Play size={24} className="text-white/40" />
                                                    </div>
                                                )}
                                                <FeaturedOverlay
                                                    headline={slide.headline || slide.productName}
                                                    subtitle={slide.subtitle || (slide.productPrice != null ? formatCurrency(slide.productPrice) : undefined)}
                                                    ctaText={slide.ctaText}
                                                    ctaLink={slide.ctaLink}
                                                    position={slide.overlayPosition}
                                                    style={slide.overlayStyle}
                                                    textColor={slide.textColor}
                                                    fontStyle={slide.fontStyle}
                                                    overlayGradient={slide.overlayGradient}
                                                />
                                                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/50 text-[9px] text-white/60 font-medium">
                                                    LIVE PREVIEW
                                                </div>
                                            </div>
                                        )}

                                        {/* Product selector */}
                                        {slide.type === "product" && (
                                            <div>
                                                <label className="block text-[10px] font-semibold text-brand-dark/40 uppercase tracking-[0.2em] mb-1.5">Product</label>
                                                <select
                                                    value={slide.productId || ""}
                                                    onChange={(e) => handleProductSelect(slide.id, e.target.value)}
                                                    className="w-full border border-brand-lilac/20 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/40 transition-all"
                                                >
                                                    <option value="">Select a product...</option>
                                                    {products.map((p) => (
                                                        <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.price)}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {/* Media selector — available for ALL slide types */}
                                        <div>
                                            <label className="block text-[10px] font-semibold text-brand-dark/40 uppercase tracking-[0.2em] mb-1.5">
                                                {slide.type === "product" ? "Custom Image (overrides product image)" : "Background"}
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openMediaPickerForSlide(slide.id)}
                                                    className="px-4 py-2 rounded-lg border border-dashed border-brand-lilac/30 text-sm text-brand-purple hover:bg-brand-purple/5 active:scale-[0.97] transition-[background-color,transform] duration-150 cursor-pointer"
                                                >
                                                    Choose from Gallery
                                                </button>
                                                {slide.imageUrl && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-10 h-10 rounded-lg overflow-hidden relative shrink-0">
                                                            <Image src={slide.imageUrl} alt="" fill className="object-cover" sizes="40px" />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateSlide(slide.id, { imageUrl: undefined, mediaId: undefined })}
                                                            className="p-1 text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Overlay fields */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-semibold text-brand-dark/40 uppercase tracking-[0.2em] mb-1.5">Headline</label>
                                                <input
                                                    type="text"
                                                    value={slide.headline || ""}
                                                    onChange={(e) => updateSlide(slide.id, { headline: e.target.value })}
                                                    className="w-full border border-brand-lilac/20 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/40 transition-all"
                                                    placeholder="Slide headline..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-semibold text-brand-dark/40 uppercase tracking-[0.2em] mb-1.5">Subtitle</label>
                                                <input
                                                    type="text"
                                                    value={slide.subtitle || ""}
                                                    onChange={(e) => updateSlide(slide.id, { subtitle: e.target.value })}
                                                    className="w-full border border-brand-lilac/20 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/40 transition-all"
                                                    placeholder="Slide subtitle..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-semibold text-brand-dark/40 uppercase tracking-[0.2em] mb-1.5">CTA Text</label>
                                                <input
                                                    type="text"
                                                    value={slide.ctaText || ""}
                                                    onChange={(e) => updateSlide(slide.id, { ctaText: e.target.value })}
                                                    className="w-full border border-brand-lilac/20 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/40 transition-all"
                                                    placeholder="Shop Now"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-semibold text-brand-dark/40 uppercase tracking-[0.2em] mb-1.5">CTA Link</label>
                                                <input
                                                    type="text"
                                                    value={slide.ctaLink || ""}
                                                    onChange={(e) => updateSlide(slide.id, { ctaLink: e.target.value })}
                                                    className="w-full border border-brand-lilac/20 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/40 transition-all"
                                                    placeholder="/shop"
                                                />
                                            </div>
                                        </div>

                                        {/* Overlay position — visual 3x3 grid picker */}
                                        <div>
                                            <label className="block text-[10px] font-semibold text-brand-dark/40 uppercase tracking-[0.2em] mb-2">Overlay Position</label>
                                            <div className="inline-grid grid-cols-3 grid-rows-3 gap-1 p-1.5 rounded-xl bg-gray-50 border border-gray-100">
                                                {(["top-left", null, "top-right", null, "center", null, "bottom-left", null, "bottom-right"] as (OverlayPosition | null)[]).map((pos, i) => (
                                                    pos ? (
                                                        <button
                                                            key={pos}
                                                            type="button"
                                                            onClick={() => updateSlide(slide.id, { overlayPosition: pos })}
                                                            className={`w-9 h-7 rounded-md text-[8px] font-semibold uppercase tracking-wider cursor-pointer transition-[background-color,color,transform] duration-150 active:scale-[0.92] ${
                                                                slide.overlayPosition === pos
                                                                    ? "bg-brand-purple text-white shadow-sm"
                                                                    : "bg-white text-brand-dark/30 hover:text-brand-dark/60 border border-gray-100"
                                                            }`}
                                                            title={OVERLAY_POSITIONS.find((p) => p.value === pos)?.label}
                                                        >
                                                            {pos === "top-left" ? "TL" : pos === "top-right" ? "TR" : pos === "center" ? "C" : pos === "bottom-left" ? "BL" : "BR"}
                                                        </button>
                                                    ) : (
                                                        <div key={`empty-${i}`} className="w-9 h-7" />
                                                    )
                                                ))}
                                            </div>
                                        </div>

                                        {/* Overlay style — pill selector */}
                                        <div>
                                            <label className="block text-[10px] font-semibold text-brand-dark/40 uppercase tracking-[0.2em] mb-2">Overlay Style</label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {OVERLAY_STYLES.map((s) => (
                                                    <button
                                                        key={s.value}
                                                        type="button"
                                                        onClick={() => updateSlide(slide.id, { overlayStyle: s.value })}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-[background-color,color,transform,box-shadow] duration-150 active:scale-[0.95] ${
                                                            slide.overlayStyle === s.value
                                                                ? "bg-brand-purple text-white shadow-sm"
                                                                : "bg-gray-50 text-brand-dark/40 border border-gray-100 hover:border-brand-lilac/30"
                                                        }`}
                                                    >
                                                        {s.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Layer Gradient */}
                                        <div>
                                            <label className="block text-[10px] font-semibold text-brand-dark/40 uppercase tracking-[0.2em] mb-2">Layer Gradient</label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {OVERLAY_GRADIENTS.map((g) => (
                                                    <button
                                                        key={g.value}
                                                        type="button"
                                                        onClick={() => updateSlide(slide.id, { overlayGradient: g.value })}
                                                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-150 active:scale-[0.95] ${
                                                            (slide.overlayGradient || "none") === g.value
                                                                ? "bg-brand-purple text-white shadow-sm"
                                                                : "bg-gray-50 text-brand-dark/40 border border-gray-100 hover:border-brand-lilac/30"
                                                        }`}
                                                    >
                                                        <span className={`inline-block w-3 h-3 rounded-full ${g.swatch} shrink-0`} />
                                                        {g.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Text Color */}
                                        <div>
                                            <label className="block text-[10px] font-semibold text-brand-dark/40 uppercase tracking-[0.2em] mb-2">Text Color</label>
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                {TEXT_COLOR_PRESETS.map((c) => (
                                                    <button
                                                        key={c.value}
                                                        type="button"
                                                        onClick={() => updateSlide(slide.id, { textColor: c.value })}
                                                        title={c.label}
                                                        className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-all duration-150 active:scale-[0.9] ${
                                                            slide.textColor === c.value
                                                                ? "border-brand-purple scale-110 shadow-md"
                                                                : "border-gray-200 hover:border-brand-lilac/40"
                                                        }`}
                                                        style={{ backgroundColor: c.value }}
                                                    />
                                                ))}
                                                <div className="flex items-center gap-1.5 ml-1">
                                                    <input
                                                        type="color"
                                                        value={slide.textColor || "#ffffff"}
                                                        onChange={(e) => updateSlide(slide.id, { textColor: e.target.value })}
                                                        className="w-7 h-7 rounded-full border border-gray-200 cursor-pointer"
                                                        title="Custom color"
                                                    />
                                                    {slide.textColor && (
                                                        <button
                                                            type="button"
                                                            onClick={() => updateSlide(slide.id, { textColor: undefined })}
                                                            className="text-[10px] text-brand-dark/30 hover:text-brand-dark/60 cursor-pointer"
                                                        >
                                                            Reset
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Font Style */}
                                        <div>
                                            <label className="block text-[10px] font-semibold text-brand-dark/40 uppercase tracking-[0.2em] mb-2">Font Style</label>
                                            <div className="flex gap-1.5">
                                                {OVERLAY_FONTS.map((f) => (
                                                    <button
                                                        key={f.value}
                                                        type="button"
                                                        onClick={() => updateSlide(slide.id, { fontStyle: f.value })}
                                                        className={`px-4 py-2 rounded-lg text-sm cursor-pointer transition-all duration-150 active:scale-[0.95] ${f.preview} ${
                                                            (slide.fontStyle || "serif") === f.value
                                                                ? "bg-brand-purple text-white shadow-sm"
                                                                : "bg-gray-50 text-brand-dark/50 border border-gray-100 hover:border-brand-lilac/30"
                                                        }`}
                                                    >
                                                        {f.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Media Picker */}
            <MediaPicker
                open={mediaPickerOpen}
                onClose={() => { setMediaPickerOpen(false); setMediaPickerTarget(null); }}
                onSelect={handleMediaSelectForSlide}
                multiple={false}
            />

            {/* Preview Modal — animated entrance */}
            <AnimatePresence>
            {previewSlide && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => setPreviewSlide(null)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                        className="relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden bg-gray-900"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {previewSlide.imageUrl && (
                            <Image src={previewSlide.imageUrl} alt="" fill className="object-cover" sizes="800px" />
                        )}
                        {previewSlide.videoUrl && (
                            <video src={previewSlide.videoUrl} autoPlay muted loop className="absolute inset-0 w-full h-full object-cover" />
                        )}
                        <FeaturedOverlay
                            headline={previewSlide.headline}
                            subtitle={previewSlide.subtitle}
                            ctaText={previewSlide.ctaText}
                            ctaLink={previewSlide.ctaLink}
                            position={previewSlide.overlayPosition}
                            style={previewSlide.overlayStyle}
                            textColor={previewSlide.textColor}
                            fontStyle={previewSlide.fontStyle}
                            overlayGradient={previewSlide.overlayGradient}
                        />
                        <button
                            onClick={() => setPreviewSlide(null)}
                            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 active:scale-[0.92] transition-[background-color,transform] duration-150 cursor-pointer z-20"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
}
