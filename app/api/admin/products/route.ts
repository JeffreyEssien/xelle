import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteProduct } from "@/lib/queries";

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;
    const secret = process.env.ADMIN_SESSION_SECRET || "xelle-admin-default-secret";
    return session === secret;
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
