import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { updateOrderStatus, updatePaymentInfo, updateOrderNotes, getOrderById } from "@/lib/queries";
import { sendOrderShippedEmail, sendOrderDeliveredEmail, sendPaymentApprovedEmail, sendReviewRequestEmail } from "@/lib/email";
import { isAdminAuthed, logAdminAction } from "@/lib/adminAuth";
import type { Order } from "@/types";

const VALID_STATUSES = ["pending", "shipped", "delivered"] as const;

async function isAdmin(): Promise<boolean> {
    return isAdminAuthed();
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        if (!status || !VALID_STATUSES.includes(status)) {
            return NextResponse.json(
                { error: "Valid status is required (pending, shipped, delivered)" },
                { status: 400 }
            );
        }

        await updateOrderStatus(id, status as Order["status"]);
        await logAdminAction("order.status_changed", { type: "order", id, metadata: { status } });

        // Revalidate admin pages to reflect changes immediately
        revalidatePath("/admin");
        revalidatePath("/admin/orders");

        // Send status email to customer
        const order = await getOrderById(id);
        if (order) {
            try {
                if (status === "shipped") {
                    await sendOrderShippedEmail(order);
                } else if (status === "delivered") {
                    await sendOrderDeliveredEmail(order);
                    await sendReviewRequestEmail(order);
                }
            } catch (emailErr) {
                console.warn("Status email failed (order still updated):", emailErr);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating order status:", error);
        return NextResponse.json(
            { error: "Failed to update order status" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { senderName, paymentStatus, notes } = body;

        // Validate paymentStatus if provided
        const validPaymentStatuses = ["awaiting_payment", "payment_submitted", "payment_confirmed"];
        if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
            return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
        }

        // payment_confirmed and notes are admin-only
        if (paymentStatus === "payment_confirmed" || notes !== undefined) {
            if (!await isAdmin()) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
        }

        // Handle notes update
        if (notes !== undefined) {
            await updateOrderNotes(id, notes);
        }

        // Handle payment info update
        if (senderName || paymentStatus) {
            await updatePaymentInfo(id, {
                senderName: senderName || undefined,
                paymentStatus: paymentStatus || undefined,
            });
        }

        // Audit the admin-only payment confirmation (customer-driven submissions aren't logged)
        if (paymentStatus === "payment_confirmed") {
            await logAdminAction("order.payment_confirmed", { type: "order", id });
        }

        revalidatePath("/admin");
        revalidatePath("/admin/orders");

        // Send payment approved email if admin confirmed payment
        if (paymentStatus === "payment_confirmed") {
            const order = await getOrderById(id);
            if (order) {
                try {
                    await sendPaymentApprovedEmail(order);
                } catch (emailErr) {
                    console.warn("Payment approved email failed (payment still updated):", emailErr);
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating payment info:", error);
        return NextResponse.json(
            { error: "Failed to update payment info" },
            { status: 500 }
        );
    }
}
