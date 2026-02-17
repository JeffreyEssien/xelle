import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { updateOrderStatus } from "@/lib/queries";
import type { Order } from "@/types";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json(
                { error: "Status is required" },
                { status: 400 }
            );
        }

        await updateOrderStatus(id, status as Order["status"]);

        // Revalidate admin pages to reflect changes immediately
        revalidatePath("/admin");
        revalidatePath("/admin/orders");

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating order status:", error);
        return NextResponse.json(
            { error: "Failed to update order status" },
            { status: 500 }
        );
    }
}
