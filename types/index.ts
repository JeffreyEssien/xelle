export interface ProductVariant {
    name: string;
    price?: number;
    stock?: number;
    image?: string;
}

export interface InventoryItem {
    id: string;
    sku: string;
    name: string;
    costPrice: number;
    sellingPrice: number;
    stock: number;
    reorderLevel: number;
    supplier?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    id: string;
    slug: string;
    name: string;
    description: string;
    price: number;
    category: string;
    brand: string;
    inventoryId?: string; // Optional during migration
    stock: number; // Mapped from InventoryItem in queries
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
    couponCode?: string;
    discountTotal?: number;
    paymentMethod?: "whatsapp" | "bank_transfer";
    senderName?: string;
    paymentStatus?: "awaiting_payment" | "payment_submitted" | "payment_confirmed";
    // Delivery details
    deliveryZone?: string;
    deliveryType?: "doorstep" | "hub_pickup";
    deliveryDiscount?: { percent: number; label: string | null };
}

export interface Media {
    id: string;
    url: string;
    publicId: string;
    type: "image" | "video";
    name?: string;
    folder: string;
    width?: number;
    height?: number;
    bytes?: number;
    format?: string;
    createdAt: string;
}

export type HeroDisplayMode = "single" | "slideshow" | "video";

export interface HeroDisplayConfig {
    mode: HeroDisplayMode;
    mediaIds: string[]; // references media table IDs
    slideshowInterval: number; // seconds between slides
    useFeaturedSlides: boolean;
}

export type FeaturedSlideType = "product" | "media" | "promo";
export type OverlayPosition = "bottom-left" | "bottom-right" | "center" | "top-left" | "top-right";
export type OverlayStyle = "dark-glass" | "light-glass" | "gradient" | "none";
export type OverlayFont = "serif" | "sans" | "mono";
export type OverlayGradient = "none" | "dark-bottom" | "dark-top" | "dark-full" | "brand-bottom" | "brand-radial" | "warm-bottom" | "cool-bottom";

export interface FeaturedSlide {
    id: string;
    type: FeaturedSlideType;
    isActive: boolean;
    sortOrder: number;
    // Content
    imageUrl?: string;
    videoUrl?: string;
    productId?: string; // for product slides
    productName?: string;
    productPrice?: number;
    productSlug?: string;
    mediaId?: string; // for media slides
    // Overlay
    headline?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    overlayPosition: OverlayPosition;
    overlayStyle: OverlayStyle;
    // Advanced overlay customization
    textColor?: string;
    fontStyle?: OverlayFont;
    overlayGradient?: OverlayGradient;
}

export interface SiteSettings {
    id: boolean;
    siteName: string;
    logoUrl?: string;
    heroEnabled?: boolean;
    heroHeading?: string;
    heroSubheading?: string;
    heroImage?: string;
    heroCtaText?: string;
    heroCtaLink?: string;
    heroEyebrow?: string;
    heroCtaSecondaryText?: string;
    heroCtaSecondaryLink?: string;
    heroTrustBadges?: string[]; // e.g. ["SAME-DAY DELIVERY", "QUALITY GUARANTEED"]
    // New Fields
    faviconUrl?: string;
    ourStoryHeading?: string;
    ourStoryText?: string;
    whyXelleHeading?: string;
    whyXelleFeatures?: string;
    // Announcement bar
    announcementBarEnabled?: boolean;
    announcementBarText?: string;
    announcementBarColor?: string;
    // Social links
    socialInstagram?: string;
    socialTwitter?: string;
    socialTiktok?: string;
    socialFacebook?: string;
    // Store info
    businessPhone?: string;
    businessWhatsapp?: string;
    businessAddress?: string;
    // Footer
    footerTagline?: string;
    // Shipping
    freeShippingThreshold?: number;
    // Hero display
    heroDisplayConfig?: HeroDisplayConfig;
    featuredSlides?: FeaturedSlide[];
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

export interface Profile {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    role: "customer" | "admin";
    createdAt: string;
}

export interface EnrichedProfile extends Profile {
    totalSpent: number;
    orderCount: number;
    lastOrderDate: string | null;
}

export interface Page {
    id: string;
    slug: string;
    title: string;
    content: any; // TipTap JSON or HTML
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface InventoryLog {
    id: string;
    productId: string;
    productName?: string;
    changeAmount: number;
    reason: string;
    createdAt: string;
}

export interface Stockpile {
    id: string;
    customerEmail: string;
    customerName: string;
    phone?: string;
    status: "active" | "shipped" | "expired" | "cancelled";
    shippingAddress?: ShippingAddress;
    deliveryZone?: string;
    deliveryType?: string;
    deliveryFee: number;
    totalItemsValue: number;
    createdAt: string;
    expiresAt: string;
    shippedAt?: string;
    items: StockpileItem[];
}

export interface StockpileItem {
    id: string;
    stockpileId: string;
    productId: string;
    productName: string;
    productImage?: string;
    variantName?: string;
    quantity: number;
    pricePaid: number;
    orderId?: string;
    createdAt: string;
}

export interface Review {
    id: string;
    productId: string;
    orderId: string;
    customerName: string;
    customerEmail: string;
    rating: number; // 1-5
    title: string;
    body: string;
    isApproved: boolean;
    isVisible: boolean;
    displayOrder: number; // lower = shows first, admin can reorder
    createdAt: string;
    updatedAt: string;
}
