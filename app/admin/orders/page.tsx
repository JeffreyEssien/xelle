import { getOrders } from "@/lib/queries";
import AdminOrdersContent from "@/components/modules/AdminOrdersContent";

export const revalidate = 30;

export default async function OrdersPage() {
    const orders = await getOrders();
    return <AdminOrdersContent initialOrders={orders} />;
}
