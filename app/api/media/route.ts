import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getMedia, createMedia, deleteMedia } from "@/lib/queries";
import { isAdminAuthed } from "@/lib/adminAuth";

async function isAdmin(): Promise<boolean> {
    return isAdminAuthed();
}

// GET /api/media?type=image — list gallery media
export async function GET(req: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const type = req.nextUrl.searchParams.get("type") as "image" | "video" | null;
    const media = await getMedia(type || undefined);
    return NextResponse.json({ media });
}

// POST /api/media — save metadata after browser-to-Cloudinary upload
export async function POST(req: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { url, publicId, type, name, folder, width, height, bytes, format } = body;

        if (!url || !publicId || !type) {
            return NextResponse.json({ error: "url, publicId, and type are required" }, { status: 400 });
        }

        const media = await createMedia({
            url,
            publicId,
            type,
            name: name || undefined,
            folder: folder || "xelle",
            width: width || undefined,
            height: height || undefined,
            bytes: bytes || undefined,
            format: format || undefined,
        });

        return NextResponse.json({ media });
    } catch (error: any) {
        if (error.code === "23505") {
            return NextResponse.json({ error: "Media already exists in gallery" }, { status: 409 });
        }
        console.error("Create media error:", error);
        return NextResponse.json({ error: "Failed to save media" }, { status: 500 });
    }
}

// DELETE /api/media?id=xxx — delete from DB + destroy from Cloudinary
export async function DELETE(req: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    try {
        const result = await deleteMedia(id);
        if (!result) return NextResponse.json({ error: "Media not found" }, { status: 404 });

        // Destroy from Cloudinary
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (cloudName && apiKey && apiSecret) {
            const timestamp = Math.floor(Date.now() / 1000);
            const toSign = `public_id=${result.publicId}&timestamp=${timestamp}${apiSecret}`;
            const signature = crypto.createHash("sha1").update(toSign).digest("hex");

            const resourceType = result.type === "video" ? "video" : "image";
            const destroyUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`;
            await fetch(destroyUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    public_id: result.publicId,
                    signature,
                    api_key: apiKey,
                    timestamp,
                }),
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete media error:", error);
        return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
    }
}
