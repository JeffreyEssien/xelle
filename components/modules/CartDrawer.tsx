"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/cartStore";
import { formatCurrency } from "@/lib/formatCurrency";
import { SHIPPING_RATE, FREE_SHIPPING_THRESHOLD as DEFAULT_FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import Button from "@/components/ui/Button";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { getSiteSettings } from "@/lib/queries";

export default function CartDrawer() {
    const { items, isOpen, close, subtotal } = useCartStore();
    const [freeShippingSetting, setFreeShippingSetting] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen) {
            getSiteSettings().then(settings => setFreeShippingSetting(settings?.freeShippingThreshold ?? null)).catch(() => { });
        }
    }, [isOpen]);

    const sub = subtotal();
    const freeShippingThreshold = freeShippingSetting !== null ? freeShippingSetting : DEFAULT_FREE_SHIPPING_THRESHOLD;
    const shipping = sub >= freeShippingThreshold ? 0 : SHIPPING_RATE;
    const freeShippingRemaining = freeShippingThreshold - sub;
    const shippingProgress = Math.min((sub / freeShippingThreshold) * 100, 100);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        onClick={close}
                        className="fixed inset-0 z-[55] bg-black/30 backdrop-blur-sm"
                    />
                    <motion.aside
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 280 }}
                        className="fixed inset-y-0 right-0 z-[60] w-full max-w-md bg-white shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-lilac/10">
                            <div className="flex items-center gap-3">
                                <ShoppingBag size={18} className="text-brand-purple" />
                                <h2 className="font-serif text-lg text-brand-dark">Cart</h2>
                                <span className="bg-brand-purple/10 text-brand-purple text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                    {items.length}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={close}
                                className="p-2 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
                                aria-label="Close cart"
                            >
                                <X size={18} className="text-brand-dark/50" />
                            </button>
                        </div>

                        {/* Free shipping progress */}
                        {items.length > 0 && (
                            <div className="px-6 py-3 bg-gradient-to-r from-brand-lilac/[0.03] to-brand-purple/[0.03] border-b border-brand-lilac/8">
                                {freeShippingRemaining > 0 ? (
                                    <>
                                        <p className="text-xs text-brand-dark/50 mb-2">
                                            Add <span className="font-semibold text-brand-purple">{formatCurrency(freeShippingRemaining)}</span> more for free shipping
                                        </p>
                                        <div className="h-1 bg-brand-lilac/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${shippingProgress}%` }}
                                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                                className="h-full bg-gradient-to-r from-brand-purple to-brand-lilac rounded-full"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-xs text-emerald-600 font-medium flex items-center justify-center gap-1.5">
                                        <Sparkles size={12} />
                                        You qualify for free shipping!
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                    <div className="p-5 bg-neutral-50 rounded-full mb-5">
                                        <ShoppingBag size={28} className="text-brand-dark/15" />
                                    </div>
                                    <p className="text-brand-dark/40 mb-1 font-medium">Your cart is empty</p>
                                    <p className="text-xs text-brand-dark/25 mb-6">Browse our collection and add items</p>
                                    <Link href="/shop" onClick={close}>
                                        <Button variant="outline" size="sm">
                                            <span className="flex items-center gap-1.5">Start Shopping <ArrowRight size={14} /></span>
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <CartItems />
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="border-t border-brand-lilac/10 px-6 py-5 space-y-3 bg-neutral-50/30">
                                <div className="flex justify-between text-sm text-brand-dark/50">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-brand-dark">{formatCurrency(sub)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-brand-dark/50">
                                    <span>Shipping</span>
                                    <span className={shipping === 0 ? "text-emerald-600 font-medium" : "font-medium text-brand-dark"}>
                                        {shipping === 0 ? "Free" : formatCurrency(shipping)}
                                    </span>
                                </div>
                                <div className="flex justify-between font-semibold text-brand-dark pt-3 border-t border-brand-lilac/8">
                                    <span>Total</span>
                                    <span className="text-lg">{formatCurrency(sub + shipping)}</span>
                                </div>
                                <Link href="/checkout" onClick={close} className="block pt-1">
                                    <Button className="w-full" size="lg">
                                        <span className="flex items-center justify-center gap-2">
                                            Checkout <ArrowRight size={16} />
                                        </span>
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}

function CartItems() {
    const { items, updateQuantity, removeItem } = useCartStore();
    return (
        <ul className="space-y-3">
            <AnimatePresence initial={false}>
                {items.map((item) => (
                    <motion.li
                        key={`${item.product.id}-${item.variant?.name || "default"}`}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, x: 60, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="flex gap-4 p-3 rounded-xl bg-white border border-brand-lilac/8 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="relative h-20 w-16 rounded-lg overflow-hidden bg-neutral-50 shrink-0">
                            <Image src={item.variant?.image || item.product.images[0]} alt={item.product.name} fill className="object-cover" sizes="64px" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                                <p className="text-sm font-medium text-brand-dark truncate">{item.product.name}</p>
                                {item.variant && <p className="text-[10px] text-brand-dark/35 mt-0.5">{item.variant.name}</p>}
                                <p className="text-sm font-semibold text-brand-dark mt-1">{formatCurrency((item.variant?.price || item.product.price) * item.quantity)}</p>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center bg-neutral-50 rounded-full overflow-hidden border border-brand-dark/5">
                                    <button type="button" onClick={() => updateQuantity(item.product.id, item.variant?.name, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer">
                                        <Minus size={11} />
                                    </button>
                                    <span className="text-xs font-semibold w-7 text-center">{item.quantity}</span>
                                    <button type="button" onClick={() => updateQuantity(item.product.id, item.variant?.name, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer">
                                        <Plus size={11} />
                                    </button>
                                </div>
                                <button type="button" onClick={() => removeItem(item.product.id, item.variant?.name)} className="p-1.5 hover:bg-red-50 rounded-full transition-colors cursor-pointer group">
                                    <Trash2 size={13} className="text-brand-dark/20 group-hover:text-red-500 transition-colors" />
                                </button>
                            </div>
                        </div>
                    </motion.li>
                ))}
            </AnimatePresence>
        </ul>
    );
}
