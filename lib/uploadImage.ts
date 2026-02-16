import { getSupabaseClient } from "@/lib/supabase";

/**
 * Upload a file to Supabase Storage in the "product-images" bucket.
 * Returns the public URL of the uploaded file, or throws on error.
 */
export async function uploadProductImage(file: File): Promise<string> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Database not available");

    const bucketDiff = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "product-images";
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
        .from(bucketDiff)
        .upload(path, file, { cacheControl: "31536000", upsert: false });

    if (error) throw error;

    const { data } = supabase.storage.from(bucketDiff).getPublicUrl(path);
    return data.publicUrl;
}
