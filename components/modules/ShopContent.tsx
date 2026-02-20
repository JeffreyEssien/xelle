"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { Product, Category } from "@/types";
import FilterSidebar from "@/components/modules/FilterSidebar";
import ProductCard from "@/components/modules/ProductCard";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { SlidersHorizontal, X, ChevronDown, LayoutGrid, List, Search } from "lucide-react";

type SortOption = "default" | "newest" | "price-asc" | "price-desc" | "name-az";

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
    { label: "Featured", value: "default" },
    { label: "Newest", value: "newest" },
    { label: "Price: Low → High", value: "price-asc" },
    { label: "Price: High → Low", value: "price-desc" },
    { label: "Name: A → Z", value: "name-az" },
];

interface ShopContentProps {
    products: Product[];
    categories: Category[];
}

export default function ShopContent({ products, categories }: ShopContentProps) {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("q") || "";
    const initialCategory = searchParams.get("category") || "";
    const [category, setCategory] = useState(initialCategory);
    const [brand, setBrand] = useState("");
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 999]);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>(
        searchParams.get("sort") === "newest" ? "newest" : "default"
    );
    const [layout, setLayout] = useState<"grid" | "list">("grid");
    const [sortOpen, setSortOpen] = useState(false);

    const filtered = useMemo(() => {
        let result = products.filter((p) => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchesName = p.name.toLowerCase().includes(q);
                const matchesCategory = p.category.toLowerCase().includes(q);
                const matchesBrand = p.brand.toLowerCase().includes(q);
                const matchesDescription = p.description?.toLowerCase().includes(q);
                if (!matchesName && !matchesCategory && !matchesBrand && !matchesDescription) return false;
            }
            if (category && p.category !== category) return false;
            if (brand && p.brand !== brand) return false;
            if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
            return true;
        });

        // Sort
        switch (sortBy) {
            case "newest":
                result = [...result].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
                break;
            case "price-asc":
                result = [...result].sort((a, b) => a.price - b.price);
                break;
            case "price-desc":
                result = [...result].sort((a, b) => b.price - a.price);
                break;
            case "name-az":
                result = [...result].sort((a, b) => a.name.localeCompare(b.name));
                break;
        }
        return result;
    }, [products, category, brand, priceRange, searchQuery, sortBy]);

    const hasFilters = category || brand || priceRange[0] > 0 || priceRange[1] < 999;

    const clearFilters = () => {
        setCategory("");
        setBrand("");
        setPriceRange([0, 999]);
    };

    return (
        <>
            {/* Header */}
            <div className="mb-10">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="font-serif text-3xl md:text-4xl text-brand-dark mb-2">
                        {searchQuery ? `Results for "${searchQuery}"` : "Shop All"}
                    </h1>
                    <div className="flex items-center gap-3 text-sm text-brand-dark/45">
                        <span>
                            {filtered.length} {filtered.length === 1 ? "product" : "products"}
                        </span>
                        {searchQuery && (
                            <a href="/shop" className="text-brand-purple hover:text-brand-dark flex items-center gap-1 transition-colors">
                                <X size={12} /> Clear search
                            </a>
                        )}
                    </div>
                </motion.div>

                {/* Toolbar */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-brand-lilac/10">
                    {/* Left: Filter chips + mobile filter toggle */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMobileFiltersOpen(true)}
                            className="lg:hidden flex items-center gap-2 px-4 py-2 text-xs font-medium text-brand-dark/70 border border-brand-dark/10 rounded-full hover:border-brand-purple/30 hover:text-brand-purple transition-all cursor-pointer"
                        >
                            <SlidersHorizontal size={14} />
                            Filters
                        </button>
                        {hasFilters && (
                            <button
                                onClick={clearFilters}
                                className="hidden lg:flex items-center gap-1.5 text-xs text-brand-dark/40 hover:text-brand-purple transition-colors cursor-pointer"
                            >
                                <X size={12} /> Clear filters
                            </button>
                        )}
                    </div>

                    {/* Right: Sort + Layout */}
                    <div className="flex items-center gap-3">
                        {/* Sort Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setSortOpen(!sortOpen)}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-brand-dark/70 border border-brand-dark/10 rounded-full hover:border-brand-purple/30 transition-all cursor-pointer"
                            >
                                {SORT_OPTIONS.find(s => s.value === sortBy)?.label}
                                <ChevronDown size={12} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
                            </button>
                            <AnimatePresence>
                                {sortOpen && (
                                    <>
                                        <div className="fixed inset-0 z-30" onClick={() => setSortOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-brand-lilac/10 py-2 z-40 min-w-[180px]"
                                        >
                                            {SORT_OPTIONS.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                                                    className={`w-full text-left px-4 py-2 text-xs transition-colors cursor-pointer ${sortBy === opt.value
                                                            ? "text-brand-purple font-semibold bg-brand-purple/5"
                                                            : "text-brand-dark/60 hover:text-brand-dark hover:bg-neutral-50"
                                                        }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Layout toggle */}
                        <div className="hidden sm:flex items-center border border-brand-dark/10 rounded-full overflow-hidden">
                            <button
                                onClick={() => setLayout("grid")}
                                className={`p-2 transition-colors cursor-pointer ${layout === "grid" ? "bg-brand-dark text-white" : "text-brand-dark/40 hover:text-brand-dark"}`}
                            >
                                <LayoutGrid size={14} />
                            </button>
                            <button
                                onClick={() => setLayout("list")}
                                className={`p-2 transition-colors cursor-pointer ${layout === "list" ? "bg-brand-dark text-white" : "text-brand-dark/40 hover:text-brand-dark"}`}
                            >
                                <List size={14} />
                            </button>
                        </div>
                    </div>
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
                                initial={{ x: "-100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "-100%" }}
                                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                                className="fixed inset-y-0 left-0 z-[70] w-full max-w-xs bg-white shadow-2xl lg:hidden flex flex-col"
                            >
                                <div className="flex justify-between items-center px-6 py-5 border-b border-brand-lilac/15">
                                    <h2 className="font-serif text-lg text-brand-dark">Filters</h2>
                                    <button
                                        onClick={() => setIsMobileFiltersOpen(false)}
                                        className="p-2 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
                                    >
                                        <X size={18} className="text-brand-dark/50" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6">
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
                                <div className="px-6 py-4 border-t border-brand-lilac/15">
                                    <Button className="w-full" onClick={() => setIsMobileFiltersOpen(false)}>
                                        Show {filtered.length} Results
                                    </Button>
                                </div>
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                {/* Products */}
                <div className="flex-1">
                    <AnimatePresence mode="wait">
                        {filtered.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-center py-24"
                            >
                                <div className="w-16 h-16 rounded-full bg-brand-lilac/10 flex items-center justify-center mx-auto mb-5">
                                    <Search size={24} className="text-brand-dark/20" />
                                </div>
                                <p className="text-brand-dark/40 text-lg mb-2">
                                    {searchQuery
                                        ? `No products found for "${searchQuery}"`
                                        : "No products match your filters."}
                                </p>
                                <p className="text-brand-dark/25 text-sm mb-6">Try adjusting your search or filters</p>
                                {(searchQuery || hasFilters) && (
                                    <button
                                        onClick={() => { clearFilters(); if (searchQuery) window.location.href = "/shop"; }}
                                        className="text-brand-purple hover:text-brand-dark text-sm font-medium transition-colors cursor-pointer"
                                    >
                                        Clear all →
                                    </button>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key={`${layout}-${sortBy}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className={
                                    layout === "grid"
                                        ? "grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                                        : "space-y-4"
                                }
                            >
                                {filtered.map((p) => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </>
    );
}
