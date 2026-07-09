import { NextResponse } from "next/server";
import { deleteProduct } from "@/lib/queries";
import { isAdminAuthed } from "@/lib/adminAuth";

async function isAdmin(): Promise<boolean> {
    return isAdminAuthed();
}

export async function DELETE(request: Request) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ error: "Product ID required" }, { status: 400 });
        }

        await deleteProduct(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete product error:", error);
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}
