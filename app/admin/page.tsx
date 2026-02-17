import {
    getProducts,
    getOrders,
    getCustomers,
    getCoupons,
    getInventoryLogs,
    getInventoryItems
} from "@/lib/queries";
import { calculateAnalytics } from "@/lib/analytics";
import AnalyticsDashboard from "@/components/modules/AnalyticsDashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const [products, orders, customers, coupons, inventoryLogs, inventoryItems] = await Promise.all([
        getProducts(),
        getOrders(),
        getCustomers(),
        getCoupons(),
        getInventoryLogs(),
        getInventoryItems()
    ]);

    const analyticsData = calculateAnalytics(orders, products, customers, coupons, inventoryLogs, inventoryItems);

    return <AnalyticsDashboard data={analyticsData} />;
}
