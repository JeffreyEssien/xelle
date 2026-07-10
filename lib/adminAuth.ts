import { cookies } from "next/headers";
import crypto from "crypto";
import { compare } from "bcryptjs";
import { getServiceClient } from "@/lib/supabase";
import { insertAuditLog } from "@/lib/queries";

/**
 * DB-backed admin auth (bcrypt accounts + opaque server sessions).
 *
 * Single source of truth for "is this request an authenticated admin?".
 * API route handlers call isAdminAuthed(); the /admin page middleware
 * (proxy.ts) does its own Edge-compatible check against the same tables.
 *
 * Legacy cutover: while ADMIN_LEGACY_PASSWORD_FALLBACK === "true", the old
 * static-secret cookie is still honoured so a deploy isn't locked out before
 * the first admin_users row is seeded. Default OFF — remove after cutover.
 */

export const ADMIN_COOKIE = "admin_session";
const SESSION_DURATION_DAYS = 7;

export interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: "admin" | "super_admin";
    isActive: boolean;
    lastLoginAt: string | null;
}

/**
 * Service client, but ONLY when a real service-role key is present.
 * XELLE's getServiceClient() silently falls back to the anon client when the
 * key is missing — never acceptable for auth tables, so we gate on the env var
 * and return null instead of querying admin_users with the public key.
 */
function getAdminDb() {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
    return getServiceClient();
}

export function legacyFallbackEnabled(): boolean {
    return process.env.ADMIN_LEGACY_PASSWORD_FALLBACK === "true";
}

export function legacySecret(): string {
    return process.env.ADMIN_SESSION_SECRET || "xelle-admin-default-secret";
}

/** Authenticate by email + password. Returns admin + fresh session token, or null. */
export async function authenticateAdmin(
    email: string,
    password: string,
): Promise<{ admin: AdminUser; token: string } | null> {
    const db = getAdminDb();
    if (!db) return null;

    const { data, error } = await db
        .from("admin_users")
        .select("*")
        .eq("email", email.toLowerCase().trim())
        .eq("is_active", true)
        .single();

    if (error || !data) return null;

    const valid = await compare(password, data.password_hash);
    if (!valid) return null;

    const token = crypto.randomBytes(48).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

    const { error: sessErr } = await db.from("admin_sessions").insert({
        admin_id: data.id,
        token,
        expires_at: expiresAt.toISOString(),
    });
    if (sessErr) return null;

    await db.from("admin_users").update({ last_login_at: new Date().toISOString() }).eq("id", data.id);

    return { admin: toAdminUser(data), token };
}

/** Validate a raw session token. Honours the legacy static secret during cutover. */
export async function validateSessionToken(token: string | undefined): Promise<AdminUser | null> {
    if (!token) return null;

    if (legacyFallbackEnabled() && token === legacySecret()) {
        return { id: "legacy", email: "legacy@admin.local", name: "Legacy Admin", role: "super_admin", isActive: true, lastLoginAt: null };
    }

    const db = getAdminDb();
    if (!db) return null;

    const { data, error } = await db
        .from("admin_sessions")
        .select("expires_at, admin_users(*)")
        .eq("token", token)
        .gt("expires_at", new Date().toISOString())
        .single();

    if (error || !data || !data.admin_users) return null;
    const u = Array.isArray(data.admin_users) ? data.admin_users[0] : data.admin_users;
    if (!u || !u.is_active) return null;
    return toAdminUser(u);
}

/** Current admin from the request cookie (Node runtime: route handlers / server components). */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
    const store = await cookies();
    return validateSessionToken(store.get(ADMIN_COOKIE)?.value);
}

/** Boolean guard for API route handlers. Single source of truth. */
export async function isAdminAuthed(): Promise<boolean> {
    return (await getCurrentAdmin()) !== null;
}

/** Delete a session (logout). No-op for the legacy static token. */
export async function destroySession(token: string | undefined): Promise<void> {
    if (!token || token === legacySecret()) return;
    const db = getAdminDb();
    if (!db) return;
    await db.from("admin_sessions").delete().eq("token", token);
}

/**
 * Append a sensitive admin action to the audit trail. Never throws — a failed
 * log must not break the mutation it records. Pass `admin` explicitly right
 * after authenticating (login), otherwise it's resolved from the request cookie.
 */
export async function logAdminAction(
    action: string,
    target?: { type?: string; id?: string; metadata?: Record<string, unknown> },
    admin?: AdminUser | null,
): Promise<void> {
    try {
        const who = admin ?? (await getCurrentAdmin());
        await insertAuditLog({
            adminId: who && who.id !== "legacy" ? who.id : null,
            adminEmail: who?.email ?? "unknown",
            action,
            targetType: target?.type ?? null,
            targetId: target?.id ?? null,
            metadata: target?.metadata ?? null,
        });
    } catch (e) {
        console.warn("logAdminAction failed:", e);
    }
}

function toAdminUser(row: any): AdminUser {
    return {
        id: row.id,
        email: row.email,
        name: row.name,
        role: row.role,
        isActive: row.is_active,
        lastLoginAt: row.last_login_at ?? null,
    };
}
