import { test, expect } from "@playwright/test";

test.describe("Order Tracking", () => {
	test("tracking page loads and shows form", async ({ page }) => {
		await page.goto("/track");
		await expect(page.locator("input").first()).toBeVisible();
	});

	test("tracking with invalid order ID shows error", async ({ request }) => {
		const res = await request.post("/api/orders/track", {
			data: {
				orderId: "ORD-NONEXISTENT",
				email: "nobody@test.com",
			},
		});

		expect(res.status()).toBe(404);
	});

	test("tracking with wrong email shows error", async ({ request }) => {
		const res = await request.post("/api/orders/track", {
			data: {
				orderId: "ORD-SOMEID",
				email: "wrong@email.com",
			},
		});

		// Should be 404 (order not found or email mismatch)
		expect(res.status()).toBe(404);
	});
});
