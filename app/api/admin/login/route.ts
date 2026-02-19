import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { password } = await request.json();
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminPassword) {
            console.error("ADMIN_PASSWORD env var is not set!");
            return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
        }

        if (password !== adminPassword) {
            return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }

        // Set session cookie
        const sessionSecret = process.env.ADMIN_SESSION_SECRET || "xelle-admin-default-secret";
        const response = NextResponse.json({ success: true });

        response.cookies.set("admin_session", sessionSecret, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
    } catch {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
