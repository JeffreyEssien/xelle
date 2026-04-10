import { NextResponse } from "next/server";
import {
    getStockpileByEmail,
    getStockpileById,
    createStockpile,
    addStockpileItem,
    removeStockpileItem,
    updateStockpileStatus,
    updateStockpileShipping,
    getAllStockpiles,
    expireOldStockpiles,
} from "@/lib/queries";
import { getServiceClient } from "@/lib/supabase";
import {
    sendStockpileCreatedEmail,
    sendStockpileItemAddedEmail,
    sendStockpileShippedEmail,
    sendStockpileExpiredEmail,
} from "@/lib/email";
import { enqueue } from "@/lib/orderQueue";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Restore stock that was deducted, used when a subsequent insert fails */
async function restoreStock(
    supabase: SupabaseClient,
    item: { productId: string; variantName?: string; inventoryId?: string; quantity: number }
) {
    if (item.variantName) {
        const { data: prod } = await supabase
            .from("products")
            .select("variants")
            .eq("id", item.productId)
            .single();
        if (prod?.variants) {
            const variants = prod.variants as { name: string; stock: number }[];
            const idx = variants.findIndex((v) => v.name === item.variantName);
            if (idx >= 0) {
                variants[idx].stock = (variants[idx].stock || 0) + item.quantity;
                const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
                await supabase
                    .from("products")
                    .update({ variants, stock: totalStock })
                    .eq("id", item.productId);
            }
        }
    } else if (item.inventoryId) {
        const { data: inv } = await supabase
            .from("inventory_items")
            .select("stock")
            .eq("id", item.inventoryId)
            .single();
        if (inv) {
            await supabase
                .from("inventory_items")
                .update({ stock: inv.stock + item.quantity })
                .eq("id", item.inventoryId);
        }
    }
}

// GET: Fetch stockpile by email or ID, or all (admin)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get("email");
        const id = searchParams.get("id");
        const all = searchParams.get("all");

        // Expire old stockpiles in the background (don't block the response)
        expireOldStockpiles().then(async (expiredCount) => {
            if (expiredCount > 0) {
                try {
                    const allStockpiles = await getAllStockpiles();
                    const recentlyExpired = allStockpiles.filter(
                        (s) => s.status === "expired" &&
                            new Date(s.expiresAt).getTime() > Date.now() - 1000 * 60 * 5 // expired in last 5 min to reduce duplicate emails
                    );
                    for (const s of recentlyExpired) {
                        sendStockpileExpiredEmail(s).catch(() => { });
                    }
                } catch { }
            }
        }).catch(() => { });

        if (all === "true") {
            const stockpiles = await getAllStockpiles();
            return NextResponse.json(stockpiles);
        }

        if (id) {
            const stockpile = await getStockpileById(id);
            return NextResponse.json(stockpile);
        }

        if (email) {
            const stockpile = await getStockpileByEmail(email);
            return NextResponse.json(stockpile);
        }

        return NextResponse.json({ error: "Provide email, id, or all=true" }, { status: 400 });
    } catch (error) {
        console.error("Stockpile GET error:", error);
        return NextResponse.json({ error: "Failed to fetch stockpile" }, { status: 500 });
    }
}

// POST: Create stockpile, add item, remove item, update status, update shipping
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action } = body;

        switch (action) {
            case "create": {
                const stockpile = await createStockpile({
                    customerEmail: body.customerEmail,
                    customerName: body.customerName,
                    phone: body.phone,
                });
                // Send welcome email
                sendStockpileCreatedEmail(stockpile).catch(() => { });
                return NextResponse.json(stockpile);
            }
            case "add_item": {
                await enqueue(async () => {
                    const supabase = getServiceClient();
                    if (!supabase) throw new Error("Database not available");

                    // Deduct stock when adding to stockpile (same as order placement)
                    let stockDeducted = false;
                    if (body.variantName) {
                        const { error: rpcError } = await supabase.rpc("deduct_variant_stock", {
                            p_product_id: body.productId,
                            p_variant_name: body.variantName,
                            p_quantity: body.quantity,
                        });
                        if (rpcError) {
                            throw new Error(rpcError.message || `Insufficient stock for ${body.productName} - ${body.variantName}`);
                        }
                        stockDeducted = true;
                    } else if (body.inventoryId) {
                        const { error: rpcError } = await supabase.rpc("deduct_stock", {
                            p_inventory_id: body.inventoryId,
                            p_quantity: body.quantity,
                        });
                        if (rpcError) {
                            throw new Error(rpcError.message || `Insufficient stock for ${body.productName}`);
                        }
                        stockDeducted = true;
                    }

                    try {
                        await addStockpileItem({
                            stockpileId: body.stockpileId,
                            productId: body.productId,
                            productName: body.productName,
                            productImage: body.productImage,
                            variantName: body.variantName,
                            quantity: body.quantity,
                            pricePaid: body.pricePaid,
                            orderId: body.orderId,
                        });
                    } catch (insertError) {
                        // Restore stock if item insert fails
                        if (stockDeducted) {
                            await restoreStock(supabase, body);
                        }
                        throw insertError;
                    }
                });
                // Send item added email outside the queue (don't hold a queue slot for email)
                const updatedStockpile = await getStockpileById(body.stockpileId);
                if (updatedStockpile) {
                    const newItem = {
                        id: "", stockpileId: body.stockpileId,
                        productId: body.productId, productName: body.productName,
                        productImage: body.productImage, variantName: body.variantName,
                        quantity: body.quantity, pricePaid: body.pricePaid,
                        createdAt: new Date().toISOString(),
                    };
                    sendStockpileItemAddedEmail(updatedStockpile, [newItem]).catch(() => { });
                }
                return NextResponse.json({ success: true });
            }
            case "add_items": {
                const batchItems: Array<{
                    productId: string; productName: string; productImage?: string;
                    variantName?: string; quantity: number; pricePaid: number;
                    inventoryId?: string; orderId?: string;
                }> = body.items;

                if (!Array.isArray(batchItems) || batchItems.length === 0) {
                    return NextResponse.json({ error: "No items provided" }, { status: 400 });
                }

                await enqueue(async () => {
                    const supabaseBatch = getServiceClient();
                    if (!supabaseBatch) throw new Error("Database not available");

                    // Track which items had stock deducted so we can restore on failure
                    const deductedItems: typeof batchItems = [];

                    try {
                        // Deduct stock for all items first
                        for (const item of batchItems) {
                            if (item.variantName) {
                                const { error: rpcError } = await supabaseBatch.rpc("deduct_variant_stock", {
                                    p_product_id: item.productId,
                                    p_variant_name: item.variantName,
                                    p_quantity: item.quantity,
                                });
                                if (rpcError) {
                                    throw new Error(rpcError.message || `Insufficient stock for ${item.productName} - ${item.variantName}`);
                                }
                            } else if (item.inventoryId) {
                                const { error: rpcError } = await supabaseBatch.rpc("deduct_stock", {
                                    p_inventory_id: item.inventoryId,
                                    p_quantity: item.quantity,
                                });
                                if (rpcError) {
                                    throw new Error(rpcError.message || `Insufficient stock for ${item.productName}`);
                                }
                            }
                            deductedItems.push(item);
                        }

                        // Insert all stockpile items in one DB call
                        const rows = batchItems.map((item) => ({
                            stockpile_id: body.stockpileId,
                            product_id: item.productId,
                            product_name: item.productName,
                            product_image: item.productImage || null,
                            variant_name: item.variantName || null,
                            quantity: item.quantity,
                            price_paid: item.pricePaid,
                            order_id: item.orderId || null,
                        }));

                        const { error: insertError } = await supabaseBatch.from("stockpile_items").insert(rows);
                        if (insertError) throw insertError;

                        // Recalc total
                        const { data: allItems } = await supabaseBatch
                            .from("stockpile_items")
                            .select("price_paid, quantity")
                            .eq("stockpile_id", body.stockpileId);
                        const total = (allItems || []).reduce((sum: number, i: any) => sum + Number(i.price_paid) * i.quantity, 0);
                        await supabaseBatch.from("stockpiles").update({ total_items_value: total }).eq("id", body.stockpileId);
                    } catch (err) {
                        // Restore stock for all items that were successfully deducted
                        for (const item of deductedItems) {
                            await restoreStock(supabaseBatch, item).catch((e) =>
                                console.error("Failed to restore stock for", item.productName, e)
                            );
                        }
                        throw err;
                    }
                });

                // Send email outside the queue
                const updatedStockpile = await getStockpileById(body.stockpileId);
                if (updatedStockpile) {
                    const newItems = batchItems.map((item) => ({
                        id: "", stockpileId: body.stockpileId,
                        productId: item.productId, productName: item.productName,
                        productImage: item.productImage, variantName: item.variantName,
                        quantity: item.quantity, pricePaid: item.pricePaid,
                        createdAt: new Date().toISOString(),
                    }));
                    sendStockpileItemAddedEmail(updatedStockpile, newItems).catch(() => { });
                }
                return NextResponse.json({ success: true });
            }
            case "remove_item": {
                // Restore stock when removing from stockpile
                const supabaseForRemove = getServiceClient();
                if (supabaseForRemove && body.productId && body.quantity) {
                    try {
                        if (body.variantName) {
                            // Restore variant stock: fetch current, then add back
                            const { data: prod } = await supabaseForRemove
                                .from("products")
                                .select("variants")
                                .eq("id", body.productId)
                                .single();
                            if (prod?.variants) {
                                const variants = prod.variants as any[];
                                const idx = variants.findIndex((v: any) => v.name === body.variantName);
                                if (idx >= 0) {
                                    variants[idx].stock = (variants[idx].stock || 0) + body.quantity;
                                    const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
                                    await supabaseForRemove
                                        .from("products")
                                        .update({ variants, stock: totalStock })
                                        .eq("id", body.productId);
                                }
                            }
                        } else if (body.inventoryId) {
                            // Restore main inventory stock
                            const { data: inv } = await supabaseForRemove
                                .from("inventory_items")
                                .select("stock")
                                .eq("id", body.inventoryId)
                                .single();
                            if (inv) {
                                await supabaseForRemove
                                    .from("inventory_items")
                                    .update({ stock: inv.stock + body.quantity })
                                    .eq("id", body.inventoryId);
                            }
                        }
                    } catch (e) {
                        console.warn("Stock restore on stockpile remove failed:", e);
                    }
                }
                await removeStockpileItem(body.itemId, body.stockpileId);
                return NextResponse.json({ success: true });
            }
            case "update_status": {
                await updateStockpileStatus(body.stockpileId, body.status);
                // Send email based on new status
                const stockpile = await getStockpileById(body.stockpileId);
                if (stockpile) {
                    if (body.status === "shipped") {
                        sendStockpileShippedEmail(stockpile).catch(() => { });
                    } else if (body.status === "expired" || body.status === "cancelled") {
                        sendStockpileExpiredEmail(stockpile).catch(() => { });
                    }
                }
                return NextResponse.json({ success: true });
            }
            case "update_shipping": {
                await updateStockpileShipping(body.stockpileId, {
                    shippingAddress: body.shippingAddress,
                    deliveryZone: body.deliveryZone,
                    deliveryType: body.deliveryType,
                    deliveryFee: body.deliveryFee,
                });
                return NextResponse.json({ success: true });
            }
            default:
                return NextResponse.json({ error: "Unknown action" }, { status: 400 });
        }
    } catch (error) {
        console.error("Stockpile POST error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed" },
            { status: 500 }
        );
    }
}
