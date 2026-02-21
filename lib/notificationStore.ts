import { create } from "zustand";

export interface AdminNotification {
    id: string;
    type: "new_order" | "payment_submitted" | "payment_confirmed" | "low_stock" | "order_status";
    title: string;
    message: string;
    orderId?: string;
    timestamp: string;
    read: boolean;
}

interface NotificationStore {
    notifications: AdminNotification[];
    unreadCount: number;
    lastChecked: string | null;
    addNotification: (n: Omit<AdminNotification, "id" | "read">) => void;
    markAllRead: () => void;
    markRead: (id: string) => void;
    setNotifications: (notifications: AdminNotification[]) => void;
    clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    lastChecked: null,

    addNotification: (n) => {
        const notification: AdminNotification = {
            ...n,
            id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            read: false,
        };
        set((state) => ({
            notifications: [notification, ...state.notifications].slice(0, 50), // Keep max 50
            unreadCount: state.unreadCount + 1,
        }));
    },

    markAllRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
            unreadCount: 0,
            lastChecked: new Date().toISOString(),
        })),

    markRead: (id) =>
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - (state.notifications.find((n) => n.id === id && !n.read) ? 1 : 0)),
        })),

    setNotifications: (notifications) =>
        set({
            notifications,
            unreadCount: notifications.filter((n) => !n.read).length,
        }),

    clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
