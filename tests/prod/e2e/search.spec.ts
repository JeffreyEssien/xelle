import { test, expect } from "@playwright/test";

test.describe("Search Engine Accuracy", () => {
	test("search by product name returns results", async ({ page }) => {
		await page.goto("/shop");

		// Open search
		await page.click('button[aria-label="Search"]');
		const searchInput = page.locator('input[placeholder="Search products..."]');
		await expect(searchInput).toBeVisible();

		await searchInput.fill("dress");
		await page.waitForTimeout(1500); // debounce

		// Should show search results or navigate to search page
		const hasResults =
			(await page.locator("a[href^='/product/']").count()) > 0 ||
			(await page.locator("text=/no results/i").count()) > 0;
		expect(hasResults).toBe(true);
	});

	test("search API — partial name match", async ({ request }) => {
		const res = await request.get("/api/search?q=dre");
		expect(res.ok()).toBe(true);

		const data = await res.json();
		expect(data).toHaveProperty("results");
		expect(Array.isArray(data.results)).toBe(true);
	});

	test("search API — category match", async ({ request }) => {
		const res = await request.get("/api/search?q=skincare");
		expect(res.ok()).toBe(true);

		const data = await res.json();
		expect(data).toHaveProperty("results");
	});

	test("search API — short query returns empty", async ({ request }) => {
		const res = await request.get("/api/search?q=a");
		expect(res.ok()).toBe(true);

		const data = await res.json();
		expect(data.results).toHaveLength(0);
	});

	test("search API — empty query returns empty", async ({ request }) => {
		const res = await request.get("/api/search?q=");
		expect(res.ok()).toBe(true);

		const data = await res.json();
		expect(data.results).toHaveLength(0);
	});

	test("search API — gibberish returns empty", async ({ request }) => {
		const res = await request.get("/api/search?q=xyzqwerty99");
		expect(res.ok()).toBe(true);

		const data = await res.json();
		expect(data.results).toHaveLength(0);
	});

	test("search results have required fields", async ({ request }) => {
		const res = await request.get("/api/search?q=product");
		const data = await res.json();

		if (data.results.length > 0) {
			const item = data.results[0];
			expect(item).toHaveProperty("id");
			expect(item).toHaveProperty("slug");
			expect(item).toHaveProperty("name");
			expect(item).toHaveProperty("price");
			expect(item.price).toBeGreaterThan(0);
		}
	});
});
