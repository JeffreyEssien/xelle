"use client";

import { useEffect, useState } from "react";
import {
    getOrders,
    getProducts,
    getCustomers,
    getCoupons,
    getInventoryLogs,
    getInventoryItems
} from "@/lib/queries";
import { calculateAnalytics, AnalyticsData } from "@/lib/analytics";
import AnalyticsDashboardComponent from "@/components/modules/AnalyticsDashboard";
import { Order, Product, Profile, Coupon, InventoryLog, InventoryItem } from "@/types";

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [orders, products, customers, coupons, logs, items] = await Promise.all([
                    getOrders(),
                    getProducts(),
                    getCustomers(),
                    getCoupons(),
                    getInventoryLogs(),
                    getInventoryItems()
                ]);

                const analytics = calculateAnalytics(orders, products, customers, coupons, logs, items);
                setData(analytics);
            } catch (error) {
                console.error("Failed to load analytics data", error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple mx-auto mb-4"></div>
                    <p className="text-brand-dark/60">Crunching the numbers...</p>
                </div>
            </div>
        );
    }

    if (!data) return <div>Error loading data.</div>;

    return <AnalyticsDashboardComponent data={data} />;
}
