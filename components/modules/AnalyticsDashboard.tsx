"use client";

import { useMemo, useState } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import { formatCurrency } from "@/lib/formatCurrency";
import type { AnalyticsData } from "@/lib/analytics";

interface AnalyticsDashboardProps {
    data: AnalyticsData;
}

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
    const [activeTab, setActiveTab] = useState<"sales" | "inventory" | "customers" | "marketing" | "operations">("sales");

    const tabs = [
        { id: "sales", label: "Sales & Profit" },
        { id: "inventory", label: "Inventory" },
        { id: "customers", label: "Customers" },
        { id: "marketing", label: "Marketing" },
        { id: "operations", label: "Operations" },
    ] as const;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-brand-dark">Analytics</h1>
                    <p className="text-brand-dark/50 text-sm mt-1">
                        Comprehensive store insights
                    </p>
                </div>
                <div className="flex space-x-1 bg-brand-creme/50 p-1 rounded-lg border border-brand-lilac/10">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab.id
                                    ? "bg-white text-brand-purple shadow-sm border border-brand-lilac/20"
                                    : "text-brand-dark/60 hover:text-brand-dark"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === "sales" && <SalesView data={data} />}
            {activeTab === "inventory" && <InventoryView data={data} />}
            {activeTab === "customers" && <CustomersView data={data} />}
            {activeTab === "marketing" && <MarketingView data={data} />}
            {activeTab === "operations" && <OperationsView data={data} />}

        </div>
    );
}

// --- Views ---

function SalesView({ data }: { data: AnalyticsData }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Total Revenue" value={formatCurrency(data.sales.totalRevenue)} icon="💰" />
                <KPICard title="Gross Profit" value={formatCurrency(data.profit.grossProfit)} icon="📈" accent="green" subtext={`${data.profit.grossMargin.toFixed(1)}% Margin`} />
                <KPICard title="Net Revenue" value={formatCurrency(data.sales.netRevenue)} icon="🧾" subtext="Excl. Shipping" />
                <KPICard title="Avg Order Value" value={formatCurrency(data.sales.aov)} icon="🏷️" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-brand-lilac/20 shadow-sm">
                    <h3 className="text-lg font-medium text-brand-dark mb-6">Revenue Trend</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.sales.trend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="date" stroke="#888" fontSize={12} tickFormatter={d => new Date(d).toLocaleDateString(undefined, { weekday: 'short' })} />
                                <YAxis stroke="#888" fontSize={12} tickFormatter={v => `₦${v / 1000}k`} />
                                <Tooltip formatter={(val) => formatCurrency(Number(val))} />
                                <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-brand-lilac/20 shadow-sm">
                    <h3 className="text-lg font-medium text-brand-dark mb-6">Revenue by Status</h3>
                    <div className="space-y-4">
                        {Object.entries(data.sales.revenueByStatus).map(([status, amount], i) => (
                            <div key={status} className="flex justify-between items-center">
                                <span className="capitalize text-sm text-gray-600">{status}</span>
                                <div className="text-right">
                                    <div className="font-medium">{formatCurrency(amount)}</div>
                                    <div className="text-xs text-gray-400">
                                        {((amount / data.sales.totalRevenue) * 100).toFixed(0)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-brand-lilac/20 shadow-sm">
                <h3 className="text-lg font-medium text-brand-dark mb-4">Top Selling Products</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-4 py-2">Product</th>
                                <th className="px-4 py-2 text-right">Units Sold</th>
                                <th className="px-4 py-2 text-right">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.products.topSelling.map(p => (
                                <tr key={p.id}>
                                    <td className="px-4 py-3 font-medium text-brand-dark">{p.name}</td>
                                    <td className="px-4 py-3 text-right">{p.quantity}</td>
                                    <td className="px-4 py-3 text-right">{formatCurrency(p.revenue)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function InventoryView({ data }: { data: AnalyticsData }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Inventory Value (Cost)" value={formatCurrency(data.inventory.totalValuationCost)} icon="🏭" />
                <KPICard title="Inventory Value (Retail)" value={formatCurrency(data.inventory.totalValuationRetail)} icon="🏷️" />
                <KPICard title="Projected Margin" value={`${data.inventory.projectedMargin.toFixed(1)}%`} icon="📊" accent="amber" />
                <KPICard title="Stock Turnover" value={`${(data.products.turnoverRate * 100).toFixed(1)}%`} icon="🔄" subtext="Units Sold / Current Stock" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-brand-lilac/20 shadow-sm">
                    <h3 className="text-lg font-medium text-brand-dark mb-4">Stock Health</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <MiniKPICard label="Low Stock Items" value={data.inventory.lowStockCount.toString()} accent={data.inventory.lowStockCount > 0 ? "red" : "gray"} />
                        <MiniKPICard label="Out of Stock" value={data.inventory.outOfStockCount.toString()} accent={data.inventory.outOfStockCount > 0 ? "red" : "gray"} />
                        <MiniKPICard label="Shrinkage Value" value={formatCurrency(data.inventory.shrinkageValue)} accent="red" />
                        <MiniKPICard label="Total Items" value={data.inventory.totalItems.toString()} />
                    </div>
                </div>
                <div className="bg-brand-creme/30 p-6 rounded-lg border border-brand-lilac/10">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Inventory Insights</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li>• You have <b>{data.inventory.lowStockCount}</b> items below reorder level.</li>
                        <li>• Estimated <b>{formatCurrency(data.inventory.totalValuationRetail - data.inventory.totalValuationCost)}</b> potential profit locked in stock.</li>
                        <li>• Shrinkage accounts for <b>{formatCurrency(data.inventory.shrinkageValue)}</b> loss.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

function CustomersView({ data }: { data: AnalyticsData }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Total Customers" value={data.customers.total.toString()} icon="users" />
                <KPICard title="New (30d)" value={data.customers.new.toString()} icon="user-plus" accent="green" />
                <KPICard title="Returning Rate" value={`${data.customers.returningRate.toFixed(1)}%`} icon="repeat" />
                <KPICard title="Avg CLV" value={formatCurrency(data.customers.clv)} icon="gem" subtext="Lifetime Value" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-brand-lilac/20 shadow-sm">
                    <h3 className="text-lg font-medium text-brand-dark mb-6">Guest vs Registered</h3>
                    <div className="h-[200px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={[
                                    { name: "Registered", value: data.customers.registeredVsGuest.registered },
                                    { name: "Guest", value: data.customers.registeredVsGuest.guest }
                                ]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    <Cell fill="#8b5cf6" />
                                    <Cell fill="#cbd5e1" />
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MarketingView({ data }: { data: AnalyticsData }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Coupon Usage" value={data.marketing.couponUsage.toString()} icon="ticket" />
                <KPICard title="Avg Discount Impact" value={`${data.marketing.discountImpact.toFixed(1)}%`} icon="percent" accent="amber" />
            </div>

            <div className="bg-white p-6 rounded-lg border border-brand-lilac/20 shadow-sm">
                <h3 className="text-lg font-medium text-brand-dark mb-4">Top Performing Coupons</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-4 py-2">Code</th>
                                <th className="px-4 py-2 text-right">Usage Count</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.marketing.topCoupons.map(c => (
                                <tr key={c.code}>
                                    <td className="px-4 py-3 font-mono font-medium text-brand-purple">{c.code}</td>
                                    <td className="px-4 py-3 text-right">{c.count}</td>
                                </tr>
                            ))}
                            {data.marketing.topCoupons.length === 0 && (
                                <tr><td colSpan={2} className="p-4 text-center text-gray-400">No coupon usage yet</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function OperationsView({ data }: { data: AnalyticsData }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <KPICard title="Fulfillment Rate" value={`${data.operations.fulfillmentRate.toFixed(1)}%`} icon="truck" accent={data.operations.fulfillmentRate > 90 ? "green" : "amber"} />
                <KPICard title="Pending Backlog" value={data.operations.backlog.toString()} icon="clock" accent={data.operations.backlog > 5 ? "red" : "purple"} />
                <KPICard title="Recent Activity" value={data.operations.recentActivityCount.toString()} icon="activity" subtext="Events in last 24h" />
            </div>
        </div>
    );
}


// --- Components ---

function KPICard({ title, value, subtext, icon, accent = "purple" }: {
    title: string; value: string; subtext?: string; icon: string; accent?: string
}) {
    const accentColor =
        accent === "amber" ? "bg-amber-100 text-amber-700 border-amber-200" :
            accent === "red" ? "bg-red-100 text-red-700 border-red-200" :
                accent === "green" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                    "bg-brand-lilac/10 text-brand-purple border-brand-lilac/20";

    return (
        <div className="bg-white p-6 rounded-lg border border-brand-lilac/20 shadow-sm flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-brand-dark/60">{title}</p>
                <h3 className="text-2xl font-serif text-brand-dark mt-1 font-bold">{value}</h3>
                {subtext && <p className="text-xs text-brand-dark/40 mt-1">{subtext}</p>}
            </div>
            <div className={`p-3 rounded-full border ${accentColor}`}>
                {/* Simple icon or feather icon wrapper can go here. Using emoji for simplicity/speed or lucide-react if avail */}
                <span className="text-xl leading-none block">{icon}</span>
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
