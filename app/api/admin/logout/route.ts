import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { destroySession, ADMIN_COOKIE } from "@/lib/adminAuth";

export async function POST() {
    const store = await cookies();
    await destroySession(store.get(ADMIN_COOKIE)?.value);

    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
}
