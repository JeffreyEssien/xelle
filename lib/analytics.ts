import { Order, Product, Profile, Coupon } from "@/types";

export interface AnalyticsData {
    revenue: {
        total: number;
        subtotal: number;
        shipping: number;
        growthRate: number; // vs previous period (mocked for now or calc if dates allow)
        today: number;
        weekly: number;
        monthly: number;
    };
    orders: {
        total: number;
        pending: number;
        shipped: number;
        delivered: number;
        fulfillmentRate: number;
        aov: number; // Average Order Value
        trend: { date: string; count: number; value: number }[];
    };
    products: {
        totalSold: number;
        topSelling: { id: string; name: string; quantity: number; revenue: number }[];
        lowStock: Product[];
        outOfStock: Product[];
        inventoryValue: number;
        stockTurnover: number; // Mocked or complex calc
    };
    customers: {
        total: number;
        new: number;
        returningRate: number;
        clv: number; // Customer Lifetime Value (avg)
        topCustomers: { id: string; name: string; email: string; totalSpent: number; ordersCount: number }[];
    };
    coupons: {
        totalUsage: number;
        discountImpact: number;
    };
    profit: {
        totalRevenue: number;
        totalCOGS: number;
        grossProfit: number;
        grossMargin: number; // percentage
        profitPerOrder: number;
    };
}

export function calculateAnalytics(
    orders: Order[],
    products: Product[],
    customers: Profile[],
    coupons: Coupon[]
): AnalyticsData {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = now.getTime() - 7 * oneDay;
    const monthStart = now.getTime() - 30 * oneDay;

    // --- Revenue Metrics ---
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const subtotalRevenue = orders.reduce((sum, o) => sum + o.subtotal, 0);
    const shippingRevenue = orders.reduce((sum, o) => sum + o.shipping, 0);

    const revenueToday = orders
        .filter(o => new Date(o.createdAt).getTime() >= todayStart)
        .reduce((sum, o) => sum + o.total, 0);

    const revenueWeekly = orders
        .filter(o => new Date(o.createdAt).getTime() >= weekStart)
        .reduce((sum, o) => sum + o.total, 0);

    const revenueMonthly = orders
        .filter(o => new Date(o.createdAt).getTime() >= monthStart)
        .reduce((sum, o) => sum + o.total, 0);

    // --- Profit Metrics ---
    let totalCOGS = 0;

    orders.forEach(order => {
        order.items.forEach(item => {
            // Priority 1: Use snapshot cost from order item (if available from new system)
            // Priority 2: Use current product cost (implied via some mapping if we had it, but we only have Product[])
            // For now, we rely on the 'costPrice' property which we are now adding to order items.
            // If missing (old orders), we assume 0 or ideally we'd fetch it. 
            // To be safe for "Profit" reporting, we only count what we know.
            const itemCost = (item as any).costPrice || 0;
            totalCOGS += itemCost * item.quantity;
        });
    });

    const grossProfit = totalRevenue - totalCOGS - shippingRevenue; // Net out shipping? Usually COGS is against Goods. 
    // Gross Profit = Revenue (Goods) - COGS. Shipping is separate. 
    // Let's align: Gross Profit = (Subtotal) - COGS. 
    // Total Revenue usually includes shipping. 
    // Let's use: Gross Profit = Subtotal - COGS.
    const realGrossProfit = subtotalRevenue - totalCOGS;
    const grossMargin = subtotalRevenue > 0 ? (realGrossProfit / subtotalRevenue) * 100 : 0;
    const profitPerOrder = orders.length > 0 ? realGrossProfit / orders.length : 0;

    // --- Order Metrics ---
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === "pending").length;
    const shippedOrders = orders.filter(o => o.status === "shipped").length;
    const deliveredOrders = orders.filter(o => o.status === "delivered").length;
    const fulfillmentRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;
    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Order Trend (Last 7 days)
    const trendMap = new Map<string, { count: number; value: number }>();
    for (let i = 0; i < 7; i++) {
        const d = new Date(now.getTime() - i * oneDay);
        const key = d.toISOString().split('T')[0];
        trendMap.set(key, { count: 0, value: 0 });
    }

    orders.forEach(o => {
        const key = new Date(o.createdAt).toISOString().split('T')[0];
        if (trendMap.has(key)) {
            const current = trendMap.get(key)!;
            trendMap.set(key, { count: current.count + 1, value: current.value + o.total });
        }
    });

    const trend = Array.from(trendMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

    // --- Product Metrics ---
    // Calculate sales per product from order items
    const productSales = new Map<string, { quantity: number; revenue: number }>();

    orders.forEach(order => {
        order.items.forEach(item => {
            const pid = item.product.id;
            const current = productSales.get(pid) || { quantity: 0, revenue: 0 };
            productSales.set(pid, {
                quantity: current.quantity + item.quantity,
                revenue: current.revenue + (item.product.price * item.quantity) // Using current price as approx
            });
        });
    });

    const topSelling = Array.from(productSales.entries())
        .map(([id, data]) => {
            const product = products.find(p => p.id === id);
            return {
                id,
                name: product?.name || "Unknown Product",
                quantity: data.quantity,
                revenue: data.revenue
            };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    const totalSoldUnits = Array.from(productSales.values()).reduce((sum, p) => sum + p.quantity, 0);
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5); // Hardcoded threshold for now
    const outOfStock = products.filter(p => p.stock === 0);
    const inventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

    // --- Customer Metrics ---
    // Group orders by email to identify unique customers and their spending
    const customerSpending = new Map<string, { totalSpent: number; ordersCount: number; name: string }>();

    orders.forEach(o => {
        const email = o.email.toLowerCase();
        const current = customerSpending.get(email) || { totalSpent: 0, ordersCount: 0, name: o.customerName };
        customerSpending.set(email, {
            totalSpent: current.totalSpent + o.total,
            ordersCount: current.ordersCount + 1,
            name: o.customerName
        });
    });

    const uniqueCustomersCount = customerSpending.size;
    const returningCustomersCount = Array.from(customerSpending.values()).filter(c => c.ordersCount > 1).length;
    const returningRate = uniqueCustomersCount > 0 ? (returningCustomersCount / uniqueCustomersCount) * 100 : 0;
    const avgClv = uniqueCustomersCount > 0 ? totalRevenue / uniqueCustomersCount : 0;

    const topCustomers = Array.from(customerSpending.entries())
        .map(([email, data]) => ({
            id: email, // using email as ID for aggregation
            email,
            name: data.name,
            totalSpent: data.totalSpent,
            ordersCount: data.ordersCount
        }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

    // --- Coupon Metrics ---
    // Approximation: Identify orders where subtotal != total + shipping
    // Or if we had a couponCode field. For now, we'll mock usage based on coupons table usage_count if available,
    // or calculate potential discount diff.
    const totalCouponUsage = coupons.reduce((sum, c) => sum + c.usageCount, 0);

    return {
        revenue: {
            total: totalRevenue,
            subtotal: subtotalRevenue,
            shipping: shippingRevenue,
            growthRate: 0,
            today: revenueToday,
            weekly: revenueWeekly,
            monthly: revenueMonthly
        },
        orders: {
            total: totalOrders,
            pending: pendingOrders,
            shipped: shippedOrders,
            delivered: deliveredOrders,
            fulfillmentRate,
            aov,
            trend
        },
        products: {
            totalSold: totalSoldUnits,
            topSelling,
            lowStock,
            outOfStock,
            inventoryValue,
            stockTurnover: 0
        },
        customers: {
            total: uniqueCustomersCount,
            new: uniqueCustomersCount - returningCustomersCount,
            returningRate,
            clv: avgClv,
            topCustomers
        },
        coupons: {
            totalUsage: totalCouponUsage,
            discountImpact: 0 // Need more data to calc
        },
        profit: {
            totalRevenue: totalRevenue,
            totalCOGS: totalCOGS,
            grossProfit: realGrossProfit,
            grossMargin: grossMargin,
            profitPerOrder: profitPerOrder
        }
    };
}
