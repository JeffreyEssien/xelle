import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/prod/e2e",
	timeout: 60_000,
	expect: { timeout: 15_000 },
	fullyParallel: true,
	retries: 1,
	workers: 2,
	reporter: [["html", { open: "never" }], ["list"]],
	use: {
		baseURL: "https://xelle.ng",
		headless: true,
		screenshot: "only-on-failure",
		trace: "on-first-retry",
		viewport: { width: 1280, height: 720 },
		extraHTTPHeaders: {
			"Accept-Language": "en-US,en;q=0.9",
		},
	},
	projects: [
		{
			name: "chromium",
			use: { browserName: "chromium" },
		},
	],
});
