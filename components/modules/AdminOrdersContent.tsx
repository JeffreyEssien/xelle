"use client";

import { useState } from "react";
import type { Order } from "@/types";
import { formatCurrency } from "@/lib/formatCurrency";
import Badge from "@/components/ui/Badge";
import OrderDetailPanel from "@/components/modules/OrderDetailPanel";

const statusVariant: Record<Order["status"], "warning" | "info" | "success"> = {
    pending: "warning",
    shipped: "info",
    delivered: "success",
};

const statusOptions: Order["status"][] = ["pending", "shipped", "delivered"];

interface AdminOrdersContentProps {
    initialOrders: Order[];
}

export default function AdminOrdersContent({ initialOrders }: AdminOrdersContentProps) {
    const [orderList, setOrderList] = useState<Order[]>(initialOrders);
    const [selected, setSelected] = useState<Order | null>(null);

    const updateStatus = (id: string, status: Order["status"]) => {
        setOrderList((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    };

    return (
        <div>
            <h1 className="font-serif text-3xl text-brand-dark mb-8">Orders</h1>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className={selected ? "xl:col-span-2" : "xl:col-span-3"}>
                    <OrderTable orders={orderList} onStatusChange={updateStatus} onSelect={setSelected} selectedId={selected?.id} />
                </div>
                {selected && (
                    <div className="xl:col-span-1">
                        <OrderDetailPanel order={selected} onClose={() => setSelected(null)} />
                    </div>
                )}
            </div>
        </div>
    );
}

function OrderTable({ orders, onStatusChange, onSelect, selectedId }: {
    orders: Order[]; onStatusChange: (id: string, s: Order["status"]) => void;
    onSelect: (o: Order) => void; selectedId?: string;
}) {
    return (
        <div className="bg-white rounded-lg border border-brand-lilac/20 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-brand-lilac/20 bg-brand-lilac/5">
                            <th className="text-left px-4 py-3 font-medium text-brand-dark/60">Order</th>
                            <th className="text-left px-4 py-3 font-medium text-brand-dark/60">Customer</th>
                            <th className="text-left px-4 py-3 font-medium text-brand-dark/60">Total</th>
                            <th className="text-left px-4 py-3 font-medium text-brand-dark/60">Status</th>
                            <th className="text-left px-4 py-3 font-medium text-brand-dark/60">Date</th>
                            <th className="text-right px-4 py-3 font-medium text-brand-dark/60">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-lilac/10">
                        {orders.map((o) => (
                            <tr
                                key={o.id}
                                onClick={() => onSelect(o)}
                                className={`cursor-pointer transition-colors hover:bg-brand-lilac/5 ${selectedId === o.id ? "bg-brand-purple/5" : ""}`}
                            >
                                <td className="px-4 py-3 font-mono text-xs text-brand-dark">{o.id}</td>
                                <td className="px-4 py-3">
                                    <p className="text-brand-dark font-medium">{o.customerName}</p>
                                    <p className="text-brand-dark/50 text-xs">{o.email}</p>
                                </td>
                                <td className="px-4 py-3 text-brand-dark/70">{formatCurrency(o.total)}</td>
                                <td className="px-4 py-3">
                                    <Badge variant={statusVariant[o.status]}>{o.status}</Badge>
                                </td>
                                <td className="px-4 py-3 text-brand-dark/50 text-xs">
                                    {new Date(o.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                    <select
                                        value={o.status}
                                        onChange={(e) => onStatusChange(o.id, e.target.value as Order["status"])}
                                        className="text-xs border border-brand-lilac/20 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
                                    >
                                        {statusOptions.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
