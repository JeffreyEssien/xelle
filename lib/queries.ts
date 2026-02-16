import { supabase } from "@/lib/supabase";
import type { Product, Category, Order } from "@/types";

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
    };
}

export async function getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as DbProduct[]).map(toProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_featured", true)
        .limit(4);
    if (error) throw error;
    return (data as DbProduct[]).map(toProduct);
}

export async function getNewProducts(): Promise<Product[]> {
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_new", true)
        .limit(4);
    if (error) throw error;
    return (data as DbProduct[]).map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();
    if (error) return null;
    return toProduct(data as DbProduct);
}

export async function getProductSlugs(): Promise<string[]> {
    const { data, error } = await supabase.from("products").select("slug");
    if (error) return [];
    return (data as { slug: string }[]).map((r) => r.slug);
}

export async function getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
    if (error) throw error;
    return data as Category[];
}

export async function getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as DbOrder[]).map(toOrder);
}

export async function createOrder(order: Order): Promise<void> {
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
