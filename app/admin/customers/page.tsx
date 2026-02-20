import { getCustomers, getOrders } from "@/lib/queries";
import CustomersContent from "@/components/modules/CustomersContent";
import type { EnrichedProfile, Order } from "@/types";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
    const [customers, orders] = await Promise.all([
        getCustomers(),
        getOrders()
    ]);

    // Aggregate order data by customer email since we don't have strict FK
    // In a real app with auth, we'd use user_id
    const customerStats = new Map<string, { totalSpent: number; orderCount: number; lastOrderDate: string | null }>();

    orders.forEach((order) => {
        const email = order.email.toLowerCase();
        const current = customerStats.get(email) || { totalSpent: 0, orderCount: 0, lastOrderDate: null };

        // Only count completed/paid orders for total spent? 
        // For now, let's count all non-cancelled? Or just use total.
        // Let's assume all orders in list are valid for history.

        current.totalSpent += order.total;
        current.orderCount += 1;

        if (!current.lastOrderDate || new Date(order.createdAt) > new Date(current.lastOrderDate)) {
            current.lastOrderDate = order.createdAt;
        }

        customerStats.set(email, current);
    });

    const enrichedCustomers: EnrichedProfile[] = customers.map(customer => {
        const stats = customerStats.get(customer.email.toLowerCase()) || { totalSpent: 0, orderCount: 0, lastOrderDate: null };
        return {
            ...customer,
            ...stats
        };
    });

    return <CustomersContent customers={enrichedCustomers} />;
}
