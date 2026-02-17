"use client";

import { useState, useEffect } from "react";
import { getSiteSettings, updateSiteSettings } from "@/lib/queries";
import { uploadProductImage } from "@/lib/uploadImage";
import type { SiteSettings } from "@/types";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { toast } from "sonner";

export default function SiteSettingsForm() {
    const [settings, setSettings] = useState<Partial<SiteSettings>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");
        try {
            await updateSiteSettings(settings);
            // setMessage("Settings saved successfully.");
            toast.success("Settings saved successfully.");
        } catch (error) {
            // setMessage("Failed to save settings.");
            toast.error("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    // Simple image upload handler (reuses existing upload logic concept)
    // Simplified image upload handler
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

    if (loading) return <div>Loading...</div>;

    return (
        <form onSubmit={handleSave} className="space-y-8 max-w-2xl">
            <div className="space-y-4">
                <h2 className="text-lg font-serif text-brand-dark border-b border-brand-lilac/20 pb-2">General</h2>

                <div>
                    <label className="block text-sm font-medium text-brand-dark mb-1">Site Name</label>
                    <input
                        type="text"
                        name="siteName"
                        value={settings.siteName || ""}
                        onChange={handleChange}
                        className="w-full border border-brand-lilac/20 rounded p-2 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-brand-dark mb-1">Logo URL</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            name="logoUrl"
                            value={settings.logoUrl || ""}
                            onChange={handleChange}
                            className="flex-1 border border-brand-lilac/20 rounded p-2 text-sm"
                            placeholder="https://..."
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "logoUrl")}
                            className="hidden"
                            id="logo-upload"
                        />
                        <label htmlFor="logo-upload" className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-2 px-4 rounded inline-flex items-center">
                            Upload
                        </label>
                    </div>
                    {settings.logoUrl && (
                        <div className="mt-2 relative h-12 w-auto">
                            <img src={settings.logoUrl} alt="Logo Preview" className="h-full object-contain" />
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-serif text-brand-dark border-b border-brand-lilac/20 pb-2">Homepage Hero</h2>

                <div>
                    <label className="block text-sm font-medium text-brand-dark mb-1">Heading</label>
                    <input
                        type="text"
                        name="heroHeading"
                        value={settings.heroHeading || ""}
                        onChange={handleChange}
                        className="w-full border border-brand-lilac/20 rounded p-2 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-brand-dark mb-1">Subheading</label>
                    <input
                        type="text"
                        name="heroSubheading"
                        value={settings.heroSubheading || ""}
                        onChange={handleChange}
                        className="w-full border border-brand-lilac/20 rounded p-2 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-brand-dark mb-1">Hero Image URL</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            name="heroImage"
                            value={settings.heroImage || ""}
                            onChange={handleChange}
                            className="flex-1 border border-brand-lilac/20 rounded p-2 text-sm"
                            placeholder="https://..."
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "heroImage")}
                            className="hidden"
                            id="hero-upload"
                        />
                        <label htmlFor="hero-upload" className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-2 px-4 rounded inline-flex items-center">
                            Upload
                        </label>
                    </div>
                    {settings.heroImage && (
                        <div className="mt-2 relative h-32 w-full bg-neutral-100 rounded overflow-hidden">
                            <img src={settings.heroImage} alt="Hero Preview" className="w-full h-full object-cover opacity-50" />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-brand-dark mb-1">CTA Text</label>
                        <input
                            type="text"
                            name="heroCtaText"
                            value={settings.heroCtaText || ""}
                            onChange={handleChange}
                            className="w-full border border-brand-lilac/20 rounded p-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-dark mb-1">CTA Link</label>
                        <input
                            type="text"
                            name="heroCtaLink"
                            value={settings.heroCtaLink || ""}
                            onChange={handleChange}
                            className="w-full border border-brand-lilac/20 rounded p-2 text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Settings"}
                </Button>
                {/* Message removed in favor of toast */}
            </div>
        </form>
    );
}
