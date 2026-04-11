"use client";

import { useState } from "react";
import Link from "next/link";
import type { Order } from "@/types";
import { formatCurrency } from "@/lib/formatCurrency";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { X, Printer, MessageCircle, Truck, Package, CheckCircle, CreditCard, User, MapPin, FileText, ShoppingBag, Receipt, Ban } from "lucide-react";

const statusVariant: Record<Order["status"], "warning" | "info" | "success"> = {
    pending: "warning",
    shipped: "info",
    delivered: "success",
};

const statusIcon: Record<Order["status"], React.ReactNode> = {
    pending: <Package size={14} />,
    shipped: <Truck size={14} />,
    delivered: <CheckCircle size={14} />,
};

interface OrderDetailPanelProps {
    order: Order;
    onClose: () => void;
    onUpdate?: () => void;
}

export default function OrderDetailPanel({ order, onClose, onUpdate }: OrderDetailPanelProps) {
    const addr = order.shippingAddress;
    const [notes, setNotes] = useState(order.notes || "");
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isApprovingPayment, setIsApprovingPayment] = useState(false);

    const handleStatusUpdate = async (status: Order["status"]) => {
        if (!confirm(`Mark order as ${status}?`)) return;
        setIsUpdatingStatus(true);
        try {
            const res = await fetch(`/api/orders/${order.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error("Failed");
            if (onUpdate) onUpdate();
        } catch {
            alert("Failed to update status");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleSaveNotes = async () => {
        setIsSavingNotes(true);
        try {
            const res = await fetch(`/api/orders/${order.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes }),
            });
            if (!res.ok) throw new Error("Failed");
            alert("Notes saved");
            if (onUpdate) onUpdate();
        } catch {
            alert("Failed to save notes");
        } finally {
            setIsSavingNotes(false);
        }
    };

    const handleApprovePayment = async () => {
        if (!confirm("Approve this payment? This confirms you've received the bank transfer.")) return;
        setIsApprovingPayment(true);
        try {
            const res = await fetch(`/api/orders/${order.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentStatus: "payment_confirmed" }),
            });
            if (!res.ok) throw new Error("Failed");
            if (onUpdate) onUpdate();
        } catch {
            alert("Failed to approve payment");
        } finally {
            setIsApprovingPayment(false);
        }
    };

    const openWhatsApp = (message: string) => {
        const phone = order.phone.replace(/^0/, "234").replace(/\D/g, "");
        window.open(
            `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
            "_blank"
        );
    };

    const messageCustomer = () => {
        openWhatsApp(
            `Hi ${order.customerName.split(" ")[0]}! 👋\n\nRegarding your XELLÉ order *${order.id}*, `
        );
    };

    const sendWhatsAppStatusUpdate = (status: string) => {
        const messages: Record<string, string> = {
            shipped: `Hi ${order.customerName.split(" ")[0]}! 📦\n\nGreat news! Your order *${order.id}* has been shipped and is on its way to you.\n\n*Order Total:* ₦${order.total.toLocaleString()}\n*Shipping To:* ${order.shippingAddress.address}, ${order.shippingAddress.city}\n\nWe'll let you know once it's delivered. Thank you for shopping with XELLÉ! 💜`,
            delivered: `Hi ${order.customerName.split(" ")[0]}! 🎉\n\nYour order *${order.id}* has been delivered!\n\nWe hope you love your new items. If you have any questions, feel free to reach out.\n\nThank you for shopping with XELLÉ! 💜`,
            payment_confirmed: `Hi ${order.customerName.split(" ")[0]}! ✅\n\nYour payment for order *${order.id}* (₦${order.total.toLocaleString()}) has been *confirmed*!\n\nWe're now preparing your order for shipment. We'll notify you once it ships.\n\nThank you for shopping with XELLÉ! 💜`,
        };
        openWhatsApp(messages[status] || `Hi! Regarding your order ${order.id}...`);
    };

    const paymentStatusLabel = order.paymentStatus === "payment_confirmed"
        ? "Confirmed"
        : order.paymentStatus === "payment_submitted"
            ? "Awaiting Approval"
            : "Awaiting Payment";

    const paymentStatusColor = order.paymentStatus === "payment_confirmed"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : order.paymentStatus === "payment_submitted"
            ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-red-50 text-red-700 border-red-200";

    return (
        <>
            {/* Mobile backdrop overlay */}
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm xl:hidden" onClick={onClose} />

            {/* Panel */}
            <div className="fixed inset-0 z-50 overflow-hidden xl:relative xl:inset-auto xl:z-auto">
                <div className="h-full flex items-end xl:items-stretch xl:h-auto">
                    <div className="w-full max-h-[90vh] xl:max-h-none flex flex-col bg-white rounded-t-2xl xl:rounded-lg border border-brand-lilac/20 shadow-xl xl:shadow-sm xl:sticky xl:top-24 animate-slideUp xl:animate-none">

                        {/* Fixed Header */}
                        <div className="shrink-0 px-5 pt-5 pb-4 border-b border-brand-lilac/10">
                            {/* Top bar with ID, print, close */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-brand-purple/10 flex items-center justify-center">
                                        {statusIcon[order.status]}
                                    </div>
                                    <div>
                                        <h2 className="font-mono text-sm font-semibold text-brand-dark">{order.id}</h2>
                                        <p className="text-[10px] text-brand-dark/40">
                                            {new Date(order.createdAt).toLocaleDateString("en-NG", {
                                                day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Link
                                        href={`/admin/orders/${order.id}/print`}
                                        target="_blank"
                                        className="p-2 rounded-lg text-brand-dark/40 hover:text-brand-dark hover:bg-brand-lilac/10 transition-colors"
                                        title="Print order"
                                    >
                                        <Printer size={16} />
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="p-2 rounded-lg text-brand-dark/40 hover:text-brand-dark hover:bg-brand-lilac/10 transition-colors cursor-pointer"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Status + Total summary row */}
                            <div className="flex items-center justify-between">
                                <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
                                <span className="text-lg font-semibold text-brand-dark">{formatCurrency(order.total)}</span>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

                            {/* Quick Actions */}
                            <div className="grid grid-cols-2 gap-2">
                                {order.status === "pending" && (
                                    <Button
                                        size="sm"
                                        onClick={() => handleStatusUpdate("shipped")}
                                        disabled={isUpdatingStatus}
                                        className="gap-1.5"
                                    >
                                        <Truck size={13} /> Mark Shipped
                                    </Button>
                                )}
                                {order.status === "shipped" && (
                                    <Button
                                        size="sm"
                                        onClick={() => handleStatusUpdate("delivered")}
                                        disabled={isUpdatingStatus}
                                        className="gap-1.5"
                                    >
                                        <CheckCircle size={13} /> Mark Delivered
                                    </Button>
                                )}
                                <button
                                    onClick={messageCustomer}
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[#25D366] bg-[#25D366]/8 hover:bg-[#25D366]/15 border border-[#25D366]/20 transition-colors cursor-pointer"
                                >
                                    <MessageCircle size={13} /> Message
                                </button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300 gap-1.5"
                                    onClick={() => {
                                        if (confirm("Are you sure you want to cancel this order?")) {
                                            alert("Cancel logic not yet implemented in DB");
                                        }
                                    }}
                                >
                                    <Ban size={13} /> Cancel
                                </Button>
                            </div>

                            {/* WhatsApp Status Notifications */}
                            {(order.status === "shipped" || order.status === "delivered" || order.paymentStatus === "payment_confirmed") && (
                                <div className="bg-neutral-50 rounded-lg p-3">
                                    <p className="text-[10px] font-semibold text-brand-dark/40 uppercase tracking-wider mb-2">Send WhatsApp Update</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {order.paymentStatus === "payment_confirmed" && (
                                            <button
                                                onClick={() => sendWhatsAppStatusUpdate("payment_confirmed")}
                                                className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                                            >
                                                Payment Confirmed
                                            </button>
                                        )}
                                        {order.status === "shipped" && (
                                            <button
                                                onClick={() => sendWhatsAppStatusUpdate("shipped")}
                                                className="text-[11px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                                            >
                                                Shipped
                                            </button>
                                        )}
                                        {order.status === "delivered" && (
                                            <button
                                                onClick={() => sendWhatsAppStatusUpdate("delivered")}
                                                className="text-[11px] px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer"
                                            >
                                                Delivered
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Payment Section */}
                            {order.paymentMethod && (
                                <Section icon={<CreditCard size={14} />} title="Payment">
                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-brand-dark/50">Method</span>
                                            <span className="text-xs font-medium text-brand-dark">
                                                {order.paymentMethod === "bank_transfer" ? "Bank Transfer" : "WhatsApp"}
                                            </span>
                                        </div>
                                        {order.senderName && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-brand-dark/50">Sender</span>
                                                <span className="text-xs font-medium text-brand-dark">{order.senderName}</span>
                                            </div>
                                        )}
                                        {order.paymentStatus && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-brand-dark/50">Status</span>
                                                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${paymentStatusColor}`}>
                                                    {paymentStatusLabel}
                                                </span>
                                            </div>
                                        )}
                                        {order.paymentMethod === "bank_transfer" &&
                                            order.paymentStatus === "payment_submitted" && (
                                                <Button
                                                    size="sm"
                                                    onClick={handleApprovePayment}
                                                    disabled={isApprovingPayment}
                                                    className="w-full bg-emerald-600 hover:bg-emerald-700 gap-1.5 mt-1"
                                                >
                                                    <CheckCircle size={13} />
                                                    {isApprovingPayment ? "Approving..." : "Approve Payment"}
                                                </Button>
                                            )}
                                    </div>
                                </Section>
                            )}

                            {/* Customer Section */}
                            <Section icon={<User size={14} />} title="Customer">
                                <div className="space-y-1">
                                    <p className="text-sm text-brand-dark font-medium">{order.customerName}</p>
                                    <p className="text-xs text-brand-dark/50">{order.email}</p>
                                    <p className="text-xs text-brand-dark/50">{order.phone}</p>
                                </div>
                            </Section>

                            {/* Delivery Address */}
                            <Section icon={<MapPin size={14} />} title="Delivery Address">
                                <p className="text-sm text-brand-dark leading-relaxed">
                                    {addr.address}<br />
                                    {addr.city}, {addr.state} {addr.zip}<br />
                                    {addr.country}
                                </p>
                            </Section>

                            {/* Items */}
                            {order.items.length > 0 && (
                                <Section icon={<ShoppingBag size={14} />} title={`Items (${order.items.length})`}>
                                    <div className="space-y-2">
                                        {order.items.map((item) => (
                                            <div key={`${item.product.id}-${item.variant?.name}`} className="flex items-center justify-between gap-2 py-1.5 border-b border-brand-lilac/5 last:border-0">
                                                <div className="min-w-0">
                                                    <p className="text-sm text-brand-dark truncate">{item.product.name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        {item.variant && (
                                                            <span className="text-[10px] text-brand-dark/40 bg-brand-lilac/10 px-1.5 py-0.5 rounded">
                                                                {item.variant.name}
                                                            </span>
                                                        )}
                                                        <span className="text-[10px] text-brand-dark/40">Qty: {item.quantity}</span>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-medium text-brand-dark shrink-0">
                                                    {formatCurrency((item.variant?.price || item.product.price) * item.quantity)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </Section>
                            )}

                            {/* Totals */}
                            <Section icon={<Receipt size={14} />} title="Totals">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-sm text-brand-dark/60">
                                        <span>Subtotal</span>
                                        <span>{formatCurrency(order.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-brand-dark/60">
                                        <span>Shipping</span>
                                        <span>{order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}</span>
                                    </div>
                                    {order.discountTotal && order.discountTotal > 0 && (
                                        <div className="flex justify-between text-sm text-emerald-600">
                                            <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                                            <span>-{formatCurrency(order.discountTotal)}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-brand-lilac/15 pt-2 mt-1">
                                        <div className="flex justify-between text-sm font-semibold text-brand-dark">
                                            <span>Total</span>
                                            <span>{formatCurrency(order.total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </Section>

                            {/* Notes */}
                            <Section icon={<FileText size={14} />} title="Internal Notes">
                                <textarea
                                    className="w-full text-sm p-3 border border-brand-lilac/20 rounded-lg bg-neutral-50 focus:bg-white focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple/30 transition-all resize-none"
                                    rows={3}
                                    placeholder="Add private notes here..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                                <div className="flex justify-end mt-2">
                                    <button
                                        onClick={handleSaveNotes}
                                        disabled={isSavingNotes || notes === (order.notes || "")}
                                        className="text-xs font-medium text-brand-purple hover:text-brand-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                    >
                                        {isSavingNotes ? "Saving..." : "Save Note"}
                                    </button>
                                </div>
                            </Section>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
        <div>
            <div className="flex items-center gap-1.5 mb-2.5">
                <span className="text-brand-dark/30">{icon}</span>
                <h3 className="text-[11px] font-semibold text-brand-dark/40 uppercase tracking-wider">{title}</h3>
            </div>
            {children}
        </div>
    );
}
