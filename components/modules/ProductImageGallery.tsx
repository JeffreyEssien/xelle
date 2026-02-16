"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductImageGalleryProps {
    images: string[];
    name: string;
}

export default function ProductImageGallery({ images, name }: ProductImageGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <div className="space-y-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-neutral-100">
                <Image
                    src={images[activeIndex]}
                    alt={`${name} — image ${activeIndex + 1}`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                />
            </div>
            {images.length > 1 && (
                <div className="flex gap-3">
                    {images.map((img, i) => (
                        <button
                            key={img}
                            type="button"
                            onClick={() => setActiveIndex(i)}
                            className={`relative w-20 h-24 rounded-sm overflow-hidden border-2 transition-all cursor-pointer ${i === activeIndex ? "border-brand-purple" : "border-transparent opacity-60 hover:opacity-100"
                                }`}
                        >
                            <Image src={img} alt={`${name} thumbnail ${i + 1}`} fill sizes="80px" className="object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
