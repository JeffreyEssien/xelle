"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/lib/cartStore";
import { useOrderStore } from "@/lib/orderStore";
import { SHIPPING_RATE, FREE_SHIPPING_THRESHOLD, WHATSAPP_NUMBER } from "@/lib/constants";
import type { ShippingAddress, Order } from "@/types";
import { MessageCircle, Clock, Lock, ChevronRight } from "lucide-react";

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
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact */}
            <div>
                <SectionTitle step={1}>Contact Information</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                    <FloatingField label="First Name" name="firstName" value={form.firstName} error={errors.firstName} onChange={handleChange} />
                    <FloatingField label="Last Name" name="lastName" value={form.lastName} error={errors.lastName} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <FloatingField label="Email" name="email" type="email" value={form.email} error={errors.email} onChange={handleChange} />
                    <FloatingField label="Phone" name="phone" type="tel" value={form.phone} error={errors.phone} onChange={handleChange} />
                </div>
            </div>

            {/* Shipping */}
            <div>
                <SectionTitle step={2}>Shipping Address</SectionTitle>
                <div className="mt-5 space-y-4">
                    <FloatingField label="Street Address" name="address" value={form.address} error={errors.address} onChange={handleChange} />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <FloatingField label="City" name="city" value={form.city} error={errors.city} onChange={handleChange} />
                        <FloatingField label="State" name="state" value={form.state} error={errors.state} onChange={handleChange} />
                        <FloatingField label="ZIP / Postal" name="zip" value={form.zip} error={errors.zip} onChange={handleChange} />
                    </div>
                    <FloatingField label="Country" name="country" value={form.country} error={errors.country} onChange={handleChange} />
                </div>
            </div>

            {/* Payment */}
            <div>
                <SectionTitle step={3}>Payment Method</SectionTitle>
                <div className="space-y-3 mt-5">
                    <label className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-300 ${paymentMethod === 'whatsapp' ? 'border-brand-purple bg-brand-purple/[0.04] shadow-sm shadow-brand-purple/5' : 'border-brand-dark/8 hover:border-brand-purple/30'}`}>
                        <input
                            type="radio"
                            name="payment"
                            value="whatsapp"
                            checked={paymentMethod === 'whatsapp'}
                            onChange={() => setPaymentMethod('whatsapp')}
                            className="mt-1 accent-brand-purple"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <MessageCircle size={16} className="text-brand-purple" />
                                <span className="font-medium text-brand-dark text-sm">Pay on WhatsApp</span>
                            </div>
                            <span className="block text-xs text-brand-dark/45 mt-1">Chat with us to complete your payment. Fast & secure.</span>
                        </div>
                    </label>

                    <label className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-300 ${paymentMethod === 'manual' ? 'border-brand-purple bg-brand-purple/[0.04] shadow-sm shadow-brand-purple/5' : 'border-brand-dark/8 hover:border-brand-purple/30'}`}>
                        <input
                            type="radio"
                            name="payment"
                            value="manual"
                            checked={paymentMethod === 'manual'}
                            onChange={() => setPaymentMethod('manual')}
                            className="mt-1 accent-brand-purple"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-brand-purple" />
                                <span className="font-medium text-brand-dark text-sm">Wait for Admin Confirmation</span>
                            </div>
                            <span className="block text-xs text-brand-dark/45 mt-1">Place order now and wait for an admin to contact you for payment.</span>
                        </div>
                    </label>
                </div>
            </div>

            {/* Security notice */}
            <div className="flex items-center gap-2 text-[10px] text-brand-dark/30">
                <Lock size={10} />
                <span>Your information is protected and secure</span>
            </div>

            <Button type="submit" size="lg" className="w-full" loading={loading}>
                {paymentMethod === 'whatsapp' ? "Place Order & Chat on WhatsApp" : "Place Order"}
            </Button>
        </form>
    );
}

function SectionTitle({ children, step }: { children: React.ReactNode; step: number }) {
    return (
        <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-brand-dark text-white text-xs font-bold flex items-center justify-center shrink-0">
                {step}
            </span>
            <h2 className="font-serif text-lg text-brand-dark">{children}</h2>
        </div>
    );
}

function FloatingField({ label, name, type = "text", value, error, onChange }: {
    label: string; name: string; type?: string; value: string; error?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <div className="relative">
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder=" "
                className={`peer w-full border rounded-xl px-4 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/40 transition-all bg-white ${error ? "border-red-300 focus:ring-red-200 focus:border-red-400" : "border-brand-dark/10"}`}
            />
            <label
                htmlFor={name}
                className="absolute left-4 top-2 text-[10px] text-brand-dark/40 transition-all pointer-events-none peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-brand-purple uppercase tracking-wide font-medium"
            >
                {label}
            </label>
            {error && <p className="text-red-500 text-[10px] mt-1 ml-1">{error}</p>}
        </div>
    );
}
