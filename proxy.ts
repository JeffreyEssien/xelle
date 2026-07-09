import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Admin auth middleware — gates the /admin PAGES.
 *
 * Wired via middleware.ts (Next.js only auto-runs a file named `middleware`).
 * Runs on the Edge runtime, so it validates the session cookie against
 * admin_sessions with a plain fetch-based Supabase client — it must NOT import
 * lib/adminAuth (which pulls in next/headers + bcrypt, Node-only). API routes
 * enforce the same rule themselves via isAdminAuthed().
 *
 * Cutover: while ADMIN_LEGACY_PASSWORD_FALLBACK === "true", the old static
 * secret cookie is still accepted. Default OFF.
 */
export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (!pathname.startsWith("/admin")) {
        return NextResponse.next();
    }

    // Login page must stay reachable.
    if (pathname === "/admin/login") {
        return NextResponse.next();
    }

    const token = request.cookies.get("admin_session")?.value;
    if (!token) {
        return redirectToLogin(request, pathname);
    }

    // Legacy static-secret cutover path.
    if (process.env.ADMIN_LEGACY_PASSWORD_FALLBACK === "true") {
        const legacy = process.env.ADMIN_SESSION_SECRET || "xelle-admin-default-secret";
        if (token === legacy) return NextResponse.next();
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // No service key: fail OPEN in dev (unconfigured local), CLOSED in prod.
    if (!url || !key) {
        if (process.env.NODE_ENV !== "production") return NextResponse.next();
        return clearAndRedirect(request, pathname);
    }

    try {
        const supabase = createClient(url, key);
        const { data, error } = await supabase
            .from("admin_sessions")
            .select("id")
            .eq("token", token)
            .gt("expires_at", new Date().toISOString())
            .single();

        if (error || !data) {
            return clearAndRedirect(request, pathname);
        }
    } catch {
        // DB unreachable — don't hard-lock the admin out on infra flakiness.
        if (process.env.NODE_ENV !== "production") return NextResponse.next();
        return clearAndRedirect(request, pathname);
    }

    return NextResponse.next();
}

function redirectToLogin(request: NextRequest, from: string) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", from);
    return NextResponse.redirect(loginUrl);
}

function clearAndRedirect(request: NextRequest, from: string) {
    const response = redirectToLogin(request, from);
    response.cookies.set("admin_session", "", { path: "/", maxAge: 0 });
    return response;
}

export const config = {
    matcher: ["/admin/:path*"],
};
