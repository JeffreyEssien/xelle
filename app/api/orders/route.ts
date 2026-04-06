import { NextResponse } from "next/server";
import type { Order } from "@/types";
import { createOrder } from "@/lib/queries";
import { sendOrderEmails } from "@/lib/email";
import { SITE_EMAIL } from "@/lib/constants";
import { enqueue } from "@/lib/orderQueue";

export async function POST(request: Request) {
  try {
    const order: Order = await request.json();

    // Process through queue to prevent DB overload under traffic spikes
    await enqueue(() => createOrder(order));

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
