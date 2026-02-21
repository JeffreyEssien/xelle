"use client";

import { Toaster } from "sonner";

export default function ToastProvider() {
    return (
        <Toaster
            position="bottom-right"
            gap={8}
            toastOptions={{
                duration: 3000,
                classNames: {
                    toast: "bg-white border border-brand-lilac/15 shadow-xl rounded-xl text-brand-dark font-sans",
                    title: "text-sm font-semibold",
                    description: "text-xs text-brand-dark/50",
                    actionButton: "bg-brand-purple text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-brand-dark transition-colors",
                    cancelButton: "bg-neutral-100 text-brand-dark/70 px-3 py-1.5 rounded-lg text-xs font-medium",
                    success: "border-emerald-200/40",
                    error: "border-red-200/40",
                },
            }}
        />
    );
}
