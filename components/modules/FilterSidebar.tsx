"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Category } from "@/types";
import { ChevronDown } from "lucide-react";

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
        <aside className="w-full lg:w-60 shrink-0 space-y-1">
            <CollapsibleSection title="Category" defaultOpen>
                <div className="flex flex-wrap gap-2">
                    <FilterChip label="All" active={selectedCategory === ""} onClick={() => onCategoryChange("")} />
                    {categories.map((c) => (
                        <FilterChip key={c.id} label={c.name} active={selectedCategory === c.slug} onClick={() => onCategoryChange(c.slug)} />
                    ))}
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Price" defaultOpen>
                <div className="flex flex-wrap gap-2">
                    {[
                        { label: "All Prices", value: [0, 9999999] as [number, number] },
                        { label: "Under ₦150", value: [0, 150] as [number, number] },
                        { label: "₦150 – ₦300", value: [150, 300] as [number, number] },
                        { label: "Over ₦300", value: [300, 9999999] as [number, number] },
                    ].map((p) => (
                        <FilterChip
                            key={p.label}
                            label={p.label}
                            active={priceRange[0] === p.value[0] && priceRange[1] === p.value[1]}
                            onClick={() => onPriceChange(p.value)}
                        />
                    ))}
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Brand" defaultOpen={false}>
                <div className="flex flex-wrap gap-2">
                    <FilterChip label="All Brands" active={selectedBrand === ""} onClick={() => onBrandChange("")} />
                    <FilterChip label="XELLÉ" active={selectedBrand === "XELLÉ"} onClick={() => onBrandChange("XELLÉ")} />
                </div>
            </CollapsibleSection>
        </aside>
    );
}

function CollapsibleSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-brand-lilac/10 py-4">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between py-1 cursor-pointer group"
            >
                <h3 className="text-xs font-semibold text-brand-dark/60 uppercase tracking-[0.15em] group-hover:text-brand-dark transition-colors">
                    {title}
                </h3>
                <ChevronDown
                    size={14}
                    className={`text-brand-dark/30 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                />
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="pt-3 pb-1">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-3.5 py-1.5 text-xs rounded-full transition-all duration-300 cursor-pointer ${active
                ? "bg-brand-purple text-white font-medium shadow-sm shadow-brand-purple/20"
                : "bg-neutral-50 text-brand-dark/55 hover:bg-neutral-100 hover:text-brand-dark border border-transparent hover:border-brand-lilac/20"
                }`}
        >
            {label}
        </button>
    );
}
