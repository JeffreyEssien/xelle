"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Order } from "@/types";
import { formatCurrency } from "@/lib/formatCurrency";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import OrderDetailPanel from "@/components/modules/OrderDetailPanel";
import AdminCreateOrder from "@/components/modules/AdminCreateOrder";
import { Plus, ChevronDown, ChevronRight, Archive, Package, Truck } from "lucide-react";

const statusVariant: Record<Order["status"], "warning" | "info" | "success"> = {
    pending: "warning",
    shipped: "info",
    delivered: "success",
};

const statusOptions: Order["status"][] = ["pending", "shipped", "delivered"];

type FilterTab = "all" | "regular" | "stockpile";

const isStockpileOrder = (o: Order) => o.id.startsWith("ORD-SP-") || o.id.startsWith("ORD-SHP-");
const isShippingOrder = (o: Order) => o.id.startsWith("ORD-SHP-");

/** Worst status in group: pending > shipped > delivered */
function aggregateStatus(orders: Order[]): Order["status"] {
    if (orders.some((o) => o.status === "pending")) return "pending";
    if (orders.some((o) => o.status === "shipped")) return "shipped";
    return "delivered";
}

interface StockpileGroup {
    email: string;
    customerName: string;
    orders: Order[];
    total: number;
    status: Order["status"];
    latestDate: string;
}

/** A unified row type so we can sort regular orders and stockpile groups together by date */
type DisplayRow =
    | { kind: "order"; order: Order; sortDate: string }
    | { kind: "group"; group: StockpileGroup; sortDate: string };

interface AdminOrdersContentProps {
    initialOrders: Order[];
}

export default function AdminOrdersContent({ initialOrders }: AdminOrdersContentProps) {
    const router = useRouter();
    const [orderList, setOrderList] = useState<Order[]>(initialOrders);
    const [selected, setSelected] = useState<Order | null>(null);
    const [search, setSearch] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [tab, setTab] = useState<FilterTab>("all");
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    useEffect(() => {
        setOrderList(initialOrders);
    }, [initialOrders]);

    const filteredOrders = useMemo(() =>
        orderList.filter((o) =>
            o.customerName.toLowerCase().includes(search.toLowerCase()) ||
            o.email.toLowerCase().includes(search.toLowerCase()) ||
            o.id.toLowerCase().includes(search.toLowerCase())
        ),
        [orderList, search]
    );

    // Split into regular orders and stockpile groups
    const { displayRows, stockpileGroups } = useMemo(() => {
        const regular: Order[] = [];
        const spMap = new Map<string, Order[]>();

        for (const o of filteredOrders) {
            if (isStockpileOrder(o)) {
                const key = o.email.toLowerCase();
                if (!spMap.has(key)) spMap.set(key, []);
                spMap.get(key)!.push(o);
            } else {
                regular.push(o);
            }
        }

        const groups: StockpileGroup[] = [];
        for (const [email, orders] of spMap) {
            const sorted = orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            groups.push({
                email,
                customerName: sorted[0].customerName,
                orders: sorted,
                total: orders.reduce((sum, o) => sum + o.total, 0),
                status: aggregateStatus(orders),
                latestDate: sorted[0].createdAt,
            });
        }

        // Build unified display list sorted by date (newest first)
        const rows: DisplayRow[] = [];

        if (tab === "regular") {
            for (const o of regular) rows.push({ kind: "order", order: o, sortDate: o.createdAt });
        } else if (tab === "stockpile") {
            for (const g of groups) rows.push({ kind: "group", group: g, sortDate: g.latestDate });
        } else {
            for (const o of regular) rows.push({ kind: "order", order: o, sortDate: o.createdAt });
            for (const g of groups) rows.push({ kind: "group", group: g, sortDate: g.latestDate });
        }

        rows.sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime());

        return { displayRows: rows, stockpileGroups: groups };
    }, [filteredOrders, tab]);

    const handleRefresh = () => {
        router.refresh();
        setSelected(null);
    };

    const toggleGroup = (email: string) => {
        setExpandedGroups((prev) => {
            const next = new Set(prev);
            if (next.has(email)) next.delete(email);
            else next.add(email);
            return next;
        });
    };

    const updateStatus = async (id: string, newStatus: Order["status"]) => {
        setOrderList((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
        if (selected && selected.id === id) {
            setSelected((prev) => prev ? { ...prev, status: newStatus } : null);
        }
        try {
            const response = await fetch(`/api/orders/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!response.ok) {
                console.error("Failed to update status");
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            router.refresh();
        }
    };

    const bulkUpdateStatus = async (emails: string, orders: Order[], newStatus: Order["status"]) => {
        // Optimistic update for all orders in group
        const ids = new Set(orders.map((o) => o.id));
        setOrderList((prev) => prev.map((o) => (ids.has(o.id) ? { ...o, status: newStatus } : o)));

        for (const o of orders) {
            try {
                await fetch(`/api/orders/${o.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: newStatus }),
                });
            } catch (error) {
                console.error(`Failed to update ${o.id}:`, error);
            }
        }
    };

    // Count badges for tabs
    const regularCount = filteredOrders.filter((o) => !isStockpileOrder(o)).length;
    const stockpileGroupCount = stockpileGroups.length;

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                <h1 className="font-serif text-2xl sm:text-3xl text-brand-dark">Orders</h1>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Search by ID, name, or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-4 py-2 border border-brand-lilac/30 rounded-sm focus:outline-none focus:border-brand-purple w-full sm:w-80"
                    />
                    <Button onClick={() => setShowCreate(true)} className="shrink-0">
                        <span className="flex items-center gap-2">
                            <Plus size={16} />
                            <span className="hidden sm:inline">Create Order</span>
                        </span>
                    </Button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 mb-5 bg-brand-lilac/5 rounded-lg p-1 w-fit">
                <TabButton active={tab === "all"} onClick={() => setTab("all")}>
                    All Orders
                    <span className="ml-1.5 text-[10px] opacity-60">{filteredOrders.length}</span>
                </TabButton>
                <TabButton active={tab === "regular"} onClick={() => setTab("regular")}>
                    Regular
                    <span className="ml-1.5 text-[10px] opacity-60">{regularCount}</span>
                </TabButton>
                <TabButton active={tab === "stockpile"} onClick={() => setTab("stockpile")}>
                    <Archive size={12} className="mr-1" />
                    Stockpile
                    <span className="ml-1.5 text-[10px] opacity-60">{stockpileGroupCount}</span>
                </TabButton>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" style={{ height: "calc(100vh - 220px)" }}>
                <div className={`${selected ? "xl:col-span-2" : "xl:col-span-3"} overflow-y-auto`}>
                    {/* Desktop table */}
                    <div className="hidden md:block">
                        <div className="bg-white rounded-lg border border-brand-lilac/20 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 z-10">
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
                                        {displayRows.map((row) =>
                                            row.kind === "order" ? (
                                                <OrderRow
                                                    key={row.order.id}
                                                    order={row.order}
                                                    onStatusChange={updateStatus}
                                                    onSelect={setSelected}
                                                    isSelected={selected?.id === row.order.id}
                                                />
                                            ) : (
                                                <StockpileGroupRows
                                                    key={`sp-${row.group.email}`}
                                                    group={row.group}
                                                    expanded={expandedGroups.has(row.group.email)}
                                                    onToggle={() => toggleGroup(row.group.email)}
                                                    onStatusChange={updateStatus}
                                                    onBulkStatusChange={(status) => bulkUpdateStatus(row.group.email, row.group.orders, status)}
                                                    onSelect={setSelected}
                                                    selectedId={selected?.id}
                                                />
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden space-y-3">
                        {displayRows.map((row) =>
                            row.kind === "order" ? (
                                <OrderCard
                                    key={row.order.id}
                                    order={row.order}
                                    onStatusChange={updateStatus}
                                    onSelect={setSelected}
                                    isSelected={selected?.id === row.order.id}
                                />
                            ) : (
                                <StockpileGroupCard
                                    key={`sp-${row.group.email}`}
                                    group={row.group}
                                    expanded={expandedGroups.has(row.group.email)}
                                    onToggle={() => toggleGroup(row.group.email)}
                                    onStatusChange={updateStatus}
                                    onBulkStatusChange={(status) => bulkUpdateStatus(row.group.email, row.group.orders, status)}
                                    onSelect={setSelected}
                                    selectedId={selected?.id}
                                />
                            )
                        )}
                    </div>
                </div>
                {selected && (
                    <div className="xl:col-span-1 overflow-y-auto">
                        <OrderDetailPanel
                            order={selected}
                            onClose={() => setSelected(null)}
                            onUpdate={handleRefresh}
                        />
                    </div>
                )}
            </div>

            {showCreate && (
                <AdminCreateOrder
                    onClose={() => setShowCreate(false)}
                    onSuccess={() => {
                        setShowCreate(false);
                        handleRefresh();
                    }}
                />
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   TAB BUTTON
   ═══════════════════════════════════════════════════════════ */

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${active
                ? "bg-white text-brand-dark shadow-sm"
                : "text-brand-dark/50 hover:text-brand-dark/70"
                }`}
        >
            {children}
        </button>
    );
}

/* ═══════════════════════════════════════════════════════════
   ORDER TYPE PILL
   ═══════════════════════════════════════════════════════════ */

function OrderTypePill({ order }: { order: Order }) {
    if (isShippingOrder(order)) {
        return (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
                <Truck size={9} /> Shipping
            </span>
        );
    }
    if (isStockpileOrder(order)) {
        return (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-brand-purple/10 text-brand-purple">
                <Package size={9} /> Items
            </span>
        );
    }
    return null;
}

/* ═══════════════════════════════════════════════════════════
   DESKTOP: REGULAR ORDER ROW
   ═══════════════════════════════════════════════════════════ */

function OrderRow({ order, onStatusChange, onSelect, isSelected }: {
    order: Order;
    onStatusChange: (id: string, s: Order["status"]) => void;
    onSelect: (o: Order) => void;
    isSelected: boolean;
}) {
    return (
        <tr
            onClick={() => onSelect(order)}
            className={`cursor-pointer transition-colors hover:bg-brand-lilac/5 ${isSelected ? "bg-brand-purple/5" : ""}`}
        >
            <td className="px-4 py-3 font-mono text-xs text-brand-dark">{order.id}</td>
            <td className="px-4 py-3">
                <p className="text-brand-dark font-medium">{order.customerName}</p>
                <p className="text-brand-dark/50 text-xs">{order.email}</p>
            </td>
            <td className="px-4 py-3 text-brand-dark/70">{formatCurrency(order.total)}</td>
            <td className="px-4 py-3">
                <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
            </td>
            <td className="px-4 py-3 text-brand-dark/50 text-xs">
                {new Date(order.createdAt).toLocaleDateString()}
            </td>
            <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                <select
                    value={order.status}
                    onChange={(e) => onStatusChange(order.id, e.target.value as Order["status"])}
                    className="text-xs border border-brand-lilac/20 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
                >
                    {statusOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </td>
        </tr>
    );
}

/* ═══════════════════════════════════════════════════════════
   DESKTOP: STOCKPILE GROUP (header row + expandable sub-rows)
   ═══════════════════════════════════════════════════════════ */

function StockpileGroupRows({ group, expanded, onToggle, onStatusChange, onBulkStatusChange, onSelect, selectedId }: {
    group: StockpileGroup;
    expanded: boolean;
    onToggle: () => void;
    onStatusChange: (id: string, s: Order["status"]) => void;
    onBulkStatusChange: (s: Order["status"]) => void;
    onSelect: (o: Order) => void;
    selectedId?: string;
}) {
    const Chevron = expanded ? ChevronDown : ChevronRight;

    return (
        <>
            {/* Group header row */}
            <tr
                onClick={onToggle}
                className="cursor-pointer transition-colors bg-brand-purple/[0.03] hover:bg-brand-purple/[0.07] border-l-2 border-l-brand-purple/30"
            >
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        <Chevron size={14} className="text-brand-purple/50 shrink-0" />
                        <Archive size={13} className="text-brand-purple/60 shrink-0" />
                        <span className="text-[10px] font-semibold text-brand-purple/70 uppercase tracking-wider">Stockpile</span>
                    </div>
                </td>
                <td className="px-4 py-3">
                    <p className="text-brand-dark font-medium">{group.customerName}</p>
                    <p className="text-brand-dark/50 text-xs">{group.email}</p>
                </td>
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        <span className="text-brand-dark/70 font-medium">{formatCurrency(group.total)}</span>
                        <span className="text-[10px] text-brand-dark/35 bg-brand-dark/5 px-1.5 py-0.5 rounded-full">
                            {group.orders.length} order{group.orders.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                </td>
                <td className="px-4 py-3">
                    <Badge variant={statusVariant[group.status]}>{group.status}</Badge>
                </td>
                <td className="px-4 py-3 text-brand-dark/50 text-xs">
                    {new Date(group.latestDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <select
                        value={group.status}
                        onChange={(e) => onBulkStatusChange(e.target.value as Order["status"])}
                        className="text-xs border border-brand-purple/20 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-purple/30 bg-brand-purple/5"
                        title="Update all orders in this group"
                    >
                        {statusOptions.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </td>
            </tr>

            {/* Expanded sub-order rows */}
            {expanded && group.orders.map((o) => (
                <tr
                    key={o.id}
                    onClick={() => onSelect(o)}
                    className={`cursor-pointer transition-colors hover:bg-brand-lilac/5 border-l-2 border-l-brand-purple/15 ${selectedId === o.id ? "bg-brand-purple/5" : "bg-brand-purple/[0.01]"}`}
                >
                    <td className="pl-10 pr-4 py-2.5">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-brand-dark/60">{o.id}</span>
                            <OrderTypePill order={o} />
                        </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-brand-dark/50">
                        {o.items.length > 0
                            ? o.items.map((i) => i.product.name).join(", ")
                            : "—"
                        }
                    </td>
                    <td className="px-4 py-2.5 text-brand-dark/60 text-xs">{formatCurrency(o.total)}</td>
                    <td className="px-4 py-2.5">
                        <Badge variant={statusVariant[o.status]}>{o.status}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-brand-dark/40 text-xs">
                        {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
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
        </>
    );
}

/* ═══════════════════════════════════════════════════════════
   MOBILE: REGULAR ORDER CARD
   ═══════════════════════════════════════════════════════════ */

function OrderCard({ order, onStatusChange, onSelect, isSelected }: {
    order: Order; onStatusChange: (id: string, s: Order["status"]) => void;
    onSelect: (o: Order) => void; isSelected: boolean;
}) {
    return (
        <div
            onClick={() => onSelect(order)}
            className={`bg-white rounded-lg border p-4 cursor-pointer transition-colors ${isSelected ? "border-brand-purple ring-1 ring-brand-purple/20" : "border-brand-lilac/20 hover:border-brand-lilac/40"}`}
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-brand-dark truncate">{order.customerName}</p>
                    <p className="text-xs text-brand-dark/50 truncate">{order.email}</p>
                </div>
                <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-brand-dark/40">{order.id}</span>
                <span className="font-medium text-brand-dark">{formatCurrency(order.total)}</span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-brand-lilac/10">
                <span className="text-xs text-brand-dark/50">{new Date(order.createdAt).toLocaleDateString()}</span>
                <div onClick={(e) => e.stopPropagation()}>
                    <select
                        value={order.status}
                        onChange={(e) => onStatusChange(order.id, e.target.value as Order["status"])}
                        className="text-xs border border-brand-lilac/20 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-purple/30 bg-white"
                    >
                        {statusOptions.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   MOBILE: STOCKPILE GROUP CARD
   ═══════════════════════════════════════════════════════════ */

function StockpileGroupCard({ group, expanded, onToggle, onStatusChange, onBulkStatusChange, onSelect, selectedId }: {
    group: StockpileGroup;
    expanded: boolean;
    onToggle: () => void;
    onStatusChange: (id: string, s: Order["status"]) => void;
    onBulkStatusChange: (s: Order["status"]) => void;
    onSelect: (o: Order) => void;
    selectedId?: string;
}) {
    const Chevron = expanded ? ChevronDown : ChevronRight;

    return (
        <div className="rounded-lg border border-brand-purple/20 overflow-hidden">
            {/* Group header */}
            <div
                onClick={onToggle}
                className="bg-brand-purple/[0.04] p-4 cursor-pointer"
            >
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <Chevron size={14} className="text-brand-purple/50 shrink-0" />
                        <Archive size={13} className="text-brand-purple/60 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-brand-dark truncate">{group.customerName}</p>
                            <p className="text-xs text-brand-dark/50 truncate">{group.email}</p>
                        </div>
                    </div>
                    <Badge variant={statusVariant[group.status]}>{group.status}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-brand-purple/60 font-medium">
                        {group.orders.length} stockpile order{group.orders.length !== 1 ? "s" : ""}
                    </span>
                    <span className="font-medium text-brand-dark">{formatCurrency(group.total)}</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-brand-purple/10">
                    <span className="text-xs text-brand-dark/50">{new Date(group.latestDate).toLocaleDateString()}</span>
                    <div onClick={(e) => e.stopPropagation()}>
                        <select
                            value={group.status}
                            onChange={(e) => onBulkStatusChange(e.target.value as Order["status"])}
                            className="text-xs border border-brand-purple/20 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-purple/30 bg-white"
                            title="Update all orders"
                        >
                            {statusOptions.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Expanded sub-order cards */}
            {expanded && (
                <div className="border-t border-brand-purple/10 bg-white divide-y divide-brand-lilac/10">
                    {group.orders.map((o) => (
                        <div
                            key={o.id}
                            onClick={() => onSelect(o)}
                            className={`p-3 pl-5 cursor-pointer transition-colors border-l-2 border-l-brand-purple/20 ${selectedId === o.id ? "bg-brand-purple/5" : "hover:bg-brand-lilac/5"}`}
                        >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-mono text-[11px] text-brand-dark/50 truncate">{o.id}</span>
                                    <OrderTypePill order={o} />
                                </div>
                                <Badge variant={statusVariant[o.status]}>{o.status}</Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-brand-dark/40">{new Date(o.createdAt).toLocaleDateString()}</span>
                                <span className="font-medium text-brand-dark">{formatCurrency(o.total)}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2" onClick={(e) => e.stopPropagation()}>
                                <span className="text-[10px] text-brand-dark/35 truncate">
                                    {o.items.length > 0 ? o.items.map((i) => i.product.name).join(", ") : "Shipping fee"}
                                </span>
                                <select
                                    value={o.status}
                                    onChange={(e) => onStatusChange(o.id, e.target.value as Order["status"])}
                                    className="text-[10px] border border-brand-lilac/20 rounded px-1.5 py-0.5 focus:outline-none bg-white ml-2 shrink-0"
                                >
                                    {statusOptions.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
