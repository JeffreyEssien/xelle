import { describe, it, expect, beforeEach } from "vitest";
import { useNotificationStore, type AdminNotification } from "@/lib/notificationStore";

describe("notificationStore", () => {
    beforeEach(() => {
        useNotificationStore.setState({ notifications: [], unreadCount: 0, lastChecked: null });
    });

    it("adds a notification with auto-generated id", () => {
        useNotificationStore.getState().addNotification({
            type: "new_order",
            title: "New Order",
            message: "Order ORD-123 received",
            timestamp: new Date().toISOString(),
        });
        const { notifications, unreadCount } = useNotificationStore.getState();
        expect(notifications).toHaveLength(1);
        expect(notifications[0].id).toMatch(/^notif-/);
        expect(notifications[0].read).toBe(false);
        expect(unreadCount).toBe(1);
    });

    it("prepends new notifications", () => {
        const store = useNotificationStore.getState();
        store.addNotification({ type: "new_order", title: "First", message: "1", timestamp: "t1" });
        useNotificationStore.getState().addNotification({ type: "new_order", title: "Second", message: "2", timestamp: "t2" });
        expect(useNotificationStore.getState().notifications[0].title).toBe("Second");
    });

    it("caps at 50 notifications", () => {
        for (let i = 0; i < 55; i++) {
            useNotificationStore.getState().addNotification({
                type: "new_order",
                title: `N${i}`,
                message: `msg ${i}`,
                timestamp: new Date().toISOString(),
            });
        }
        expect(useNotificationStore.getState().notifications.length).toBeLessThanOrEqual(50);
    });

    it("marks all as read", () => {
        useNotificationStore.getState().addNotification({ type: "new_order", title: "A", message: "a", timestamp: "t" });
        useNotificationStore.getState().addNotification({ type: "new_order", title: "B", message: "b", timestamp: "t" });
        useNotificationStore.getState().markAllRead();
        const state = useNotificationStore.getState();
        expect(state.unreadCount).toBe(0);
        expect(state.notifications.every((n) => n.read)).toBe(true);
        expect(state.lastChecked).toBeTruthy();
    });

    it("marks a single notification as read", () => {
        useNotificationStore.getState().addNotification({ type: "new_order", title: "A", message: "a", timestamp: "t" });
        useNotificationStore.getState().addNotification({ type: "new_order", title: "B", message: "b", timestamp: "t" });
        const id = useNotificationStore.getState().notifications[0].id;
        useNotificationStore.getState().markRead(id);
        expect(useNotificationStore.getState().unreadCount).toBe(1);
    });

    it("does not double-decrement unread count", () => {
        useNotificationStore.getState().addNotification({ type: "new_order", title: "A", message: "a", timestamp: "t" });
        const id = useNotificationStore.getState().notifications[0].id;
        useNotificationStore.getState().markRead(id);
        useNotificationStore.getState().markRead(id); // Already read
        expect(useNotificationStore.getState().unreadCount).toBe(0);
    });

    it("sets notifications from external source", () => {
        const notifications: AdminNotification[] = [
            { id: "n1", type: "new_order", title: "A", message: "a", timestamp: "t", read: false },
            { id: "n2", type: "low_stock", title: "B", message: "b", timestamp: "t", read: true },
        ];
        useNotificationStore.getState().setNotifications(notifications);
        expect(useNotificationStore.getState().notifications).toHaveLength(2);
        expect(useNotificationStore.getState().unreadCount).toBe(1);
    });

    it("clears all notifications", () => {
        useNotificationStore.getState().addNotification({ type: "new_order", title: "A", message: "a", timestamp: "t" });
        useNotificationStore.getState().clearAll();
        expect(useNotificationStore.getState().notifications).toHaveLength(0);
        expect(useNotificationStore.getState().unreadCount).toBe(0);
    });
});
