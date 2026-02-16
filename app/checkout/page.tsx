"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/modules/Header";
import Footer from "@/components/modules/Footer";
import { useCartStore } from "@/lib/cartStore";
import CheckoutForm from "@/components/modules/CheckoutForm";
import CheckoutSummary from "@/components/modules/CheckoutSummary";
import Receipt from "@/components/modules/Receipt";
import Button from "@/components/ui/Button";

export default function CheckoutPage() {
    const { items } = useCartStore();
    const router = useRouter();
    const [orderPlaced, setOrderPlaced] = useState(false);

    if (items.length === 0 && !orderPlaced) {
        return (
            <>
                <Header />
                <main className="max-w-7xl mx-auto px-6 py-24 text-center">
                    <h1 className="font-serif text-3xl text-brand-dark mb-4">Your cart is empty</h1>
                    <p className="text-brand-dark/50 mb-8">Add some items before checking out.</p>
                    <button type="button" onClick={() => router.push("/shop")} className="text-brand-purple underline cursor-pointer">
                        Continue Shopping
                    </button>
                </main>
                <Footer />
            </>
        );
    }

    if (orderPlaced) {
        return (
            <>
                <Header />
                <main className="max-w-7xl mx-auto px-6 py-12">
                    <SuccessBanner />
                    <Receipt />
                    <div className="text-center mt-8 flex gap-4 justify-center">
                        <Button variant="outline" onClick={() => window.print()}>Print Receipt</Button>
                        <a href="/shop"><Button>Continue Shopping</Button></a>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="max-w-7xl mx-auto px-6 py-12">
                <h1 className="font-serif text-3xl md:text-4xl text-brand-dark mb-10">Checkout</h1>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    <div className="lg:col-span-3">
                        <CheckoutForm onComplete={() => setOrderPlaced(true)} />
                    </div>
                    <div className="lg:col-span-2">
                        <CheckoutSummary />
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

function SuccessBanner() {
    return (
        <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-emerald-600 text-2xl">✓</span>
            </div>
            <h1 className="font-serif text-3xl text-brand-dark mb-2">Order Confirmed!</h1>
            <p className="text-brand-dark/60">
                A confirmation email with your receipt has been sent to your inbox.
            </p>
        </div>
    );
}
