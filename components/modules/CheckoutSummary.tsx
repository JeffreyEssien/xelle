"use client";

import Image from "next/image";
import { useCartStore } from "@/lib/cartStore";
import { formatCurrency } from "@/lib/formatCurrency";
import { SHIPPING_RATE, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

export default function CheckoutSummary() {
    const { items, subtotal } = useCartStore();
    const sub = subtotal();
    const shipping = sub >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATE;

    return (
        <div className="bg-brand-lilac/5 rounded-lg p-6 sticky top-24">
            <h2 className="font-serif text-lg text-brand-dark mb-6">Order Summary</h2>
            <ul className="space-y-4 mb-6">
                {items.map((item) => (
                    <li key={item.product.id} className="flex gap-3">
                        <div className="relative h-16 w-14 rounded-sm overflow-hidden bg-neutral-100 shrink-0">
                            <Image src={item.product.images[0]} alt={item.product.name} fill sizes="56px" className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-brand-dark font-medium truncate">{item.product.name}</p>
                            <p className="text-xs text-brand-dark/50">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm text-brand-dark font-medium shrink-0">
                            {formatCurrency(item.product.price * item.quantity)}
                        </p>
                    </li>
                ))}
            </ul>
            <div className="border-t border-brand-lilac/20 pt-4 space-y-2">
                <Row label="Subtotal" value={formatCurrency(sub)} />
                <Row label="Shipping" value={shipping === 0 ? "Free" : formatCurrency(shipping)} />
                {shipping > 0 && (
                    <p className="text-xs text-brand-dark/40">
                        Free shipping on orders over {formatCurrency(FREE_SHIPPING_THRESHOLD)}
                    </p>
                )}
            </div>
            <div className="border-t border-brand-lilac/20 mt-4 pt-4">
                <div className="flex justify-between font-medium text-brand-dark text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(sub + shipping)}</span>
                </div>
            </div>
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between text-sm text-brand-dark/70">
            <span>{label}</span>
            <span>{value}</span>
        </div>
    );
}
