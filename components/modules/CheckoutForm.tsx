"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/lib/cartStore";
import { useOrderStore } from "@/lib/orderStore";
import { SHIPPING_RATE, FREE_SHIPPING_THRESHOLD, WHATSAPP_NUMBER } from "@/lib/constants";
import type { ShippingAddress, Order } from "@/types";

interface CheckoutFormProps {
    onComplete: () => void;
}

const emptyAddress: ShippingAddress = {
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", zip: "", country: "",
};

export default function CheckoutForm({ onComplete }: CheckoutFormProps) {
    const [form, setForm] = useState<ShippingAddress>(emptyAddress);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});
    const { items, subtotal, clearCart, couponCode, discount, removeCoupon } = useCartStore();
    const { addOrder } = useOrderStore();

    const [paymentMethod, setPaymentMethod] = useState<"whatsapp" | "manual">("whatsapp");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    };

    // ... validate ...
    const validate = (): boolean => {
        const e: typeof errors = {};
        if (!form.firstName.trim()) e.firstName = "Required";
        if (!form.lastName.trim()) e.lastName = "Required";
        if (!form.email.trim()) e.email = "Required";
        if (!form.address.trim()) e.address = "Required";
        if (!form.city.trim()) e.city = "Required";
        if (!form.zip.trim()) e.zip = "Required";
        if (!form.country.trim()) e.country = "Required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);

        const sub = subtotal();
        const ship = sub >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATE;
        const discountAmount = sub * (discount / 100);

        const order: Order = {
            id: `ORD-${Date.now().toString(36).toUpperCase()}`,
            customerName: `${form.firstName} ${form.lastName}`,
            email: form.email,
            phone: form.phone,
            items: [...items],
            subtotal: sub,
            shipping: ship,
            total: Math.max(0, sub - discountAmount) + ship,
            status: "pending",
            createdAt: new Date().toISOString(),
            shippingAddress: { ...form },
            couponCode: couponCode || undefined,
            discountTotal: discountAmount > 0 ? discountAmount : undefined
        };

        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(order),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                console.error("Order failed:", data);
                alert(data.error || "Failed to place order. Please try again.");
                setLoading(false);
                return;
            }

            addOrder(order);
            clearCart();
            removeCoupon();
            setLoading(false);

            if (paymentMethod === "whatsapp") {
                const message = encodeURIComponent(
                    `*New Order: ${order.id}*\n\n` +
                    `*Customer:* ${order.customerName}\n` +
                    `*Email:* ${order.email}\n` +
                    `*Phone:* ${order.phone}\n\n` +
                    `*Items:*\n` +
                    order.items.map(i => `${i.quantity}x ${i.product.name} (${i.variant?.name || 'Default'})`).join('\n') +
                    `\n\n*Total:* ₦${order.total.toLocaleString()}\n\n` +
                    `I would like to pay for this order.`
                );
                window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
            } else {
                onComplete();
            }

        } catch (err) {
            console.error("Order submission error:", err);
            alert("Something went wrong. Please check your connection and try again.");
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <SectionTitle>Contact Information</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First Name" name="firstName" value={form.firstName} error={errors.firstName} onChange={handleChange} />
                <Field label="Last Name" name="lastName" value={form.lastName} error={errors.lastName} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Email" name="email" type="email" value={form.email} error={errors.email} onChange={handleChange} />
                <Field label="Phone" name="phone" type="tel" value={form.phone} error={errors.phone} onChange={handleChange} />
            </div>

            <SectionTitle>Shipping Address</SectionTitle>
            <Field label="Street Address" name="address" value={form.address} error={errors.address} onChange={handleChange} />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Field label="City" name="city" value={form.city} error={errors.city} onChange={handleChange} />
                <Field label="State" name="state" value={form.state} error={errors.state} onChange={handleChange} />
                <Field label="ZIP / Postal" name="zip" value={form.zip} error={errors.zip} onChange={handleChange} />
            </div>
            <Field label="Country" name="country" value={form.country} error={errors.country} onChange={handleChange} />

            <SectionTitle>Payment Method</SectionTitle>
            <div className="space-y-3">
                <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'whatsapp' ? 'border-brand-purple bg-brand-purple/5' : 'border-brand-lilac/20 hover:border-brand-purple/50'}`}>
                    <input
                        type="radio"
                        name="payment"
                        value="whatsapp"
                        checked={paymentMethod === 'whatsapp'}
                        onChange={() => setPaymentMethod('whatsapp')}
                        className="mt-1"
                    />
                    <div>
                        <span className="block font-medium text-brand-dark">Pay on WhatsApp</span>
                        <span className="block text-sm text-brand-dark/60">Chat with us to complete your payment. Fast & secure.</span>
                    </div>
                </label>

                <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'manual' ? 'border-brand-purple bg-brand-purple/5' : 'border-brand-lilac/20 hover:border-brand-purple/50'}`}>
                    <input
                        type="radio"
                        name="payment"
                        value="manual"
                        checked={paymentMethod === 'manual'}
                        onChange={() => setPaymentMethod('manual')}
                        className="mt-1"
                    />
                    <div>
                        <span className="block font-medium text-brand-dark">Wait for Admin Confirmation</span>
                        <span className="block text-sm text-brand-dark/60">Place order now and wait for an admin to contact you for payment.</span>
                    </div>
                </label>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Processing..." : (paymentMethod === 'whatsapp' ? "Place Order & Chat on WhatsApp" : "Place Order")}
            </Button>
        </form>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <h2 className="font-serif text-xl text-brand-dark pt-2">{children}</h2>;
}

function Field({ label, name, type = "text", value, error, onChange }: {
    label: string; name: string; type?: string; value: string; error?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <div>
            <label htmlFor={name} className="block text-xs text-brand-dark/60 mb-1">{label}</label>
            <input id={name} name={name} type={type} value={value} onChange={onChange}
                className={`w-full border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30 ${error ? "border-red-400" : "border-brand-lilac/20"}`} />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}
