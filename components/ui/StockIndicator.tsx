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
            <span className="text-amber-600 font-medium text-sm">
                Only {stock} left — order soon
            </span>
        );
    }
    return <span className="text-emerald-600 font-medium text-sm">In Stock</span>;
}
