"use client";

import { useState, useMemo } from "react";
import type { Product, Category } from "@/types";
import FilterSidebar from "@/components/modules/FilterSidebar";
import ProductCard from "@/components/modules/ProductCard";

interface ShopContentProps {
    products: Product[];
    categories: Category[];
}

export default function ShopContent({ products, categories }: ShopContentProps) {
    const [category, setCategory] = useState("");
    const [brand, setBrand] = useState("");
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 999]);

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
            <div className="mb-10">
                <h1 className="font-serif text-3xl md:text-4xl text-brand-dark">Shop All</h1>
                <p className="text-brand-dark/50 mt-2">{filtered.length} products</p>
            </div>
            <div className="flex flex-col lg:flex-row gap-12">
                <FilterSidebar
                    categories={categories}
                    selectedCategory={category}
                    selectedBrand={brand}
                    priceRange={priceRange}
                    onCategoryChange={setCategory}
                    onBrandChange={setBrand}
                    onPriceChange={setPriceRange}
                />
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
