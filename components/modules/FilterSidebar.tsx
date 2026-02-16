"use client";

import type { Category } from "@/types";

interface FilterSidebarProps {
    categories: Category[];
    selectedCategory: string;
    selectedBrand: string;
    priceRange: [number, number];
    onCategoryChange: (v: string) => void;
    onBrandChange: (v: string) => void;
    onPriceChange: (v: [number, number]) => void;
}

export default function FilterSidebar({
    categories,
    selectedCategory,
    selectedBrand,
    priceRange,
    onCategoryChange,
    onBrandChange,
    onPriceChange,
}: FilterSidebarProps) {
    return (
        <aside className="w-full lg:w-64 shrink-0 space-y-8">
            <CategoryFilter categories={categories} selected={selectedCategory} onChange={onCategoryChange} />
            <PriceFilter range={priceRange} onChange={onPriceChange} />
            <BrandFilter selected={selectedBrand} onChange={onBrandChange} />
        </aside>
    );
}

function CategoryFilter({ categories, selected, onChange }: { categories: Category[]; selected: string; onChange: (v: string) => void }) {
    return (
        <div>
            <h3 className="font-sans text-xs font-semibold text-brand-dark uppercase tracking-wider mb-3">Category</h3>
            <ul className="space-y-2">
                <FilterItem label="All" active={selected === ""} onClick={() => onChange("")} />
                {categories.map((c) => (
                    <FilterItem key={c.id} label={c.name} active={selected === c.slug} onClick={() => onChange(c.slug)} />
                ))}
            </ul>
        </div>
    );
}

function PriceFilter({ range, onChange }: { range: [number, number]; onChange: (v: [number, number]) => void }) {
    const presets: { label: string; value: [number, number] }[] = [
        { label: "All Prices", value: [0, 999] },
        { label: "Under $150", value: [0, 150] },
        { label: "$150 – $300", value: [150, 300] },
        { label: "Over $300", value: [300, 999] },
    ];

    return (
        <div>
            <h3 className="font-sans text-xs font-semibold text-brand-dark uppercase tracking-wider mb-3">Price</h3>
            <ul className="space-y-2">
                {presets.map((p) => (
                    <FilterItem
                        key={p.label}
                        label={p.label}
                        active={range[0] === p.value[0] && range[1] === p.value[1]}
                        onClick={() => onChange(p.value)}
                    />
                ))}
            </ul>
        </div>
    );
}

function BrandFilter({ selected, onChange }: { selected: string; onChange: (v: string) => void }) {
    return (
        <div>
            <h3 className="font-sans text-xs font-semibold text-brand-dark uppercase tracking-wider mb-3">Brand</h3>
            <ul className="space-y-2">
                <FilterItem label="All Brands" active={selected === ""} onClick={() => onChange("")} />
                <FilterItem label="XELLÉ" active={selected === "XELLÉ"} onClick={() => onChange("XELLÉ")} />
            </ul>
        </div>
    );
}

function FilterItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <li>
            <button
                type="button"
                onClick={onClick}
                className={`text-sm transition-colors cursor-pointer ${active ? "text-brand-purple font-medium" : "text-brand-dark/60 hover:text-brand-dark"}`}
            >
                {label}
            </button>
        </li>
    );
}
