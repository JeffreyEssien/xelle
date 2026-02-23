"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { getSiteSettings, updateSiteSettings } from "@/lib/queries";
import { toast } from "sonner";
import { TrendingDown } from "lucide-react";

export default function FreeShippingSettings() {
    const [threshold, setThreshold] = useState<number | "">("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await getSiteSettings();
            if (data?.freeShippingThreshold !== undefined) {
                setThreshold(data.freeShippingThreshold);
            }
        } catch (error) {
            console.error("Failed to load settings", error);
            toast.error("Failed to load shipping threshold");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateSiteSettings({
                freeShippingThreshold: threshold === "" ? undefined : threshold
            });
            toast.success("Free shipping threshold saved.");
        } catch {
            toast.error("Failed to save shipping threshold.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg border border-brand-lilac/20 flex animate-pulse items-center">
                <div className="h-4 bg-brand-lilac/20 rounded w-1/4"></div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-lg border border-brand-lilac/20 flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingDown size={14} className="text-brand-purple" />
                    <label className="text-sm font-medium text-brand-dark/80">
                        Free Shipping Threshold (NGN)
                    </label>
                </div>
                <input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full border border-brand-lilac/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/40 bg-neutral-50"
                    placeholder="e.g. 50000"
                    min="0"
                    step="1000"
                />
                <p className="text-xs text-brand-dark/45 mt-2">
                    Orders at or above this amount automatically receive free shipping. Leave blank to disable.
                </p>
            </div>
            <div className="pt-2 sm:pt-0">
                <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Config"}
                </Button>
            </div>
        </form>
    );
}
