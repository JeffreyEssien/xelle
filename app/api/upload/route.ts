import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { isAdminAuthed } from "@/lib/adminAuth";

async function isAdmin(): Promise<boolean> {
    return isAdminAuthed();
}

// GET /api/upload?folder=xelle — returns signed Cloudinary upload params
export async function GET(req: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        return NextResponse.json(
            { error: "Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET." },
            { status: 500 }
        );
    }

    const folder = req.nextUrl.searchParams.get("folder") || "xelle";
    const timestamp = Math.floor(Date.now() / 1000);

    // Signature = SHA1 of "folder=xelle&timestamp=XXXX{API_SECRET}")
    const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(toSign).digest("hex");

    return NextResponse.json({
        signature,
        timestamp,
        apiKey,
        cloudName,
        folder,
    });
}
