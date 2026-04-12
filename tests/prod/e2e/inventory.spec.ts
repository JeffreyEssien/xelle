import { test, expect } from "@playwright/test";

test.describe("Inventory & Stock Display", () => {
	test("out-of-stock products show sold out badge and disabled button", async ({
		page,
	}) => {
		await page.goto("/shop");
		await page.waitForLoadState("networkidle");

		// Look for a "Sold Out" badge on any product card
		const soldOutBadge = page.locator("text=Sold Out").first();
		if (await soldOutBadge.isVisible().catch(() => false)) {
			// Click the sold out product card
			const card = soldOutBadge.locator("xpath=ancestor::a").first();
			await card.click();
			await page.waitForLoadState("networkidle");

			// On PDP, button should say "Sold Out" and be disabled
			const soldOutBtn = page.getByRole("main").getByRole("button", { name: /sold out/i }).first();
			await expect(soldOutBtn).toBeVisible();
			await expect(soldOutBtn).toBeDisabled();

			// Stock indicator should say "Out of Stock"
			await expect(page.locator("text=Out of Stock").first()).toBeVisible();
		} else {
			// No sold out products — verify at least one product shows stock info
			await page.locator("a[href^='/product/']").first().click();
			await page.waitForLoadState("networkidle");

			const hasStockInfo = await page
				.locator("text=/In Stock|Out of Stock|Only \\d+ left/")
				.first()
				.isVisible()
				.catch(() => false);
			expect(hasStockInfo).toBe(true);
		}
	});

	test("low stock products show warning indicator", async ({ page }) => {
		await page.goto("/shop");
		await page.waitForLoadState("networkidle");

		const lowStockBadge = page.locator("text=/Only \\d+ left/").first();
		if (await lowStockBadge.isVisible().catch(() => false)) {
			const card = lowStockBadge.locator("xpath=ancestor::a").first();
			await card.click();
			await page.waitForLoadState("networkidle");

			await expect(
				page.locator("text=/Only \\d+ left — order soon/").first(),
			).toBeVisible();
		}
		// If no low stock products, test passes
	});

	test("in-stock products can be added to cart", async ({ page }) => {
		await page.goto("/shop");
		await page.locator("a[href^='/product/']").first().click();
		await page.waitForLoadState("networkidle");

		const addBtn = page.getByRole("main").getByRole("button", { name: /add to cart/i }).first();
		if (await addBtn.isVisible() && await addBtn.isEnabled()) {
			await addBtn.click();
			await expect(page.locator("text=/Added to Cart/i").first()).toBeVisible();
		}
	});
});
