"use client";

import { useMemo } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import { formatCurrency } from "@/lib/formatCurrency";
import type { AnalyticsData } from "@/lib/analytics";
import Badge from "@/components/ui/Badge";
import Link from "next/link";

interface AnalyticsDashboardProps {
    data: AnalyticsData;
}

const STATUS_COLORS = {
    pending: "#F59E0B", // amber-500
    shipped: "#3B82F6", // blue-500
    delivered: "#10B981", // emerald-500
};

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {

    const orderStatusData = useMemo(() => [
        { name: "Pending", value: data.orders.pending, color: STATUS_COLORS.pending },
        { name: "Shipped", value: data.orders.shipped, color: STATUS_COLORS.shipped },
        { name: "Delivered", value: data.orders.delivered, color: STATUS_COLORS.delivered },
    ].filter(d => d.value > 0), [data.orders]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-brand-dark">Dashboard</h1>
                    <p className="text-brand-dark/50 text-sm mt-1">
                        Overview of your store performance
                    </p>
                </div>
                <div className="text-xs text-brand-dark/40 font-mono">
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Total Revenue"
                    value={formatCurrency(data.revenue.total)}
                    subtext={`${data.orders.total} orders total`}
                    icon="💰"
                />
                <KPICard
                    title="Average Order Value"
                    value={formatCurrency(data.orders.aov)}
                    subtext="Revenue per order"
                    icon="🏷️"
                />
                <KPICard
                    title="Pending Orders"
                    value={data.orders.pending.toString()}
                    subtext="Requires fulfillment"
                    icon="📦"
                    accent="amber"
                />
                <KPICard
                    title="Customers"
                    value={data.customers.total.toString()}
                    subtext={`${data.customers.new} new this period`}
                    icon="👥"
                />
            </div>

            {/* Secondary KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MiniKPICard label="Inventory Value" value={formatCurrency(data.products.inventoryValue)} />
                <MiniKPICard label="Low Stock Items" value={data.products.lowStock.length.toString()} accent={data.products.lowStock.length > 0 ? "red" : "gray"} />
                <MiniKPICard label="Coupon Usage" value={data.coupons.totalUsage.toString()} />
                <MiniKPICard label="Fulfillment Rate" value={`${data.orders.fulfillmentRate.toFixed(1)}%`} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Trend */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-brand-lilac/20 shadow-sm">
                    <h3 className="text-lg font-medium text-brand-dark mb-6">Revenue Trend (Last 7 Days)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.orders.trend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#888"
                                    fontSize={12}
                                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { weekday: 'short' })}
                                />
                                <YAxis
                                    stroke="#888"
                                    fontSize={12}
                                    tickFormatter={(val) => `₦${val / 1000}k`}
                                />
                                <Tooltip
                                    formatter={(value: number | string | Array<number | string> | undefined) => [formatCurrency(Number(value || 0)), "Revenue"]}
                                    labelFormatter={(label) => new Date(label).toDateString()}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#6d28d9"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: "#6d28d9" }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Order Status */}
                <div className="bg-white p-6 rounded-lg border border-brand-lilac/20 shadow-sm">
                    <h3 className="text-lg font-medium text-brand-dark mb-6">Order Status</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={orderStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {orderStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {data.orders.total === 0 && (
                        <div className="text-center text-sm text-gray-500 mt-[-150px]">No orders yet</div>
                    )}
                </div>
            </div>

            {/* Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="bg-white rounded-lg border border-brand-lilac/20 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-brand-lilac/10">
                        <h3 className="text-lg font-medium text-brand-dark">Top Selling Products</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-brand-creme text-brand-dark/70">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Product</th>
                                    <th className="px-6 py-3 font-medium text-right">Sold</th>
                                    <th className="px-6 py-3 font-medium text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-lilac/10">
                                {data.products.topSelling.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">No sales data yet.</td>
                                    </tr>
                                ) : (
                                    data.products.topSelling.map((p) => (
                                        <tr key={p.id} className="hover:bg-brand-creme/20">
                                            <td className="px-6 py-3 font-medium text-brand-dark">{p.name}</td>
                                            <td className="px-6 py-3 text-right">{p.quantity}</td>
                                            <td className="px-6 py-3 text-right">{formatCurrency(p.revenue)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Customers */}
                <div className="bg-white rounded-lg border border-brand-lilac/20 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-brand-lilac/10">
                        <h3 className="text-lg font-medium text-brand-dark">Top Customers</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-brand-creme text-brand-dark/70">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Customer</th>
                                    <th className="px-6 py-3 font-medium text-right">Orders</th>
                                    <th className="px-6 py-3 font-medium text-right">Total Spent</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-lilac/10">
                                {data.customers.topCustomers.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">No customer data yet.</td>
                                    </tr>
                                ) : (
                                    data.customers.topCustomers.map((c) => (
                                        <tr key={c.id} className="hover:bg-brand-creme/20">
                                            <td className="px-6 py-3">
                                                <div className="font-medium text-brand-dark">{c.name}</div>
                                                <div className="text-xs text-gray-500">{c.email}</div>
                                            </td>
                                            <td className="px-6 py-3 text-right">{c.ordersCount}</td>
                                            <td className="px-6 py-3 text-right">{formatCurrency(c.totalSpent)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, subtext, icon, accent = "purple" }: {
    title: string; value: string; subtext: string; icon: string; accent?: string
}) {
    const accentColor =
        accent === "amber" ? "bg-amber-100 text-amber-700 border-amber-200" :
            accent === "red" ? "bg-red-100 text-red-700 border-red-200" :
                "bg-brand-lilac/10 text-brand-purple border-brand-lilac/20"; // default

    return (
        <div className="bg-white p-6 rounded-lg border border-brand-lilac/20 shadow-sm flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-brand-dark/60">{title}</p>
                <h3 className="text-2xl font-serif text-brand-dark mt-1 font-bold">{value}</h3>
                <p className="text-xs text-brand-dark/40 mt-1">{subtext}</p>
            </div>
            <div className={`p-3 rounded-full border ${accentColor}`}>
                <span className="text-xl">{icon}</span>
            </div>
        </div>
    );
}

function MiniKPICard({ label, value, accent = "gray" }: { label: string; value: string; accent?: string }) {
    const textColor = accent === "red" ? "text-red-600" : "text-brand-dark";
    return (
        <div className="bg-white p-4 rounded-lg border border-brand-lilac/20 shadow-sm text-center">
            <p className="text-xs text-brand-dark/50 uppercase tracking-wider">{label}</p>
            <p className={`text-lg font-bold font-serif ${textColor} mt-1`}>{value}</p>
        </div>
    );
}
