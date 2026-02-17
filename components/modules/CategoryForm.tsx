"use client";

import { useState } from "react";
import type { Category } from "@/types";
import { createCategory, updateCategory } from "@/lib/queries";
import Button from "@/components/ui/Button";

interface CategoryFormProps {
    initialData?: Category | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function CategoryForm({ initialData, onSuccess, onCancel }: CategoryFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        name: initialData?.name || "",
        slug: initialData?.slug || "",
        image: initialData?.image || "",
        description: initialData?.description || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));

        // Auto-generate slug from name if creating new category
        if (name === "name" && !initialData) {
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            setForm((prev) => ({ ...prev, slug: slug }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (initialData) {
                await updateCategory(initialData.id, form);
            } else {
                await createCategory(form);
            }
            onSuccess();
        } catch (error) {
            console.error("Error saving category:", error);
            alert("Failed to save category. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-brand-dark mb-1">Name</label>
                <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-transparent border border-brand-lilac/30 rounded-sm focus:outline-none focus:border-brand-purple"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-brand-dark mb-1">Slug</label>
                <input
                    type="text"
                    name="slug"
                    required
                    value={form.slug}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-transparent border border-brand-lilac/30 rounded-sm focus:outline-none focus:border-brand-purple font-mono text-sm"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-brand-dark mb-1">Image URL</label>
                <input
                    type="url"
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full px-4 py-2 bg-transparent border border-brand-lilac/30 rounded-sm focus:outline-none focus:border-brand-purple"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-brand-dark mb-1">Description</label>
                <textarea
                    name="description"
                    rows={4}
                    value={form.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-transparent border border-brand-lilac/30 rounded-sm focus:outline-none focus:border-brand-purple"
                />
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : initialData ? "Update Category" : "Create Category"}
                </Button>
            </div>
        </form>
    );
}
