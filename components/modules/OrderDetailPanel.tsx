import type { Order } from "@/types";
import { formatCurrency } from "@/lib/formatCurrency";
import Badge from "@/components/ui/Badge";

const statusVariant: Record<Order["status"], "warning" | "info" | "success"> = {
    pending: "warning",
    shipped: "info",
    delivered: "success",
};

interface OrderDetailPanelProps {
    order: Order;
    onClose: () => void;
}

export default function OrderDetailPanel({ order, onClose }: OrderDetailPanelProps) {
    const addr = order.shippingAddress;

    return (
        <div className="bg-white rounded-lg border border-brand-lilac/20 p-6 sticky top-24 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg text-brand-dark">{order.id}</h2>
                <button type="button" onClick={onClose} className="text-brand-dark/40 hover:text-brand-dark cursor-pointer">✕</button>
            </div>

            <Section title="Status">
                <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
                <p className="text-xs text-brand-dark/50 mt-1">
                    Placed on {new Date(order.createdAt).toLocaleString()}
                </p>
            </Section>

            <Section title="Customer">
                <p className="text-sm text-brand-dark font-medium">{order.customerName}</p>
                <p className="text-xs text-brand-dark/60">{order.email}</p>
                <p className="text-xs text-brand-dark/60">{order.phone}</p>
            </Section>

            <Section title="Delivery Address">
                <p className="text-sm text-brand-dark">{addr.address}</p>
                <p className="text-sm text-brand-dark">{addr.city}, {addr.state} {addr.zip}</p>
                <p className="text-sm text-brand-dark">{addr.country}</p>
            </Section>

            {order.items.length > 0 && (
                <Section title="Items">
                    <ul className="space-y-2">
                        {order.items.map((item) => (
                            <li key={item.product.id} className="flex justify-between text-sm">
                                <span className="text-brand-dark/80">
                                    {item.product.name} <span className="text-brand-dark/40">×{item.quantity}</span>
                                </span>
                                <span className="text-brand-dark font-medium">
                                    {formatCurrency(item.product.price * item.quantity)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            <Section title="Totals">
                <div className="space-y-1">
                    <Row label="Subtotal" value={formatCurrency(order.subtotal)} />
                    <Row label="Shipping" value={order.shipping === 0 ? "Free" : formatCurrency(order.shipping)} />
                    <div className="border-t border-brand-lilac/10 pt-2 mt-2">
                        <Row label="Total" value={formatCurrency(order.total)} bold />
                    </div>
                </div>
            </Section>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="text-xs font-semibold text-brand-dark/40 uppercase tracking-wider mb-2">{title}</h3>
            {children}
        </div>
    );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
    return (
        <div className={`flex justify-between text-sm ${bold ? "font-medium text-brand-dark" : "text-brand-dark/70"}`}>
            <span>{label}</span>
            <span>{value}</span>
        </div>
    );
}
