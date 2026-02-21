"use server";

import { revalidatePath } from "next/cache";

export async function revalidateShop() {
    revalidatePath("/shop");
    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/admin/inventory");
}
