"use client";

import { useState, useMemo } from "react";
import type { Product, Category } from "@/types";
import FilterSidebar from "@/components/modules/FilterSidebar";
import ProductCard from "@/components/modules/ProductCard";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/ui/Button";

interface ShopContentProps {
    products: Product[];
    categories: Category[];
}

export default function ShopContent({ products, categories }: ShopContentProps) {
    const [category, setCategory] = useState("");
    const [brand, setBrand] = useState("");
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 999]);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    const filtered = useMemo(() => {
        return products.filter((p) => {
            if (category && p.category !== category) return false;
            if (brand && p.brand !== brand) return false;
            if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
            return true;
        });
    }, [products, category, brand, priceRange]);

    return (
        <>
            <div className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="font-serif text-3xl md:text-4xl text-brand-dark">Shop All</h1>
                    <p className="text-brand-dark/50 mt-2">{filtered.length} products</p>
                </div>
                <div className="lg:hidden">
                    <Button variant="outline" onClick={() => setIsMobileFiltersOpen(true)}>
                        Filters
                    </Button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Desktop Sidebar */}
                <div className="hidden lg:block">
                    <FilterSidebar
                        categories={categories}
                        selectedCategory={category}
                        selectedBrand={brand}
                        priceRange={priceRange}
                        onCategoryChange={setCategory}
                        onBrandChange={setBrand}
                        onPriceChange={setPriceRange}
                    />
                </div>

                {/* Mobile Filter Drawer */}
                <AnimatePresence>
                    {isMobileFiltersOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMobileFiltersOpen(false)}
                                className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm lg:hidden"
                            />
                            <motion.aside
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{ type: "tween", duration: 0.3 }}
                                className="fixed inset-y-0 right-0 z-[70] w-full max-w-xs bg-white shadow-2xl p-6 lg:hidden overflow-y-auto"
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="font-serif text-xl text-brand-dark">Filters</h2>
                                    <button
                                        onClick={() => setIsMobileFiltersOpen(false)}
                                        className="text-brand-dark/50 hover:text-brand-dark"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <FilterSidebar
                                    categories={categories}
                                    selectedCategory={category}
                                    selectedBrand={brand}
                                    priceRange={priceRange}
                                    onCategoryChange={setCategory}
                                    onBrandChange={setBrand}
                                    onPriceChange={setPriceRange}
                                />
                                <div className="mt-8 pt-6 border-t border-brand-lilac/20">
                                    <Button className="w-full" onClick={() => setIsMobileFiltersOpen(false)}>
                                        Show {filtered.length} Results
                                    </Button>
                                </div>
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                <div className="flex-1">
                    {filtered.length === 0 ? (
                        <p className="text-center text-brand-dark/40 py-20">No products match your filters.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                            {filtered.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
