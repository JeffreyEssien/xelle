import { NextResponse } from "next/server";
import { isAdminAuthed, logAdminAction } from "@/lib/adminAuth";
import * as q from "@/lib/queries";

/**
 * Authenticated admin write dispatch (Phase 1.3).
 *
 * Admin forms used to call lib/queries mutation functions directly from the
 * browser — which ran getServiceClient() client-side and silently fell back to
 * the anon key, relying on permissive RLS. They now POST here instead, so every
 * privileged write runs server-side under the service role. Migration 004 then
 * removes the anon write policies these depended on.
 *
 * Only the whitelisted mutations below are callable.
 */
const MUTATIONS = {
    createProduct: q.createProduct,
    updateProduct: q.updateProduct,
    deleteProduct: q.deleteProduct,
    updateProductStock: q.updateProductStock,
    createCategory: q.createCategory,
    updateCategory: q.updateCategory,
    deleteCategory: q.deleteCategory,
    createCoupon: q.createCoupon,
    deleteCoupon: q.deleteCoupon,
    toggleCouponStatus: q.toggleCouponStatus,
    updateSiteSettings: q.updateSiteSettings,
    createInventoryItem: q.createInventoryItem,
    updateInventoryItem: q.updateInventoryItem,
    logInventoryChange: q.logInventoryChange,
    createPage: q.createPage,
    updatePage: q.updatePage,
    deletePage: q.deletePage,
    createDeliveryZone: q.createDeliveryZone,
    updateDeliveryZone: q.updateDeliveryZone,
    deleteDeliveryZone: q.deleteDeliveryZone,
    createDeliveryLocation: q.createDeliveryLocation,
    updateDeliveryLocation: q.updateDeliveryLocation,
    deleteDeliveryLocation: q.deleteDeliveryLocation,
} as const;

type MutationName = keyof typeof MUTATIONS;

// Which mutations to write to the audit trail, and under what action name.
const AUDIT: Partial<Record<MutationName, string>> = {
    createProduct: "product.created",
    updateProduct: "product.updated",
    deleteProduct: "product.deleted",
    createCoupon: "coupon.created",
    deleteCoupon: "coupon.deleted",
    toggleCouponStatus: "coupon.toggled",
    updateSiteSettings: "settings.updated",
    createInventoryItem: "inventory.item_created",
    updateInventoryItem: "inventory.item_updated",
    logInventoryChange: "inventory.adjusted",
    createCategory: "category.created",
    updateCategory: "category.updated",
    deleteCategory: "category.deleted",
    createPage: "page.created",
    updatePage: "page.updated",
    deletePage: "page.deleted",
};

export async function POST(request: Request) {
    if (!(await isAdminAuthed())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let fn: string;
    let args: unknown[];
    try {
        const body = await request.json();
        fn = body?.fn;
        args = Array.isArray(body?.args) ? body.args : [];
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    if (typeof fn !== "string" || !(fn in MUTATIONS)) {
        return NextResponse.json({ error: `Unknown mutation: ${fn}` }, { status: 400 });
    }

    try {
        const handler = MUTATIONS[fn as MutationName] as (...a: unknown[]) => Promise<unknown>;
        const result = await handler(...args);

        const action = AUDIT[fn as MutationName];
        if (action) {
            const targetId = typeof args[0] === "string" ? args[0] : (typeof result === "string" ? result : undefined);
            await logAdminAction(action, { type: fn.replace(/^(create|update|delete|toggle|log)/, "").toLowerCase() || undefined, id: targetId });
        }

        return NextResponse.json({ success: true, result: result ?? null });
    } catch (err: any) {
        console.error(`admin/db ${fn} failed:`, err?.message || err);
        return NextResponse.json({ error: err?.message || "Mutation failed" }, { status: 500 });
    }
}
