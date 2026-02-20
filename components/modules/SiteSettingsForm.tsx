"use client";

import { useState, useEffect } from "react";
import { getSiteSettings, updateSiteSettings } from "@/lib/queries";
import { uploadProductImage } from "@/lib/uploadImage";
import type { SiteSettings } from "@/types";
import Button from "@/components/ui/Button";
import { toast } from "sonner";
import {
    Megaphone, Globe, Phone, MessageCircle, MapPin, Type,
    Instagram, Twitter, Music2, Facebook
} from "lucide-react";

export default function SiteSettingsForm() {
    const [settings, setSettings] = useState<Partial<SiteSettings>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "logoUrl" | "heroImage") => {
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
            </SettingsSection>

            {/* --- Homepage Hero --- */}
            <SettingsSection title="Homepage Hero" icon={Type}>
                <Field label="Heading">
                    <input type="text" name="heroHeading" value={settings.heroHeading || ""} onChange={handleChange} className="form-input" />
                </Field>
                <Field label="Subheading">
                    <input type="text" name="heroSubheading" value={settings.heroSubheading || ""} onChange={handleChange} className="form-input" />
                </Field>
                <Field label="Hero Image">
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
                    <Field label="CTA Text">
                        <input type="text" name="heroCtaText" value={settings.heroCtaText || ""} onChange={handleChange} className="form-input" />
                    </Field>
                    <Field label="CTA Link">
                        <input type="text" name="heroCtaLink" value={settings.heroCtaLink || ""} onChange={handleChange} className="form-input" />
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
                    <input type="text" name="announcementBarText" value={settings.announcementBarText || ""} onChange={handleChange} className="form-input" placeholder="Free shipping on orders over ₦50,000!" />
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
