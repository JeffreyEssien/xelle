import { NextRequest, NextResponse } from "next/server";
import {
    getProductReviews,
    getProductRating,
    createReview,
    verifyPurchase,
    hasReviewed,
} from "@/lib/queries";

// GET /api/reviews?productId=xxx — fetch visible reviews + rating
export async function GET(req: NextRequest) {
    const productId = req.nextUrl.searchParams.get("productId");
    if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

    const [reviews, rating] = await Promise.all([
        getProductReviews(productId),
        getProductRating(productId),
    ]);

    return NextResponse.json({ reviews, rating });
}

// POST /api/reviews — submit a review (verified purchase only)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { productId, email, customerName, rating, title, reviewBody } = body;

        if (!productId || !email || !customerName || !rating || !title || !reviewBody) {
            return NextResponse.json({ error: "All fields required" }, { status: 400 });
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
        }

        // Verify this email has a delivered order with this product
        const purchase = await verifyPurchase(productId, email);
        if (!purchase.verified || !purchase.orderId) {
            return NextResponse.json(
                { error: "Only verified purchasers can leave reviews. Your order must be delivered first." },
                { status: 403 }
            );
        }

        // Check if already reviewed
        const alreadyReviewed = await hasReviewed(productId, purchase.orderId, email);
        if (alreadyReviewed) {
            return NextResponse.json(
                { error: "You have already reviewed this product for this order." },
                { status: 409 }
            );
        }

        const review = await createReview({
            productId,
            orderId: purchase.orderId,
            customerName,
            customerEmail: email,
            rating,
            title,
            body: reviewBody,
        });

        return NextResponse.json({ review, message: "Review submitted! It will appear once approved by our team." });
    } catch (error: any) {
        console.error("Review submission error:", error);
        if (error.code === "23505") {
            return NextResponse.json({ error: "You already reviewed this product." }, { status: 409 });
        }
        return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
    }
}
