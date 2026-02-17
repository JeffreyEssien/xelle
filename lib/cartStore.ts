"use client";

import { create } from "zustand";
import type { CartItem, Product } from "@/types";

interface CartStore {
    items: CartItem[];
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
    addItem: (product: Product, variant?: Product["variants"][0]) => void;
    removeItem: (productId: string, variantName?: string) => void;
    updateQuantity: (productId: string, variantName: string | undefined, quantity: number) => void;
    clearCart: () => void;
    totalItems: () => number;
    subtotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
    items: [],
    isOpen: false,

    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
    toggle: () => set((s) => ({ isOpen: !s.isOpen })),

    addItem: (product, variant) =>
        set((state) => {
            const existing = state.items.find((i) =>
                i.product.id === product.id &&
                ((!i.variant && !variant) || (i.variant?.name === variant?.name))
            );
            if (existing) {
                return {
                    items: state.items.map((i) =>
                        (i.product.id === product.id && ((!i.variant && !variant) || (i.variant?.name === variant?.name)))
                            ? { ...i, quantity: i.quantity + 1 }
                            : i
                    ),
                };
            }
            return { items: [...state.items, { product, variant, quantity: 1 }] };
        }),

    removeItem: (productId, variantName) =>
        set((state) => ({
            items: state.items.filter((i) =>
                !(i.product.id === productId && (i.variant?.name === variantName || (!i.variant && !variantName)))
            ),
        })),

    updateQuantity: (productId, variantName, quantity) =>
        set((state) => ({
            items:
                quantity <= 0
                    ? state.items.filter((i) =>
                        !(i.product.id === productId && (i.variant?.name === variantName || (!i.variant && !variantName)))
                    )
                    : state.items.map((i) =>
                        (i.product.id === productId && (i.variant?.name === variantName || (!i.variant && !variantName)))
                            ? { ...i, quantity }
                            : i
                    ),
        })),

    clearCart: () => set({ items: [] }),
    totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
    subtotal: () => get().items.reduce((s, i) => {
        const price = i.variant?.price || i.product.price;
        return s + price * i.quantity;
    }, 0),
}));
