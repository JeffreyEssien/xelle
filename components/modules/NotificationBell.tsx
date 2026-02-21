"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, ShoppingBag, CreditCard, Package, AlertTriangle, Check } from "lucide-react";
import { useNotificationStore, type AdminNotification } from "@/lib/notificationStore";
import { formatCurrency } from "@/lib/formatCurrency";

const POLL_INTERVAL = 30000; // 30 seconds

const typeConfig: Record<AdminNotification["type"], { icon: typeof Bell; color: string; bg: string }> = {
    new_order: { icon: ShoppingBag, color: "text-purple-600", bg: "bg-purple-50" },
    payment_submitted: { icon: CreditCard, color: "text-amber-600", bg: "bg-amber-50" },
    payment_confirmed: { icon: Check, color: "text-emerald-600", bg: "bg-emerald-50" },
    low_stock: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
    order_status: { icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
};

export default function NotificationBell() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const { notifications, unreadCount, addNotification, markAllRead, markRead } = useNotificationStore();
    const seenOrderIds = useRef<Set<string>>(new Set());
    const lastPoll = useRef<string>(new Date().toISOString());
    const initialLoad = useRef(true);

    // Only render on admin pages
    if (!pathname?.startsWith("/admin")) return null;

    // Close panel when clicking outside
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Poll for new orders
    const pollNotifications = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/notifications?since=${encodeURIComponent(lastPoll.current)}`);
            if (!res.ok) return;

            const data = await res.json();

            // Process new orders
            for (const order of data.recentOrders || []) {
                if (seenOrderIds.current.has(order.id)) continue;
                seenOrderIds.current.add(order.id);

                // Skip initial load orders — we only want new ones
                if (initialLoad.current) continue;

                addNotification({
                    type: "new_order",
                    title: "New Order!",
                    message: `${order.customerName} placed an order for ${formatCurrency(order.total)}`,
                    orderId: order.id,
                    timestamp: order.createdAt,
                });

                // Play notification sound
                playNotificationSound();
            }

            // Check for pending payments that need attention
            for (const payment of data.pendingPayments || []) {
                if (seenOrderIds.current.has(`payment-${payment.id}`)) continue;
                seenOrderIds.current.add(`payment-${payment.id}`);

                if (initialLoad.current) continue;

                addNotification({
                    type: "payment_submitted",
                    title: "Payment Awaiting Approval",
                    message: `${payment.customerName} submitted payment of ${formatCurrency(payment.total)}${payment.senderName ? ` from ${payment.senderName}` : ""}`,
                    orderId: payment.id,
                    timestamp: new Date().toISOString(),
                });

                playNotificationSound();
            }

            initialLoad.current = false;
            lastPoll.current = new Date().toISOString();
        } catch (err) {
            console.warn("Notification poll failed:", err);
        }
    }, [addNotification]);

    useEffect(() => {
        // Initial poll
        pollNotifications();

        // Set up interval
        const interval = setInterval(pollNotifications, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [pollNotifications]);

    return (
        <div ref={panelRef} className="relative">
            {/* Bell Button */}
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen && unreadCount > 0) markAllRead();
                }}
                className="relative p-2 rounded-xl hover:bg-brand-lilac/10 transition-colors cursor-pointer"
                aria-label="Notifications"
            >
                <Bell size={20} className="text-brand-dark/60" />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm"
                    >
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </motion.span>
                )}
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 top-full mt-2 w-[380px] max-h-[500px] bg-white rounded-2xl shadow-2xl border border-brand-lilac/15 overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-brand-lilac/10 flex items-center justify-between bg-brand-lilac/[0.02]">
                            <div>
                                <h3 className="text-sm font-semibold text-brand-dark">Notifications</h3>
                                <p className="text-[10px] text-brand-dark/40 mt-0.5">
                                    {notifications.length === 0
                                        ? "No notifications yet"
                                        : `${notifications.length} notification${notifications.length !== 1 ? "s" : ""}`}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-brand-lilac/10 rounded-lg transition-colors cursor-pointer"
                            >
                                <X size={14} className="text-brand-dark/30" />
                            </button>
                        </div>

                        {/* Notification List */}
                        <div className="overflow-y-auto max-h-[400px]">
                            {notifications.length === 0 ? (
                                <div className="py-12 text-center">
                                    <Bell size={32} className="mx-auto text-brand-dark/10 mb-3" />
                                    <p className="text-sm text-brand-dark/30">All quiet for now</p>
                                    <p className="text-[10px] text-brand-dark/20 mt-1">New orders will appear here</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <NotificationItem
                                        key={notif.id}
                                        notification={notif}
                                        onRead={() => markRead(notif.id)}
                                    />
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function NotificationItem({ notification, onRead }: { notification: AdminNotification; onRead: () => void }) {
    const config = typeConfig[notification.type];
    const Icon = config.icon;
    const timeAgo = getTimeAgo(notification.timestamp);

    return (
        <div
            className={`px-5 py-3.5 border-b border-brand-lilac/5 hover:bg-brand-lilac/[0.03] transition-colors cursor-pointer ${!notification.read ? "bg-brand-lilac/[0.05]" : ""
                }`}
            onClick={onRead}
        >
            <div className="flex gap-3">
                <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon size={16} className={config.color} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${!notification.read ? "font-semibold text-brand-dark" : "text-brand-dark/70"}`}>
                            {notification.title}
                        </p>
                        {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-brand-purple flex-shrink-0 mt-1.5" />
                        )}
                    </div>
                    <p className="text-xs text-brand-dark/50 mt-0.5 leading-relaxed truncate">
                        {notification.message}
                    </p>
                    <p className="text-[10px] text-brand-dark/25 mt-1">{timeAgo}</p>
                </div>
            </div>
        </div>
    );
}

function getTimeAgo(timestamp: string): string {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diff = now - then;

    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function playNotificationSound() {
    try {
        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
    } catch {
        // Audio not available, skip
    }
}
