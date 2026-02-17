import { NextResponse } from "next/server";
import type { Order } from "@/types";
import { createOrder } from "@/lib/queries";

const ADMIN_EMAIL = "mrsamoladapo@gmail.com";

export async function POST(request: Request) {
  try {
    const order: Order = await request.json();

    // Insert into Supabase
    await createOrder(order);

    // --- Admin notification ---
    const adminEmail = buildAdminEmail(order);
    console.log(`\n📧 ADMIN EMAIL → ${ADMIN_EMAIL}`);
    console.log("─".repeat(50));
    console.log(adminEmail);
    console.log("─".repeat(50));

    // --- Customer receipt email ---
    const customerEmail = buildCustomerEmail(order);
    console.log(`\n📧 CUSTOMER RECEIPT → ${order.email}`);
    console.log("─".repeat(50));
    console.log(customerEmail);
    console.log("─".repeat(50));

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (err) {
    console.error("Order error:", err);
    return NextResponse.json({ success: false, error: "Failed to process order" }, { status: 500 });
  }
}

function formatItems(order: Order): string {
  return order.items
    .map((i) => `  • ${i.product.name} ×${i.quantity}  —  ₦${(i.product.price * i.quantity).toFixed(2)}`)
    .join("\n") || "  (no items listed)";
}

function buildAdminEmail(order: Order): string {
  const a = order.shippingAddress;
  return `
🛍️  NEW ORDER: ${order.id}
Date: ${new Date(order.createdAt).toLocaleString()}

CUSTOMER
  Name:  ${order.customerName}
  Email: ${order.email}
  Phone: ${order.phone}

DELIVERY ADDRESS
  ${a.address}
  ${a.city}, ${a.state} ${a.zip}
  ${a.country}

ITEMS
${formatItems(order)}

TOTALS
  Subtotal: ₦${order.subtotal.toFixed(2)}
  Shipping: ${order.shipping === 0 ? "Free" : `₦${order.shipping.toFixed(2)}`}
  Total:    ₦${order.total.toFixed(2)}

Status: ${order.status.toUpperCase()}
`.trim();
}

function buildCustomerEmail(order: Order): string {
  const a = order.shippingAddress;
  return `
Hi ${a.firstName},

Thank you for your XELLÉ order! Here's your receipt.

ORDER: ${order.id}
Date:  ${new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

ITEMS
${formatItems(order)}

SUBTOTAL:  ₦${order.subtotal.toFixed(2)}
SHIPPING:  ${order.shipping === 0 ? "Free" : `₦${order.shipping.toFixed(2)}`}
TOTAL:     ₦${order.total.toFixed(2)}

SHIPPING TO
  ${a.address}
  ${a.city}, ${a.state} ${a.zip}
  ${a.country}

We'll send you tracking info once your order ships.

With love,
The XELLÉ Team
`.trim();
}
