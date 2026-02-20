"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useCartStore } from "@/lib/cartStore";
import { formatCurrency } from "@/lib/formatCurrency";
import { SHIPPING_RATE, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import CouponInput from "@/components/modules/CouponInput";
import { Package } from "lucide-react";

export default function CheckoutSummary() {
    const { items, subtotal, discount } = useCartStore();
    const sub = subtotal();
    const shipping = sub >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATE;
    const discountAmount = sub * (discount / 100);
    const total = Math.max(0, sub - discountAmount + shipping);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card p-6 sticky top-24"
        >
            <div className="flex items-center gap-2 mb-6">
                <Package size={16} className="text-brand-purple" />
                <h2 className="font-serif text-lg text-brand-dark">Order Summary</h2>
            </div>

            <ul className="space-y-4 mb-6">
                {items.map((item, i) => (
                    <motion.li
                        key={item.product.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        className="flex gap-3"
                    >
                        <div className="relative h-14 w-12 rounded-lg overflow-hidden bg-neutral-50 shrink-0 border border-brand-lilac/10">
                            <Image src={item.product.images[0]} alt={item.product.name} fill sizes="48px" className="object-cover" />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-dark text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                                {item.quantity}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-brand-dark font-medium truncate">{item.product.name}</p>
                            {item.variant && <p className="text-[10px] text-brand-dark/35">{item.variant.name}</p>}
                        </div>
                        <p className="text-sm text-brand-dark font-medium shrink-0">
                            {formatCurrency((item.variant?.price || item.product.price) * item.quantity)}
                        </p>
                    </motion.li>
                ))}
            </ul>

            <div className="mb-5">
                <CouponInput />
            </div>

            <div className="border-t border-brand-lilac/10 pt-4 space-y-2.5">
                <Row label="Subtotal" value={formatCurrency(sub)} />
                {discount > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-emerald-600">Discount</span>
                        <span className="text-emerald-600 font-medium">-{formatCurrency(discountAmount)}</span>
                    </div>
                )}
                <Row label="Shipping" value={shipping === 0 ? "Free" : formatCurrency(shipping)} />
                {shipping > 0 && (
                    <p className="text-[10px] text-brand-dark/30">
                        Free shipping on orders over {formatCurrency(FREE_SHIPPING_THRESHOLD)}
                    </p>
                )}
            </div>

            <div className="border-t border-brand-lilac/10 mt-4 pt-4">
                <div className="flex justify-between font-semibold text-brand-dark">
                    <span>Total</span>
                    <span className="text-xl">{formatCurrency(total)}</span>
                </div>
            </div>
        </motion.div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between text-sm text-brand-dark/50">
            <span>{label}</span>
            <span className="font-medium text-brand-dark/70">{value}</span>
        </div>
    );
}
