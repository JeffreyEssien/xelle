# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Site Navigation & Core Pages >> mobile navigation works
- Location: tests/prod/e2e/navigation.spec.ts:39:6

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  locator('a[href=\'/shop\']').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('a[href=\'/shop\']').first()
    9 × locator resolved to <a href="/shop" class="group relative text-sm font-sans text-brand-dark/70 hover:text-brand-dark transition-colors duration-300 py-2">…</a>
      - unexpected value "hidden"

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - region "Notifications alt+T"
  - banner [ref=e2]:
    - navigation [ref=e3]:
      - link "XELLÉ" [ref=e4] [cursor=pointer]:
        - /url: /
        - generic [ref=e5]: XELLÉ
      - generic [ref=e6]:
        - button "Search" [ref=e7] [cursor=pointer]:
          - img [ref=e8]
        - button "Open cart" [ref=e11] [cursor=pointer]:
          - img [ref=e12]
        - button "Close menu" [active] [ref=e15] [cursor=pointer]:
          - img [ref=e16]
  - generic [ref=e20]:
    - navigation [ref=e21]:
      - list [ref=e22]:
        - listitem [ref=e23]:
          - link "Home" [ref=e24] [cursor=pointer]:
            - /url: /
        - listitem [ref=e25]:
          - link "Shop" [ref=e26] [cursor=pointer]:
            - /url: /shop
        - listitem [ref=e27]:
          - link "Stockpile" [ref=e28] [cursor=pointer]:
            - /url: /stockpile
        - listitem [ref=e29]:
          - link "Track Order" [ref=e30] [cursor=pointer]:
            - /url: /track
        - listitem [ref=e31]:
          - link "About" [ref=e32] [cursor=pointer]:
            - /url: /#about
    - paragraph [ref=e34]: XELLÉ — Luxury Redefined
  - main [ref=e35]:
    - generic [ref=e42]:
      - generic [ref=e44]: CURATED FOR EVERYDAY LIVING
      - heading "Smart. Comfortable. Intentional." [level=1] [ref=e47]:
        - generic [ref=e49]: Smart.
        - generic [ref=e51]: Comfortable.
        - generic [ref=e53]: Intentional.
      - paragraph [ref=e54]: Thoughtfully curated beauty products, accessories, home essentials, gadgets, and lifestyle finds — all in one place. Because shopping should feel easy, not overwhelming.
      - generic [ref=e55]:
        - link "Shop Collection" [ref=e56] [cursor=pointer]:
          - /url: /shop
          - button "Shop Collection" [ref=e57]
        - link "Our Story" [ref=e58] [cursor=pointer]:
          - /url: /#about
          - generic [ref=e59]: Our Story
      - button "Scroll" [ref=e61] [cursor=pointer]:
        - generic [ref=e62]: Scroll
        - img [ref=e63]
    - generic [ref=e65]:
      - generic [ref=e66]:
        - generic [ref=e67]:
          - paragraph [ref=e68]: Just Arrived
          - heading "New Arrivals" [level=2] [ref=e69]
        - link "View All" [ref=e70] [cursor=pointer]:
          - /url: /shop?sort=newest
          - generic [ref=e71]: View All
          - img [ref=e72]
      - generic [ref=e74]:
        - link "Powder puff New Powder puff beauty ₦1,500.00" [ref=e77] [cursor=pointer]:
          - /url: /product/powder-puff
          - generic [ref=e78]:
            - img "Powder puff" [ref=e79]
            - generic [ref=e82]: New
            - generic [ref=e83]:
              - button [ref=e84]:
                - img [ref=e85]
              - button [ref=e87]:
                - img [ref=e88]
          - generic [ref=e91]:
            - heading "Powder puff" [level=3] [ref=e92]
            - paragraph [ref=e93]: beauty
            - paragraph [ref=e94]: ₦1,500.00
        - link "Perfume Atomizer New Perfume Atomizer self-care ₦3,500.00" [ref=e97] [cursor=pointer]:
          - /url: /product/perfume-atomizer
          - generic [ref=e98]:
            - img "Perfume Atomizer" [ref=e99]
            - generic [ref=e102]: New
            - generic [ref=e103]:
              - button [ref=e104]:
                - img [ref=e105]
              - button [ref=e107]:
                - img [ref=e108]
          - generic [ref=e111]:
            - heading "Perfume Atomizer" [level=3] [ref=e112]
            - paragraph [ref=e113]: self-care
            - paragraph [ref=e114]: ₦3,500.00
        - link "Hair clips Only 1 left Hair clips hair ₦6,000.00" [ref=e117] [cursor=pointer]:
          - /url: /product/hair-clips
          - generic [ref=e118]:
            - img "Hair clips" [ref=e119]
            - generic [ref=e122]: Only 1 left
            - generic [ref=e123]:
              - button [ref=e124]:
                - img [ref=e125]
              - button [ref=e127]:
                - img [ref=e128]
          - generic [ref=e131]:
            - heading "Hair clips" [level=3] [ref=e132]
            - paragraph [ref=e133]: hair
            - paragraph [ref=e134]: ₦6,000.00
        - link "Teeth Strips Only 3 left Teeth Strips self-care ₦3,000.00" [ref=e137] [cursor=pointer]:
          - /url: /product/teeth-strips
          - generic [ref=e138]:
            - img "Teeth Strips" [ref=e139]
            - generic [ref=e142]: Only 3 left
            - generic [ref=e143]:
              - button [ref=e144]:
                - img [ref=e145]
              - button [ref=e147]:
                - img [ref=e148]
          - generic [ref=e151]:
            - heading "Teeth Strips" [level=3] [ref=e152]
            - paragraph [ref=e153]: self-care
            - paragraph [ref=e154]: ₦3,000.00
    - generic [ref=e157]:
      - generic [ref=e158]:
        - generic [ref=e159]:
          - paragraph [ref=e160]: Browse
          - heading "Shop by Category" [level=2] [ref=e161]
        - link "All Categories" [ref=e162] [cursor=pointer]:
          - /url: /shop
          - generic [ref=e163]: All Categories
          - img [ref=e164]
      - generic [ref=e166]:
        - link "Beauty Products Beauty Products High-end beauty essentials at affordable prices. Everyday makeup must-haves in one place." [ref=e168] [cursor=pointer]:
          - /url: /shop?category=beauty
          - generic [ref=e169]:
            - img "Beauty Products" [ref=e171]
            - generic [ref=e174]:
              - generic [ref=e175]:
                - heading "Beauty Products" [level=3] [ref=e176]
                - paragraph [ref=e177]: High-end beauty essentials at affordable prices. Everyday makeup must-haves in one place.
              - img [ref=e179]
        - link "Content Kits Content Kits Content creator must-haves for better photos and videos. Simple tools, professional results." [ref=e184] [cursor=pointer]:
          - /url: /shop?category=content
          - generic [ref=e185]:
            - img "Content Kits" [ref=e187]
            - generic [ref=e190]:
              - generic [ref=e191]:
                - heading "Content Kits" [level=3] [ref=e192]
                - paragraph [ref=e193]: Content creator must-haves for better photos and videos. Simple tools, professional results.
              - img [ref=e195]
        - link "Fragrances Fragrances Scents that leave a lasting impression." [ref=e200] [cursor=pointer]:
          - /url: /shop?category=fragrances
          - generic [ref=e201]:
            - img "Fragrances" [ref=e203]
            - generic [ref=e206]:
              - generic [ref=e207]:
                - heading "Fragrances" [level=3] [ref=e208]
                - paragraph [ref=e209]: Scents that leave a lasting impression.
              - img [ref=e211]
        - link "Gadgets Gadgets Trending gadgets and tech accessories designed for convenience and modern living." [ref=e216] [cursor=pointer]:
          - /url: /shop?category=gadgets
          - generic [ref=e217]:
            - img "Gadgets" [ref=e219]
            - generic [ref=e222]:
              - generic [ref=e223]:
                - heading "Gadgets" [level=3] [ref=e224]
                - paragraph [ref=e225]: Trending gadgets and tech accessories designed for convenience and modern living.
              - img [ref=e227]
        - link "Gift Set Gift Set Perfectly Curated Gift boxes" [ref=e232] [cursor=pointer]:
          - /url: /shop?category=gift-set
          - generic [ref=e233]:
            - img "Gift Set" [ref=e235]
            - generic [ref=e238]:
              - generic [ref=e239]:
                - heading "Gift Set" [level=3] [ref=e240]
                - paragraph [ref=e241]: Perfectly Curated Gift boxes
              - img [ref=e243]
        - link "Hair Care Hair Care Everyday hair care essentials for healthy, styled, confident hair." [ref=e248] [cursor=pointer]:
          - /url: /shop?category=hair
          - generic [ref=e249]:
            - img "Hair Care" [ref=e251]
            - generic [ref=e254]:
              - generic [ref=e255]:
                - heading "Hair Care" [level=3] [ref=e256]
                - paragraph [ref=e257]: Everyday hair care essentials for healthy, styled, confident hair.
              - img [ref=e259]
        - link "Handbags Handbags Chic, everyday handbags that elevate your outfit effortlessly. Stylish, functional, and perfect for on-the-go looks." [ref=e264] [cursor=pointer]:
          - /url: /shop?category=handbags
          - generic [ref=e265]:
            - img "Handbags" [ref=e267]
            - generic [ref=e270]:
              - generic [ref=e271]:
                - heading "Handbags" [level=3] [ref=e272]
                - paragraph [ref=e273]: Chic, everyday handbags that elevate your outfit effortlessly. Stylish, functional, and perfect for on-the-go looks.
              - img [ref=e275]
        - link "Home Care/Essentials Home Care/Essentials Practical home essentials that keep your space clean, organized, and aesthetic." [ref=e280] [cursor=pointer]:
          - /url: /shop?category=home
          - generic [ref=e281]:
            - img "Home Care/Essentials" [ref=e283]
            - generic [ref=e286]:
              - generic [ref=e287]:
                - heading "Home Care/Essentials" [level=3] [ref=e288]
                - paragraph [ref=e289]: Practical home essentials that keep your space clean, organized, and aesthetic.
              - img [ref=e291]
        - link "Kitchen Kitchen Smart kitchen tools and accessories that make cooking and storage easier." [ref=e296] [cursor=pointer]:
          - /url: /shop?category=kitchen
          - generic [ref=e297]:
            - img "Kitchen" [ref=e299]
            - generic [ref=e302]:
              - generic [ref=e303]:
                - heading "Kitchen" [level=3] [ref=e304]
                - paragraph [ref=e305]: Smart kitchen tools and accessories that make cooking and storage easier.
              - img [ref=e307]
        - link "Message Pad Message Pad A Christian journal designed for sermon notes, prayers, and intentional faith growth." [ref=e312] [cursor=pointer]:
          - /url: /shop?category=message-pad
          - generic [ref=e313]:
            - img "Message Pad" [ref=e315]
            - generic [ref=e318]:
              - generic [ref=e319]:
                - heading "Message Pad" [level=3] [ref=e320]
                - paragraph [ref=e321]: A Christian journal designed for sermon notes, prayers, and intentional faith growth.
              - img [ref=e323]
        - link "Self Care Self Care Comfort, glow, and soft-life energy." [ref=e328] [cursor=pointer]:
          - /url: /shop?category=self-care
          - generic [ref=e329]:
            - img "Self Care" [ref=e331]
            - generic [ref=e334]:
              - generic [ref=e335]:
                - heading "Self Care" [level=3] [ref=e336]
                - paragraph [ref=e337]: Comfort, glow, and soft-life energy.
              - img [ref=e339]
    - generic [ref=e345]:
      - generic [ref=e346]:
        - paragraph [ref=e347]: Our Story
        - heading "The Comfort of Smart Living" [level=2] [ref=e348]
      - generic [ref=e349]:
        - paragraph [ref=e350]: "XELLÉ was created from a simple idea: everyday living should feel elevated without being expensive or complicated."
        - paragraph [ref=e351]: As a chronic online shopper, I was tired of buying from multiple stores and paying delivery fees over and over again. I wanted one space where you could find quality beauty products, chic accessories, home essentials, gadgets, and more — all carefully selected and reasonably priced.
        - paragraph [ref=e352]: At XELLÉ, we focus on high-end finds at affordable prices and everyday essentials that make life easier. Convenience you can rely on. Quality you can trust. Pieces that help you feel put together without the stress.
        - paragraph [ref=e353]: This is more than just a store. It’s convenience. It’s comfort. It’s curated for everyday living.
      - generic [ref=e354]:
        - heading "Why XELLÉ?" [level=3] [ref=e355]
        - list [ref=e356]:
          - listitem [ref=e357]:
            - generic [ref=e358]: ✔
            - generic [ref=e359]: High-end brands at affordable prices
          - listitem [ref=e360]:
            - generic [ref=e361]: ✔
            - generic [ref=e362]: Beauty, accessories, gadgets & home essentials in one place
          - listitem [ref=e363]:
            - generic [ref=e364]: ✔
            - generic [ref=e365]: One cart. One delivery fee
          - listitem [ref=e366]:
            - generic [ref=e367]: ✔
            - generic [ref=e368]: Curated for comfort and convenience
  - contentinfo [ref=e369]:
    - generic [ref=e371]:
      - generic [ref=e372]:
        - generic [ref=e374]:
          - link "XELLÉ" [ref=e375] [cursor=pointer]:
            - /url: /
            - text: XELLÉ
          - paragraph [ref=e376]: Curating smart finds for modern, everyday living.
        - generic [ref=e377]:
          - heading "Explore" [level=4] [ref=e378]
          - list [ref=e379]:
            - listitem [ref=e380]:
              - link "Shop Collection Shop Collection" [ref=e381] [cursor=pointer]:
                - /url: /shop
                - generic [ref=e382]:
                  - generic [ref=e383]: Shop Collection
                  - generic [ref=e384]: Shop Collection
            - listitem [ref=e385]:
              - link "New Arrivals New Arrivals" [ref=e386] [cursor=pointer]:
                - /url: /shop?sort=newest
                - generic [ref=e387]:
                  - generic [ref=e388]: New Arrivals
                  - generic [ref=e389]: New Arrivals
            - listitem [ref=e390]:
              - link "Track Order Track Order" [ref=e391] [cursor=pointer]:
                - /url: /track
                - generic [ref=e392]:
                  - generic [ref=e393]: Track Order
                  - generic [ref=e394]: Track Order
            - listitem [ref=e395]:
              - link "Our Story Our Story" [ref=e396] [cursor=pointer]:
                - /url: /#about
                - generic [ref=e397]:
                  - generic [ref=e398]: Our Story
                  - generic [ref=e399]: Our Story
        - generic [ref=e400]:
          - heading "Get in Touch" [level=4] [ref=e401]
          - link "xelle.ng2026@gmail.com xelle.ng2026@gmail.com" [ref=e403] [cursor=pointer]:
            - /url: mailto:xelle.ng2026@gmail.com
            - img [ref=e405]
            - generic [ref=e408]:
              - generic [ref=e409]: xelle.ng2026@gmail.com
              - generic [ref=e410]: xelle.ng2026@gmail.com
        - generic [ref=e411]:
          - heading "Newsletter" [level=4] [ref=e412]
          - generic [ref=e413]:
            - textbox "Subscribe for updates" [ref=e414]
            - button "Subscribe" [ref=e415]:
              - img [ref=e416]
      - generic [ref=e419]:
        - paragraph [ref=e420]:
          - generic [ref=e421]: © 2026 XELLÉ.
        - generic [ref=e422]:
          - generic [ref=e423] [cursor=pointer]:
            - generic [ref=e424]: Privacy Policy
            - generic [ref=e425]: Privacy Policy
          - generic [ref=e426] [cursor=pointer]:
            - generic [ref=e427]: Terms of Service
            - generic [ref=e428]: Terms of Service
  - generic [ref=e429]:
    - generic [ref=e430]:
      - button [ref=e431] [cursor=pointer]:
        - img [ref=e432]
      - paragraph [ref=e435]:
        - text: 👋 Need help?
        - text: Chat with us on WhatsApp!
    - button "Chat on WhatsApp" [ref=e436] [cursor=pointer]:
      - img [ref=e437]
  - alert [ref=e439]
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
  17 | 			expect(status).toBeLessThan(500);
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
> 66 | 			await expect(navLink.first()).toBeVisible({ timeout: 5_000 });
     |                                  ^ Error: expect(locator).toBeVisible() failed
  67 | 		}
  68 | 		// If no menu button found, nav might be always visible — that's fine
  69 | 	});
  70 | });
  71 | 
```