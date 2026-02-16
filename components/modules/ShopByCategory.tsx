"use client";

import { motion } from "framer-motion";
import type { Category } from "@/types";
import CategoryTile from "@/components/modules/CategoryTile";

interface ShopByCategoryProps {
    categories: Category[];
}

export default function ShopByCategory({ categories }: ShopByCategoryProps) {
    return (
        <section className="py-24 px-6 bg-brand-lilac/5">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <p className="text-xs uppercase tracking-[0.25em] text-brand-purple mb-3">Browse</p>
                    <h2 className="font-serif text-3xl md:text-4xl text-brand-dark">Shop by Category</h2>
                </motion.div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((cat, i) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                        >
                            <CategoryTile category={cat} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
