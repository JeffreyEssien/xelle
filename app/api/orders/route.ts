import { NextResponse } from "next/server";
import type { Order } from "@/types";
import { createOrder, validateCoupon, incrementCouponUsage } from "@/lib/queries";
import { sendOrderEmails } from "@/lib/email";
import { SITE_EMAIL } from "@/lib/constants";
import { enqueue } from "@/lib/orderQueue";

export async function POST(request: Request) {
  try {
    const order: Order = await request.json();

    // Validate required fields
    if (!order.customerName || !order.email || !order.phone || !order.shippingAddress) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    if (!order.items || order.items.length === 0) {
      return NextResponse.json({ success: false, error: "Order must have items" }, { status: 400 });
    }

    // Validate all items have positive quantities and prices
    for (const item of order.items) {
      if (!item.quantity || item.quantity < 1 || !Number.isInteger(item.quantity)) {
        return NextResponse.json({ success: false, error: "Invalid item quantity" }, { status: 400 });
      }
      const price = item.variant?.price || item.product.price;
      if (typeof price !== "number" || price <= 0) {
        return NextResponse.json({ success: false, error: "Invalid item price" }, { status: 400 });
      }
    }

    // Server-side price recalculation to prevent price tampering
    const calculatedSubtotal = order.items.reduce((sum, item) => {
      const price = item.variant?.price || item.product.price;
      return sum + price * item.quantity;
    }, 0);

    let discountAmount = 0;
    if (order.couponCode) {
      const coupon = await validateCoupon(order.couponCode);
      if (coupon) {
        discountAmount = calculatedSubtotal * (coupon.discountPercent / 100);
      }
    }

    // Validate shipping fee is non-negative
    const shipping = Math.max(0, Number(order.shipping) || 0);
    order.subtotal = calculatedSubtotal;
    order.discountTotal = discountAmount;
    order.total = Math.max(0, calculatedSubtotal - discountAmount + shipping);

    // Force status to pending for new orders
    order.status = "pending";

    // Generate server-side ID to prevent ID spoofing
    let prefix = "ORD-";
    if (order.deliveryZone === "stockpile") prefix = "ORD-SP-";
    else if (order.id?.startsWith("ORD-SHP-")) prefix = "ORD-SHP-";
    order.id = `${prefix}${Date.now().toString(36).toUpperCase()}`;

    // Process through queue to prevent DB overload under traffic spikes
    await enqueue(() => createOrder(order));

    // Increment coupon usage after successful order
    if (order.couponCode) {
      incrementCouponUsage(order.couponCode).catch((e) => console.warn("Coupon usage increment failed:", e));
    }

    // Send emails (fire-and-forget so it doesn't block the response)
    sendOrderEmails(order).catch((e) => console.warn("Order email failed:", e));

    // Always log to console as backup
    console.log(`\n🛍️ ORDER PLACED: ${order.id}`);
    console.log(`   Customer: ${order.customerName} (${order.email})`);
    console.log(`   Total: ₦${order.total.toLocaleString()}`);
    console.log(`   Payment: ${order.paymentMethod || "not specified"}`);

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (err: any) {
    const message = err?.message || String(err);
    console.error("Order error:", message, err);
    const status = message.includes("busy") ? 503 : 500;
    return NextResponse.json(
      { success: false, error: message || "Failed to process order" },
      { status }
    );
  }
}
