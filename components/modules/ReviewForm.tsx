"use client";

import { useState } from "react";
import StarRating from "@/components/ui/StarRating";
import { Send, CheckCircle, AlertCircle } from "lucide-react";

interface ReviewFormProps {
    productId: string;
    productName: string;
    onSuccess: () => void;
}

export default function ReviewForm({ productId, productName, onSuccess }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (rating === 0) { setError("Please select a star rating"); return; }
        if (!title.trim()) { setError("Please add a title"); return; }
        if (!body.trim()) { setError("Please write your review"); return; }
        if (!name.trim()) { setError("Please enter your name"); return; }
        if (!email.trim()) { setError("Please enter your email"); return; }

        setLoading(true);
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId,
                    email: email.trim().toLowerCase(),
                    customerName: name.trim(),
                    rating,
                    title: title.trim(),
                    reviewBody: body.trim(),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to submit review");
                return;
            }

            setSuccess(true);
            setTimeout(() => onSuccess(), 2000);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <CheckCircle size={32} className="mx-auto text-emerald-500 mb-3" />
                <h3 className="font-semibold text-emerald-800 mb-1">Review Submitted!</h3>
                <p className="text-sm text-emerald-600">Thank you! Your review will appear once approved by our team.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-neutral-50/70 border border-brand-lilac/10">
            <h3 className="font-serif text-lg text-brand-dark mb-1">Review {productName}</h3>
            <p className="text-xs text-brand-dark/40 mb-5">Only customers with delivered orders can leave reviews.</p>

            {error && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}

            {/* Star Rating */}
            <div className="mb-5">
                <label className="block text-[10px] font-semibold text-brand-dark/40 uppercase tracking-[0.2em] mb-2">
                    Your Rating
                </label>
                <StarRating rating={rating} size={28} interactive onChange={setRating} />
            </div>

            {/* Name + Email row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-[10px] font-semibold text-brand-dark/40 uppercase tracking-[0.2em] mb-1.5">
                        Your Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-brand-lilac/15 bg-white text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/30 transition-all"
                        placeholder="Jane Doe"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-semibold text-brand-dark/40 uppercase tracking-[0.2em] mb-1.5">
                        Order Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-brand-lilac/15 bg-white text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/30 transition-all"
                        placeholder="your@email.com"
                    />
                </div>
            </div>

            {/* Title */}
            <div className="mb-4">
                <label className="block text-[10px] font-semibold text-brand-dark/40 uppercase tracking-[0.2em] mb-1.5">
                    Review Title
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                    className="w-full px-4 py-2.5 rounded-lg border border-brand-lilac/15 bg-white text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/30 transition-all"
                    placeholder="Summarize your experience"
                />
            </div>

            {/* Body */}
            <div className="mb-5">
                <label className="block text-[10px] font-semibold text-brand-dark/40 uppercase tracking-[0.2em] mb-1.5">
                    Your Review
                </label>
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={4}
                    maxLength={1000}
                    className="w-full px-4 py-2.5 rounded-lg border border-brand-lilac/15 bg-white text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/30 transition-all resize-none"
                    placeholder="Share your thoughts about this product..."
                />
                <p className="text-right text-[10px] text-brand-dark/25 mt-1">{body.length}/1000</p>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-brand-dark text-white text-sm font-medium hover:bg-brand-purple transition-colors disabled:opacity-50 cursor-pointer"
            >
                {loading ? (
                    <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                    <Send size={14} />
                )}
                {loading ? "Submitting..." : "Submit Review"}
            </button>
        </form>
    );
}
