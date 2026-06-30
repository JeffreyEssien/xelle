import { describe, it, expect, beforeEach, vi } from "vitest";
import { useCartStore } from "@/lib/cartStore";
import type { Product } from "@/types";

// Mock the validateCoupon import used by the store
vi.mock("@/lib/queries", () => ({
    validateCoupon: vi.fn(async (code: string) => {
        if (code === "SAVE20") return { code: "SAVE20", discountPercent: 20 };
        return null;
    }),
}));

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
    id: "prod-1",
    slug: "test-product",
    name: "Test Product",
    description: "A test product",
    price: 5000,
    category: "test",
    brand: "Test Brand",
    stock: 10,
    images: ["/img.jpg"],
    variants: [],
    isFeatured: false,
    isNew: false,
    ...overrides,
});

describe("cartStore", () => {
    beforeEach(() => {
        // Reset store state before each test
        useCartStore.setState({
            items: [],
            isOpen: false,
            discount: 0,
            couponCode: null,
        });
    });

    describe("open/close/toggle", () => {
        it("opens the cart", () => {
            useCartStore.getState().open();
            expect(useCartStore.getState().isOpen).toBe(true);
        });

        it("closes the cart", () => {
            useCartStore.setState({ isOpen: true });
            useCartStore.getState().close();
            expect(useCartStore.getState().isOpen).toBe(false);
        });

        it("toggles the cart", () => {
            useCartStore.getState().toggle();
            expect(useCartStore.getState().isOpen).toBe(true);
            useCartStore.getState().toggle();
            expect(useCartStore.getState().isOpen).toBe(false);
        });
    });

    describe("addItem", () => {
        it("adds a new product to cart", () => {
            const product = makeProduct();
            useCartStore.getState().addItem(product);
            expect(useCartStore.getState().items).toHaveLength(1);
            expect(useCartStore.getState().items[0].quantity).toBe(1);
        });

        it("increments quantity for existing item", () => {
            const product = makeProduct();
            useCartStore.getState().addItem(product);
            useCartStore.getState().addItem(product);
            expect(useCartStore.getState().items).toHaveLength(1);
            expect(useCartStore.getState().items[0].quantity).toBe(2);
        });

        it("does not exceed available stock", () => {
            const product = makeProduct({ stock: 2 });
            useCartStore.getState().addItem(product);
            useCartStore.getState().addItem(product);
            useCartStore.getState().addItem(product); // Should be blocked
            expect(useCartStore.getState().items[0].quantity).toBe(2);
        });

        it("does not add out-of-stock product", () => {
            const product = makeProduct({ stock: 0 });
            useCartStore.getState().addItem(product);
            expect(useCartStore.getState().items).toHaveLength(0);
        });

        it("handles variant items separately", () => {
            const product = makeProduct();
            useCartStore.getState().addItem(product, { name: "Red", price: 5500, stock: 5 });
            useCartStore.getState().addItem(product, { name: "Blue", price: 5500, stock: 5 });
            expect(useCartStore.getState().items).toHaveLength(2);
        });

        it("uses variant stock when available", () => {
            const product = makeProduct({ stock: 10 });
            const variant = { name: "Small", price: 4000, stock: 1 };
            useCartStore.getState().addItem(product, variant);
            useCartStore.getState().addItem(product, variant); // Should be blocked
            expect(useCartStore.getState().items[0].quantity).toBe(1);
        });
    });

    describe("removeItem", () => {
        it("removes an item from cart", () => {
            const product = makeProduct();
            useCartStore.getState().addItem(product);
            useCartStore.getState().removeItem("prod-1", undefined);
            expect(useCartStore.getState().items).toHaveLength(0);
        });

        it("removes only the matching variant", () => {
            const product = makeProduct();
            useCartStore.getState().addItem(product, { name: "Red", stock: 5 });
            useCartStore.getState().addItem(product, { name: "Blue", stock: 5 });
            useCartStore.getState().removeItem("prod-1", "Red");
            expect(useCartStore.getState().items).toHaveLength(1);
            expect(useCartStore.getState().items[0].variant!.name).toBe("Blue");
        });
    });

    describe("updateQuantity", () => {
        it("updates quantity within stock limits", () => {
            const product = makeProduct({ stock: 10 });
            useCartStore.getState().addItem(product);
            useCartStore.getState().updateQuantity("prod-1", undefined, 5);
            expect(useCartStore.getState().items[0].quantity).toBe(5);
        });

        it("clamps to available stock", () => {
            const product = makeProduct({ stock: 3 });
            useCartStore.getState().addItem(product);
            useCartStore.getState().updateQuantity("prod-1", undefined, 100);
            expect(useCartStore.getState().items[0].quantity).toBe(3);
        });

        it("removes item when quantity set to 0", () => {
            const product = makeProduct();
            useCartStore.getState().addItem(product);
            useCartStore.getState().updateQuantity("prod-1", undefined, 0);
            expect(useCartStore.getState().items).toHaveLength(0);
        });
    });

    describe("clearCart", () => {
        it("clears all items and resets discount", () => {
            const product = makeProduct();
            useCartStore.getState().addItem(product);
            useCartStore.setState({ discount: 20, couponCode: "TEST" });
            useCartStore.getState().clearCart();
            const state = useCartStore.getState();
            expect(state.items).toHaveLength(0);
            expect(state.discount).toBe(0);
            expect(state.couponCode).toBeNull();
        });
    });

    describe("totalItems", () => {
        it("counts total items across products", () => {
            useCartStore.getState().addItem(makeProduct({ id: "a", stock: 10 }));
            useCartStore.getState().addItem(makeProduct({ id: "a", stock: 10 }));
            useCartStore.getState().addItem(makeProduct({ id: "b", stock: 10 }));
            expect(useCartStore.getState().totalItems()).toBe(3);
        });
    });

    describe("subtotal and total", () => {
        it("calculates subtotal correctly", () => {
            useCartStore.getState().addItem(makeProduct({ id: "a", price: 1000, stock: 10 }));
            useCartStore.getState().addItem(makeProduct({ id: "a", price: 1000, stock: 10 }));
            useCartStore.getState().addItem(makeProduct({ id: "b", price: 2000, stock: 10 }));
            expect(useCartStore.getState().subtotal()).toBe(4000);
        });

        it("uses variant price when available", () => {
            const product = makeProduct({ price: 1000 });
            useCartStore.getState().addItem(product, { name: "Large", price: 1500, stock: 10 });
            expect(useCartStore.getState().subtotal()).toBe(1500);
        });

        it("applies discount to total", () => {
            useCartStore.getState().addItem(makeProduct({ price: 10000, stock: 10 }));
            useCartStore.setState({ discount: 20 });
            expect(useCartStore.getState().total()).toBe(8000);
        });

        it("total is never negative", () => {
            useCartStore.getState().addItem(makeProduct({ price: 100, stock: 10 }));
            useCartStore.setState({ discount: 200 }); // Extreme value
            expect(useCartStore.getState().total()).toBeGreaterThanOrEqual(0);
        });
    });

    describe("coupon", () => {
        it("applies a valid coupon", async () => {
            const result = await useCartStore.getState().applyCoupon("SAVE20");
            expect(result).toBe(true);
            expect(useCartStore.getState().discount).toBe(20);
            expect(useCartStore.getState().couponCode).toBe("SAVE20");
        });

        it("rejects an invalid coupon", async () => {
            const result = await useCartStore.getState().applyCoupon("INVALID");
            expect(result).toBe(false);
            expect(useCartStore.getState().discount).toBe(0);
        });

        it("removes a coupon", () => {
            useCartStore.setState({ discount: 20, couponCode: "SAVE20" });
            useCartStore.getState().removeCoupon();
            expect(useCartStore.getState().discount).toBe(0);
            expect(useCartStore.getState().couponCode).toBeNull();
        });
    });
});
