/**
 * Simple Cloudinary upload for single image fields (logo, favicon, hero fallback).
 * Gets a signed token from /api/upload, uploads directly to Cloudinary.
 * Does NOT save to the media table — use MediaPicker for gallery-tracked uploads.
 */
export async function uploadProductImage(file: File): Promise<string> {
    // Step 1: Get signed upload params from our API
    const tokenRes = await fetch("/api/upload?folder=xelle");
    if (!tokenRes.ok) {
        const err = await tokenRes.json().catch(() => ({}));
        throw new Error(err.error || "Failed to get upload token");
    }

    const { signature, timestamp, apiKey, cloudName, folder } = await tokenRes.json();

    // Step 2: Upload directly to Cloudinary
    const resourceType = file.type.startsWith("video/") ? "video" : "image";
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);
    formData.append("folder", folder);

    const uploadRes = await fetch(uploadUrl, { method: "POST", body: formData });
    if (!uploadRes.ok) {
        throw new Error("Cloudinary upload failed");
    }

    const result = await uploadRes.json();
    return result.secure_url;
}

/**
 * Gallery upload — uploads to Cloudinary AND saves metadata to the media table.
 * Used by MediaPicker component.
 */
export async function uploadToGallery(file: File): Promise<{
    url: string;
    publicId: string;
    type: "image" | "video";
    width: number;
    height: number;
    bytes: number;
    format: string;
}> {
    // Step 1: Get signed upload params
    const tokenRes = await fetch("/api/upload?folder=xelle");
    if (!tokenRes.ok) {
        const err = await tokenRes.json().catch(() => ({}));
        throw new Error(err.error || "Failed to get upload token");
    }

    const { signature, timestamp, apiKey, cloudName, folder } = await tokenRes.json();

    // Step 2: Upload to Cloudinary
    const resourceType = file.type.startsWith("video/") ? "video" : "image";
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);
    formData.append("folder", folder);

    const uploadRes = await fetch(uploadUrl, { method: "POST", body: formData });
    if (!uploadRes.ok) {
        throw new Error("Cloudinary upload failed");
    }

    const result = await uploadRes.json();

    // Step 3: Save metadata to media table
    const mediaRes = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            url: result.secure_url,
            publicId: result.public_id,
            type: resourceType,
            name: file.name,
            folder,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            format: result.format,
        }),
    });

    if (!mediaRes.ok) {
        // Upload succeeded but DB save failed — still return the URL
        console.warn("Media saved to Cloudinary but failed to save to gallery DB");
    }

    return {
        url: result.secure_url,
        publicId: result.public_id,
        type: resourceType as "image" | "video",
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        format: result.format,
    };
}
