import {
    getProducts,
    getOrders,
    getCustomers,
    getCoupons
} from "@/lib/queries";
import { calculateAnalytics } from "@/lib/analytics";
import AnalyticsDashboard from "@/components/modules/AnalyticsDashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const [products, orders, customers, coupons] = await Promise.all([
        getProducts(),
        getOrders(),
        getCustomers(),
        getCoupons()
    ]);

    const analyticsData = calculateAnalytics(orders, products, customers, coupons);

    return <AnalyticsDashboard data={analyticsData} />;
}
