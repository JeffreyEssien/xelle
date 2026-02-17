"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cartStore";
import Button from "@/components/ui/Button";

export default function CouponInput() {
    const { applyCoupon, removeCoupon, discount, couponCode } = useCartStore();
    const [code, setCode] = useState("");
    const [error, setError] = useState("");

    const handleApply = async () => {
        if (!code) return;
        const success = await applyCoupon(code);
        if (success) {
            setError("");
            setCode("");
        } else {
            setError("Invalid coupon code");
        }
    };

    if (discount > 0) {
        return (
            <div className="bg-green-50 border border-green-200 rounded p-3 text-sm flex justify-between items-center text-green-700">
                <span>
                    Code <strong>{couponCode}</strong> applied ({discount}% off)
                </span>
                <button
                    onClick={removeCoupon}
                    className="text-xs underline hover:no-underline text-green-800"
                >
                    Remove
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Discount code"
                    className="flex-1 bg-white border border-brand-lilac/30 rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-purple uppercase"
                />
                <Button size="sm" variant="outline" onClick={handleApply}>
                    Apply
                </Button>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
