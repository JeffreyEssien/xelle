"use client";

import { useState } from "react";
import type { Product } from "@/types";
import { formatCurrency } from "@/lib/formatCurrency";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { cn } from "@/lib/cn";
import Button from "@/components/ui/Button";
import AddProductForm from "@/components/modules/AddProductForm";

interface AdminProductsContentProps {
    products: Product[];
}

export default function AdminProductsContent({ products }: AdminProductsContentProps) {
    const [showForm, setShowForm] = useState(false);

    return (
        <div>
            <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h1 className="font-serif text-2xl sm:text-3xl text-brand-dark">Products</h1>
                <Button onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Close" : "+ Add Product"}
                </Button>
            </div>
            {showForm && <AddProductForm />}

            {/* Desktop table */}
            <div className="hidden md:block">
                <div className="bg-white rounded-lg border border-brand-lilac/20 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-brand-lilac/20 bg-brand-lilac/5">
                                    <th className="text-left px-4 py-3 font-medium text-brand-dark/60">Product</th>
                                    <th className="text-left px-4 py-3 font-medium text-brand-dark/60">Price</th>
                                    <th className="text-left px-4 py-3 font-medium text-brand-dark/60">Stock</th>
                                    <th className="text-left px-4 py-3 font-medium text-brand-dark/60">Category</th>
                                    <th className="text-right px-4 py-3 font-medium text-brand-dark/60">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-lilac/10">
                                {products.map((p) => (
                                    <tr key={p.id} className={cn(p.stock <= LOW_STOCK_THRESHOLD && "bg-red-50/50")}>
                                        <td className="px-4 py-3 font-medium text-brand-dark">{p.name}</td>
                                        <td className="px-4 py-3 text-brand-dark/70">{formatCurrency(p.price)}</td>
                                        <td className="px-4 py-3">
                                            <StockBadge stock={p.stock} />
                                        </td>
                                        <td className="px-4 py-3 text-brand-dark/70 capitalize">{p.category}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button type="button" className="text-brand-purple hover:underline text-xs cursor-pointer">Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
                {products.map((p) => (
                    <div
                        key={p.id}
                        className={cn(
                            "bg-white rounded-lg border p-4",
                            p.stock <= LOW_STOCK_THRESHOLD ? "border-red-200 bg-red-50/30" : "border-brand-lilac/20",
                        )}
                    >
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <p className="text-sm font-medium text-brand-dark">{p.name}</p>
                            <button type="button" className="text-brand-purple hover:underline text-xs cursor-pointer shrink-0">Edit</button>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                            <span className="text-brand-dark/70">{formatCurrency(p.price)}</span>
                            <span className="capitalize text-brand-dark/50">{p.category}</span>
                            <StockBadge stock={p.stock} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StockBadge({ stock }: { stock: number }) {
    if (stock <= LOW_STOCK_THRESHOLD) {
        return <span className="text-red-600 font-medium text-xs">{stock} left</span>;
    }
    return <span className="text-emerald-600 text-xs">{stock} in stock</span>;
}
