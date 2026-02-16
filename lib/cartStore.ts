"use client";

import { create } from "zustand";
import type { CartItem, Product } from "@/types";

interface CartStore {
    items: CartItem[];
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
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

    addItem: (product) =>
        set((state) => {
            const existing = state.items.find((i) => i.product.id === product.id);
            if (existing) {
                return {
                    items: state.items.map((i) =>
                        i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
                    ),
                };
            }
            return { items: [...state.items, { product, quantity: 1 }] };
        }),

    removeItem: (productId) =>
        set((state) => ({
            items: state.items.filter((i) => i.product.id !== productId),
        })),

    updateQuantity: (productId, quantity) =>
        set((state) => ({
            items:
                quantity <= 0
                    ? state.items.filter((i) => i.product.id !== productId)
                    : state.items.map((i) =>
                        i.product.id === productId ? { ...i, quantity } : i,
                    ),
        })),

    clearCart: () => set({ items: [] }),
    totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
    subtotal: () => get().items.reduce((s, i) => s + i.product.price * i.quantity, 0),
}));
