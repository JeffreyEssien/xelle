/**
 * E2E test-data cleanup.
 *
 * Deletes ONLY rows that carry an E2E marker (see ./e2e-markers.mjs), using the
 * Supabase service-role key. Safe to run against any environment — including
 * production — because every delete is scoped to a marker no real record owns.
 *
 * Usage:
 *   node scripts/cleanup-e2e.mjs            # count, then delete
 *   DRY_RUN=1 node scripts/cleanup-e2e.mjs  # count only, delete nothing
 *
 * Required env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (service role — never the anon key)
 *
 * Exit codes: 0 = ok (incl. nothing to delete), 1 = misconfig / fatal error.
 */
import { createClient } from "@supabase/supabase-js";
import {
    E2E_EMAIL,
    E2E_PRODUCT_SLUG_PREFIX,
    E2E_COUPON_PREFIX,
    E2E_SKU_PREFIX,
} from "./e2e-markers.mjs";

const DRY_RUN = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ── Guards ──────────────────────────────────────────────────────────────────
if (!url || !serviceKey) {
    console.error(
        "✖ cleanup-e2e: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.",
    );
    process.exit(1);
}

// A marker must be present and distinctive. An empty/short marker could widen a
// filter into a table-wide delete — refuse rather than risk it.
function assertMarker(label, value, min = 5) {
    if (typeof value !== "string" || value.trim().length < min) {
        console.error(`✖ cleanup-e2e: marker "${label}" is missing or too short — refusing to run.`);
        process.exit(1);
    }
    if (value.includes("%") || value.includes("_")) {
        // Prefix markers feed into LIKE; wildcards here would broaden the match.
        console.error(`✖ cleanup-e2e: marker "${label}" contains a SQL LIKE wildcard — refusing to run.`);
        process.exit(1);
    }
}
assertMarker("E2E_EMAIL", E2E_EMAIL);
assertMarker("E2E_PRODUCT_SLUG_PREFIX", E2E_PRODUCT_SLUG_PREFIX);
assertMarker("E2E_COUPON_PREFIX", E2E_COUPON_PREFIX);
assertMarker("E2E_SKU_PREFIX", E2E_SKU_PREFIX);

const db = createClient(url, serviceKey, { auth: { persistSession: false } });

let host = url;
try {
    host = new URL(url).host;
} catch {}
console.log(`\n🧹 E2E cleanup ${DRY_RUN ? "(DRY RUN — no deletes)" : ""}`);
console.log(`   target: ${host}`);
console.log(`   marker email: ${E2E_EMAIL}\n`);

// Deletion plan. Order matters for foreign keys:
//  - reviews FK orders(id)/products(id) ON DELETE CASCADE
//  - stockpile_items FK stockpiles(id) ON DELETE CASCADE
// We still delete reviews explicitly first (idempotent, belt-and-suspenders).
const plan = [
    { table: "reviews", apply: (q) => q.eq("customer_email", E2E_EMAIL) },
    { table: "orders", apply: (q) => q.eq("email", E2E_EMAIL) },
    { table: "stockpiles", apply: (q) => q.eq("customer_email", E2E_EMAIL) },
    { table: "products", apply: (q) => q.like("slug", `${E2E_PRODUCT_SLUG_PREFIX}%`) },
    { table: "coupons", apply: (q) => q.like("code", `${E2E_COUPON_PREFIX}%`) },
    { table: "inventory_items", apply: (q) => q.like("sku", `${E2E_SKU_PREFIX}%`) },
];

let totalDeleted = 0;
let hadError = false;

for (const { table, apply } of plan) {
    // 1) Count first so the log shows exactly what is in scope.
    const { count, error: countErr } = await apply(
        db.from(table).select("id", { count: "exact", head: true }),
    );
    if (countErr) {
        console.warn(`   ⚠ ${table}: count failed — ${countErr.message}`);
        hadError = true;
        continue;
    }

    if (!count) {
        console.log(`   • ${table}: 0 marked rows`);
        continue;
    }

    if (DRY_RUN) {
        console.log(`   • ${table}: ${count} marked rows would be deleted`);
        continue;
    }

    // 2) Delete — same marker filter. `.select("id")` returns the deleted rows
    //    so we can report the real count, not an assumption.
    const { data, error: delErr } = await apply(db.from(table).delete()).select("id");
    if (delErr) {
        console.warn(`   ⚠ ${table}: delete failed — ${delErr.message}`);
        hadError = true;
        continue;
    }
    const n = data?.length ?? 0;
    totalDeleted += n;
    console.log(`   ✓ ${table}: deleted ${n}`);
}

console.log(
    `\n${DRY_RUN ? "DRY RUN complete." : `Done. Deleted ${totalDeleted} row(s).`}\n`,
);

// Cleanup failures shouldn't mask a green test run, but surface them loudly.
process.exit(hadError ? 1 : 0);
