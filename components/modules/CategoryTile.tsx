"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Category } from "@/types";

interface CategoryTileProps {
    category: Category;
}

export default function CategoryTile({ category }: CategoryTileProps) {
    return (
        <Link href={`/shop?category=${category.slug}`} className="group block">
            <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative aspect-square overflow-hidden rounded-sm"
            >
                <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/70 via-brand-dark/20 to-transparent" />
                <div className="absolute bottom-6 left-6">
                    <h3 className="font-serif text-xl text-white mb-1">{category.name}</h3>
                    <p className="text-sm text-white/70">{category.description}</p>
                </div>
            </motion.div>
        </Link>
    );
}
