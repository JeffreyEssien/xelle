import { test, expect } from "@playwright/test";

/** Helper: navigate to PDP and add first in-stock product to cart */
async function addFirstProductToCart(page: import("@playwright/test").Page) {
	await page.goto("/shop");
	await page.locator("a[href^='/product/']").first().click();
	await page.waitForLoadState("networkidle");

	// Use the main PDP "Add to Cart" button (scoped to main content area)
	const addBtn = page.getByRole("main").getByRole("button", { name: /add to cart/i }).first();
	const soldBtn = page.getByRole("main").getByRole("button", { name: /sold out/i }).first();

	if (await soldBtn.isVisible().catch(() => false)) {
		return false; // sold out
	}
	if (await addBtn.isVisible() && await addBtn.isEnabled()) {
		await addBtn.click();
		await page.waitForTimeout(1500);

		// Close cart drawer if it opened (backdrop blocks clicks)
		const closeBtn = page.locator('button[aria-label="Close cart"]');
		if (await closeBtn.isVisible().catch(() => false)) {
			await closeBtn.click();
			await page.waitForTimeout(500);
		}
		return true;
	}
	return false;
}

test.describe("End-to-End Checkout Flow", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await page.evaluate(() => localStorage.clear());
	});

	test("complete checkout with bank transfer — order goes to pending", async ({
		page,
	}) => {
		// 1. Add product to cart
		const added = await addFirstProductToCart(page);
		if (!added) {
			test.skip(true, "Product is sold out — skipping checkout test");
			return;
		}

		// Grab PDP price for later comparison
		const priceText = await page.locator("p.font-serif").first().textContent();
		expect(priceText).toContain("₦");

		// 2. Go to checkout
		await page.goto("/checkout");
		await page.waitForLoadState("networkidle");

		// Verify order summary shows price
		await expect(page.locator("text=₦").first()).toBeVisible();

		// 3. Fill checkout form
		await page.fill('input[name="firstName"]', "Test");
		await page.fill('input[name="lastName"]', "Caveman");
		await page.fill('input[name="email"]', "test@xelle.ng");
		await page.fill('input[name="phone"]', "08012345678");
		await page.fill('input[name="address"]', "1 Test Cave, Lekki Phase 1");

		// Select Lagos state
		await page.selectOption("select >> nth=0", { label: "Lagos" });
		await page.waitForTimeout(1000);

		// Select a Lagos area
		const areaSelect = page.locator("select").nth(1);
		if (await areaSelect.isVisible()) {
			const options = await areaSelect.locator("option").allTextContents();
			const validOption = options.find(
				(o) => o.trim() !== "" && !o.startsWith("Select"),
			);
			if (validOption) {
				await areaSelect.selectOption({ label: validOption });
			}
		}

		// 4. Select bank transfer payment
		await page.click('input[name="payment"][value="manual"]');

		// 5. Submit order
		await page.locator('button[type="submit"]').click();

		// 6. Should transition to bank transfer step or show payment info
		await expect(
			page.locator("text=/bank|transfer|payment|pocketapp/i").first(),
		).toBeVisible({ timeout: 20_000 });

		// 7. Fill sender name and confirm
		const senderInput = page.locator('input[placeholder="e.g. John Doe"]');
		if (await senderInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
			await senderInput.fill("Test Caveman");
			const confirmBtn = page.getByRole("button", { name: /made payment/i });
			await confirmBtn.click();

			// Should show receipt or awaiting confirmation
			await expect(
				page.locator("text=/receipt|awaiting|confirmation|thank/i").first(),
			).toBeVisible({ timeout: 15_000 });
		}
	});

	test("checkout validates required fields", async ({ page }) => {
		const added = await addFirstProductToCart(page);
		if (!added) {
			test.skip(true, "No products in stock");
			return;
		}

		await page.goto("/checkout");
		await page.waitForLoadState("networkidle");

		// Submit without filling anything
		await page.locator('button[type="submit"]').click();

		// Should show validation errors
		await expect(page.locator("text=Required").first()).toBeVisible();
	});

	test("price continuity — PDP price matches checkout subtotal", async ({
		page,
	}) => {
		await page.goto("/shop");
		await page.locator("a[href^='/product/']").first().click();
		await page.waitForLoadState("networkidle");

		// Capture PDP price
		const pdpPriceEl = page.locator("p.font-serif").first();
		const pdpPriceText = await pdpPriceEl.textContent();
		const pdpPrice = pdpPriceText
			? parseFloat(pdpPriceText.replace(/[₦,]/g, ""))
			: 0;
		expect(pdpPrice).toBeGreaterThan(0);

		// Add to cart
		const addBtn = page.getByRole("main").getByRole("button", { name: /add to cart/i }).first();
		if (!(await addBtn.isEnabled())) {
			test.skip(true, "Product sold out");
			return;
		}
		await addBtn.click();
		await page.waitForTimeout(2000);

		// Go to checkout
		await page.goto("/checkout");
		await page.waitForLoadState("networkidle");

		// Verify subtotal matches PDP price (single item, qty 1)
		const allPrices = await page.locator("text=/₦[\\d,.]+/").allTextContents();
		const priceValues = allPrices
			.map((t) => parseFloat(t.replace(/[₦,]/g, "")))
			.filter((n) => !isNaN(n) && n > 0);

		// The PDP price should appear somewhere in checkout totals
		expect(priceValues).toContain(pdpPrice);
	});
});
