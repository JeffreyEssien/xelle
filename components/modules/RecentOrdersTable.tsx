"use client";

import Link from "next/link";
import type { Order } from "@/types";
import { formatCurrency } from "@/lib/formatCurrency";

interface RecentOrdersTableProps {
    orders: Order[];
}

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-brand-lilac/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-brand-lilac/20 flex justify-between items-center bg-brand-lilac/5">
                <h3 className="font-serif text-lg text-brand-dark">Recent Orders</h3>
                <Link href="/admin/orders" className="text-sm text-brand-purple hover:underline">
                    View All
                </Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-50 text-brand-dark/60 font-medium">
                        <tr>
                            <th className="px-6 py-3">Order ID</th>
                            <th className="px-6 py-3">Customer</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Amount</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-lilac/10">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-brand-dark/40">
                                    No orders yet.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-3 font-mono text-xs text-brand-dark/70">
                                        #{order.id.slice(0, 8)}
                                    </td>
                                    <td className="px-6 py-3 text-brand-dark">{order.customerName}</td>
                                    <td className="px-6 py-3 text-brand-dark/70">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-3 font-medium text-brand-dark">
                                        {formatCurrency(order.total)}
                                    </td>
                                    <td className="px-6 py-3">
                                        <Badge status={order.status} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function Badge({ status }: { status: string }) {
    const colors = {
        pending: "bg-amber-100 text-amber-800",
        shipped: "bg-blue-100 text-blue-800",
        delivered: "bg-green-100 text-green-800",
    };
    const style = colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
    return (
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${style}`}>
            {status}
        </span>
    );
}
