"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { createCoupon } from "@/lib/queries";

export default function CouponForm({ onSuccess }: { onSuccess: () => void }) {
    const [code, setCode] = useState("");
    const [discount, setDiscount] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createCoupon({
                code,
                discountPercent: parseInt(discount),
                isActive: true,
            });
            setCode("");
            setDiscount("");
            onSuccess();
        } catch (error) {
            alert("Failed to create coupon. Code might already exist.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-4 items-end bg-white p-4 rounded-lg border border-brand-lilac/20">
            <div>
                <label className="block text-xs text-brand-dark/60 mb-1">Coupon Code</label>
                <input
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SUMMER20"
                    className="border border-brand-lilac/20 rounded px-3 py-2 text-sm uppercase w-48"
                />
            </div>
            <div>
                <label className="block text-xs text-brand-dark/60 mb-1">Discount %</label>
                <input
                    required
                    type="number"
                    min="1"
                    max="100"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="20"
                    className="border border-brand-lilac/20 rounded px-3 py-2 text-sm w-24"
                />
            </div>
            <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Coupon"}
            </Button>
        </form>
    );
}
