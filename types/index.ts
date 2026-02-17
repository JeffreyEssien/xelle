export interface ProductVariant {
    name: string;
    price?: number;
    stock?: number;
    image?: string;
}

export interface Product {
    id: string;
    slug: string;
    name: string;
    description: string;
    price: number;
    category: string;
    brand: string;
    stock: number;
    images: string[];
    variants: ProductVariant[];
    isFeatured: boolean;
    isNew: boolean;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    image: string;
    description: string;
}

export interface CartItem {
    product: Product;
    variant?: ProductVariant;
    quantity: number;
}

export interface ShippingAddress {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

export interface Order {
    id: string;
    customerName: string;
    email: string;
    phone: string;
    items: CartItem[];
    total: number;
    subtotal: number;
    shipping: number;
    status: "pending" | "shipped" | "delivered";
    createdAt: string;
    shippingAddress: ShippingAddress;
    notes?: string;
}

export interface SiteSettings {
    id: boolean;
    siteName: string;
    logoUrl?: string;
    heroHeading?: string;
    heroSubheading?: string;
    heroImage?: string;
    heroCtaText?: string;
    heroCtaLink?: string;
}

export interface Coupon {
    id: string;
    code: string;
    discountPercent: number;
    isActive: boolean;
    usageCount: number;
    createdAt: string;
}

export interface FilterState {
    category: string;
    priceRange: [number, number];
    brand: string;
    sortBy: "price-asc" | "price-desc" | "name" | "newest";
}
