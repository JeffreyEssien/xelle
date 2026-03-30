import { NextResponse } from "next/server";
import type { Order } from "@/types";
import { createOrder } from "@/lib/queries";
import { sendOrderEmails } from "@/lib/email";
import { SITE_EMAIL } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const order: Order = await request.json();

    // Insert into Supabase
    try {
      await createOrder(order);
    } catch (dbErr: any) {
      if (dbErr?.message === "OUT_OF_STOCK") {
        return NextResponse.json({
          success: false,
          error: "OUT_OF_STOCK",
          outOfStockItems: dbErr.items
        }, { status: 409 });
      }
      console.error("DB insert failed:", dbErr?.message || dbErr);
      return NextResponse.json({ success: false, error: `DB: ${dbErr?.message || "insert failed"}` }, { status: 500 });
    }

    // Send emails (customer receipt + admin notification)
    try {
      await sendOrderEmails(order);
    } catch (emailErr: any) {
      console.warn("Email send failed (non-fatal):", emailErr?.message || emailErr);
    }

    // Always log to console as backup
    console.log(`\n🛍️ ORDER PLACED: ${order.id}`);
    console.log(`   Customer: ${order.customerName} (${order.email})`);
    console.log(`   Total: ₦${order.total.toLocaleString()}`);
    console.log(`   Payment: ${order.paymentMethod || "not specified"}`);

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (err: any) {
    console.error("Order error:", err?.message || err);
    return NextResponse.json({ success: false, error: err?.message || "Failed to process order" }, { status: 500 });
  }
}
