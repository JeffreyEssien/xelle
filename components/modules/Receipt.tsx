"use client";

import { useOrderStore } from "@/lib/orderStore";
import { formatCurrency } from "@/lib/formatCurrency";
import { SITE_NAME } from "@/lib/constants";

export default function Receipt() {
    const { lastOrder } = useOrderStore();
    if (!lastOrder) return null;

    const { id, customerName, email, createdAt, items, subtotal, shipping, total, shippingAddress } = lastOrder;

    return (
        <div className="max-w-2xl mx-auto bg-white border border-brand-lilac/20 rounded-lg overflow-hidden print:border-none">
            <ReceiptHeader orderId={id} date={createdAt} />
            <div className="px-8 py-6 space-y-6">
                <CustomerSection name={customerName} email={email} address={shippingAddress} />
                <ItemsTable items={items} />
                <TotalsSection subtotal={subtotal} shipping={shipping} total={total} />
            </div>
            <ReceiptFooter />
        </div>
    );
}

function ReceiptHeader({ orderId, date }: { orderId: string; date: string }) {
    return (
        <div className="bg-brand-dark text-white px-8 py-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-serif text-2xl tracking-widest">{SITE_NAME}</h2>
                    <p className="text-white/50 text-xs mt-1">Order Receipt</p>
                </div>
                <div className="text-right">
                    <p className="font-mono text-sm">{orderId}</p>
                    <p className="text-white/50 text-xs mt-1">{new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
            </div>
        </div>
    );
}

function CustomerSection({ name, email, address }: {
    name: string; email: string; address: { address: string; city: string; state: string; zip: string; country: string };
}) {
    return (
        <div className="grid grid-cols-2 gap-6">
            <div>
                <Label>Billed To</Label>
                <p className="text-sm text-brand-dark font-medium">{name}</p>
                <p className="text-xs text-brand-dark/60">{email}</p>
            </div>
            <div>
                <Label>Ship To</Label>
                <p className="text-sm text-brand-dark">{address.address}</p>
                <p className="text-sm text-brand-dark">{address.city}, {address.state} {address.zip}</p>
                <p className="text-sm text-brand-dark">{address.country}</p>
            </div>
        </div>
    );
}

function ItemsTable({ items }: { items: { product: { name: string; price: number }; quantity: number }[] }) {
    return (
        <div>
            <Label>Items</Label>
            <table className="w-full text-sm mt-2">
                <thead>
                    <tr className="border-b border-brand-lilac/20">
                        <th className="text-left py-2 font-medium text-brand-dark/60">Product</th>
                        <th className="text-center py-2 font-medium text-brand-dark/60">Qty</th>
                        <th className="text-right py-2 font-medium text-brand-dark/60">Price</th>
                        <th className="text-right py-2 font-medium text-brand-dark/60">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-brand-lilac/10">
                    {items.map((item) => (
                        <tr key={item.product.name}>
                            <td className="py-2 text-brand-dark">{item.product.name}</td>
                            <td className="py-2 text-center text-brand-dark/70">{item.quantity}</td>
                            <td className="py-2 text-right text-brand-dark/70">{formatCurrency(item.product.price)}</td>
                            <td className="py-2 text-right text-brand-dark font-medium">{formatCurrency(item.product.price * item.quantity)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function TotalsSection({ subtotal, shipping, total }: { subtotal: number; shipping: number; total: number }) {
    return (
        <div className="border-t border-brand-lilac/20 pt-4 space-y-2">
            <TotalRow label="Subtotal" value={formatCurrency(subtotal)} />
            <TotalRow label="Shipping" value={shipping === 0 ? "Free" : formatCurrency(shipping)} />
            <div className="border-t border-brand-lilac/10 pt-2 mt-2">
                <TotalRow label="Total Paid" value={formatCurrency(total)} bold />
            </div>
        </div>
    );
}

function ReceiptFooter() {
    return (
        <div className="bg-brand-lilac/5 px-8 py-4 text-center">
            <p className="text-xs text-brand-dark/40">
                A confirmation email has been sent to your inbox. Thank you for shopping with {SITE_NAME}.
            </p>
        </div>
    );
}

function Label({ children }: { children: React.ReactNode }) {
    return <h3 className="text-xs font-semibold text-brand-dark/40 uppercase tracking-wider mb-1">{children}</h3>;
}

function TotalRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
    return (
        <div className={`flex justify-between text-sm ${bold ? "text-brand-dark font-semibold text-base" : "text-brand-dark/70"}`}>
            <span>{label}</span>
            <span>{value}</span>
        </div>
    );
}
