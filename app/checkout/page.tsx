"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/modules/Header";
import Footer from "@/components/modules/Footer";
import { useCartStore } from "@/lib/cartStore";
import CheckoutForm from "@/components/modules/CheckoutForm";
import CheckoutSummary from "@/components/modules/CheckoutSummary";
import Receipt from "@/components/modules/Receipt";
import Button from "@/components/ui/Button";
import { ShoppingBag, ArrowRight, ArrowLeft, Check, Printer } from "lucide-react";

export default function CheckoutPage() {
    const { items } = useCartStore();
    const router = useRouter();
    const [orderPlaced, setOrderPlaced] = useState(false);

    if (items.length === 0 && !orderPlaced) {
        return (
            <>
                <Header />
                <main className="max-w-7xl mx-auto px-6 py-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-neutral-50 flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag size={32} className="text-brand-dark/15" />
                        </div>
                        <h1 className="font-serif text-3xl text-brand-dark mb-3">Your cart is empty</h1>
                        <p className="text-brand-dark/40 mb-8 text-sm">Add some items before checking out.</p>
                        <Button onClick={() => router.push("/shop")}>
                            <span className="flex items-center gap-2">
                                Continue Shopping <ArrowRight size={16} />
                            </span>
                        </Button>
                    </motion.div>
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
                    <div className="text-center mt-10 flex gap-4 justify-center flex-wrap">
                        <Button variant="outline" onClick={() => window.print()}>
                            <span className="flex items-center gap-2"><Printer size={16} /> Print Receipt</span>
                        </Button>
                        <a href="/shop"><Button>
                            <span className="flex items-center gap-2">Continue Shopping <ArrowRight size={16} /></span>
                        </Button></a>
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
                {/* Breadcrumb */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-8"
                >
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1.5 text-xs text-brand-dark/35 hover:text-brand-purple transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={12} />
                        Back to cart
                    </button>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-serif text-3xl md:text-4xl text-brand-dark mb-10"
                >
                    Checkout
                </motion.h1>

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
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-12"
        >
            {/* Animated checkmark */}
            <div className="relative w-20 h-20 mx-auto mb-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                    className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center"
                >
                    <motion.div
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 20 }}
                    >
                        <Check size={32} className="text-emerald-500" strokeWidth={3} />
                    </motion.div>
                </motion.div>
            </div>
            <h1 className="font-serif text-3xl text-brand-dark mb-3">Order Confirmed!</h1>
            <p className="text-brand-dark/50 text-sm max-w-md mx-auto">
                A confirmation email with your receipt has been sent to your inbox.
            </p>
        </motion.div>
    );
}
