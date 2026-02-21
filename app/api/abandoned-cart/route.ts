import { NextResponse } from "next/server";
import { sendAbandonedCartEmail } from "@/lib/email";

export async function POST(request: Request) {
    try {
        const { email, firstName, items } = await request.json();

        if (!email || !firstName || !items?.length) {
            return NextResponse.json(
                { error: "Missing required fields: email, firstName, items" },
                { status: 400 }
            );
        }

        await sendAbandonedCartEmail(email, firstName, items);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Abandoned cart email error:", error);
        return NextResponse.json(
            { error: "Failed to send abandoned cart email" },
            { status: 500 }
        );
    }
}
