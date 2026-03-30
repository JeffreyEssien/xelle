"use client";

import Button from "./Button";

interface OutOfStockItem {
    name: string;
    requested: number;
    available: number;
}

interface OutOfStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: OutOfStockItem[];
}

export default function OutOfStockModal({ isOpen, onClose, items }: OutOfStockModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-5">
                <div className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-brand-dark">Items Out of Stock</h3>
                    <p className="text-sm text-brand-dark/60 mt-1">
                        Some items in your cart are no longer available in the requested quantity.
                    </p>
                </div>

                <div className="space-y-3">
                    {items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-3">
                            <span className="text-sm font-medium text-brand-dark">{item.name}</span>
                            <span className="text-xs text-red-600 whitespace-nowrap ml-3">
                                {item.available === 0
                                    ? "Sold out"
                                    : `Only ${item.available} left (requested ${item.requested})`}
                            </span>
                        </div>
                    ))}
                </div>

                <Button variant="primary" size="lg" className="w-full" onClick={onClose}>
                    Back to Cart
                </Button>
            </div>
        </div>
    );
}
