import { NextResponse } from "next/server";
import crypto from "crypto";
import { getServiceClient } from "@/lib/supabase";
import { createMedia } from "@/lib/queries";
import { isAdminAuthed } from "@/lib/adminAuth";

async function isAdmin(): Promise<boolean> {
    return isAdminAuthed();
}

function getCloudinaryConfig() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) return null;
    return { cloudName, apiKey, apiSecret };
}

function signUpload(apiSecret: string, folder: string) {
    const timestamp = Math.floor(Date.now() / 1000);
    const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(toSign).digest("hex");
    return { timestamp, signature };
}

interface CloudinaryResult {
    url: string;
    publicId: string;
    width: number;
    height: number;
    bytes: number;
    format: string;
}

async function uploadToCloudinary(
    imageUrl: string,
    config: { cloudName: string; apiKey: string; apiSecret: string },
    folder: string
): Promise<CloudinaryResult | null> {
    try {
        const { timestamp, signature } = signUpload(config.apiSecret, folder);

        const formData = new FormData();
        formData.append("file", imageUrl); // Cloudinary accepts URLs directly
        formData.append("api_key", config.apiKey);
        formData.append("timestamp", String(timestamp));
        formData.append("signature", signature);
        formData.append("folder", folder);

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
            { method: "POST", body: formData }
        );

        if (!res.ok) {
            const err = await res.text();
            console.error("Cloudinary upload failed:", err);
            return null;
        }

        const result = await res.json();
        return {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            format: result.format,
        };
    } catch (e) {
        console.error("Upload error:", e);
        return null;
    }
}

/** Register a migrated image in the media table (skip duplicates) */
async function registerInGallery(result: CloudinaryResult, name: string) {
    try {
        await createMedia({
            url: result.url,
            publicId: result.publicId,
            type: "image",
            name,
            folder: "xelle",
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            format: result.format,
        });
    } catch (e: any) {
        // 23505 = unique violation (already registered) — skip silently
        if (e?.code !== "23505") {
            console.warn("Failed to register in gallery:", e?.message);
        }
    }
}

function isSupabaseUrl(url: string): boolean {
    return url.includes("supabase.co") || url.includes("supabase.in");
}

// POST /api/admin/migrate — migrate all Supabase images to Cloudinary
export async function POST() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = getCloudinaryConfig();
    if (!config) {
        return NextResponse.json({ error: "Cloudinary not configured" }, { status: 500 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const folder = "xelle";
    const log: string[] = [];
    let migrated = 0;
    let skipped = 0;
    let failed = 0;

    // ─── 1. Products (images TEXT[]) ───
    const { data: products } = await supabase.from("products").select("id, name, images");
    if (products) {
        for (const product of products) {
            const images: string[] = product.images || [];
            let changed = false;
            const newImages: string[] = [];

            for (let i = 0; i < images.length; i++) {
                const url = images[i];
                if (!isSupabaseUrl(url)) {
                    newImages.push(url);
                    skipped++;
                    continue;
                }
                const result = await uploadToCloudinary(url, config, folder);
                if (result) {
                    newImages.push(result.url);
                    await registerInGallery(result, `${product.name} - Image ${i + 1}`);
                    migrated++;
                    changed = true;
                    log.push(`✓ product "${product.name}" image ${i + 1} migrated + registered`);
                } else {
                    newImages.push(url); // keep old on failure
                    failed++;
                    log.push(`✗ product "${product.name}" image ${i + 1} FAILED`);
                }
            }

            if (changed) {
                await supabase.from("products").update({ images: newImages }).eq("id", product.id);
            }
        }
    }

    // ─── 2. Categories (image TEXT) ───
    const { data: categories } = await supabase.from("categories").select("id, name, image");
    if (categories) {
        for (const cat of categories) {
            if (!cat.image || !isSupabaseUrl(cat.image)) {
                skipped++;
                continue;
            }
            const result = await uploadToCloudinary(cat.image, config, folder);
            if (result) {
                await supabase.from("categories").update({ image: result.url }).eq("id", cat.id);
                await registerInGallery(result, `Category: ${cat.name}`);
                migrated++;
                log.push(`✓ category "${cat.name}" migrated + registered`);
            } else {
                failed++;
                log.push(`✗ category "${cat.name}" FAILED`);
            }
        }
    }

    // ─── 3. Site Settings (hero_image TEXT) ───
    const { data: settings } = await supabase.from("site_settings").select("id, hero_image").limit(1).single();
    if (settings?.hero_image && isSupabaseUrl(settings.hero_image)) {
        const result = await uploadToCloudinary(settings.hero_image, config, folder);
        if (result) {
            await supabase.from("site_settings").update({ hero_image: result.url }).eq("id", settings.id);
            await registerInGallery(result, "Hero Image");
            migrated++;
            log.push(`✓ hero_image migrated + registered`);
        } else {
            failed++;
            log.push(`✗ hero_image FAILED`);
        }
    } else {
        skipped++;
    }

    // ─── 4. Reviews (product_image TEXT) ───
    const { data: reviews } = await supabase.from("reviews").select("id, product_image");
    if (reviews) {
        for (const review of reviews) {
            if (!review.product_image || !isSupabaseUrl(review.product_image)) {
                skipped++;
                continue;
            }
            const result = await uploadToCloudinary(review.product_image, config, folder);
            if (result) {
                await supabase.from("reviews").update({ product_image: result.url }).eq("id", review.id);
                await registerInGallery(result, `Review ${review.id}`);
                migrated++;
                log.push(`✓ review ${review.id} image migrated + registered`);
            } else {
                failed++;
                log.push(`✗ review ${review.id} FAILED`);
            }
        }
    }

    return NextResponse.json({
        done: true,
        migrated,
        skipped,
        failed,
        log,
    });
}
