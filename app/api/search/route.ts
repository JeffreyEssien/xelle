import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
        return NextResponse.json({ results: [] });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
        return NextResponse.json({ results: [] });
    }

    const { data, error } = await supabase
        .from("products")
        .select("id, slug, name, price, images, category, stock")
        .or(`name.ilike.%${q}%,category.ilike.%${q}%,brand.ilike.%${q}%`)
        .limit(6);

    if (error) {
        return NextResponse.json({ results: [] });
    }

    const results = data.map((p: any) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: p.price,
        image: p.images?.[0] || "",
        category: p.category,
        stock: p.stock,
    }));

    return NextResponse.json({ results });
}
