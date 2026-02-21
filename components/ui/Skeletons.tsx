"use client";

import { motion } from "framer-motion";

export function ProductCardSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="aspect-[3/4] rounded-2xl bg-neutral-100 shimmer-bg" />
            <div className="mt-4 space-y-2.5">
                <div className="h-4 bg-neutral-100 rounded-full w-3/4 shimmer-bg" />
                <div className="h-3 bg-neutral-100 rounded-full w-1/2 shimmer-bg" />
                <div className="h-4 bg-neutral-100 rounded-full w-1/3 shimmer-bg" />
            </div>
        </div>
    );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                >
                    <ProductCardSkeleton />
                </motion.div>
            ))}
        </div>
    );
}

export function ProductDetailSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 animate-pulse">
            {/* Image */}
            <div>
                <div className="aspect-[3/4] rounded-2xl bg-neutral-100 shimmer-bg" />
                <div className="flex gap-3 mt-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-20 h-24 rounded-xl bg-neutral-100 shimmer-bg" />
                    ))}
                </div>
            </div>
            {/* Details */}
            <div className="space-y-5 pt-4">
                <div className="h-3 bg-neutral-100 rounded-full w-2/3 shimmer-bg" />
                <div className="h-3 bg-neutral-100 rounded-full w-1/3 shimmer-bg" />
                <div className="h-8 bg-neutral-100 rounded-full w-1/2 shimmer-bg" />
                <div className="h-6 bg-neutral-100 rounded-full w-2/5 shimmer-bg" />
                <div className="space-y-2 mt-6">
                    <div className="h-3 bg-neutral-100 rounded-full w-full shimmer-bg" />
                    <div className="h-3 bg-neutral-100 rounded-full w-4/5 shimmer-bg" />
                    <div className="h-3 bg-neutral-100 rounded-full w-3/5 shimmer-bg" />
                </div>
                <div className="h-12 bg-neutral-100 rounded-full w-full mt-8 shimmer-bg" />
            </div>
        </div>
    );
}

export function CategoryTileSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="aspect-[4/5] rounded-2xl bg-neutral-100 shimmer-bg" />
        </div>
    );
}
