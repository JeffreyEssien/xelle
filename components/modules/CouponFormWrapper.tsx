"use client";

import CouponForm from "@/components/modules/CouponForm";
import { useRouter } from "next/navigation";

export default function CouponFormWrapper() {
    const router = useRouter();
    return <CouponForm onSuccess={() => router.refresh()} />;
}
