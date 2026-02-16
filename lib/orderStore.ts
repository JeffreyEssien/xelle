"use client";

import { create } from "zustand";
import type { Order } from "@/types";

interface OrderStore {
    orders: Order[];
    addOrder: (order: Order) => void;
    updateStatus: (id: string, status: Order["status"]) => void;
    lastOrder: Order | null;
    setLastOrder: (order: Order | null) => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
    orders: [],
    lastOrder: null,

    addOrder: (order) =>
        set((state) => ({
            orders: [order, ...state.orders],
            lastOrder: order,
        })),

    updateStatus: (id, status) =>
        set((state) => ({
            orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        })),

    setLastOrder: (order) => set({ lastOrder: order }),
}));
