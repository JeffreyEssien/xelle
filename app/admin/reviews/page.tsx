"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Eye, EyeOff, Trash2, GripVertical, Check, Filter } from "lucide-react";
import type { Review } from "@/types";

interface ReviewWithProduct extends Review {
    productName?: string;
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<ReviewWithProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "pending" | "approved" | "hidden">("all");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchReviews = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/reviews");
            const data = await res.json();
            setReviews(data.reviews || []);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    const handleAction = async (action: string, reviewId: string) => {
        setActionLoading(reviewId);
        try {
            await fetch("/api/admin/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, reviewId }),
            });
            await fetchReviews();
        } catch {
            // silent
        } finally {
            setActionLoading(null);
        }
    };

    const handleReorder = async (reviewId: string, direction: "up" | "down") => {
        const idx = filteredReviews.findIndex((r) => r.id === reviewId);
        if (idx < 0) return;

        const swapIdx = direction === "up" ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= filteredReviews.length) return;

        const updated = [
            { id: filteredReviews[idx].id, displayOrder: filteredReviews[swapIdx].displayOrder },
            { id: filteredReviews[swapIdx].id, displayOrder: filteredReviews[idx].displayOrder },
        ];

        setActionLoading(reviewId);
        try {
            await fetch("/api/admin/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "reorder", reviews: updated }),
            });
            await fetchReviews();
        } catch {
            // silent
        } finally {
            setActionLoading(null);
        }
    };

    const filteredReviews = reviews.filter((r) => {
        if (filter === "pending") return !r.isApproved;
        if (filter === "approved") return r.isApproved && r.isVisible;
        if (filter === "hidden") return !r.isVisible && r.isApproved;
        return true;
    });

    const pendingCount = reviews.filter((r) => !r.isApproved).length;

    if (loading) {
        return (
            <div className="max-w-5xl">
                <h1 className="text-2xl font-serif text-brand-dark mb-6">Reviews</h1>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse h-28 bg-white rounded-xl border border-gray-100" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-serif text-brand-dark">Reviews</h1>
                    <p className="text-sm text-brand-dark/40 mt-1">
                        {reviews.length} total · {pendingCount} pending approval
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
                <Filter size={14} className="text-brand-dark/30" />
                {(["all", "pending", "approved", "hidden"] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                            filter === f
                                ? "bg-brand-dark text-white"
                                : "bg-gray-100 text-brand-dark/60 hover:bg-gray-200"
                        }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                        {f === "pending" && pendingCount > 0 && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-400 text-white text-[10px]">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Reviews List */}
            {filteredReviews.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <Star size={32} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-brand-dark/40 text-sm">No reviews match this filter.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredReviews.map((review, index) => (
                        <div
                            key={review.id}
                            className={`p-5 rounded-xl bg-white border transition-colors ${
                                !review.isApproved
                                    ? "border-amber-200 bg-amber-50/30"
                                    : review.isVisible
                                        ? "border-gray-100"
                                        : "border-gray-100 opacity-60"
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Drag handle / order */}
                                <div className="flex flex-col items-center gap-1 pt-1">
                                    <button
                                        onClick={() => handleReorder(review.id, "up")}
                                        disabled={index === 0 || actionLoading === review.id}
                                        className="text-gray-300 hover:text-brand-purple disabled:opacity-30 cursor-pointer"
                                        title="Move up"
                                    >
                                        <GripVertical size={14} />
                                    </button>
                                    <span className="text-[10px] text-brand-dark/20 font-mono">#{review.displayOrder}</span>
                                    <button
                                        onClick={() => handleReorder(review.id, "down")}
                                        disabled={index === filteredReviews.length - 1 || actionLoading === review.id}
                                        className="text-gray-300 hover:text-brand-purple disabled:opacity-30 cursor-pointer"
                                        title="Move down"
                                    >
                                        <GripVertical size={14} />
                                    </button>
                                </div>

                                {/* Review content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        {/* Stars */}
                                        <div className="flex gap-0.5">
                                            {Array.from({ length: 5 }, (_, i) => (
                                                <Star
                                                    key={i}
                                                    size={12}
                                                    className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}
                                                />
                                            ))}
                                        </div>
                                        {/* Status badges */}
                                        {!review.isApproved && (
                                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-100 text-amber-700">
                                                Pending
                                            </span>
                                        )}
                                        {review.isApproved && review.isVisible && (
                                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-100 text-emerald-700">
                                                Visible
                                            </span>
                                        )}
                                        {review.isApproved && !review.isVisible && (
                                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-gray-500">
                                                Hidden
                                            </span>
                                        )}
                                    </div>

                                    <h4 className="font-semibold text-sm text-brand-dark truncate">{review.title}</h4>
                                    <p className="text-sm text-brand-dark/55 mt-1 line-clamp-2">{review.body}</p>

                                    <div className="flex items-center gap-3 mt-2 text-xs text-brand-dark/30">
                                        <span className="font-medium text-brand-dark/50">{review.customerName}</span>
                                        <span>·</span>
                                        <span>{review.customerEmail}</span>
                                        <span>·</span>
                                        <span className="text-brand-purple/60">{review.productName}</span>
                                        <span>·</span>
                                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                    {!review.isApproved && (
                                        <button
                                            onClick={() => handleAction("approve", review.id)}
                                            disabled={actionLoading === review.id}
                                            className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors cursor-pointer"
                                            title="Approve & Show"
                                        >
                                            <Check size={16} />
                                        </button>
                                    )}
                                    {review.isVisible ? (
                                        <button
                                            onClick={() => handleAction("hide", review.id)}
                                            disabled={actionLoading === review.id}
                                            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
                                            title="Hide"
                                        >
                                            <EyeOff size={16} />
                                        </button>
                                    ) : review.isApproved ? (
                                        <button
                                            onClick={() => handleAction("approve", review.id)}
                                            disabled={actionLoading === review.id}
                                            className="p-2 rounded-lg text-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                                            title="Make Visible"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    ) : null}
                                    <button
                                        onClick={() => {
                                            if (confirm("Delete this review permanently?")) {
                                                handleAction("delete", review.id);
                                            }
                                        }}
                                        disabled={actionLoading === review.id}
                                        className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors cursor-pointer"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
