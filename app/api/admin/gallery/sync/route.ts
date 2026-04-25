import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createMedia } from "@/lib/queries";
import { getServiceClient } from "@/lib/supabase";

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    const expected = process.env.ADMIN_SESSION_SECRET || "xelle-admin-default-secret";
    return token === expected;
}

interface CloudinaryResource {
    public_id: string;
    secure_url: string;
    resource_type: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
    created_at: string;
}

async function fetchCloudinaryResources(
    cloudName: string,
    apiKey: string,
    apiSecret: string,
    resourceType: "image" | "video",
    folder: string
): Promise<CloudinaryResource[]> {
    const all: CloudinaryResource[] = [];
    let nextCursor: string | undefined;

    do {
        const url = new URL(
            `https://api.cloudinary.com/v1_1/${cloudName}/resources/${resourceType}`
        );
        url.searchParams.set("prefix", folder + "/");
        url.searchParams.set("type", "upload");
        url.searchParams.set("max_results", "500");
        if (nextCursor) url.searchParams.set("next_cursor", nextCursor);

        const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
        const res = await fetch(url.toString(), {
            headers: { Authorization: `Basic ${auth}` },
        });

        if (!res.ok) {
            const err = await res.text();
            console.error(`Cloudinary ${resourceType} list failed:`, err);
            break;
        }

        const data = await res.json();
        all.push(...(data.resources || []));
        nextCursor = data.next_cursor;
    } while (nextCursor);

    return all;
}

// POST /api/admin/gallery/sync — sync Cloudinary resources into media table
export async function POST() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        return NextResponse.json({ error: "Cloudinary not configured" }, { status: 500 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
        return NextResponse.json({ error: "Database not available" }, { status: 500 });
    }

    // Get existing public_ids from media table
    const { data: existing } = await supabase.from("media").select("public_id");
    const knownIds = new Set((existing || []).map((r: { public_id: string }) => r.public_id));

    const folder = "xelle";
    let synced = 0;
    let skipped = 0;
    let failed = 0;

    // Fetch images and videos from Cloudinary
    const [images, videos] = await Promise.all([
        fetchCloudinaryResources(cloudName, apiKey, apiSecret, "image", folder),
        fetchCloudinaryResources(cloudName, apiKey, apiSecret, "video", folder),
    ]);

    const allResources = [
        ...images.map((r) => ({ ...r, type: "image" as const })),
        ...videos.map((r) => ({ ...r, type: "video" as const })),
    ];

    for (const resource of allResources) {
        if (knownIds.has(resource.public_id)) {
            skipped++;
            continue;
        }

        try {
            await createMedia({
                url: resource.secure_url,
                publicId: resource.public_id,
                type: resource.type,
                name: resource.public_id.split("/").pop() || resource.public_id,
                folder,
                width: resource.width,
                height: resource.height,
                bytes: resource.bytes,
                format: resource.format,
            });
            synced++;
        } catch (e: any) {
            if (e?.code === "23505") {
                skipped++;
            } else {
                console.warn("Sync insert failed:", e?.message);
                failed++;
            }
        }
    }

    return NextResponse.json({
        done: true,
        total: allResources.length,
        synced,
        skipped,
        failed,
    });
}
