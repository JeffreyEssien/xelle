export const SITE_NAME = "XELLÉ";
export const SITE_DESCRIPTION = "Simple. Elegant. Classy.";
export const CURRENCY = "USD";
export const LOW_STOCK_THRESHOLD = 5;
export const SHIPPING_RATE = 9.99;
export const FREE_SHIPPING_THRESHOLD = 150;

export const NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "About", href: "/#about" },
] as const;

export const ADMIN_NAV_LINKS = [
    { label: "Dashboard", href: "/admin", icon: "grid" },
    { label: "Products", href: "/admin/products", icon: "package" },
    { label: "Orders", href: "/admin/orders", icon: "clipboard" },
] as const;
