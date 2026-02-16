"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/formatCurrency";
import type { Product } from "@/types";
import Badge from "@/components/ui/Badge";
import { useCartStore } from "@/lib/cartStore";

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addItem, open } = useCartStore();

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product);
        open();
    };

    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="group relative"
        >
            <Link href={`/product/${product.slug}`} className="block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-neutral-100">
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.isNew && (
                        <div className="absolute top-3 left-3">
                            <Badge>New</Badge>
                        </div>
                    )}
                    <QuickAddButton onClick={handleQuickAdd} disabled={product.stock === 0} />
                </div>
                <div className="mt-4 space-y-1">
                    <h3 className="font-serif text-base text-brand-dark group-hover:text-brand-purple transition-colors">
                        {product.name}
                    </h3>
                    <p className="font-sans text-sm text-brand-dark/60">{product.category}</p>
                    <p className="font-sans font-medium text-brand-dark">
                        {formatCurrency(product.price)}
                    </p>
                </div>
            </Link>
        </motion.div>
    );
}

function QuickAddButton({ onClick, disabled }: { onClick: (e: React.MouseEvent) => void; disabled: boolean }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm text-brand-dark text-sm font-medium py-2.5 rounded-sm opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-brand-dark hover:text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
            {disabled ? "Sold Out" : "+ Add to Cart"}
        </button>
    );
}
