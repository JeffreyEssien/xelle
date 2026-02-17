"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/cartStore";
import { formatCurrency } from "@/lib/formatCurrency";
import { SHIPPING_RATE, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import Button from "@/components/ui/Button";

export default function CartDrawer() {
    const { items, isOpen, close, subtotal } = useCartStore();
    const sub = subtotal();
    const shipping = sub >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATE;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <Overlay onClick={close} />
                    <motion.aside
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "tween", duration: 0.3 }}
                        className="fixed inset-y-0 right-0 z-[60] w-full max-w-md bg-white shadow-2xl flex flex-col"
                    >
                        <DrawerHeader onClose={close} count={items.length} />
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {items.length === 0 ? <EmptyState /> : <CartItems />}
                        </div>
                        {items.length > 0 && <DrawerFooter subtotal={sub} shipping={shipping} onClose={close} />}
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}

function Overlay({ onClick }: { onClick: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClick}
            className="fixed inset-0 z-[55] bg-black/30 backdrop-blur-sm"
        />
    );
}

function DrawerHeader({ onClose, count }: { onClose: () => void; count: number }) {
    return (
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-lilac/20">
            <h2 className="font-serif text-lg text-brand-dark">Cart ({count})</h2>
            <button type="button" onClick={onClose} className="text-brand-dark/50 hover:text-brand-dark text-xl cursor-pointer">
                ✕
            </button>
        </div>
    );
}

function EmptyState() {
    return <p className="text-center text-brand-dark/40 py-12">Your cart is empty.</p>;
}

function CartItems() {
    const { items, updateQuantity, removeItem } = useCartStore();
    return (
        <ul className="divide-y divide-brand-lilac/10">
            {items.map((item) => (
                <li key={`${item.product.id}-${item.variant?.name || "default"}`} className="py-4 flex gap-4">
                    <div className="relative h-20 w-16 rounded-sm overflow-hidden bg-neutral-100 shrink-0">
                        <Image src={item.variant?.image || item.product.images[0]} alt={item.product.name} fill className="object-cover" sizes="64px" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-brand-dark truncate">{item.product.name}</p>
                        {item.variant && <p className="text-xs text-brand-dark/60">Variant: {item.variant.name}</p>}
                        <p className="text-sm text-brand-dark/60">{formatCurrency(item.variant?.price || item.product.price)}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <button type="button" onClick={() => updateQuantity(item.product.id, item.variant?.name, item.quantity - 1)} className="w-6 h-6 rounded border border-brand-lilac/30 text-xs cursor-pointer">−</button>
                            <span className="text-sm w-6 text-center">{item.quantity}</span>
                            <button type="button" onClick={() => updateQuantity(item.product.id, item.variant?.name, item.quantity + 1)} className="w-6 h-6 rounded border border-brand-lilac/30 text-xs cursor-pointer">+</button>
                            <button type="button" onClick={() => removeItem(item.product.id, item.variant?.name)} className="ml-auto text-xs text-red-500 hover:underline cursor-pointer">Remove</button>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
}

function DrawerFooter({ subtotal, shipping, onClose }: { subtotal: number; shipping: number; onClose: () => void }) {
    return (
        <div className="border-t border-brand-lilac/20 px-6 py-4 space-y-3">
            <div className="flex justify-between text-sm text-brand-dark/70">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-brand-dark/70">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
            </div>
            <div className="flex justify-between font-medium text-brand-dark pt-2 border-t border-brand-lilac/10">
                <span>Total</span>
                <span>{formatCurrency(subtotal + shipping)}</span>
            </div>
            <Link href="/checkout" onClick={onClose}>
                <Button className="w-full mt-2">Proceed to Checkout</Button>
            </Link>
        </div>
    );
}
