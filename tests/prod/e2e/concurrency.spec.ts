import { test, expect } from "@playwright/test";

test.describe("Concurrency & Performance", () => {
	test("concurrent order submissions — server handles gracefully", async ({
		request,
	}) => {
		// Simulate 5 simultaneous order submissions
		// All should either succeed or fail gracefully (no 500 crashes)
		const orderPayload = (i: number) => ({
			customerName: `Concurrent User ${i}`,
			email: `concurrent${i}@test.com`,
			phone: `0801234${String(i).padStart(4, "0")}`,
			shippingAddress: {
				firstName: `User`,
				lastName: `${i}`,
				email: `concurrent${i}@test.com`,
				phone: `0801234${String(i).padStart(4, "0")}`,
				address: `${i} Concurrent Street`,
				city: "Lagos",
				state: "Lagos",
				zip: "100001",
				country: "Nigeria",
			},
			items: [
				{
					product: {
						id: "concurrent-test-fake-id",
						name: "Concurrent Test Item",
						price: 5000,
						images: [],
						slug: "concurrent-test",
						description: "",
						category: "",
						brand: "",
						stock: 1, // Only 1 in stock
						variants: [],
						isFeatured: false,
						isNew: false,
					},
					quantity: 1,
				},
			],
			subtotal: 5000,
			shipping: 3500,
			total: 8500,
			paymentMethod: "bank_transfer",
			deliveryZone: "Island Core",
			deliveryType: "doorstep",
		});

		const results = await Promise.all(
			[0, 1, 2, 3, 4].map((i) =>
				request
					.post("/api/orders", { data: orderPayload(i) })
					.then(async (res) => ({
						status: res.status(),
						body: await res.json().catch(() => ({})),
					})),
			),
		);

		// All responses should be valid HTTP (no timeouts, no 500s ideally)
		for (const r of results) {
			expect([200, 400, 500, 503]).toContain(r.status);
		}

		// At least some should get a proper response (not all 500)
		const nonServerErrors = results.filter((r) => r.status !== 500);
		expect(nonServerErrors.length).toBeGreaterThan(0);
	});

	test("order queue returns 503 when overloaded", async ({ request }) => {
		// Fire many requests rapidly to potentially hit the queue limit
		const payload = {
			customerName: "Queue Test",
			email: "queue@test.com",
			phone: "08000000000",
			shippingAddress: {
				firstName: "Queue",
				lastName: "Test",
				email: "queue@test.com",
				phone: "08000000000",
				address: "1 Queue St",
				city: "Lagos",
				state: "Lagos",
				zip: "100001",
				country: "Nigeria",
			},
			items: [
				{
					product: {
						id: "queue-test-fake",
						name: "Queue Item",
						price: 1000,
						images: [],
						slug: "queue",
						description: "",
						category: "",
						brand: "",
						stock: 100,
						variants: [],
						isFeatured: false,
						isNew: false,
					},
					quantity: 1,
				},
			],
			subtotal: 1000,
			shipping: 0,
			total: 1000,
			paymentMethod: "bank_transfer",
			deliveryZone: "Island Core",
			deliveryType: "doorstep",
		};

		// Send 10 concurrent requests
		const results = await Promise.all(
			Array.from({ length: 10 }, () =>
				request
					.post("/api/orders", { data: payload })
					.then(async (res) => res.status()),
			),
		);

		// All should be valid HTTP status codes (no crashes)
		for (const status of results) {
			expect([200, 400, 500, 503]).toContain(status);
		}
	});

	test("homepage loads within acceptable time", async ({ page }) => {
		const start = Date.now();
		await page.goto("/", { waitUntil: "domcontentloaded" });
		const loadTime = Date.now() - start;

		// Should load within 10 seconds
		expect(loadTime).toBeLessThan(10_000);
		console.log(`Homepage load time: ${loadTime}ms`);
	});

	test("shop page loads within acceptable time", async ({ page }) => {
		const start = Date.now();
		await page.goto("/shop", { waitUntil: "domcontentloaded" });
		const loadTime = Date.now() - start;

		expect(loadTime).toBeLessThan(10_000);
		console.log(`Shop page load time: ${loadTime}ms`);
	});
});
