import { getSupabaseClient } from "@/lib/supabase";
import type { Product, Category, Order, SiteSettings, Coupon, Profile, InventoryLog, Page, InventoryItem } from "@/types";

interface DbProduct {
    id: string;
    slug: string;
    name: string;
    description: string;
    price: number;
    category: string;
    brand: string;
    stock: number;
    images: string[];
    variants: Product["variants"]; // JSONB
    is_featured: boolean;
    is_new: boolean;
    created_at: string;
}

interface DbOrder {
    id: string;
    customer_name: string;
    email: string;
    phone: string;
    items: Order["items"];
    subtotal: number;
    shipping: number;
    total: number;
    status: Order["status"];
    shipping_address: Order["shippingAddress"];
    created_at: string;
    notes?: string;
}

function toProduct(row: DbProduct): Product {
    return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: row.description,
        price: Number(row.price),
        category: row.category,
        brand: row.brand,
        stock: row.stock,
        images: row.images,
        variants: row.variants || [],
        isFeatured: row.is_featured,
        isNew: row.is_new,
    };
}

function toOrder(row: DbOrder): Order {
    return {
        id: row.id,
        customerName: row.customer_name,
        email: row.email,
        phone: row.phone || "",
        items: row.items,
        subtotal: Number(row.subtotal),
        shipping: Number(row.shipping),
        total: Number(row.total),
        status: row.status,
        shippingAddress: row.shipping_address,
        createdAt: row.created_at,
        notes: row.notes,
    };
}

// ... existing getProducts ...

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Database not available");

    const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id);
    if (error) throw error;
}

export async function updateOrderNotes(id: string, notes: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Database not available");

    const { error } = await supabase
        .from("orders")
        .update({ notes })
        .eq("id", id);
    if (error) throw error;
}

export async function getProducts(): Promise<Product[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase
        .from("products")
        .select("*, inventory:inventory_items(stock)")
        .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as any[]).map(row => ({
        ...toProduct(row),
        stock: row.inventory?.stock ?? row.stock // Fallback to local stock if valid, but prefer inventory
    }));
}

export async function getFeaturedProducts(): Promise<Product[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_featured", true)
        .limit(4);
    if (error) throw error;
    return (data as DbProduct[]).map(toProduct);
}

export async function getNewProducts(): Promise<Product[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_new", true)
        .limit(4);
    if (error) throw error;
    return (data as DbProduct[]).map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const { data, error } = await supabase
        .from("products")
        .select("*, inventory:inventory_items(stock)")
        .eq("slug", slug)
        .single();
    if (error) return null;
    const prod = toProduct(data as DbProduct);
    prod.stock = (data as any).inventory?.stock ?? prod.stock;
    return prod;
}

export async function getProductSlugs(): Promise<string[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase.from("products").select("slug");
    if (error) return [];
    return (data as { slug: string }[]).map((r) => r.slug);
}

export async function getCategories(): Promise<Category[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
    if (error) throw error;
    return data as Category[];
}

export async function createCategory(category: Omit<Category, "id">): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Database not available");

    const { error } = await supabase.from("categories").insert({
        name: category.name,
        slug: category.slug,
        image: category.image,
        description: category.description,
    });
    if (error) throw error;
}

export async function updateCategory(id: string, category: Partial<Category>): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Database not available");

    const { error } = await supabase
        .from("categories")
        .update(category)
        .eq("id", id);
    if (error) throw error;
}

export async function deleteCategory(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Database not available");

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
}

export async function getOrders(): Promise<Order[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as DbOrder[]).map(toOrder);
}

export async function createOrder(order: Order): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Database not available");
    const { error } = await supabase.from("orders").insert({
        id: order.id,
        customer_name: order.customerName,
        email: order.email,
        phone: order.phone,
        items: order.items,
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.total,
        status: order.status,
        shipping_address: order.shippingAddress,
        created_at: order.createdAt,
    });
    if (error) throw error;
}

export interface CreateProductInput {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    images: string[];
    variants: Product["variants"];
    inventoryId?: string; // Link to inventory source
}

export async function createProduct(input: CreateProductInput): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Database not available");

    const slug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const { error } = await supabase.from("products").insert({
        slug,
        name: input.name,
        description: input.description,
        price: input.price,
        category: input.category,
        brand: "",
        stock: input.stock,
        images: input.images,
        variants: input.variants,
        is_featured: false,
        is_new: true,
        inventory_item_id: input.inventoryId, // Save the link
    });
    if (error) throw error;
}
export async function updateProduct(id: string, input: CreateProductInput): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Database not available");

    const slug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const { error } = await supabase
        .from("products")
        .update({
            slug,
            name: input.name,
            description: input.description,
            price: input.price,
            category: input.category,
            stock: input.stock,
            images: input.images,
            variants: input.variants,
        })
        .eq("id", id);

    if (error) throw error;
}

export async function updateProductStock(id: string, newStock: number): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Database not available");

    const { error } = await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", id);

    if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Database not available");

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    // We expect a single row with id=true
    const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", true)
        .single();

    if (error) {
        // If table doesn't exist or is empty, return default/null
        return null;
    }

    return {
        id: data.id,
        siteName: data.site_name,
        logoUrl: data.logo_url,
        heroHeading: data.hero_heading,
        heroSubheading: data.hero_subheading,
        heroImage: data.hero_image,
        heroCtaText: data.hero_cta_text,
        heroCtaLink: data.hero_cta_link,
    };
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Database not available");

    const dbSettings: any = {};
    if (settings.siteName !== undefined) dbSettings.site_name = settings.siteName;
    if (settings.logoUrl !== undefined) dbSettings.logo_url = settings.logoUrl;
    if (settings.heroHeading !== undefined) dbSettings.hero_heading = settings.heroHeading;
    if (settings.heroSubheading !== undefined) dbSettings.hero_subheading = settings.heroSubheading;
    if (settings.heroImage !== undefined) dbSettings.hero_image = settings.heroImage;
    if (settings.heroCtaText !== undefined) dbSettings.hero_cta_text = settings.heroCtaText;
    if (settings.heroCtaLink !== undefined) dbSettings.hero_cta_link = settings.heroCtaLink;

    // init if not exists, otherwise update
    const { error } = await supabase
        .from("site_settings")
        .upsert({ id: true, ...dbSettings });

    if (error) throw error;
}

/* ── Coupons ── */

export async function getCoupons(): Promise<Coupon[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching coupons:", error);
        return [];
    }

    return data.map((c) => ({
        id: c.id,
        code: c.code,
        discountPercent: c.discount_percent,
        isActive: c.is_active,
        usageCount: c.usage_count,
        createdAt: c.created_at,
    }));
}

export async function createCoupon(coupon: { code: string; discountPercent: number; isActive: boolean }): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Database not available");

    const { error } = await supabase.from("coupons").insert({
        code: coupon.code.toUpperCase(),
        discount_percent: coupon.discountPercent,
        is_active: coupon.isActive,
    });
    if (error) throw error;
}

export async function deleteCoupon(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Database not available");

    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) throw error;
}

export async function toggleCouponStatus(id: string, isActive: boolean): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Database not available");

    const { error } = await supabase.from("coupons").update({ is_active: isActive }).eq("id", id);
    if (error) throw error;
}

export async function validateCoupon(code: string): Promise<Coupon | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code.toUpperCase())
        .eq("is_active", true)
        .single();

    if (error || !data) return null;

    return {
        id: data.id,
        code: data.code,
        discountPercent: data.discount_percent,
        isActive: data.is_active,
        usageCount: data.usage_count,
        createdAt: data.created_at,
    };
}

/* ── Customers ── */

export async function getCustomers(): Promise<Profile[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching customers:", JSON.stringify(error, null, 2));
        return [];
    }

    return data.map((p) => ({
        id: p.id,
        email: p.email,
        fullName: p.full_name,
        avatarUrl: p.avatar_url,
        role: p.role,
        createdAt: p.created_at,
    }));
}

/* ── Inventory Logs ── */

export async function getInventoryLogs(): Promise<InventoryLog[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from("inventory_logs")
        .select("*, product:products(name)")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching inventory logs:", JSON.stringify(error, null, 2));
        return [];
    }

    return data.map((log: any) => ({
        id: log.id,
        productId: log.product_id,
        productName: log.product?.name || "Unknown Product",
        changeAmount: log.change_amount,
        reason: log.reason,
        createdAt: log.created_at,
    }));
}

export async function logInventoryChange(productId: string, changeAmount: number, reason: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    await supabase.from("inventory_logs").insert({
        product_id: productId,
        change_amount: changeAmount,
        reason,
    });
}

/* ── Inventory Items (New) ── */

export async function getInventoryItems(): Promise<InventoryItem[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .order("name");

    if (error) {
        console.error("Error fetching inventory items:", error);
        return [];
    }

    return data.map(item => ({
        id: item.id,
        sku: item.sku,
        name: item.name,
        costPrice: Number(item.cost_price),
        sellingPrice: Number(item.selling_price),
        stock: item.stock,
        reorderLevel: item.reorder_level,
        supplier: item.supplier,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
    }));
}

export async function updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Database not available");

    const dbUpdates: any = { updated_at: new Date().toISOString() };
    if (updates.sku !== undefined) dbUpdates.sku = updates.sku;
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.costPrice !== undefined) dbUpdates.cost_price = updates.costPrice;
    if (updates.sellingPrice !== undefined) dbUpdates.selling_price = updates.sellingPrice;
    if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
    if (updates.reorderLevel !== undefined) dbUpdates.reorder_level = updates.reorderLevel;
    if (updates.supplier !== undefined) dbUpdates.supplier = updates.supplier;

    const { error } = await supabase
        .from("inventory_items")
        .update(dbUpdates)
        .eq("id", id);
    if (error) throw error;
}

export async function createInventoryItem(item: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Database not available");

    const { data, error } = await supabase.from("inventory_items").insert({
        sku: item.sku,
        name: item.name,
        cost_price: item.costPrice,
        selling_price: item.sellingPrice,
        stock: item.stock,
        reorder_level: item.reorderLevel,
        supplier: item.supplier,
    }).select("id").single();

    if (error) throw error;
    return data.id;
}

/* ── CMS / Pages ── */

export async function getPages(): Promise<Page[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from("pages")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) return [];

    return data.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        content: p.content,
        isPublished: p.is_published,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
    }));
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

    if (error || !data) return null;

    return {
        id: data.id,
        slug: data.slug,
        title: data.title,
        content: data.content,
        isPublished: data.is_published,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    };
}

export async function getPageById(id: string): Promise<Page | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !data) return null;

    return {
        id: data.id,
        slug: data.slug,
        title: data.title,
        content: data.content,
        isPublished: data.is_published,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    };
}

export async function createPage(page: Omit<Page, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Database not available");

    const { data, error } = await supabase.from("pages").insert({
        slug: page.slug,
        title: page.title,
        content: page.content,
        is_published: page.isPublished,
    }).select("id").single();

    if (error) throw error;
    return data.id;
}

export async function updatePage(id: string, page: Partial<Page>): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Database not available");

    const updates: any = { updated_at: new Date().toISOString() };
    if (page.slug !== undefined) updates.slug = page.slug;
    if (page.title !== undefined) updates.title = page.title;
    if (page.content !== undefined) updates.content = page.content;
    if (page.isPublished !== undefined) updates.is_published = page.isPublished;

    const { error } = await supabase.from("pages").update(updates).eq("id", id);
    if (error) throw error;
}

export async function deletePage(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Database not available");

    const { error } = await supabase.from("pages").delete().eq("id", id);
    if (error) throw error;
}
