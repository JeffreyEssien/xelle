"use client";

import { Toaster } from "sonner";

export default function ToastProvider() {
    return (
        <Toaster
            position="top-center"
            toastOptions={{
                classNames: {
                    toast: "bg-white text-black border border-gray-200 shadow-lg",
                    title: "text-base font-semibold",
                    description: "text-sm text-gray-500",
                    actionButton: "bg-black text-white px-4 py-2 rounded-md font-medium",
                    cancelButton: "bg-gray-100 text-black px-4 py-2 rounded-md font-medium",
                },
            }}
        />
    );
}
