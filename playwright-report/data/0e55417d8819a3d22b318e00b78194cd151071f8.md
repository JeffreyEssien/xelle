# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Site Navigation & Core Pages >> navigation links work
- Location: tests/prod/e2e/navigation.spec.ts:22:6

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "/shop"
Received string:    "https://www.xelle.ng/"
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
      - list [ref=e6]:
        - listitem [ref=e7]:
          - link "Home" [ref=e8] [cursor=pointer]:
            - /url: /
            - text: Home
        - listitem [ref=e9]:
          - link "Shop" [active] [ref=e10] [cursor=pointer]:
            - /url: /shop
            - text: Shop
        - listitem [ref=e12]:
          - link "Stockpile" [ref=e13] [cursor=pointer]:
            - /url: /stockpile
            - text: Stockpile
        - listitem [ref=e14]:
          - link "Track Order" [ref=e15] [cursor=pointer]:
            - /url: /track
            - text: Track Order
        - listitem [ref=e16]:
          - link "About" [ref=e17] [cursor=pointer]:
            - /url: /#about
            - text: About
      - generic [ref=e18]:
        - button "Search" [ref=e19] [cursor=pointer]:
          - img [ref=e20]
        - button "Open cart" [ref=e23] [cursor=pointer]:
          - img [ref=e24]
  - main [ref=e27]:
    - generic [ref=e34]:
      - generic [ref=e36]: CURATED FOR EVERYDAY LIVING
      - heading "Smart. Comfortable. Intentional." [level=1] [ref=e39]:
        - generic [ref=e41]: Smart.
        - generic [ref=e43]: Comfortable.
        - generic [ref=e45]: Intentional.
      - paragraph [ref=e46]: Thoughtfully curated beauty products, accessories, home essentials, gadgets, and lifestyle finds — all in one place. Because shopping should feel easy, not overwhelming.
      - generic [ref=e47]:
        - link "Shop Collection" [ref=e48] [cursor=pointer]:
          - /url: /shop
          - button "Shop Collection" [ref=e49]
        - link "Our Story" [ref=e50] [cursor=pointer]:
          - /url: /#about
          - generic [ref=e51]: Our Story
      - button "Scroll" [ref=e53] [cursor=pointer]:
        - generic [ref=e54]: Scroll
        - img [ref=e55]
    - generic [ref=e57]:
      - generic [ref=e58]:
        - generic [ref=e59]:
          - paragraph [ref=e60]: Just Arrived
          - heading "New Arrivals" [level=2] [ref=e61]
        - link "View All" [ref=e62] [cursor=pointer]:
          - /url: /shop?sort=newest
          - generic [ref=e63]: View All
          - img [ref=e64]
      - generic [ref=e66]:
        - link "Powder puff New Add to Cart Powder puff beauty ₦1,500.00" [ref=e69] [cursor=pointer]:
          - /url: /product/powder-puff
          - generic [ref=e70]:
            - img "Powder puff" [ref=e71]
            - generic [ref=e74]: New
            - generic [ref=e75]:
              - button [ref=e76]:
                - img [ref=e77]
              - button [ref=e79]:
                - img [ref=e80]
            - button "Add to Cart" [ref=e83]:
              - img [ref=e84]
              - text: Add to Cart
          - generic [ref=e87]:
            - heading "Powder puff" [level=3] [ref=e88]
            - paragraph [ref=e89]: beauty
            - paragraph [ref=e90]: ₦1,500.00
        - link "Perfume Atomizer New Add to Cart Perfume Atomizer self-care ₦3,500.00" [ref=e93] [cursor=pointer]:
          - /url: /product/perfume-atomizer
          - generic [ref=e94]:
            - img "Perfume Atomizer" [ref=e95]
            - generic [ref=e98]: New
            - generic [ref=e99]:
              - button [ref=e100]:
                - img [ref=e101]
              - button [ref=e103]:
                - img [ref=e104]
            - button "Add to Cart" [ref=e107]:
              - img [ref=e108]
              - text: Add to Cart
          - generic [ref=e111]:
            - heading "Perfume Atomizer" [level=3] [ref=e112]
            - paragraph [ref=e113]: self-care
            - paragraph [ref=e114]: ₦3,500.00
        - link "Hair clips Only 1 left Add to Cart Hair clips hair ₦6,000.00" [ref=e117] [cursor=pointer]:
          - /url: /product/hair-clips
          - generic [ref=e118]:
            - img "Hair clips" [ref=e119]
            - generic [ref=e122]: Only 1 left
            - generic [ref=e123]:
              - button [ref=e124]:
                - img [ref=e125]
              - button [ref=e127]:
                - img [ref=e128]
            - button "Add to Cart" [ref=e131]:
              - img [ref=e132]
              - text: Add to Cart
          - generic [ref=e135]:
            - heading "Hair clips" [level=3] [ref=e136]
            - paragraph [ref=e137]: hair
            - paragraph [ref=e138]: ₦6,000.00
        - link "Teeth Strips Only 3 left Add to Cart Teeth Strips self-care ₦3,000.00" [ref=e141] [cursor=pointer]:
          - /url: /product/teeth-strips
          - generic [ref=e142]:
            - img "Teeth Strips" [ref=e143]
            - generic [ref=e146]: Only 3 left
            - generic [ref=e147]:
              - button [ref=e148]:
                - img [ref=e149]
              - button [ref=e151]:
                - img [ref=e152]
            - button "Add to Cart" [ref=e155]:
              - img [ref=e156]
              - text: Add to Cart
          - generic [ref=e159]:
            - heading "Teeth Strips" [level=3] [ref=e160]
            - paragraph [ref=e161]: self-care
            - paragraph [ref=e162]: ₦3,000.00
    - generic [ref=e165]:
      - generic [ref=e166]:
        - generic [ref=e167]:
          - paragraph [ref=e168]: Browse
          - heading "Shop by Category" [level=2] [ref=e169]
        - link "All Categories" [ref=e170] [cursor=pointer]:
          - /url: /shop
          - generic [ref=e171]: All Categories
          - img [ref=e172]
      - generic [ref=e174]:
        - link "Beauty Products Beauty Products High-end beauty essentials at affordable prices. Everyday makeup must-haves in one place." [ref=e176] [cursor=pointer]:
          - /url: /shop?category=beauty
          - generic [ref=e177]:
            - img "Beauty Products" [ref=e179]
            - generic [ref=e182]:
              - generic [ref=e183]:
                - heading "Beauty Products" [level=3] [ref=e184]
                - paragraph [ref=e185]: High-end beauty essentials at affordable prices. Everyday makeup must-haves in one place.
              - img [ref=e187]
        - link "Content Kits Content Kits Content creator must-haves for better photos and videos. Simple tools, professional results." [ref=e192] [cursor=pointer]:
          - /url: /shop?category=content
          - generic [ref=e193]:
            - img "Content Kits" [ref=e195]
            - generic [ref=e198]:
              - generic [ref=e199]:
                - heading "Content Kits" [level=3] [ref=e200]
                - paragraph [ref=e201]: Content creator must-haves for better photos and videos. Simple tools, professional results.
              - img [ref=e203]
        - link "Fragrances Fragrances Scents that leave a lasting impression." [ref=e208] [cursor=pointer]:
          - /url: /shop?category=fragrances
          - generic [ref=e209]:
            - img "Fragrances" [ref=e211]
            - generic [ref=e214]:
              - generic [ref=e215]:
                - heading "Fragrances" [level=3] [ref=e216]
                - paragraph [ref=e217]: Scents that leave a lasting impression.
              - img [ref=e219]
        - link "Gadgets Gadgets Trending gadgets and tech accessories designed for convenience and modern living." [ref=e224] [cursor=pointer]:
          - /url: /shop?category=gadgets
          - generic [ref=e225]:
            - img "Gadgets" [ref=e227]
            - generic [ref=e230]:
              - generic [ref=e231]:
                - heading "Gadgets" [level=3] [ref=e232]
                - paragraph [ref=e233]: Trending gadgets and tech accessories designed for convenience and modern living.
              - img [ref=e235]
        - link "Gift Set Gift Set Perfectly Curated Gift boxes" [ref=e240] [cursor=pointer]:
          - /url: /shop?category=gift-set
          - generic [ref=e241]:
            - img "Gift Set" [ref=e243]
            - generic [ref=e246]:
              - generic [ref=e247]:
                - heading "Gift Set" [level=3] [ref=e248]
                - paragraph [ref=e249]: Perfectly Curated Gift boxes
              - img [ref=e251]
        - link "Hair Care Hair Care Everyday hair care essentials for healthy, styled, confident hair." [ref=e256] [cursor=pointer]:
          - /url: /shop?category=hair
          - generic [ref=e257]:
            - img "Hair Care" [ref=e259]
            - generic [ref=e262]:
              - generic [ref=e263]:
                - heading "Hair Care" [level=3] [ref=e264]
                - paragraph [ref=e265]: Everyday hair care essentials for healthy, styled, confident hair.
              - img [ref=e267]
        - link "Handbags Handbags Chic, everyday handbags that elevate your outfit effortlessly. Stylish, functional, and perfect for on-the-go looks." [ref=e272] [cursor=pointer]:
          - /url: /shop?category=handbags
          - generic [ref=e273]:
            - img "Handbags" [ref=e275]
            - generic [ref=e278]:
              - generic [ref=e279]:
                - heading "Handbags" [level=3] [ref=e280]
                - paragraph [ref=e281]: Chic, everyday handbags that elevate your outfit effortlessly. Stylish, functional, and perfect for on-the-go looks.
              - img [ref=e283]
        - link "Home Care/Essentials Home Care/Essentials Practical home essentials that keep your space clean, organized, and aesthetic." [ref=e288] [cursor=pointer]:
          - /url: /shop?category=home
          - generic [ref=e289]:
            - img "Home Care/Essentials" [ref=e291]
            - generic [ref=e294]:
              - generic [ref=e295]:
                - heading "Home Care/Essentials" [level=3] [ref=e296]
                - paragraph [ref=e297]: Practical home essentials that keep your space clean, organized, and aesthetic.
              - img [ref=e299]
        - link "Kitchen Kitchen Smart kitchen tools and accessories that make cooking and storage easier." [ref=e304] [cursor=pointer]:
          - /url: /shop?category=kitchen
          - generic [ref=e305]:
            - img "Kitchen" [ref=e307]
            - generic [ref=e310]:
              - generic [ref=e311]:
                - heading "Kitchen" [level=3] [ref=e312]
                - paragraph [ref=e313]: Smart kitchen tools and accessories that make cooking and storage easier.
              - img [ref=e315]
        - link "Message Pad Message Pad A Christian journal designed for sermon notes, prayers, and intentional faith growth." [ref=e320] [cursor=pointer]:
          - /url: /shop?category=message-pad
          - generic [ref=e321]:
            - img "Message Pad" [ref=e323]
            - generic [ref=e326]:
              - generic [ref=e327]:
                - heading "Message Pad" [level=3] [ref=e328]
                - paragraph [ref=e329]: A Christian journal designed for sermon notes, prayers, and intentional faith growth.
              - img [ref=e331]
        - link "Self Care Self Care Comfort, glow, and soft-life energy." [ref=e336] [cursor=pointer]:
          - /url: /shop?category=self-care
          - generic [ref=e337]:
            - img "Self Care" [ref=e339]
            - generic [ref=e342]:
              - generic [ref=e343]:
                - heading "Self Care" [level=3] [ref=e344]
                - paragraph [ref=e345]: Comfort, glow, and soft-life energy.
              - img [ref=e347]
    - generic [ref=e353]:
      - generic [ref=e354]:
        - paragraph [ref=e355]: Our Story
        - heading "The Comfort of Smart Living" [level=2] [ref=e356]
      - generic [ref=e357]:
        - paragraph [ref=e358]: "XELLÉ was created from a simple idea: everyday living should feel elevated without being expensive or complicated."
        - paragraph [ref=e359]: As a chronic online shopper, I was tired of buying from multiple stores and paying delivery fees over and over again. I wanted one space where you could find quality beauty products, chic accessories, home essentials, gadgets, and more — all carefully selected and reasonably priced.
        - paragraph [ref=e360]: At XELLÉ, we focus on high-end finds at affordable prices and everyday essentials that make life easier. Convenience you can rely on. Quality you can trust. Pieces that help you feel put together without the stress.
        - paragraph [ref=e361]: This is more than just a store. It’s convenience. It’s comfort. It’s curated for everyday living.
      - generic [ref=e362]:
        - heading "Why XELLÉ?" [level=3] [ref=e363]
        - list [ref=e364]:
          - listitem [ref=e365]:
            - generic [ref=e366]: ✔
            - generic [ref=e367]: High-end brands at affordable prices
          - listitem [ref=e368]:
            - generic [ref=e369]: ✔
            - generic [ref=e370]: Beauty, accessories, gadgets & home essentials in one place
          - listitem [ref=e371]:
            - generic [ref=e372]: ✔
            - generic [ref=e373]: One cart. One delivery fee
          - listitem [ref=e374]:
            - generic [ref=e375]: ✔
            - generic [ref=e376]: Curated for comfort and convenience
  - contentinfo [ref=e377]:
    - generic [ref=e379]:
      - generic [ref=e380]:
        - generic [ref=e382]:
          - link "XELLÉ" [ref=e383] [cursor=pointer]:
            - /url: /
            - text: XELLÉ
          - paragraph [ref=e384]: Curating smart finds for modern, everyday living.
        - generic [ref=e385]:
          - heading "Explore" [level=4] [ref=e386]
          - list [ref=e387]:
            - listitem [ref=e388]:
              - link "Shop Collection Shop Collection" [ref=e389] [cursor=pointer]:
                - /url: /shop
                - generic [ref=e390]:
                  - generic [ref=e391]: Shop Collection
                  - generic [ref=e392]: Shop Collection
            - listitem [ref=e393]:
              - link "New Arrivals New Arrivals" [ref=e394] [cursor=pointer]:
                - /url: /shop?sort=newest
                - generic [ref=e395]:
                  - generic [ref=e396]: New Arrivals
                  - generic [ref=e397]: New Arrivals
            - listitem [ref=e398]:
              - link "Track Order Track Order" [ref=e399] [cursor=pointer]:
                - /url: /track
                - generic [ref=e400]:
                  - generic [ref=e401]: Track Order
                  - generic [ref=e402]: Track Order
            - listitem [ref=e403]:
              - link "Our Story Our Story" [ref=e404] [cursor=pointer]:
                - /url: /#about
                - generic [ref=e405]:
                  - generic [ref=e406]: Our Story
                  - generic [ref=e407]: Our Story
        - generic [ref=e408]:
          - heading "Get in Touch" [level=4] [ref=e409]
          - link "xelle.ng2026@gmail.com xelle.ng2026@gmail.com" [ref=e411] [cursor=pointer]:
            - /url: mailto:xelle.ng2026@gmail.com
            - img [ref=e413]
            - generic [ref=e416]:
              - generic [ref=e417]: xelle.ng2026@gmail.com
              - generic [ref=e418]: xelle.ng2026@gmail.com
        - generic [ref=e419]:
          - heading "Newsletter" [level=4] [ref=e420]
          - generic [ref=e421]:
            - textbox "Subscribe for updates" [ref=e422]
            - button "Subscribe" [ref=e423]:
              - img [ref=e424]
      - generic [ref=e427]:
        - paragraph [ref=e428]:
          - generic [ref=e429]: © 2026 XELLÉ.
          - generic [ref=e430]: ALL RIGHTS RESERVED.
        - generic [ref=e431]:
          - generic [ref=e432] [cursor=pointer]:
            - generic [ref=e433]: Privacy Policy
            - generic [ref=e434]: Privacy Policy
          - generic [ref=e435] [cursor=pointer]:
            - generic [ref=e436]: Terms of Service
            - generic [ref=e437]: Terms of Service
  - button "Chat on WhatsApp" [ref=e439] [cursor=pointer]:
    - img [ref=e440]
  - alert [ref=e442]
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
> 31 | 			expect(page.url()).toContain("/shop");
     |                       ^ Error: expect(received).toContain(expected) // indexOf
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