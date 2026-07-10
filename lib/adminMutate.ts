"use client";

/**
 * Client-side helper for privileged admin writes (Phase 1.3).
 *
 * Replaces direct lib/queries mutation calls in "use client" admin forms —
 * those ran under the browser's anon key. This routes them through the
 * authenticated /api/admin/db dispatch so they execute server-side under the
 * service role. Mirrors the query function's signature and return value:
 *
 *   await createCoupon(data)        →  await adminMutate("createCoupon", data)
 *   const id = await createInventoryItem(x)  →  await adminMutate<string>("createInventoryItem", x)
 */
export async function adminMutate<T = void>(fn: string, ...args: unknown[]): Promise<T> {
    const res = await fetch("/api/admin/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fn, args }),
    });

    let payload: any = null;
    try {
        payload = await res.json();
    } catch {
        // fall through to status-based error
    }

    if (!res.ok || !payload?.success) {
        throw new Error(payload?.error || `Admin action failed (${res.status})`);
    }

    return payload.result as T;
}
