import { getOrders } from "@/lib/queries";
import AdminOrdersContent from "@/components/modules/AdminOrdersContent";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
    const orders = await getOrders();
    return <AdminOrdersContent initialOrders={orders} />;
}
