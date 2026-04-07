import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;
let serviceClient: SupabaseClient | null = null;

/**
 * Public (anon) client — safe for browser use.
 * RLS policies control what this client can access.
 */
export function getSupabaseClient(): SupabaseClient | null {
    if (client) return client;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.warn("⚠️  Supabase env vars not set — returning null client");
        return null;
    }

    client = createClient(url, key);
    return client;
}

/**
 * Service role client — bypasses RLS. Server-side ONLY.
 * Never import or call this from "use client" components.
 * Used in API routes and Server Components for writes and sensitive reads.
 */
export function getServiceClient(): SupabaseClient | null {
    if (serviceClient) return serviceClient;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        // Fall back to anon client on missing service key (dev convenience)
        console.warn("⚠️  SUPABASE_SERVICE_ROLE_KEY not set — falling back to anon client");
        return getSupabaseClient();
    }

    serviceClient = createClient(url, key);
    return serviceClient;
}
