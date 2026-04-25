"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import StarRating from "@/components/ui/StarRating";
import ReviewForm from "@/components/modules/ReviewForm";
import type { Review } from "@/types";
import { MessageSquare, ChevronDown } from "lucide-react";

interface ProductReviewsProps {
    productId: string;
    productName: string;
}

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
    const searchParams = useSearchParams();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [rating, setRating] = useState({ average: 0, count: 0 });
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(searchParams.get("review") === "true");
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        fetch(`/api/reviews?productId=${productId}`)
            .then((r) => r.json())
            .then((data) => {
                setReviews(data.reviews || []);
                setRating(data.rating || { average: 0, count: 0 });
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [productId]);

    const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

    return (
        <section className="mt-16 border-t border-brand-lilac/10 pt-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h2 className="font-serif text-2xl text-brand-dark">Customer Reviews</h2>
                    {rating.count > 0 && (
                        <div className="flex items-center gap-3 mt-2">
                            <StarRating rating={rating.average} size={20} />
                            <span className="text-lg font-semibold text-brand-dark">{rating.average}</span>
                            <span className="text-sm text-brand-dark/40">({rating.count} {rating.count === 1 ? "review" : "reviews"})</span>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-5 py-2.5 rounded-full text-sm font-medium bg-brand-dark text-white hover:bg-brand-purple transition-colors cursor-pointer"
                >
                    <span className="flex items-center gap-2">
                        <MessageSquare size={14} />
                        Write a Review
                    </span>
                </button>
            </div>

            {/* Review Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-8"
                    >
                        <ReviewForm
                            productId={productId}
                            productName={productName}
                            onSuccess={() => {
                                setShowForm(false);
                                // Refresh reviews
                                fetch(`/api/reviews?productId=${productId}`)
                                    .then((r) => r.json())
                                    .then((data) => {
                                        setReviews(data.reviews || []);
                                        setRating(data.rating || { average: 0, count: 0 });
                                    });
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reviews List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-4 bg-gray-100 rounded w-1/4 mb-2" />
                            <div className="h-3 bg-gray-100 rounded w-3/4 mb-1" />
                            <div className="h-3 bg-gray-100 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-12 bg-neutral-50/50 rounded-2xl border border-brand-lilac/8">
                    <MessageSquare size={32} className="mx-auto text-brand-dark/15 mb-3" />
                    <p className="text-brand-dark/40 text-sm">No reviews yet. Be the first to share your experience!</p>
                </div>
            ) : (
                <>
                    <div className="space-y-6">
                        {displayedReviews.map((review, index) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="p-5 rounded-xl bg-neutral-50/70 border border-brand-lilac/8"
                            >
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <StarRating rating={review.rating} size={14} />
                                            <span className="text-xs text-brand-dark/30 font-medium">
                                                Verified Purchase
                                            </span>
                                        </div>
                                        <h4 className="font-semibold text-brand-dark text-sm">{review.title}</h4>
                                    </div>
                                </div>
                                <p className="text-sm text-brand-dark/60 leading-relaxed mb-3">{review.body}</p>
                                <div className="flex items-center gap-2 text-xs text-brand-dark/30">
                                    <span className="font-medium text-brand-dark/50">{review.customerName}</span>
                                    <span>·</span>
                                    <span>{new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {reviews.length > 3 && !showAll && (
                        <button
                            onClick={() => setShowAll(true)}
                            className="mt-6 mx-auto flex items-center gap-1.5 px-5 py-2.5 text-sm text-brand-purple hover:text-brand-dark transition-colors font-medium cursor-pointer"
                        >
                            <ChevronDown size={14} />
                            Show all {reviews.length} reviews
                        </button>
                    )}
                </>
            )}
        </section>
    );
}
