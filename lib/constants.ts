export const SITE_NAME = "XELLÉ";
export const SITE_DESCRIPTION = "Simple. Elegant. Classy.";
export const CURRENCY = "NGN";
export const LOW_STOCK_THRESHOLD = 5;
export const SHIPPING_RATE = 2500;
export const FREE_SHIPPING_THRESHOLD = 50000;

export const SITE_EMAIL = "xelle.ng2026@gmail.com";

export const NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "About", href: "/#about" },
] as const;

export const ADMIN_NAV_LINKS = [
    { label: "Dashboard", href: "/admin", icon: "grid" },
    { label: "Products", href: "/admin/products", icon: "package" },
    { label: "Orders", href: "/admin/orders", icon: "clipboard" },
    { label: "Customers", href: "/admin/customers", icon: "users" },
    { label: "Analytics", href: "/admin/analytics", icon: "chart" },
    { label: "CMS Pages", href: "/admin/pages", icon: "file" },
    { label: "Inventory", href: "/admin/inventory", icon: "box" },
    { label: "Coupons", href: "/admin/coupons", icon: "ticket" },
    { label: "Settings", href: "/admin/settings", icon: "cog" },
    { label: "Categories", href: "/admin/categories", icon: "tag" },
] as const;

export const WHATSAPP_NUMBER = "2349161265463";

// Bank Transfer Details
export const BANK_NAME = "Pocketapp";
export const BANK_ACCOUNT_NUMBER = "9765752252";
export const BANK_ACCOUNT_NAME = "Excellence Okey Orji";
