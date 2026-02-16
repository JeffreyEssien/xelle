import { formatCurrency } from "@/lib/formatCurrency";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import SummaryCard from "@/components/modules/SummaryCard";
import { getProducts, getOrders } from "@/lib/queries";

export const revalidate = 30;

export default async function AdminDashboard() {
    const [products, orders] = await Promise.all([
        getProducts(),
        getOrders(),
    ]);

    const totalSales = orders.reduce((s, o) => s + o.total, 0);
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const lowStockCount = products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD).length;

    return (
        <div>
            <h1 className="font-serif text-3xl text-brand-dark mb-8">Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <SummaryCard title="Total Sales" value={formatCurrency(totalSales)} accent="purple" />
                <SummaryCard title="Pending Orders" value={String(pendingOrders)} accent="amber" />
                <SummaryCard title="Low Stock Alerts" value={String(lowStockCount)} accent="red" />
            </div>
        </div>
    );
}
