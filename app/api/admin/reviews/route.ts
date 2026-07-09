import { NextRequest, NextResponse } from "next/server";
import {
    getAllReviews,
    getProductReviewsAdmin,
    approveReview,
    hideReview,
    deleteReview,
    updateReviewOrder,
} from "@/lib/queries";
import { isAdminAuthed } from "@/lib/adminAuth";

async function isAdmin(): Promise<boolean> {
    return isAdminAuthed();
}

// GET /api/admin/reviews?productId=xxx (optional filter)
export async function GET(req: NextRequest) {
    if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const productId = req.nextUrl.searchParams.get("productId");

    if (productId) {
        const reviews = await getProductReviewsAdmin(productId);
        return NextResponse.json({ reviews });
    }

    const reviews = await getAllReviews();
    return NextResponse.json({ reviews });
}

// POST /api/admin/reviews — actions: approve, hide, delete, reorder
export async function POST(req: NextRequest) {
    if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { action, reviewId, reviews } = body;

        switch (action) {
            case "approve":
                if (!reviewId) return NextResponse.json({ error: "reviewId required" }, { status: 400 });
                await approveReview(reviewId);
                return NextResponse.json({ success: true });

            case "hide":
                if (!reviewId) return NextResponse.json({ error: "reviewId required" }, { status: 400 });
                await hideReview(reviewId);
                return NextResponse.json({ success: true });

            case "delete":
                if (!reviewId) return NextResponse.json({ error: "reviewId required" }, { status: 400 });
                await deleteReview(reviewId);
                return NextResponse.json({ success: true });

            case "reorder":
                if (!reviews || !Array.isArray(reviews))
                    return NextResponse.json({ error: "reviews array required" }, { status: 400 });
                await updateReviewOrder(reviews);
                return NextResponse.json({ success: true });

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (error: any) {
        console.error("Admin review action error:", error);
        return NextResponse.json({ error: "Failed to process action" }, { status: 500 });
    }
}
