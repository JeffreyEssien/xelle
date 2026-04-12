# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Site Navigation & Core Pages >> Homepage page loads successfully
- Location: tests/prod/e2e/navigation.spec.ts:12:7

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 500
Received:   500
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - region "Notifications alt+T"
  - banner [ref=e2]:
    - navigation [ref=e3]:
      - link "XELLÉ" [ref=e4] [cursor=pointer]:
        - /url: /
        - generic [ref=e5]: XELLÉ
      - list [ref=e6]:
        - listitem [ref=e7]:
          - link "Home" [ref=e8] [cursor=pointer]:
            - /url: /
            - text: Home
        - listitem [ref=e9]:
          - link "Shop" [ref=e10] [cursor=pointer]:
            - /url: /shop
            - text: Shop
        - listitem [ref=e11]:
          - link "Stockpile" [ref=e12] [cursor=pointer]:
            - /url: /stockpile
            - text: Stockpile
        - listitem [ref=e13]:
          - link "Track Order" [ref=e14] [cursor=pointer]:
            - /url: /track
            - text: Track Order
        - listitem [ref=e15]:
          - link "About" [ref=e16] [cursor=pointer]:
            - /url: /#about
            - text: About
      - generic [ref=e17]:
        - button "Search" [ref=e18] [cursor=pointer]:
          - img [ref=e19]
        - button "Open cart" [ref=e22] [cursor=pointer]:
          - img [ref=e23]
  - main [ref=e26]:
    - generic [ref=e33]:
      - generic [ref=e35]: CURATED FOR EVERYDAY LIVING
      - heading "Smart. Comfortable. Intentional." [level=1] [ref=e38]:
        - generic [ref=e40]: Smart.
        - generic [ref=e42]: Comfortable.
        - generic [ref=e44]: Intentional.
      - paragraph [ref=e45]: Thoughtfully curated beauty products, accessories, home essentials, gadgets, and lifestyle finds — all in one place. Because shopping should feel easy, not overwhelming.
      - generic [ref=e46]:
        - link "Shop Collection" [ref=e47] [cursor=pointer]:
          - /url: /shop
          - button "Shop Collection" [ref=e48]
        - link "Our Story" [ref=e49] [cursor=pointer]:
          - /url: /#about
          - generic [ref=e50]: Our Story
      - button "Scroll" [ref=e52] [cursor=pointer]:
        - generic [ref=e53]: Scroll
        - img [ref=e54]
    - generic [ref=e56]:
      - generic [ref=e57]:
        - generic [ref=e58]:
          - paragraph [ref=e59]: Just Arrived
          - heading "New Arrivals" [level=2] [ref=e60]
        - link "View All" [ref=e61] [cursor=pointer]:
          - /url: /shop?sort=newest
          - generic [ref=e62]: View All
          - img [ref=e63]
      - generic [ref=e65]:
        - link "Powder puff New Add to Cart Powder puff beauty ₦1,500.00" [ref=e68] [cursor=pointer]:
          - /url: /product/powder-puff
          - generic [ref=e69]:
            - img "Powder puff" [ref=e70]
            - generic [ref=e73]: New
            - generic [ref=e74]:
              - button [ref=e75]:
                - img [ref=e76]
              - button [ref=e78]:
                - img [ref=e79]
            - button "Add to Cart" [ref=e82]:
              - img [ref=e83]
              - text: Add to Cart
          - generic [ref=e86]:
            - heading "Powder puff" [level=3] [ref=e87]
            - paragraph [ref=e88]: beauty
            - paragraph [ref=e89]: ₦1,500.00
        - link "Perfume Atomizer New Add to Cart Perfume Atomizer self-care ₦3,500.00" [ref=e92] [cursor=pointer]:
          - /url: /product/perfume-atomizer
          - generic [ref=e93]:
            - img "Perfume Atomizer" [ref=e94]
            - generic [ref=e97]: New
            - generic [ref=e98]:
              - button [ref=e99]:
                - img [ref=e100]
              - button [ref=e102]:
                - img [ref=e103]
            - button "Add to Cart" [ref=e106]:
              - img [ref=e107]
              - text: Add to Cart
          - generic [ref=e110]:
            - heading "Perfume Atomizer" [level=3] [ref=e111]
            - paragraph [ref=e112]: self-care
            - paragraph [ref=e113]: ₦3,500.00
        - link "Hair clips Only 1 left Add to Cart Hair clips hair ₦6,000.00" [ref=e116] [cursor=pointer]:
          - /url: /product/hair-clips
          - generic [ref=e117]:
            - img "Hair clips" [ref=e118]
            - generic [ref=e121]: Only 1 left
            - generic [ref=e122]:
              - button [ref=e123]:
                - img [ref=e124]
              - button [ref=e126]:
                - img [ref=e127]
            - button "Add to Cart" [ref=e130]:
              - img [ref=e131]
              - text: Add to Cart
          - generic [ref=e134]:
            - heading "Hair clips" [level=3] [ref=e135]
            - paragraph [ref=e136]: hair
            - paragraph [ref=e137]: ₦6,000.00
        - link "Teeth Strips Only 3 left Add to Cart Teeth Strips self-care ₦3,000.00" [ref=e140] [cursor=pointer]:
          - /url: /product/teeth-strips
          - generic [ref=e141]:
            - img "Teeth Strips" [ref=e142]
            - generic [ref=e145]: Only 3 left
            - generic [ref=e146]:
              - button [ref=e147]:
                - img [ref=e148]
              - button [ref=e150]:
                - img [ref=e151]
            - button "Add to Cart" [ref=e154]:
              - img [ref=e155]
              - text: Add to Cart
          - generic [ref=e158]:
            - heading "Teeth Strips" [level=3] [ref=e159]
            - paragraph [ref=e160]: self-care
            - paragraph [ref=e161]: ₦3,000.00
    - generic [ref=e164]:
      - generic [ref=e165]:
        - generic [ref=e166]:
          - paragraph [ref=e167]: Browse
          - heading "Shop by Category" [level=2] [ref=e168]
        - link "All Categories" [ref=e169] [cursor=pointer]:
          - /url: /shop
          - generic [ref=e170]: All Categories
          - img [ref=e171]
      - generic [ref=e173]:
        - link "Beauty Products Beauty Products High-end beauty essentials at affordable prices. Everyday makeup must-haves in one place." [ref=e175] [cursor=pointer]:
          - /url: /shop?category=beauty
          - generic [ref=e176]:
            - img "Beauty Products" [ref=e178]
            - generic [ref=e181]:
              - generic [ref=e182]:
                - heading "Beauty Products" [level=3] [ref=e183]
                - paragraph [ref=e184]: High-end beauty essentials at affordable prices. Everyday makeup must-haves in one place.
              - img [ref=e186]
        - link "Content Kits Content Kits Content creator must-haves for better photos and videos. Simple tools, professional results." [ref=e191] [cursor=pointer]:
          - /url: /shop?category=content
          - generic [ref=e192]:
            - img "Content Kits" [ref=e194]
            - generic [ref=e197]:
              - generic [ref=e198]:
                - heading "Content Kits" [level=3] [ref=e199]
                - paragraph [ref=e200]: Content creator must-haves for better photos and videos. Simple tools, professional results.
              - img [ref=e202]
        - link "Fragrances Fragrances Scents that leave a lasting impression." [ref=e207] [cursor=pointer]:
          - /url: /shop?category=fragrances
          - generic [ref=e208]:
            - img "Fragrances" [ref=e210]
            - generic [ref=e213]:
              - generic [ref=e214]:
                - heading "Fragrances" [level=3] [ref=e215]
                - paragraph [ref=e216]: Scents that leave a lasting impression.
              - img [ref=e218]
        - link "Gadgets Gadgets Trending gadgets and tech accessories designed for convenience and modern living." [ref=e223] [cursor=pointer]:
          - /url: /shop?category=gadgets
          - generic [ref=e224]:
            - img "Gadgets" [ref=e226]
            - generic [ref=e229]:
              - generic [ref=e230]:
                - heading "Gadgets" [level=3] [ref=e231]
                - paragraph [ref=e232]: Trending gadgets and tech accessories designed for convenience and modern living.
              - img [ref=e234]
        - link "Gift Set Gift Set Perfectly Curated Gift boxes" [ref=e239] [cursor=pointer]:
          - /url: /shop?category=gift-set
          - generic [ref=e240]:
            - img "Gift Set" [ref=e242]
            - generic [ref=e245]:
              - generic [ref=e246]:
                - heading "Gift Set" [level=3] [ref=e247]
                - paragraph [ref=e248]: Perfectly Curated Gift boxes
              - img [ref=e250]
        - link "Hair Care Hair Care Everyday hair care essentials for healthy, styled, confident hair." [ref=e255] [cursor=pointer]:
          - /url: /shop?category=hair
          - generic [ref=e256]:
            - img "Hair Care" [ref=e258]
            - generic [ref=e261]:
              - generic [ref=e262]:
                - heading "Hair Care" [level=3] [ref=e263]
                - paragraph [ref=e264]: Everyday hair care essentials for healthy, styled, confident hair.
              - img [ref=e266]
        - link "Handbags Handbags Chic, everyday handbags that elevate your outfit effortlessly. Stylish, functional, and perfect for on-the-go looks." [ref=e271] [cursor=pointer]:
          - /url: /shop?category=handbags
          - generic [ref=e272]:
            - img "Handbags" [ref=e274]
            - generic [ref=e277]:
              - generic [ref=e278]:
                - heading "Handbags" [level=3] [ref=e279]
                - paragraph [ref=e280]: Chic, everyday handbags that elevate your outfit effortlessly. Stylish, functional, and perfect for on-the-go looks.
              - img [ref=e282]
        - link "Home Care/Essentials Home Care/Essentials Practical home essentials that keep your space clean, organized, and aesthetic." [ref=e287] [cursor=pointer]:
          - /url: /shop?category=home
          - generic [ref=e288]:
            - img "Home Care/Essentials" [ref=e290]
            - generic [ref=e293]:
              - generic [ref=e294]:
                - heading "Home Care/Essentials" [level=3] [ref=e295]
                - paragraph [ref=e296]: Practical home essentials that keep your space clean, organized, and aesthetic.
              - img [ref=e298]
        - link "Kitchen Kitchen Smart kitchen tools and accessories that make cooking and storage easier." [ref=e303] [cursor=pointer]:
          - /url: /shop?category=kitchen
          - generic [ref=e304]:
            - img "Kitchen" [ref=e306]
            - generic [ref=e309]:
              - generic [ref=e310]:
                - heading "Kitchen" [level=3] [ref=e311]
                - paragraph [ref=e312]: Smart kitchen tools and accessories that make cooking and storage easier.
              - img [ref=e314]
        - link "Message Pad Message Pad A Christian journal designed for sermon notes, prayers, and intentional faith growth." [ref=e319] [cursor=pointer]:
          - /url: /shop?category=message-pad
          - generic [ref=e320]:
            - img "Message Pad" [ref=e322]
            - generic [ref=e325]:
              - generic [ref=e326]:
                - heading "Message Pad" [level=3] [ref=e327]
                - paragraph [ref=e328]: A Christian journal designed for sermon notes, prayers, and intentional faith growth.
              - img [ref=e330]
        - link "Self Care Self Care Comfort, glow, and soft-life energy." [ref=e335] [cursor=pointer]:
          - /url: /shop?category=self-care
          - generic [ref=e336]:
            - img "Self Care" [ref=e338]
            - generic [ref=e341]:
              - generic [ref=e342]:
                - heading "Self Care" [level=3] [ref=e343]
                - paragraph [ref=e344]: Comfort, glow, and soft-life energy.
              - img [ref=e346]
    - generic [ref=e352]:
      - generic [ref=e353]:
        - paragraph [ref=e354]: Our Story
        - heading "The Comfort of Smart Living" [level=2] [ref=e355]
      - generic [ref=e356]:
        - paragraph [ref=e357]: "XELLÉ was created from a simple idea: everyday living should feel elevated without being expensive or complicated."
        - paragraph [ref=e358]: As a chronic online shopper, I was tired of buying from multiple stores and paying delivery fees over and over again. I wanted one space where you could find quality beauty products, chic accessories, home essentials, gadgets, and more — all carefully selected and reasonably priced.
        - paragraph [ref=e359]: At XELLÉ, we focus on high-end finds at affordable prices and everyday essentials that make life easier. Convenience you can rely on. Quality you can trust. Pieces that help you feel put together without the stress.
        - paragraph [ref=e360]: This is more than just a store. It’s convenience. It’s comfort. It’s curated for everyday living.
      - generic [ref=e361]:
        - heading "Why XELLÉ?" [level=3] [ref=e362]
        - list [ref=e363]:
          - listitem [ref=e364]:
            - generic [ref=e365]: ✔
            - generic [ref=e366]: High-end brands at affordable prices
          - listitem [ref=e367]:
            - generic [ref=e368]: ✔
            - generic [ref=e369]: Beauty, accessories, gadgets & home essentials in one place
          - listitem [ref=e370]:
            - generic [ref=e371]: ✔
            - generic [ref=e372]: One cart. One delivery fee
          - listitem [ref=e373]:
            - generic [ref=e374]: ✔
            - generic [ref=e375]: Curated for comfort and convenience
  - contentinfo [ref=e376]:
    - generic [ref=e378]:
      - generic [ref=e379]:
        - generic [ref=e381]:
          - link "XELLÉ" [ref=e382] [cursor=pointer]:
            - /url: /
            - text: XELLÉ
          - paragraph [ref=e383]: Curating smart finds for modern, everyday living.
        - generic [ref=e384]:
          - heading "Explore" [level=4] [ref=e385]
          - list [ref=e386]:
            - listitem [ref=e387]:
              - link "Shop Collection Shop Collection" [ref=e388] [cursor=pointer]:
                - /url: /shop
                - generic [ref=e389]:
                  - generic [ref=e390]: Shop Collection
                  - generic [ref=e391]: Shop Collection
            - listitem [ref=e392]:
              - link "New Arrivals New Arrivals" [ref=e393] [cursor=pointer]:
                - /url: /shop?sort=newest
                - generic [ref=e394]:
                  - generic [ref=e395]: New Arrivals
                  - generic [ref=e396]: New Arrivals
            - listitem [ref=e397]:
              - link "Track Order Track Order" [ref=e398] [cursor=pointer]:
                - /url: /track
                - generic [ref=e399]:
                  - generic [ref=e400]: Track Order
                  - generic [ref=e401]: Track Order
            - listitem [ref=e402]:
              - link "Our Story Our Story" [ref=e403] [cursor=pointer]:
                - /url: /#about
                - generic [ref=e404]:
                  - generic [ref=e405]: Our Story
                  - generic [ref=e406]: Our Story
        - generic [ref=e407]:
          - heading "Get in Touch" [level=4] [ref=e408]
          - link "xelle.ng2026@gmail.com xelle.ng2026@gmail.com" [ref=e410] [cursor=pointer]:
            - /url: mailto:xelle.ng2026@gmail.com
            - img [ref=e412]
            - generic [ref=e415]:
              - generic [ref=e416]: xelle.ng2026@gmail.com
              - generic [ref=e417]: xelle.ng2026@gmail.com
        - generic [ref=e418]:
          - heading "Newsletter" [level=4] [ref=e419]
          - generic [ref=e420]:
            - textbox "Subscribe for updates" [ref=e421]
            - button "Subscribe" [ref=e422]:
              - img [ref=e423]
      - generic [ref=e426]:
        - paragraph [ref=e427]:
          - generic [ref=e428]: © 2026 XELLÉ.
          - generic [ref=e429]: ALL RIGHTS RESERVED.
        - generic [ref=e430]:
          - generic [ref=e431] [cursor=pointer]:
            - generic [ref=e432]: Privacy Policy
            - generic [ref=e433]: Privacy Policy
          - generic [ref=e434] [cursor=pointer]:
            - generic [ref=e435]: Terms of Service
            - generic [ref=e436]: Terms of Service
  - generic [ref=e437]:
    - button "Chat on WhatsApp"
  - alert [ref=e438]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Site Navigation & Core Pages", () => {
  4  | 	const pages = [
  5  | 		{ path: "/", name: "Homepage" },
  6  | 		{ path: "/shop", name: "Shop" },
  7  | 		{ path: "/track", name: "Order Tracking" },
  8  | 		{ path: "/stockpile", name: "Stockpile" },
  9  | 	];
  10 | 
  11 | 	for (const p of pages) {
  12 | 		test(`${p.name} page loads successfully`, async ({ page }) => {
  13 | 			const res = await page.goto(p.path);
  14 | 			const status = res?.status() || 0;
  15 | 			// Some pages may redirect (3xx → 200)
  16 | 			expect(status).toBeGreaterThanOrEqual(200);
> 17 | 			expect(status).toBeLessThan(500);
     |                   ^ Error: expect(received).toBeLessThan(expected)
  18 | 			await expect(page.locator("body")).toBeVisible();
  19 | 		});
  20 | 	}
  21 | 
  22 | 	test("navigation links work", async ({ page }) => {
  23 | 		await page.goto("/");
  24 | 		await page.waitForLoadState("networkidle");
  25 | 
  26 | 		// Find and click shop link (may be in nav or body)
  27 | 		const shopLink = page.locator("a[href='/shop']").first();
  28 | 		if (await shopLink.isVisible().catch(() => false)) {
  29 | 			await shopLink.click();
  30 | 			await page.waitForLoadState("networkidle");
  31 | 			expect(page.url()).toContain("/shop");
  32 | 		} else {
  33 | 			// Try navigating directly
  34 | 			await page.goto("/shop");
  35 | 			expect(page.url()).toContain("/shop");
  36 | 		}
  37 | 	});
  38 | 
  39 | 	test("mobile navigation works", async ({ page }) => {
  40 | 		await page.setViewportSize({ width: 375, height: 667 });
  41 | 		await page.goto("/");
  42 | 		await page.waitForLoadState("networkidle");
  43 | 
  44 | 		// Look for hamburger/menu button
  45 | 		const menuBtn = page.locator("button").filter({ hasText: "" }).first();
  46 | 		// Try common menu button patterns
  47 | 		const menuSelectors = [
  48 | 			'button[aria-label="Menu"]',
  49 | 			'button[aria-label="Open menu"]',
  50 | 			'button[aria-label="Toggle menu"]',
  51 | 		];
  52 | 
  53 | 		let menuOpened = false;
  54 | 		for (const sel of menuSelectors) {
  55 | 			const btn = page.locator(sel);
  56 | 			if (await btn.isVisible().catch(() => false)) {
  57 | 				await btn.click();
  58 | 				menuOpened = true;
  59 | 				break;
  60 | 			}
  61 | 		}
  62 | 
  63 | 		if (menuOpened) {
  64 | 			await page.waitForTimeout(500);
  65 | 			const navLink = page.locator("a[href='/shop']");
  66 | 			await expect(navLink.first()).toBeVisible({ timeout: 5_000 });
  67 | 		}
  68 | 		// If no menu button found, nav might be always visible — that's fine
  69 | 	});
  70 | });
  71 | 
```