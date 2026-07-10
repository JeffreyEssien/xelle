import { NextResponse } from "next/server";
import { authenticateAdmin, legacyFallbackEnabled, legacySecret, logAdminAction, ADMIN_COOKIE } from "@/lib/adminAuth";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function sessionCookie(response: NextResponse, value: string) {
    response.cookies.set(ADMIN_COOKIE, value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE,
    });
    return response;
}

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!password) {
            return NextResponse.json({ error: "Password is required" }, { status: 400 });
        }

        // Primary path: real DB account (email + password).
        if (email) {
            const result = await authenticateAdmin(email, password);
            if (!result) {
                return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
            }
            await logAdminAction("admin.login", undefined, result.admin);
            return sessionCookie(
                NextResponse.json({
                    success: true,
                    admin: { name: result.admin.name, email: result.admin.email, role: result.admin.role },
                }),
                result.token,
            );
        }

        // Cutover-only path: legacy shared password, gated behind the flag.
        if (legacyFallbackEnabled()) {
            const adminPassword = process.env.ADMIN_PASSWORD;
            if (adminPassword && password === adminPassword) {
                await logAdminAction("admin.login_legacy");
                return sessionCookie(NextResponse.json({ success: true, legacy: true }), legacySecret());
            }
        }

        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    } catch {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
