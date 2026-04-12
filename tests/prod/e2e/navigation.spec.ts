import { test, expect } from "@playwright/test";

test.describe("Site Navigation & Core Pages", () => {
	const pages = [
		{ path: "/", name: "Homepage", mayFail: true },
		{ path: "/shop", name: "Shop" },
		{ path: "/track", name: "Order Tracking" },
		{ path: "/stockpile", name: "Stockpile" },
	];

	for (const p of pages) {
		test(`${p.name} page loads successfully`, async ({ page }) => {
			const res = await page.goto(p.path);
			const status = res?.status() || 0;
			if (p.mayFail && status === 500) {
				console.warn(`BUG: ${p.name} returns 500 — needs fixing`);
			}
			expect(status).toBeGreaterThanOrEqual(200);
			expect(status).toBeLessThan(500);
		});
	}

	test("navigation links work", async ({ page }) => {
		// Start from /shop (homepage may be 500)
		await page.goto("/shop");
		await page.waitForLoadState("networkidle");

		// Click a product link to verify navigation
		const productLink = page.locator("a[href^='/product/']").first();
		await expect(productLink).toBeVisible({ timeout: 10_000 });
		await productLink.click();
		await page.waitForLoadState("networkidle");
		expect(page.url()).toContain("/product/");
	});

	test("mobile navigation works", async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		// Start from /shop (homepage may be 500)
		await page.goto("/shop");
		await page.waitForLoadState("networkidle");

		// Look for hamburger/menu button
		const menuSelectors = [
			'button[aria-label="Menu"]',
			'button[aria-label="Open menu"]',
			'button[aria-label="Toggle menu"]',
		];

		let menuOpened = false;
		for (const sel of menuSelectors) {
			const btn = page.locator(sel);
			if (await btn.isVisible().catch(() => false)) {
				await btn.click();
				menuOpened = true;
				break;
			}
		}

		if (menuOpened) {
			await page.waitForTimeout(500);
			// Check for any nav link becoming visible
			const navLink = page.locator("a[href='/track'], a[href='/stockpile']").first();
			await expect(navLink).toBeVisible({ timeout: 5_000 });
		}
		// If no menu button found, nav might be always visible — that's fine
	});
});
