"use client";

import { motion } from "framer-motion";
import type { Product } from "@/types";
import ProductCard from "@/components/modules/ProductCard";

interface NewArrivalsProps {
    products: Product[];
}

export default function NewArrivals({ products }: NewArrivalsProps) {
    return (
        <section className="py-24 px-6 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
            >
                <p className="text-xs uppercase tracking-[0.25em] text-brand-purple mb-3">Just Arrived</p>
                <h2 className="font-serif text-3xl md:text-4xl text-brand-dark">New Arrivals</h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map((product, i) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                    >
                        <ProductCard product={product} />
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
