#!/usr/bin/env node
/**
 * Seed / reset the first super_admin account.
 *
 *   npm run seed:admin            # create if missing (idempotent)
 *   npm run seed:admin -- --force # reset password for an existing email
 *
 * Reads (from .env.local then .env):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   (required)
 *   INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PASSWORD           (required)
 *   INITIAL_ADMIN_NAME                                    (optional, default "Owner")
 *
 * Never stores plaintext — the password is bcrypt-hashed before insert.
 */
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { hash } from "bcryptjs";

dotenv.config({ path: ".env.local" });
dotenv.config();

const force = process.argv.includes("--force");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (process.env.INITIAL_ADMIN_EMAIL || "").toLowerCase().trim();
const password = process.env.INITIAL_ADMIN_PASSWORD || "";
const name = process.env.INITIAL_ADMIN_NAME || "Owner";

function fail(msg) {
    console.error(`✗ ${msg}`);
    process.exit(1);
}

if (!url || !key) fail("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
if (!email || !password) fail("INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD must be set.");
if (password.length < 8) fail("INITIAL_ADMIN_PASSWORD must be at least 8 characters.");

const supabase = createClient(url, key);

const passwordHash = await hash(password, 12);

const { data: existing, error: lookupErr } = await supabase
    .from("admin_users")
    .select("id, email")
    .eq("email", email)
    .maybeSingle();

if (lookupErr) fail(`Lookup failed: ${lookupErr.message} (did migration 002 run?)`);

if (existing && !force) {
    console.log(`✓ Admin ${email} already exists — nothing to do. Use --force to reset the password.`);
    process.exit(0);
}

if (existing && force) {
    const { error } = await supabase
        .from("admin_users")
        .update({ password_hash: passwordHash, is_active: true, role: "super_admin", name })
        .eq("id", existing.id);
    if (error) fail(`Update failed: ${error.message}`);
    console.log(`✓ Reset password for super_admin ${email}.`);
    process.exit(0);
}

const { error } = await supabase.from("admin_users").insert({
    email,
    name,
    password_hash: passwordHash,
    role: "super_admin",
    is_active: true,
});
if (error) fail(`Insert failed: ${error.message}`);
console.log(`✓ Created super_admin ${email}.`);
