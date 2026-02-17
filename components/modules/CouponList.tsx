"use client";

import { Coupon } from "@/types";
import { deleteCoupon, toggleCouponStatus } from "@/lib/queries";
import { useRouter } from "next/navigation";
import Badge from "@/components/ui/Badge";
import { useState } from "react";

export default function CouponList({ initialCoupons }: { initialCoupons: Coupon[] }) {
    const router = useRouter();
    const [loadingIds, setLoadingIds] = useState<string[]>([]);

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this coupon?")) return;
        try {
            await deleteCoupon(id);
            router.refresh();
        } catch (e) {
            alert("Failed to delete");
        }
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        setLoadingIds(prev => [...prev, id]);
        try {
            await toggleCouponStatus(id, !currentStatus);
            router.refresh();
        } catch (e) {
            alert("Failed to update status");
        } finally {
            setLoadingIds(prev => prev.filter(x => x !== id));
        }
    };

    if (initialCoupons.length === 0) {
        return <div className="p-8 text-center text-brand-dark/40 text-sm">No coupons found. Create one above.</div>;
    }

    return (
        <table className="w-full text-sm">
            <thead>
                <tr className="border-b border-brand-lilac/20 bg-brand-lilac/5">
                    <th className="text-left px-4 py-3 font-medium text-brand-dark/60">Code</th>
                    <th className="text-left px-4 py-3 font-medium text-brand-dark/60">Discount</th>
                    <th className="text-left px-4 py-3 font-medium text-brand-dark/60">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-brand-dark/60">Usage</th>
                    <th className="text-right px-4 py-3 font-medium text-brand-dark/60">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-brand-lilac/10">
                {initialCoupons.map((c) => (
                    <tr key={c.id} className="hover:bg-brand-lilac/5 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium text-brand-dark">{c.code}</td>
                        <td className="px-4 py-3 text-brand-dark">{c.discountPercent}%</td>
                        <td className="px-4 py-3">
                            <button
                                onClick={() => handleToggle(c.id, c.isActive)}
                                disabled={loadingIds.includes(c.id)}
                                className="disabled:opacity-50"
                            >
                                <Badge variant={c.isActive ? "success" : "warning"}>
                                    {c.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </button>
                        </td>
                        <td className="px-4 py-3 text-brand-dark/60">{c.usageCount}</td>
                        <td className="px-4 py-3 text-right">
                            <button
                                onClick={() => handleDelete(c.id)}
                                className="text-red-500 hover:text-red-700 text-xs hover:underline"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
