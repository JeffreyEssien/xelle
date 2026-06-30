import { describe, it, expect, beforeEach } from "vitest";
import { useOrderStore } from "@/lib/orderStore";
import type { Order } from "@/types";

const makeOrder = (overrides: Partial<Order> = {}): Order => ({
    id: "ORD-123",
    customerName: "Test User",
    email: "test@test.com",
    phone: "08012345678",
    items: [],
    total: 10000,
    subtotal: 10000,
    shipping: 0,
    status: "pending",
    createdAt: new Date().toISOString(),
    shippingAddress: {
        firstName: "Test",
        lastName: "User",
        email: "test@test.com",
        phone: "08012345678",
        address: "123 Test St",
        city: "Lagos",
        state: "Lagos",
        zip: "100001",
        country: "Nigeria",
    },
    ...overrides,
});

describe("orderStore", () => {
    beforeEach(() => {
        useOrderStore.setState({ orders: [], lastOrder: null });
    });

    it("adds an order and sets it as lastOrder", () => {
        const order = makeOrder();
        useOrderStore.getState().addOrder(order);
        expect(useOrderStore.getState().orders).toHaveLength(1);
        expect(useOrderStore.getState().lastOrder).toEqual(order);
    });

    it("prepends new orders (newest first)", () => {
        useOrderStore.getState().addOrder(makeOrder({ id: "ORD-1" }));
        useOrderStore.getState().addOrder(makeOrder({ id: "ORD-2" }));
        expect(useOrderStore.getState().orders[0].id).toBe("ORD-2");
    });

    it("updates order status", () => {
        useOrderStore.getState().addOrder(makeOrder({ id: "ORD-1" }));
        useOrderStore.getState().updateStatus("ORD-1", "shipped");
        expect(useOrderStore.getState().orders[0].status).toBe("shipped");
    });

    it("does not affect other orders when updating status", () => {
        useOrderStore.getState().addOrder(makeOrder({ id: "ORD-1" }));
        useOrderStore.getState().addOrder(makeOrder({ id: "ORD-2" }));
        useOrderStore.getState().updateStatus("ORD-1", "delivered");
        expect(useOrderStore.getState().orders.find((o) => o.id === "ORD-2")!.status).toBe("pending");
    });

    it("sets lastOrder", () => {
        const order = makeOrder();
        useOrderStore.getState().setLastOrder(order);
        expect(useOrderStore.getState().lastOrder).toEqual(order);
    });

    it("clears lastOrder", () => {
        useOrderStore.getState().setLastOrder(makeOrder());
        useOrderStore.getState().setLastOrder(null);
        expect(useOrderStore.getState().lastOrder).toBeNull();
    });
});
