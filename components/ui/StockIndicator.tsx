import { LOW_STOCK_THRESHOLD } from "@/lib/constants";

interface StockIndicatorProps {
    stock: number;
}

export default function StockIndicator({ stock }: StockIndicatorProps) {
    if (stock === 0) {
        return <span className="text-red-600 font-medium text-sm">Out of Stock</span>;
    }
    if (stock <= LOW_STOCK_THRESHOLD) {
        return (
            <span className="text-amber-600 font-medium text-sm flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                Only {stock} left — order soon
            </span>
        );
    }
    return (
        <span className="text-emerald-600 font-medium text-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            In Stock
        </span>
    );
}
