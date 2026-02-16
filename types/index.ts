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
}

export interface FilterState {
    category: string;
    priceRange: [number, number];
    brand: string;
    sortBy: "price-asc" | "price-desc" | "name" | "newest";
}
