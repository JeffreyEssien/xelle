import { test, expect } from "@playwright/test";

test.describe("Resilience & Edge Cases", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await page.evaluate(() => localStorage.clear());
	});

	test("impossible discount — coupon > cart total does not produce negative", async ({
		page,
	}) => {
		// Add a product to cart
		await page.goto("/shop");
		await page.locator("a[href^='/product/']").first().click();
		await page.waitForLoadState("networkidle");

		const addBtn = page.getByRole("main").getByRole("button", { name: /add to cart/i }).first();
		if (!(await addBtn.isVisible()) || !(await addBtn.isEnabled())) {
			test.skip(true, "No products in stock");
			return;
		}
		await addBtn.click();
		await page.waitForTimeout(1500);
		// Close cart drawer if it opened
		const closeCart1 = page.locator('button[aria-label="Close cart"]');
		if (await closeCart1.isVisible().catch(() => false)) {
			await closeCart1.click();
			await page.waitForTimeout(500);
		}

		await page.goto("/checkout");
		await page.waitForLoadState("networkidle");

		// Try applying a bogus coupon
		const couponToggle = page.locator("button", { hasText: /coupon/i });
		if (await couponToggle.isVisible().catch(() => false)) {
			await couponToggle.click();
			const couponInput = page.locator('input[placeholder="Enter code"]');
			await couponInput.fill("TESTCOUPON999");
			await page.locator("button", { hasText: /apply/i }).click();
			await page.waitForTimeout(1000);
		}

		// Verify no negative amounts anywhere
		const allPriceTexts = await page.locator("text=/₦/").allTextContents();
		for (const t of allPriceTexts) {
			const amount = parseFloat(t.replace(/[^0-9.-]/g, ""));
			if (!isNaN(amount)) {
				expect(amount).toBeGreaterThanOrEqual(0);
			}
		}
	});

	test("double-click submit does not create duplicate orders", async ({
		page,
	}) => {
		// Add product
		await page.goto("/shop");
		await page.locator("a[href^='/product/']").first().click();
		await page.waitForLoadState("networkidle");

		const addBtn = page.getByRole("main").getByRole("button", { name: /add to cart/i }).first();
		if (!(await addBtn.isVisible()) || !(await addBtn.isEnabled())) {
			test.skip(true, "No products in stock");
			return;
		}
		await addBtn.click();
		await page.waitForTimeout(1500);
		// Close cart drawer if it opened
		const closeCart2 = page.locator('button[aria-label="Close cart"]');
		if (await closeCart2.isVisible().catch(() => false)) {
			await closeCart2.click();
			await page.waitForTimeout(500);
		}

		await page.goto("/checkout");
		await page.waitForLoadState("networkidle");

		// Fill form
		await page.fill('input[name="firstName"]', "Double");
		await page.fill('input[name="lastName"]', "Click");
		await page.fill('input[name="email"]', "doubleclick@test.com");
		await page.fill('input[name="phone"]', "08099999999");
		await page.fill('input[name="address"]', "1 Double Click Street");
		await page.selectOption("select >> nth=0", { label: "Lagos" });
		await page.waitForTimeout(1000);

		const areaSelect = page.locator("select").nth(1);
		if (await areaSelect.isVisible()) {
			const options = await areaSelect.locator("option").allTextContents();
			const validOption = options.find(
				(o) => o.trim() !== "" && !o.startsWith("Select"),
			);
			if (validOption) await areaSelect.selectOption({ label: validOption });
		}

		await page.click('input[name="payment"][value="manual"]');

		// Rapid double-click the submit button
		const submitBtn = page.locator('button[type="submit"]');
		await submitBtn.dblclick();

		await page.waitForTimeout(5000);

		// After first submit, button should be disabled OR only one order confirmation appears
		const pageText = (await page.textContent("body")) || "";
		const orderIds = pageText.match(/ORD-[A-Z0-9]+/g) || [];
		const uniqueIds = [...new Set(orderIds)];
		expect(uniqueIds.length).toBeLessThanOrEqual(1);
	});

	test("zero-price product cannot be purchased via API", async ({
		request,
	}) => {
		const res = await request.post("/api/orders", {
			data: {
				customerName: "Zero Price Test",
				email: "zero@test.com",
				phone: "08000000000",
				shippingAddress: {
					firstName: "Zero", lastName: "Price", email: "zero@test.com",
					phone: "08000000000", address: "1 Zero St", city: "Lagos",
					state: "Lagos", zip: "100001", country: "Nigeria",
				},
				items: [{
					product: {
						id: "fake-id", name: "Free Item", price: 0, images: [],
						slug: "free", description: "", category: "", brand: "",
						stock: 10, variants: [], isFeatured: false, isNew: false,
					},
					quantity: 1,
				}],
				subtotal: 0, shipping: 0, total: 0,
				paymentMethod: "bank_transfer",
				deliveryZone: "Island Core", deliveryType: "doorstep",
			},
		});

		expect(res.status()).toBe(400);
		const data = await res.json();
		expect(data.success).toBe(false);
	});

	test("negative-price product rejected by API", async ({ request }) => {
		const res = await request.post("/api/orders", {
			data: {
				customerName: "Neg Price", email: "neg@test.com", phone: "08000000000",
				shippingAddress: {
					firstName: "Neg", lastName: "Price", email: "neg@test.com",
					phone: "08000000000", address: "1 Neg St", city: "Lagos",
					state: "Lagos", zip: "100001", country: "Nigeria",
				},
				items: [{
					product: {
						id: "fake-id-2", name: "Neg Item", price: -5000, images: [],
						slug: "neg", description: "", category: "", brand: "",
						stock: 10, variants: [], isFeatured: false, isNew: false,
					},
					quantity: 1,
				}],
				subtotal: -5000, shipping: 0, total: -5000,
				paymentMethod: "bank_transfer",
				deliveryZone: "Island Core", deliveryType: "doorstep",
			},
		});

		expect(res.status()).toBe(400);
	});

	test("order with empty items rejected", async ({ request }) => {
		const res = await request.post("/api/orders", {
			data: {
				customerName: "Empty Cart", email: "empty@test.com", phone: "08000000000",
				shippingAddress: {
					firstName: "Empty", lastName: "Cart", email: "empty@test.com",
					phone: "08000000000", address: "1 Empty St", city: "Lagos",
					state: "Lagos", zip: "100001", country: "Nigeria",
				},
				items: [], subtotal: 0, shipping: 0, total: 0,
				paymentMethod: "bank_transfer",
				deliveryZone: "Island Core", deliveryType: "doorstep",
			},
		});

		expect(res.status()).toBe(400);
	});

	test("order with zero quantity rejected", async ({ request }) => {
		const res = await request.post("/api/orders", {
			data: {
				customerName: "Zero Qty", email: "zeroqty@test.com", phone: "08000000000",
				shippingAddress: {
					firstName: "Zero", lastName: "Qty", email: "zeroqty@test.com",
					phone: "08000000000", address: "1 Zero Qty St", city: "Lagos",
					state: "Lagos", zip: "100001", country: "Nigeria",
				},
				items: [{
					product: {
						id: "fake-id-3", name: "Some Product", price: 5000, images: [],
						slug: "some", description: "", category: "", brand: "",
						stock: 10, variants: [], isFeatured: false, isNew: false,
					},
					quantity: 0,
				}],
				subtotal: 0, shipping: 0, total: 0,
				paymentMethod: "bank_transfer",
				deliveryZone: "Island Core", deliveryType: "doorstep",
			},
		});

		expect(res.status()).toBe(400);
	});

	test("missing required fields rejected", async ({ request }) => {
		const res = await request.post("/api/orders", {
			data: {
				items: [{
					product: { id: "x", name: "X", price: 100, images: [] },
					quantity: 1,
				}],
			},
		});

		expect(res.status()).toBe(400);
	});
});
