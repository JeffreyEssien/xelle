"use client";

import type { Product } from "@/types";
import { formatCurrency } from "@/lib/formatCurrency";
import { useCartStore } from "@/lib/cartStore";
import Button from "@/components/ui/Button";
import StockIndicator from "@/components/ui/StockIndicator";

interface ProductDetailsProps {
    product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
    const { addItem, open } = useCartStore();

    const handleAdd = () => {
        addItem(product);
        open();
    };

    return (
        <div className="flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-purple mb-2">{product.category}</p>
            <h1 className="font-serif text-3xl md:text-4xl text-brand-dark mb-4">{product.name}</h1>
            <p className="font-sans text-2xl text-brand-dark mb-6">{formatCurrency(product.price)}</p>
            <p className="text-brand-dark/60 leading-relaxed mb-6">{product.description}</p>
            <div className="mb-8">
                <StockIndicator stock={product.stock} />
            </div>
            <Button size="lg" onClick={handleAdd} disabled={product.stock === 0} className="w-full sm:w-auto">
                {product.stock === 0 ? "Sold Out" : "Add to Cart"}
            </Button>
            <div className="mt-10 pt-6 border-t border-brand-lilac/20 space-y-3">
                <DetailRow label="Brand" value={product.brand} />
                <DetailRow label="Category" value={product.category} />
                <DetailRow label="SKU" value={product.id.toUpperCase()} />
            </div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between text-sm">
            <span className="text-brand-dark/50">{label}</span>
            <span className="text-brand-dark capitalize">{value}</span>
        </div>
    );
}
