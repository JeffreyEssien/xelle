"use client";

import { useMemo } from "react";
import type { Order } from "@/types";
import { formatCurrency } from "@/lib/formatCurrency";

interface SalesChartProps {
    orders: Order[];
}

export default function SalesChart({ orders }: SalesChartProps) {
    const data = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split("T")[0];
        }).reverse();

        return last7Days.map((date) => {
            const dayTotal = orders
                .filter((o) => o.createdAt.startsWith(date))
                .reduce((sum, o) => sum + o.total, 0);
            return { date, total: dayTotal };
        });
    }, [orders]);

    const maxTotal = Math.max(...data.map((d) => d.total), 100); // Prevent div by zero, min scale 100

    return (
        <div className="bg-white rounded-lg shadow-sm border border-brand-lilac/20 p-6">
            <h3 className="font-serif text-lg text-brand-dark mb-6">Sales (Last 7 Days)</h3>
            <div className="h-48 flex items-end justify-between gap-2">
                {data.map((day) => {
                    const heightPercent = Math.max((day.total / maxTotal) * 100, 4); // Min 4% height
                    const displayDate = new Date(day.date).toLocaleDateString("en-US", { weekday: "short" });

                    return (
                        <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group">
                            <div className="relative w-full bg-brand-lilac/10 rounded-t-sm h-full flex items-end overflow-hidden group-hover:bg-brand-lilac/20 transition-colors">
                                <div
                                    className="w-full bg-brand-purple/80 transition-all duration-500 ease-out rounded-t-sm group-hover:bg-brand-purple"
                                    style={{ height: `${heightPercent}%` }}
                                ></div>
                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-brand-dark text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                    {formatCurrency(day.total)}
                                </div>
                            </div>
                            <span className="text-xs text-brand-dark/50 font-medium">{displayDate}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
