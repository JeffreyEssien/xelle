import { test, expect } from "@playwright/test";

test.describe("Stockpile System", () => {
	test("stockpile page loads", async ({ page }) => {
		await page.goto("/stockpile");
		await page.waitForLoadState("networkidle");
		await expect(page.locator("body")).toBeVisible();
	});

	test("stockpile API — get without params returns 400", async ({
		request,
	}) => {
		const res = await request.get("/api/stockpile");
		expect(res.status()).toBe(400);
	});

	test("stockpile API — get by nonexistent email returns empty", async ({
		request,
	}) => {
		const res = await request.get(
			"/api/stockpile?email=nonexistent@fake.com",
		);
		const data = await res.json();
		// Should return ok with null/empty stockpile
		expect(res.ok()).toBe(true);
		expect(data.stockpile === null || data.stockpile === undefined || Object.keys(data).length === 0).toBe(true);
	});

	test("stockpile API — get by nonexistent ID returns empty", async ({
		request,
	}) => {
		const res = await request.get(
			"/api/stockpile?id=00000000-0000-0000-0000-000000000000",
		);
		const data = await res.json();
		expect(res.ok()).toBe(true);
		expect(data.stockpile === null || data.stockpile === undefined || Object.keys(data).length === 0).toBe(true);
	});
});
