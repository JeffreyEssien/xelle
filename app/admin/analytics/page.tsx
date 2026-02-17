"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { getOrders } from "@/lib/queries";
import { Order } from "@/types";

export default function AnalyticsDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getOrders().then((data) => {
            setOrders(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div>Loading Analytics...</div>;

    // Process Date for Revenue Chart
    const revenueData = orders.reduce((acc: any[], order) => {
        const date = new Date(order.createdAt).toLocaleDateString();
        const existing = acc.find((d) => d.date === date);
        if (existing) {
            existing.revenue += order.total;
        } else {
            acc.push({ date, revenue: order.total });
        }
        return acc;
    }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Process Top Products
    const productSales: Record<string, number> = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            const name = item.product.name;
            productSales[name] = (productSales[name] || 0) + item.quantity;
        });
    });

    const topProductsData = Object.entries(productSales)
        .map(([name, sales]) => ({ name, sales }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-serif text-brand-dark">Analytics Dashboard</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <div className="bg-white p-6 rounded-lg shadow border border-brand-lilac/20">
                    <h2 className="text-xl font-medium mb-4">Revenue Over Time</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products Chart */}
                <div className="bg-white p-6 rounded-lg shadow border border-brand-lilac/20">
                    <h2 className="text-xl font-medium mb-4">Top Selling Products</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProductsData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="sales" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-brand-creme p-6 rounded shadow border border-brand-lilac/10">
                    <h3 className="text-sm font-medium text-gray-500 uppercase">Total Revenue</h3>
                    <p className="text-3xl font-bold text-brand-dark mt-2">
                        ${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
                    </p>
                </div>
                <div className="bg-brand-creme p-6 rounded shadow border border-brand-lilac/10">
                    <h3 className="text-sm font-medium text-gray-500 uppercase">Total Orders</h3>
                    <p className="text-3xl font-bold text-brand-dark mt-2">
                        {orders.length}
                    </p>
                </div>
                <div className="bg-brand-creme p-6 rounded shadow border border-brand-lilac/10">
                    <h3 className="text-sm font-medium text-gray-500 uppercase">Avg. Order Value</h3>
                    <p className="text-3xl font-bold text-brand-dark mt-2">
                        ${(orders.reduce((sum, o) => sum + o.total, 0) / (orders.length || 1)).toFixed(2)}
                    </p>
                </div>
            </div>
        </div>
    );
}
