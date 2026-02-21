import { NextResponse } from "next/server";
import { getOrders } from "@/lib/queries";

// This endpoint returns recent orders for the notification polling system.
// The admin frontend polls this every 30 seconds to detect new orders and status changes.
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const since = searchParams.get("since"); // ISO timestamp

        const allOrders = await getOrders();

        // Filter to orders created or updated after the "since" timestamp
        let recentOrders = allOrders;
        if (since) {
            const sinceDate = new Date(since).getTime();
            recentOrders = allOrders.filter((o) => {
                return new Date(o.createdAt).getTime() > sinceDate;
            });
        }

        // Also check for orders with pending payment submissions
        const pendingPayments = allOrders.filter(
            (o) => o.paymentStatus === "payment_submitted"
        );

        // Check for low-stock items
        const lowStockOrders = allOrders
            .flatMap((o) => o.items)
            .filter((item) => item.product.stock <= 5)
            .map((item) => ({
                productName: item.product.name,
                stock: item.product.stock,
            }));

        return NextResponse.json({
            recentOrders: recentOrders.slice(0, 10).map((o) => ({
                id: o.id,
                customerName: o.customerName,
                total: o.total,
                status: o.status,
                paymentMethod: o.paymentMethod,
                paymentStatus: o.paymentStatus,
                senderName: o.senderName,
                createdAt: o.createdAt,
            })),
            pendingPayments: pendingPayments.map((o) => ({
                id: o.id,
                customerName: o.customerName,
                total: o.total,
                senderName: o.senderName,
            })),
            totalOrders: allOrders.length,
        });
    } catch (error) {
        console.error("Notifications API error:", error);
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }
}
