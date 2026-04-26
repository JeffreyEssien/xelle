"use client";

import { useState, useEffect } from "react";
import { getSiteSettings, updateSiteSettings } from "@/lib/queries";
import { uploadProductImage } from "@/lib/uploadImage";
import type { SiteSettings, HeroDisplayConfig, Media } from "@/types";
import Button from "@/components/ui/Button";
import MediaPicker from "@/components/modules/MediaPicker";
import { toast } from "sonner";
import Image from "next/image";
import {
    Megaphone, Globe, Phone, MessageCircle, MapPin, Type,
    Instagram, Twitter, Music2, Facebook, Monitor, Image as ImageIcon,
    Film, Play, Trash2, Eye, EyeOff, X, Plus, ArrowRight,
    ChevronLeft, ChevronRight
} from "lucide-react";

const DEFAULT_DISPLAY_CONFIG: HeroDisplayConfig = {
    mode: "single",
    mediaIds: [],
    slideshowInterval: 5,
    useFeaturedSlides: false,
};

export default function SiteSettingsForm() {
    const [settings, setSettings] = useState<Partial<SiteSettings>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [mediaPickerFilter, setMediaPickerFilter] = useState<"image" | "video" | undefined>();
    const [resolvedMedia, setResolvedMedia] = useState<Media[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [badgeInput, setBadgeInput] = useState("");

    useEffect(() => {
        loadSettings();
    }, []);

    const displayConfig = settings.heroDisplayConfig || DEFAULT_DISPLAY_CONFIG;

    // Resolve media IDs to URLs for preview
    useEffect(() => {
        if (displayConfig.mediaIds.length === 0) {
            setResolvedMedia([]);
            return;
        }
        const fetchMedia = async () => {
            try {
                const res = await fetch("/api/media");
                const data = await res.json();
                const allMedia: Media[] = data.media || [];
                const resolved = displayConfig.mediaIds
                    .map((id: string) => allMedia.find((m: Media) => m.id === id))
                    .filter(Boolean) as Media[];
                setResolvedMedia(resolved);
            } catch { /* silent */ }
        };
        fetchMedia();
    }, [displayConfig.mediaIds]);

    const loadSettings = async () => {
        try {
            const data = await getSiteSettings();
            if (data) setSettings(data);
        } catch (error) {
            console.error("Failed to load settings", error);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            setSettings((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setSettings((prev) => ({ ...prev, [name]: value }));
        }
    };

    const updateDisplayConfig = (updates: Partial<HeroDisplayConfig>) => {
        setSettings((prev) => ({
            ...prev,
            heroDisplayConfig: { ...displayConfig, ...updates },
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateSiteSettings(settings);
            toast.success("Settings saved successfully.");
        } catch {
            toast.error("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "logoUrl" | "heroImage" | "faviconUrl") => {
        const file = e.target.files?.[0];
        if (!file) return;
        const toastId = toast.loading("Uploading image...");
        try {
            const url = await uploadProductImage(file);
            setSettings((prev) => ({ ...prev, [field]: url }));
            toast.success("Image uploaded successfully", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload image", { id: toastId });
        }
    };

    const openMediaPicker = (filter?: "image" | "video") => {
        setMediaPickerFilter(filter);
        setMediaPickerOpen(true);
    };

    const handleMediaSelect = (selected: Media[]) => {
        const ids = selected.map((m) => m.id);
        if (displayConfig.mode === "single" || displayConfig.mode === "video") {
            updateDisplayConfig({ mediaIds: ids.slice(0, 1) });
        } else {
            const existing = displayConfig.mediaIds || [];
            const merged = [...existing, ...ids.filter((id) => !existing.includes(id))];
            updateDisplayConfig({ mediaIds: merged });
        }
        setResolvedMedia((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            return [...prev, ...selected.filter((m) => !existingIds.has(m.id))];
        });
    };

    const removeMediaId = (id: string) => {
        const updated = (displayConfig.mediaIds || []).filter((mid: string) => mid !== id);
        updateDisplayConfig({ mediaIds: updated });
        setResolvedMedia((prev) => prev.filter((m) => m.id !== id));
    };

    const addTrustBadge = () => {
        const text = badgeInput.trim().toUpperCase();
        if (!text) return;
        const current = settings.heroTrustBadges || [];
        if (current.includes(text)) return;
        setSettings((prev) => ({ ...prev, heroTrustBadges: [...current, text] }));
        setBadgeInput("");
    };

    const removeTrustBadge = (index: number) => {
        const current = settings.heroTrustBadges || [];
        setSettings((prev) => ({
            ...prev,
            heroTrustBadges: current.filter((_, i) => i !== index),
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSave} className="space-y-10 max-w-2xl">
            {/* --- General --- */}
            <SettingsSection title="General" icon={Globe}>
                <Field label="Site Name">
                    <input type="text" name="siteName" value={settings.siteName || ""} onChange={handleChange} className="form-input" />
                </Field>
                <Field label="Logo">
                    <div className="flex gap-2">
                        <input type="text" name="logoUrl" value={settings.logoUrl || ""} onChange={handleChange} className="form-input flex-1" placeholder="https://..." />
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "logoUrl")} className="hidden" id="logo-upload" />
                        <label htmlFor="logo-upload" className="upload-btn">Upload</label>
                    </div>
                    {settings.logoUrl && (
                        <div className="mt-2 relative h-12 w-auto">
                            <img src={settings.logoUrl} alt="Logo Preview" className="h-full object-contain" />
                        </div>
                    )}
                </Field>
                <Field label="Favicon (Icon)">
                    <div className="flex gap-2">
                        <input type="text" name="faviconUrl" value={settings.faviconUrl || ""} onChange={handleChange} className="form-input flex-1" placeholder="https://..." />
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "faviconUrl")} className="hidden" id="favicon-upload" />
                        <label htmlFor="favicon-upload" className="upload-btn">Upload</label>
                    </div>
                    {settings.faviconUrl && (
                        <div className="mt-2 relative h-8 w-8">
                            <img src={settings.faviconUrl} alt="Favicon Preview" className="h-full w-full object-contain" />
                        </div>
                    )}
                </Field>
            </SettingsSection>

            {/* --- Homepage Hero --- */}
            <SettingsSection title="Homepage Hero" icon={Type}>
                {/* Hero Enabled Toggle */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-100 -mt-2 mb-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.heroEnabled !== false}
                            onChange={(e) => setSettings((prev) => ({ ...prev, heroEnabled: e.target.checked }))}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-brand-purple transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                    </label>
                    <div>
                        <p className="text-sm font-medium text-brand-dark">Show Hero Section</p>
                        <p className="text-xs text-brand-dark/40">Turn OFF to hide the hero entirely. Page content shifts up.</p>
                    </div>
                </div>

                {/* Preview Toggle */}
                <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-2 text-sm text-brand-purple hover:text-brand-purple/80 transition-colors cursor-pointer mb-2"
                >
                    {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                    {showPreview ? "Hide Preview" : "Preview Hero"}
                </button>

                {/* Live Preview */}
                {showPreview && (
                    <HeroPreview
                        settings={settings}
                        resolvedMedia={resolvedMedia}
                        onClose={() => setShowPreview(false)}
                    />
                )}

                <Field label="Eyebrow Text">
                    <input type="text" name="heroEyebrow" value={settings.heroEyebrow || ""} onChange={handleChange} className="form-input" placeholder="CURATED FOR EVERYDAY LIVING" />
                </Field>
                <Field label="Heading">
                    <input type="text" name="heroHeading" value={settings.heroHeading || ""} onChange={handleChange} className="form-input" placeholder="Smart. Comfortable. Intentional." />
                </Field>
                <Field label="Subheading">
                    <input type="text" name="heroSubheading" value={settings.heroSubheading || ""} onChange={handleChange} className="form-input" />
                </Field>
                <Field label="Hero Image (Fallback)">
                    <div className="flex gap-2">
                        <input type="text" name="heroImage" value={settings.heroImage || ""} onChange={handleChange} className="form-input flex-1" placeholder="https://..." />
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "heroImage")} className="hidden" id="hero-upload" />
                        <label htmlFor="hero-upload" className="upload-btn">Upload</label>
                    </div>
                    {settings.heroImage && (
                        <div className="mt-2 relative h-32 w-full bg-neutral-100 rounded-lg overflow-hidden">
                            <img src={settings.heroImage} alt="Hero Preview" className="w-full h-full object-cover opacity-60" />
                        </div>
                    )}
                </Field>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Primary CTA Text">
                        <input type="text" name="heroCtaText" value={settings.heroCtaText || ""} onChange={handleChange} className="form-input" placeholder="Shop Now" />
                    </Field>
                    <Field label="Primary CTA Link">
                        <input type="text" name="heroCtaLink" value={settings.heroCtaLink || ""} onChange={handleChange} className="form-input" placeholder="/shop" />
                    </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Secondary CTA Text">
                        <input type="text" name="heroCtaSecondaryText" value={settings.heroCtaSecondaryText || ""} onChange={handleChange} className="form-input" placeholder="Our Story" />
                    </Field>
                    <Field label="Secondary CTA Link">
                        <input type="text" name="heroCtaSecondaryLink" value={settings.heroCtaSecondaryLink || ""} onChange={handleChange} className="form-input" placeholder="/#about" />
                    </Field>
                </div>

                {/* Trust Badges */}
                <Field label="Trust Badges">
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={badgeInput}
                            onChange={(e) => setBadgeInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTrustBadge(); } }}
                            className="form-input flex-1"
                            placeholder="e.g. SAME-DAY DELIVERY"
                        />
                        <button type="button" onClick={addTrustBadge} className="px-3 py-2 bg-brand-purple/10 text-brand-purple rounded-lg hover:bg-brand-purple/20 transition-colors cursor-pointer">
                            <Plus size={16} />
                        </button>
                    </div>
                    {(settings.heroTrustBadges || []).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {(settings.heroTrustBadges || []).map((badge, i) => (
                                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs font-medium text-brand-dark/60">
                                    {badge}
                                    <button type="button" onClick={() => removeTrustBadge(i)} className="text-brand-dark/30 hover:text-red-500 transition-colors cursor-pointer">
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </Field>
            </SettingsSection>

            {/* --- Hero Display Panel --- */}
            <SettingsSection title="Hero Display Panel" icon={Monitor}>
                <p className="text-xs text-brand-dark/40 -mt-2 mb-4">
                    Controls the right-side visual of the hero. Choose a display mode and select media from the gallery.
                    {displayConfig.useFeaturedSlides && (
                        <span className="block mt-1 text-amber-600 font-medium">
                            Featured Slides are active — these settings are overridden. Manage slides at /admin/featured.
                        </span>
                    )}
                </p>

                {/* Display Mode Picker */}
                <Field label="Display Mode">
                    <div className="flex gap-2">
                        {([
                            { mode: "single", icon: ImageIcon, label: "Single Image" },
                            { mode: "slideshow", icon: Play, label: "Slideshow" },
                            { mode: "video", icon: Film, label: "Video" },
                        ] as const).map(({ mode, icon: Icon, label }) => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => {
                                    updateDisplayConfig({ mode, mediaIds: [] });
                                    setResolvedMedia([]);
                                }}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                                    displayConfig.mode === mode
                                        ? "border-brand-purple bg-brand-purple/5 text-brand-purple"
                                        : "border-gray-100 text-brand-dark/40 hover:border-brand-lilac/30"
                                }`}
                            >
                                <Icon size={16} />
                                {label}
                            </button>
                        ))}
                    </div>
                </Field>

                {/* Choose from Gallery button */}
                <Field label="Media">
                    <button
                        type="button"
                        onClick={() => openMediaPicker(displayConfig.mode === "video" ? "video" : "image")}
                        className="px-4 py-2.5 rounded-lg border border-dashed border-brand-lilac/30 text-sm text-brand-purple hover:bg-brand-purple/5 transition-colors w-full text-center cursor-pointer"
                    >
                        Choose from Gallery
                    </button>
                </Field>

                {/* Selected Media Preview */}
                {resolvedMedia.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-[10px] font-semibold text-brand-dark/40 uppercase tracking-[0.2em]">
                            Selected ({resolvedMedia.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {resolvedMedia.map((m) => (
                                <div key={m.id} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-gray-100">
                                    {m.type === "image" ? (
                                        <Image src={m.url} alt={m.name || ""} fill className="object-cover" sizes="96px" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                            <Film size={16} className="text-white/60" />
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeMediaId(m.id)}
                                        className="absolute top-1 right-1 p-1 rounded-md bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                        <Trash2 size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Slideshow interval */}
                {displayConfig.mode === "slideshow" && (
                    <Field label="Slideshow Interval (seconds)">
                        <input
                            type="number"
                            min={2}
                            max={30}
                            value={displayConfig.slideshowInterval || 5}
                            onChange={(e) => updateDisplayConfig({ slideshowInterval: Number(e.target.value) })}
                            className="form-input w-32"
                        />
                    </Field>
                )}
            </SettingsSection>

            {/* --- Our Story & Why XELLE --- */}
            <SettingsSection title="Our Story & Features" icon={Type}>
                <Field label="Our Story Heading">
                    <input type="text" name="ourStoryHeading" value={settings.ourStoryHeading || ""} onChange={handleChange} className="form-input" placeholder="The Comfort of Smart Living" />
                </Field>
                <Field label="Our Story Text (Separate paragraphs with double newlines)">
                    <textarea
                        name="ourStoryText"
                        value={settings.ourStoryText || ""}
                        onChange={handleChange}
                        className="form-input min-h-[160px] resize-y"
                        placeholder="XELLÉ was created from a simple idea...\n\nAs a chronic online shopper..."
                    />
                </Field>
                <div className="pt-4 border-t border-brand-lilac/15 mt-4">
                    <Field label="Why XELLÉ Heading">
                        <input type="text" name="whyXelleHeading" value={settings.whyXelleHeading || ""} onChange={handleChange} className="form-input" placeholder="Why XELLÉ?" />
                    </Field>
                    <Field label="Why XELLÉ Features (One feature per line)">
                        <textarea
                            name="whyXelleFeatures"
                            value={settings.whyXelleFeatures || ""}
                            onChange={handleChange}
                            className="form-input min-h-[120px] resize-y"
                            placeholder="High-end brands at affordable prices\nBeauty, accessories, gadgets & home essentials in one place"
                        />
                    </Field>
                </div>
            </SettingsSection>

            {/* --- Announcement Bar --- */}
            <SettingsSection title="Announcement Bar" icon={Megaphone}>
                <div className="flex items-center gap-3 mb-4">
                    <input
                        type="checkbox"
                        name="announcementBarEnabled"
                        checked={settings.announcementBarEnabled || false}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-brand-lilac/30 text-brand-purple focus:ring-brand-purple/30"
                        id="announcement-toggle"
                    />
                    <label htmlFor="announcement-toggle" className="text-sm text-brand-dark/70 cursor-pointer">
                        Show announcement bar on storefront
                    </label>
                </div>
                <Field label="Announcement Text">
                    <input type="text" name="announcementBarText" value={settings.announcementBarText || ""} onChange={handleChange} className="form-input" placeholder="New arrivals now available — shop the latest collection!" />
                </Field>
                <Field label="Background Color">
                    <div className="flex items-center gap-3">
                        <input type="color" name="announcementBarColor" value={settings.announcementBarColor || "#B665D2"} onChange={handleChange} className="h-10 w-14 rounded border border-brand-lilac/20 cursor-pointer" />
                        <input type="text" name="announcementBarColor" value={settings.announcementBarColor || "#B665D2"} onChange={handleChange} className="form-input flex-1 font-mono text-sm" placeholder="#B665D2" />
                    </div>
                </Field>
            </SettingsSection>

            {/* --- Social Links --- */}
            <SettingsSection title="Social Media" icon={Instagram}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SocialField label="Instagram" icon={Instagram} name="socialInstagram" value={settings.socialInstagram || ""} onChange={handleChange} placeholder="https://instagram.com/..." />
                    <SocialField label="Twitter / X" icon={Twitter} name="socialTwitter" value={settings.socialTwitter || ""} onChange={handleChange} placeholder="https://x.com/..." />
                    <SocialField label="TikTok" icon={Music2} name="socialTiktok" value={settings.socialTiktok || ""} onChange={handleChange} placeholder="https://tiktok.com/..." />
                    <SocialField label="Facebook" icon={Facebook} name="socialFacebook" value={settings.socialFacebook || ""} onChange={handleChange} placeholder="https://facebook.com/..." />
                </div>
            </SettingsSection>

            {/* --- Store Info --- */}
            <SettingsSection title="Store Information" icon={MapPin}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Phone Number" icon={Phone}>
                        <input type="tel" name="businessPhone" value={settings.businessPhone || ""} onChange={handleChange} className="form-input" placeholder="+234..." />
                    </Field>
                    <Field label="WhatsApp Number" icon={MessageCircle}>
                        <input type="tel" name="businessWhatsapp" value={settings.businessWhatsapp || ""} onChange={handleChange} className="form-input" placeholder="+234..." />
                    </Field>
                </div>
                <Field label="Business Address" icon={MapPin}>
                    <textarea
                        name="businessAddress"
                        value={settings.businessAddress || ""}
                        onChange={handleChange}
                        className="form-input min-h-[80px] resize-y"
                        placeholder="123 Main Street, Lagos, Nigeria"
                    />
                </Field>
            </SettingsSection>

            {/* --- Footer --- */}
            <SettingsSection title="Footer" icon={Type}>
                <Field label="Footer Tagline">
                    <input type="text" name="footerTagline" value={settings.footerTagline || ""} onChange={handleChange} className="form-input" placeholder="Your tagline here..." />
                </Field>
            </SettingsSection>

            {/* Save */}
            <div className="flex items-center gap-4 pt-4 border-t border-brand-lilac/10">
                <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save All Settings"}
                </Button>
            </div>

            {/* Media Picker Modal */}
            <MediaPicker
                open={mediaPickerOpen}
                onClose={() => setMediaPickerOpen(false)}
                onSelect={handleMediaSelect}
                multiple={displayConfig.mode === "slideshow"}
                typeFilter={mediaPickerFilter}
                selectedIds={displayConfig.mediaIds}
            />

            <style jsx>{`
                .form-input {
                    width: 100%;
                    border: 1px solid rgba(200, 162, 200, 0.2);
                    border-radius: 0.5rem;
                    padding: 0.5rem 0.75rem;
                    font-size: 0.875rem;
                    transition: border-color 0.15s, box-shadow 0.15s;
                    background: white;
                }
                .form-input:focus {
                    outline: none;
                    border-color: rgba(182, 101, 210, 0.4);
                    box-shadow: 0 0 0 3px rgba(182, 101, 210, 0.1);
                }
                .upload-btn {
                    cursor: pointer;
                    background: #f3f4f6;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                    transition: background-color 0.15s;
                    display: inline-flex;
                    align-items: center;
                    white-space: nowrap;
                }
                .upload-btn:hover {
                    background: #e5e7eb;
                }
            `}</style>
        </form>
    );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HERO PREVIEW — accurate scaled-down live preview
   Mirrors the actual Hero component layout exactly
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function HeroPreview({
    settings,
    resolvedMedia,
    onClose,
}: {
    settings: Partial<SiteSettings>;
    resolvedMedia: Media[];
    onClose: () => void;
}) {
    const heading = settings.heroHeading || "Smart. Comfortable. Intentional.";
    const headingWords = heading.split(" ");
    const subheading = settings.heroSubheading || "Thoughtfully curated beauty products, accessories, home essentials, gadgets, and lifestyle finds — all in one place.";
    const eyebrow = settings.heroEyebrow || "CURATED FOR EVERYDAY LIVING";
    const ctaText = settings.heroCtaText || "Shop Now";
    const secondaryCtaText = settings.heroCtaSecondaryText || "Our Story";
    const trustBadges = settings.heroTrustBadges?.length
        ? settings.heroTrustBadges
        : ["QUALITY GUARANTEED", "FAST DELIVERY", "CURATED SELECTION"];

    const previewImages = resolvedMedia.length > 0
        ? resolvedMedia.map((m) => m.url)
        : settings.heroImage ? [settings.heroImage] : [];
    const [previewSlide, setPreviewSlide] = useState(0);

    // Cycle preview slides
    useEffect(() => {
        if (previewImages.length <= 1) return;
        const timer = setInterval(() => {
            setPreviewSlide((prev) => (prev + 1) % previewImages.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [previewImages.length]);

    return (
        <div className="mb-6 rounded-xl border border-brand-purple/15 overflow-hidden bg-white shadow-xl shadow-brand-purple/5">
            {/* Preview chrome — fake browser bar */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                </div>
                <div className="flex-1 flex justify-center">
                    <span className="text-[9px] text-brand-dark/30 bg-gray-100 rounded-md px-8 py-1 font-mono">
                        yoursite.com
                    </span>
                </div>
                <button type="button" onClick={onClose} className="text-brand-dark/30 hover:text-brand-dark transition-colors cursor-pointer">
                    <X size={14} />
                </button>
            </div>

            {/* Fake header bar */}
            <div className="flex items-center justify-between px-5 py-2 border-b border-gray-50">
                <span className="font-serif text-[10px] font-bold tracking-widest text-brand-dark">
                    {settings.siteName || "XELLÉ"}
                </span>
                <div className="flex gap-3">
                    {["Home", "Shop", "About"].map((l) => (
                        <span key={l} className="text-[7px] text-brand-dark/30 tracking-wide">{l}</span>
                    ))}
                </div>
            </div>

            {/* Hero preview — split layout */}
            <div className="grid grid-cols-2 min-h-[340px]">
                {/* Left side — text */}
                <div className="flex items-center px-5 sm:px-7 py-8">
                    <div className="w-full max-w-[280px]">
                        {/* Eyebrow */}
                        <div className="flex items-center gap-2 mb-5">
                            <span className="w-7 h-[1.5px] bg-brand-purple" />
                            <span className="text-[7px] uppercase tracking-[0.25em] text-brand-dark/35 font-medium">
                                {eyebrow}
                            </span>
                        </div>

                        {/* Heading */}
                        <h3 className="font-serif text-[17px] sm:text-xl font-bold text-brand-dark leading-[1.1] mb-3">
                            {headingWords.map((word, i) => (
                                <span key={i} className={i === headingWords.length - 1 ? "text-brand-purple italic" : ""}>
                                    {word}{" "}
                                </span>
                            ))}
                        </h3>

                        {/* Subheading */}
                        <p className="text-[8px] sm:text-[9px] text-brand-dark/35 leading-relaxed mb-5 line-clamp-3">
                            {subheading}
                        </p>

                        {/* CTAs */}
                        <div className="flex items-center gap-3 mb-5">
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-dark text-white text-[8px] font-semibold rounded-full">
                                {ctaText}
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                            </span>
                            <span className="text-[7px] uppercase tracking-[0.15em] font-semibold text-brand-dark/40 relative">
                                {secondaryCtaText}
                            </span>
                        </div>

                        {/* Trust badges */}
                        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                            {trustBadges.map((badge, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                    <span className="w-[3px] h-[3px] rounded-full bg-brand-purple/25" />
                                    <span className="text-[6px] uppercase tracking-[0.18em] text-brand-dark/20 font-medium">
                                        {badge}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right side — image */}
                <div className="relative bg-gray-100 overflow-hidden">
                    {previewImages.length > 0 ? (
                        <>
                            <img
                                src={previewImages[previewSlide] || previewImages[0]}
                                alt="Preview"
                                className="w-full h-full object-cover transition-opacity duration-500"
                            />
                            {/* Fake nav arrows */}
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black/15 flex items-center justify-center">
                                <ChevronLeft size={8} className="text-white/70" />
                            </div>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black/15 flex items-center justify-center">
                                <ChevronRight size={8} className="text-white/70" />
                            </div>
                            {/* Fake product overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent pt-8 pb-3 px-3">
                                <p className="font-serif text-[10px] font-semibold text-white">Product Name</p>
                                <p className="text-[8px] text-white/60">N7,000.00</p>
                            </div>
                            {/* Dots */}
                            {previewImages.length > 1 && (
                                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                                    {previewImages.map((_, i) => (
                                        <span key={i} className={`rounded-full transition-all ${i === previewSlide ? "w-3 h-1 bg-white" : "w-1 h-1 bg-white/40"}`} />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-lilac/15 via-white to-brand-purple/8">
                            <div className="text-center">
                                <ImageIcon size={24} className="text-brand-purple/15 mx-auto mb-1" />
                                <span className="text-[7px] text-brand-dark/20 font-medium">No media selected</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Preview label */}
            <div className="px-4 py-2 bg-brand-purple/[0.03] border-t border-brand-purple/8 flex items-center justify-between">
                <span className="text-[10px] text-brand-purple/60 font-medium tracking-wide">
                    LIVE PREVIEW — updates as you edit above
                </span>
                <span className="text-[9px] text-brand-dark/20">Desktop layout</span>
            </div>
        </div>
    );
}

// --- Layout Components ---

function SettingsSection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-brand-lilac/15">
                <Icon size={18} className="text-brand-purple" />
                <h2 className="text-lg font-serif text-brand-dark">{title}</h2>
            </div>
            <div className="space-y-4 pl-0.5">
                {children}
            </div>
        </div>
    );
}

function Field({ label, icon: Icon, children }: { label: string; icon?: React.ElementType; children: React.ReactNode }) {
    return (
        <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-brand-dark/70 mb-1.5">
                {Icon && <Icon size={14} className="text-brand-dark/40" />}
                {label}
            </label>
            {children}
        </div>
    );
}

function SocialField({ label, icon: Icon, name, value, onChange, placeholder }: {
    label: string; icon: React.ElementType; name: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string;
}) {
    return (
        <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-brand-dark/70 mb-1.5">
                <Icon size={14} className="text-brand-dark/40" />
                {label}
            </label>
            <input type="url" name={name} value={value} onChange={onChange} className="w-full border border-brand-lilac/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/40 bg-white transition-all" placeholder={placeholder} />
        </div>
    );
}
