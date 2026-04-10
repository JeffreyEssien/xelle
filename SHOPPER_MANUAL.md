# XELLE Shopper's Manual

Welcome to **XELLE** — your destination for curated, high-end lifestyle products. This guide walks you through everything you can do on our platform, from browsing to receiving your order.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Browsing the Homepage](#2-browsing-the-homepage)
3. [Shopping for Products](#3-shopping-for-products)
4. [Product Details](#4-product-details)
5. [Your Cart](#5-your-cart)
6. [Checkout](#6-checkout)
7. [Payment Methods](#7-payment-methods)
8. [Delivery Information](#8-delivery-information)
9. [Tracking Your Order](#9-tracking-your-order)
10. [The Stockpile Feature](#10-the-stockpile-feature)
11. [Getting Help](#11-getting-help)

---

## 1. Getting Started

### Navigating the Site

The top navigation bar is always visible and gives you quick access to every section of the site:

| Link | What It Does |
|------|-------------|
| **Home** | Returns you to the homepage |
| **Shop** | Browse the full product catalog |
| **Stockpile** | Look up or manage your pay-now-ship-later bundle |
| **Track Order** | Check the status of an existing order |
| **About** | Learn about the XELLE brand story |

On the right side of the navigation bar you will find:

- **Search icon** — Click to open the search bar. Type at least 2 characters and live results will appear showing matching product names, categories, and prices. Click a result to go directly to that product, or press Enter to see full search results in the shop.
- **Cart icon** — Shows a badge with the number of items in your cart. Click to open the cart sidebar.

On mobile, the navigation links are accessed through the hamburger menu icon on the far right.

### WhatsApp Button

A floating green WhatsApp button appears in the bottom-right corner of every page. Tap it to start a conversation with the XELLE team. It opens WhatsApp with a pre-filled greeting message so you can ask questions, get help, or inquire about products.

---

## 2. Browsing the Homepage

The homepage is designed to help you discover products quickly.

### Hero Section

The large banner at the top showcases the brand and features a **"Shop Collection"** button that takes you directly to the shop. Below the hero text you will also find an **"Our Story"** link that scrolls you down to learn more about the brand.

### New Arrivals

Just below the hero, a grid of the latest products is displayed. Each product shows its image, name, and price. Click any product to view its full details, or click **"View All"** to see all new arrivals in the shop with the newest-first sort applied.

### Shop by Category

A grid of category tiles helps you jump straight to a specific type of product. Each tile shows the category image and name. Clicking one takes you to the shop filtered to that category.

### Our Story

The About section at the bottom of the homepage describes the XELLE mission, values, and a list of reasons to shop with XELLE. This section is also accessible by clicking "About" in the navigation.

---

## 3. Shopping for Products

### The Shop Page

**URL:** `/shop`

When you visit the shop, all products are displayed in a grid. At the top you will see:

- **Product count** — Shows how many products match your current filters (e.g. "24 products").
- **Sort dropdown** — Click to sort products by:
  - Featured (default)
  - Newest
  - Price: Low to High
  - Price: High to Low
  - Name: A to Z
- **Layout toggle** (desktop only) — Switch between grid view and list view.

### Filtering Products

On desktop, a filter sidebar appears on the left. On mobile, tap the **"Filters"** button to open the filter drawer.

Available filters:

- **Category** — Select a specific product category to narrow results.
- **Brand** — Filter by brand name.
- **Price Range** — Adjust the slider to set a minimum and maximum price.

When filters are active, a **"Clear filters"** button appears to reset everything. On mobile, a **"Show N Results"** button at the bottom of the filter drawer confirms your selection and closes the drawer.

### Search

You can search for products from any page using the search icon in the navigation bar. Type your query (minimum 2 characters) and live results appear in a dropdown showing:

- Product thumbnail image
- Product name
- Category
- Price

Click a result to go to that product page, or press Enter to search the full shop.

You can also arrive at the shop with a search pre-filled via URL, for example: `/shop?q=dress`.

---

## 4. Product Details

**URL:** `/product/[product-name]`

Clicking any product takes you to its detail page.

### What You Will See

**Breadcrumb navigation** at the top shows your path: Home > Shop > Category > Product Name. Each breadcrumb is clickable.

**Product images** are displayed on the left (or top on mobile). If the product has multiple images, thumbnails are shown below the main image.

**Product information** on the right includes:

- **Category** — Shown as a small label above the title.
- **Product name** — Large heading.
- **Brand** — Shown as "by [Brand Name]".
- **Price** — Displayed prominently in Naira. If you select a variant with a different price, this updates.

### Variants

If the product comes in different options (such as size, color, or scent), they are shown as buttons under an **"OPTIONS"** heading. Click a variant to select it. The selected variant is highlighted with a dark background. Selecting a variant may update the displayed price and stock.

### Stock Status

A stock indicator shows whether the product is available:

- **In stock** — Shown in green with the quantity available.
- **Low stock** — Shown in amber/orange when fewer than 5 units remain.
- **Out of stock** — Shown in red. You will not be able to add the product to your cart.

### Add to Cart

Click the **"Add to Cart"** button to add the product (with your selected variant, if applicable) to your cart. The button briefly changes to show a checkmark and **"Added to Cart!"** to confirm. The cart icon in the navigation bar updates its count.

If the product is out of stock, the button changes to **"Sold Out"** and is disabled.

You cannot add more units than are available in stock. If you try to exceed the available quantity, the action is silently blocked.

### Ask on WhatsApp

Below the Add to Cart button, a green **"Ask About This on WhatsApp"** button lets you inquire about the product directly. Clicking it opens WhatsApp with a pre-filled message that includes the product name and price.

### Trust Badges

Three badges at the bottom of the product info provide reassurance:

- **Fast Delivery** — "Nationwide"
- **Authentic** — "100% Genuine"
- **Easy Returns** — "7-day Policy"

### Description & Details Tabs

Two tabs below the product info let you switch between:

- **Description** — The full product description with formatted text.
- **Details** — A table showing the brand, category, and SKU.

---

## 5. Your Cart

### Opening the Cart

Click the **cart icon** (shopping bag) in the navigation bar to open the cart sidebar, which slides in from the right.

### Empty Cart

If your cart is empty, you will see:

- A shopping bag icon
- The message **"Your cart is empty"**
- A **"Start Shopping"** button that takes you to the shop

### Cart With Items

Each item in your cart shows:

- **Product thumbnail** image
- **Product name**
- **Variant name** (if applicable, shown in small text below the name)
- **Total price** for that item (unit price multiplied by quantity)
- **Quantity controls:**
  - **Minus (-)** button to decrease quantity. Reducing to 0 removes the item.
  - **Current quantity** displayed in the center.
  - **Plus (+)** button to increase quantity. You cannot exceed available stock.
- **Trash icon** to remove the item entirely.

Items animate out when removed.

### Cart Summary

At the bottom of the cart sidebar:

- **Subtotal** — The sum of all item prices.
- **Shipping** — Shows "Calculated at checkout" (the exact fee depends on your delivery location).
- **Checkout button** — A large button labeled **"Checkout"** with an arrow icon. Click to proceed to checkout.

A delivery info banner at the top of the items list reminds you: "Delivery fee is calculated at checkout based on your location."

---

## 6. Checkout

**URL:** `/checkout`

### Before You Begin

If your cart is empty, the checkout page will show a message directing you to the shop. You must have at least one item in your cart to proceed.

### Checkout Form

The checkout page is divided into two sections: the form on the left and the order summary on the right (side by side on desktop, stacked on mobile).

#### Section 1: Contact Information

All fields are required:

| Field | Type | Description |
|-------|------|-------------|
| First Name | Text | Your first name |
| Last Name | Text | Your last name |
| Email | Email | The email address used for order confirmations and tracking |
| Phone | Phone | Your phone number for delivery coordination |

#### Section 2: Delivery Details

| Field | Type | Description |
|-------|------|-------------|
| Street Address | Text | Your full delivery address |
| State | Dropdown | Select your Nigerian state (all 36 states + FCT available) |

**What happens after you select a state depends on your location:**

##### If you select Lagos:

An **Area** dropdown appears, grouped by delivery zone. Each zone group shows its name and fee:

- **Island Core — N3,500** — Ikate, Lekki Phase 1, Chevron, Osapa London, Ikoyi, Victoria Island (VI), Oniru, Banana Island, Salem, Jakande, Agungi, Ajah, Ikota
- **Island Extension — N5,000** — Sangotedo, Awoyaya, Marina, CMS, Apapa, Ijora, Mile 2, Festac, Satellite Town, Trade Fair, LASU (Ojo), Iyana Iba
- **Mainland Core — N5,000** — Surulere, Ojuelegba, Mushin, Isolo, Oshodi, Anthony, Maryland, Palmgrove, Shomolu, Bariga, Gbagada, Oworoshoki, Yaba, Ebute Metta, Oyingbo, Fadeyi, Jibowu, Ikeja, Ogba, Ojota, Ketu, Ogudu, Magodo, Iju Ishaga, LUTH (Idi-Araba)
- **Mainland Extension — N6,000** — Ikorodu, Ikotun, Egbeda, Ipaja, Iyana Ipaja, Ayobo, Command, Abule Egba, Agege, Dopemu, Fagba, Isheri Olowora, Akute, Berger, Lambe Alagbado, Ishashi, Igando, Ejigbo, Ago Palace

After selecting your area, a result card confirms your zone and the delivery fee. If a promotional discount is active on your zone, both the original and discounted fees are shown.

##### If you select an interstate state (outside Lagos):

A **City** dropdown appears with cities available for delivery in that state. After selecting a city, you must choose a **Delivery Type**:

- **Doorstep Delivery** — Delivered directly to your address. Takes 3-5 working days. Higher fee.
- **Hub Pickup** — Pick up your package from a delivery hub near you. Takes 1-3 days after dispatch. Lower fee.

Each option shows the price and estimated delivery time. A result card confirms your selection.

##### If your state is not covered:

A message appears explaining that delivery to your state is not yet available and suggesting you contact XELLE via WhatsApp for assistance.

#### Coupon Code

An expandable **"Have a coupon code?"** section lets you enter a discount code. Type your code and click **"Apply"**. If valid, the discount is applied to your order and shown as a green badge with the code name and percentage. Click the X on the badge to remove it and try a different code.

#### Stockpile Mode

A checkbox labeled **"Add items to Stockpile instead of ordering now"** lets you opt into the Stockpile feature. When checked, delivery details become optional because your items will be stored for up to 14 days before shipping. See Section 10 for full details on Stockpile.

### Order Summary

The right panel shows:

- **Each item** in your order with its thumbnail, name, variant (if any), quantity, and price.
- **Subtotal** — Sum of all item prices.
- **Discount** — Shown in green if a coupon is applied, with the amount deducted.
- **Shipping** — The delivery fee based on your selected location.
- **Total** — The final amount you need to pay, shown in large bold text.

---

## 7. Payment Methods

At checkout, you choose how to pay:

### Option 1: WhatsApp Payment (Recommended)

Select **"Pay via WhatsApp"** and submit the form. You will be redirected to WhatsApp with a pre-filled message containing your complete order details (order ID, items, delivery address, and total). The XELLE team will respond with payment instructions.

### Option 2: Bank Transfer

Select **"Direct Bank Transfer"** and submit the form. A payment panel appears with:

1. **The exact amount to pay** — Displayed prominently with your order ID.
2. **Bank account details:**
   - **Bank:** Pocketapp
   - **Account Number:** 9765752252
   - **Account Name:** Excellence Okey Orji
   - Each detail has a **Copy** button for easy copying.
3. **Payment confirmation form** — After you transfer the money, enter the **name on the account you sent payment from** and click **"Confirm Payment Sent"**.

After confirming, you will see a **"Payment Submitted!"** banner with your order ID and a note that the admin will verify your payment. A link to **"Track Your Order"** is provided.

### Order Confirmation

After a successful order via WhatsApp, or after bank transfer confirmation, you receive:

- A confirmation receipt showing all order details.
- A **"Print Receipt"** button for your records.
- A **"Continue Shopping"** button to return to the shop.
- An email confirmation sent to the address you provided.

---

## 8. Delivery Information

### Lagos Delivery

All Lagos deliveries are doorstep delivery. Fees are based on your zone:

| Zone | Fee | Areas |
|------|-----|-------|
| Island Core | N3,500 | Ikate, Lekki Phase 1, Chevron, Osapa London, Ikoyi, Victoria Island, Oniru, Banana Island, Salem, Jakande, Agungi, Ajah, Ikota |
| Island Extension | N5,000 | Sangotedo, Awoyaya, Marina, CMS, Apapa, Ijora, Mile 2, Festac, Satellite Town, Trade Fair, LASU (Ojo), Iyana Iba |
| Mainland Core | N5,000 | Surulere, Ojuelegba, Mushin, Isolo, Oshodi, Anthony, Maryland, Palmgrove, Shomolu, Bariga, Gbagada, Oworoshoki, Yaba, Ebute Metta, Oyingbo, Fadeyi, Jibowu, Ikeja, Ogba, Ojota, Ketu, Ogudu, Magodo, Iju Ishaga, LUTH (Idi-Araba) |
| Mainland Extension | N6,000 | Ikorodu, Ikotun, Egbeda, Ipaja, Iyana Ipaja, Ayobo, Command, Abule Egba, Agege, Dopemu, Fagba, Isheri Olowora, Akute, Berger, Lambe Alagbado, Ishashi, Igando, Ejigbo, Ago Palace |

Lagos delivery typically takes 1-3 working days depending on your zone.

### Interstate Delivery

Interstate deliveries are available to states across Nigeria. Two delivery options:

| Option | Cost | Time |
|--------|------|------|
| Hub Pickup | Lower fee | 1-3 days after dispatch |
| Doorstep Delivery | Higher fee | 3-5 working days |

**Sample interstate pricing:**

| State | City | Hub Pickup | Doorstep |
|-------|------|-----------|----------|
| Oyo | Ibadan | N3,500 | N6,000 |
| Ogun | Abeokuta | N3,500 | N6,500 |
| Edo | Benin City | N4,000 | N7,000 |
| Delta | Warri | N4,000 | N7,000 |
| Rivers | Port Harcourt | N4,000 | N8,000 |
| Anambra | Onitsha | N4,000 | N8,000 |
| Enugu | Enugu | N4,000 | N8,000 |

### Important Delivery Terms

- Pricing applies to items weighing between 0-2 kg.
- Each additional kilogram attracts a N1,000 surcharge.
- An additional fee of N500 may apply for remote area deliveries.
- Promotional discounts on delivery fees may be available and are shown at checkout.

---

## 9. Tracking Your Order

**URL:** `/track`

### How to Track

1. Go to the **Track Order** page (via the navigation bar or the link in your confirmation email).
2. Enter your **Order ID** (e.g. `ORD-1712345678901`) in the first field.
3. Enter the **email address** you used at checkout in the second field.
4. Click **"Track Order"**.

Your Order ID is included in your confirmation email.

### What You Will See

If your order is found, the tracking page shows:

#### Order Status Timeline

A visual timeline with three steps:

1. **Order Placed** — Your order has been received.
2. **Shipped** — Your order is on its way.
3. **Delivered** — Your order has arrived.

The current step is highlighted and previous steps are marked as complete.

#### Payment Status (for bank transfers)

If you paid by bank transfer, a separate status indicator shows:

- **Awaiting Payment** — You have not yet confirmed payment.
- **Payment Submitted** — You confirmed the transfer; the admin is reviewing.
- **Payment Confirmed** — Your payment has been verified.

#### Order Details

- **Order items** — Each product with its image, name, variant, quantity, and price.
- **Totals** — Subtotal, discount (if applied), shipping, and total.
- **Shipping address** — Your full delivery address.
- **Payment information** — The payment method used and its current status.

A **"Continue Shopping"** button at the bottom takes you back to the shop.

### If Your Order Is Not Found

An error message appears: **"No order found with that ID and email combination."** Double-check your Order ID and email and try again.

---

## 10. The Stockpile Feature

**URL:** `/stockpile`

Stockpile is XELLE's **pay-now-ship-later** feature. It lets you buy items over time and ship them all together with a single delivery fee.

### How It Works

1. **Shop & Pay** — Browse and purchase items as you find them. At checkout, check the **"Add items to Stockpile"** box. You pay for the items but they are held instead of shipped.
2. **Items Held** — Your paid items are securely stored for up to **14 days** while you continue shopping and adding more items to your stockpile.
3. **Ship Together** — When you are ready, visit the Stockpile page, look up your stockpile, and click **"Request Shipping"**. You pay one delivery fee for everything.

### Looking Up Your Stockpile

1. Go to the **Stockpile** page.
2. Enter your **email address** or **Stockpile ID** in the search field.
3. Click **"Find"**.

### What You Will See

If you have an active stockpile, the page shows:

- **Status banner** — Shows whether your stockpile is Active, Shipped, or Expired, along with how many days remain.
- **Stats** — Number of items, total value paid, and days left.
- **Items list** — Every product in your stockpile with its image, name, variant, quantity, and price.
- **Stockpile ID** — Your unique ID with a Copy button. Save this for future lookups.
- **Action buttons:**
  - **"Keep Shopping"** — Go back to the shop to add more items.
  - **"Request Shipping"** — Proceeds to a special checkout flow where you only enter delivery details and pay the shipping fee.

### Requesting Shipping

When you click **"Request Shipping"**, you are taken to a special checkout page that:

- Pre-fills your contact information from your stockpile.
- Shows your stockpiled items (marked as "Already paid").
- Only requires you to enter your delivery address and pay the shipping fee.
- Does not charge you again for the items.

### Expiration

Your stockpile items are held for **14 days** from the first item added. If you do not request shipping within 14 days, your stockpile expires. You will receive an email notification before and when this happens.

- When 3 or fewer days remain, a warning message appears on the stockpile page.
- After expiration, items are released and no longer reserved.
- Contact XELLE via WhatsApp for assistance with expired stockpiles.

---

## 11. Getting Help

### WhatsApp

The fastest way to get help is through WhatsApp. Use the floating green button on any page, or message XELLE directly at **+234 701 137 8490**.

### Email

You can reach XELLE by email at **xelle.ng2026@gmail.com** for order inquiries, returns, or general questions.

### Order Issues

If you have a problem with your order:

1. First, check your order status on the **Track Order** page.
2. If payment is pending, ensure you have completed and confirmed your bank transfer.
3. For urgent issues, contact XELLE via WhatsApp with your Order ID ready.

### Returns

XELLE offers a 7-day return policy. Contact the team via WhatsApp or email with your Order ID and reason for return.

---

*This manual covers the XELLE shopping experience as of the current platform version. Features and pricing may be updated by the XELLE team at any time.*
