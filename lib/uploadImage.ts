/** Cached upload token — reuse across parallel uploads (valid ~1hr) */
let tokenCache: { signature: string; timestamp: string; apiKey: string; cloudName: string; folder: string; fetchedAt: number } | null = null;

async function getUploadToken(): Promise<{ signature: string; timestamp: string; apiKey: string; cloudName: string; folder: string }> {
    // Reuse token if less than 30 seconds old
    if (tokenCache && Date.now() - tokenCache.fetchedAt < 30_000) {
        return tokenCache;
    }
    const res = await fetch("/api/upload?folder=xelle");
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to get upload token");
    }
    const data = await res.json();
    tokenCache = { ...data, fetchedAt: Date.now() };
    return data;
}

/**
 * Simple Cloudinary upload for single image fields (logo, favicon, hero fallback).
 * Gets a signed token from /api/upload, uploads directly to Cloudinary.
 * Does NOT save to the media table — use MediaPicker for gallery-tracked uploads.
 */
export async function uploadProductImage(file: File): Promise<string> {
    const { signature, timestamp, apiKey, cloudName, folder } = await getUploadToken();

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
    const { signature, timestamp, apiKey, cloudName, folder } = await getUploadToken();

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

    // Save metadata to media table
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
