import {
    getOrders,
    getProducts,
    getCustomers,
    getCoupons,
    getInventoryLogs,
    getInventoryItems
} from "@/lib/queries";
import { calculateAnalytics } from "@/lib/analytics";
import AnalyticsDashboardComponent from "@/components/modules/AnalyticsDashboard";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
    const [orders, products, customers, coupons, logs, items] = await Promise.all([
        getOrders(),
        getProducts(),
        getCustomers(),
        getCoupons(),
        getInventoryLogs(),
        getInventoryItems()
    ]);

    const data = calculateAnalytics(orders, products, customers, coupons, logs, items);

    return <AnalyticsDashboardComponent data={data} />;
}
