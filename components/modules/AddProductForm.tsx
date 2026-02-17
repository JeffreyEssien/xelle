"use client";

import { useState } from "react";
import type { Product } from "@/types";
import Button from "@/components/ui/Button";
import { uploadProductImage } from "@/lib/uploadImage";
import { createProduct, updateProduct } from "@/lib/queries";

export default function AddProductForm({ initialData }: { initialData?: Product | null }) {
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<File[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>(initialData?.images || []);
    const [uploading, setUploading] = useState(false);

    const [form, setForm] = useState({
        title: initialData?.name || "",
        description: initialData?.description || "",
        price: initialData?.price.toString() || "",
        stock: initialData?.stock.toString() || "",
        category: initialData?.category || "",
    });
    const [variants, setVariants] = useState<Product["variants"]>(initialData?.variants || []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setImages((prev) => [...prev, ...newFiles]);

            // Auto-upload immediately for better UX
            setUploading(true);
            try {
                const uploadPromises = newFiles.map(file => uploadProductImage(file));
                const urls = await Promise.all(uploadPromises);
                setImageUrls((prev) => [...prev, ...urls]);
            } catch (error) {
                console.error("Upload failed", error);
                alert("Failed to upload images. Please try again.");
            } finally {
                setUploading(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (imageUrls.length === 0) {
            alert("Please upload at least one image.");
            return;
        }

        setLoading(true);
        try {
            if (initialData) {
                await updateProduct(initialData.id, {
                    name: form.title,
                    description: form.description,
                    price: parseFloat(form.price),
                    stock: parseInt(form.stock),
                    category: form.category,
                    images: imageUrls,
                    variants: variants,
                });
                alert("Product updated successfully!");
            } else {
                await createProduct({
                    name: form.title,
                    description: form.description,
                    price: parseFloat(form.price),
                    stock: parseInt(form.stock),
                    category: form.category,
                    images: imageUrls,
                    variants: variants,
                });
                alert("Product created successfully!");
            }
            // Reset form
            if (!initialData) {
                setForm({
                    title: "",
                    description: "",
                    price: "",
                    stock: "",
                    category: "",
                });
                setImages([]);
                setImageUrls([]);
                setVariants([]);
            }
            window.location.reload(); // Refresh to show new product
        } catch (error: any) {
            console.error(error);
            alert(`Failed to save product: ${error.message || JSON.stringify(error)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-brand-lilac/20 p-6 mb-8 space-y-4 animate-slideUp">
            <h2 className="font-serif text-lg text-brand-dark mb-2">{initialData ? "Edit Product" : "Add New Product"}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Title" name="title" value={form.title} onChange={handleChange} required />
                <InputField label="Price ($)" name="price" type="number" value={form.price} onChange={handleChange} required />
                <InputField label="Stock" name="stock" type="number" value={form.stock} onChange={handleChange} required />
                <SelectField label="Category" name="category" value={form.category} onChange={handleChange} required />
            </div>

            <TextAreaField label="Description" name="description" value={form.description} onChange={handleChange} required />

            {/* Variants Section */}
            <div className="space-y-3 border-t border-brand-lilac/20 pt-4">
                <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-brand-dark">Variants (Optional)</label>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setVariants([...variants, { name: "", stock: 0 }])}
                    >
                        + Add Variant
                    </Button>
                </div>
                {variants.map((variant, idx) => (
                    <div key={idx} className="flex gap-2 items-end bg-brand-lilac/5 p-3 rounded-md">
                        <div className="flex-1">
                            <label className="text-xs text-brand-dark/60">Name (e.g. Red, XL)</label>
                            <input
                                type="text"
                                value={variant.name}
                                onChange={(e) => {
                                    const newVariants = [...variants];
                                    newVariants[idx].name = e.target.value;
                                    setVariants(newVariants);
                                }}
                                className="w-full border border-brand-lilac/20 rounded-md px-2 py-1 text-sm"
                                placeholder="Variant Name"
                            />
                        </div>
                        <div className="w-24">
                            <label className="text-xs text-brand-dark/60">Stock</label>
                            <input
                                type="number"
                                value={variant.stock || 0}
                                onChange={(e) => {
                                    const newVariants = [...variants];
                                    newVariants[idx].stock = parseInt(e.target.value) || 0;
                                    setVariants(newVariants);
                                }}
                                className="w-full border border-brand-lilac/20 rounded-md px-2 py-1 text-sm"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => setVariants(variants.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700 text-xs pb-2"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            {/* Image Upload Area */}
            <div className="space-y-3">
                <label className="block text-xs text-brand-dark/60">Product Images</label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-2">
                    {imageUrls.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-md overflow-hidden border border-brand-lilac/20">
                            <img src={url} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    ))}
                    {uploading && (
                        <div className="aspect-square rounded-md bg-brand-lilac/5 flex items-center justify-center border border-brand-lilac/20">
                            <span className="text-xs text-brand-dark/50 animate-pulse">Uploading...</span>
                        </div>
                    )}
                </div>

                <div className="border-2 border-dashed border-brand-lilac/30 rounded-md p-8 text-center hover:bg-brand-lilac/5 transition-colors relative">
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="space-y-1 pointe-events-none">
                        <p className="text-sm text-brand-dark/60 font-medium">Click or drag images here to upload</p>
                        <p className="text-xs text-brand-dark/40">Support for JPG, PNG, WEBP</p>
                    </div>
                </div>
            </div>

            <div className="pt-2">
                <Button type="submit" disabled={loading || uploading}>
                    {loading ? "Saving..." : (initialData ? "Update Product" : "Save Product")}
                </Button>
            </div>
        </form>
    );
}

function InputField({ label, name, type = "text", value, onChange, required }: {
    label: string; name: string; type?: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
}) {
    return (
        <div>
            <label htmlFor={name} className="block text-xs text-brand-dark/60 mb-1">{label}</label>
            <input
                id={name} name={name} type={type} value={value} onChange={onChange} required={required}
                className="w-full border border-brand-lilac/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
            />
        </div>
    );
}

function TextAreaField({ label, name, value, onChange, required }: {
    label: string; name: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    required?: boolean;
}) {
    return (
        <div>
            <label htmlFor={name} className="block text-xs text-brand-dark/60 mb-1">{label}</label>
            <textarea
                id={name} name={name} rows={3} value={value} onChange={onChange} required={required}
                className="w-full border border-brand-lilac/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
            />
        </div>
    );
}

function SelectField({ label, name, value, onChange, required }: {
    label: string; name: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    required?: boolean;
}) {
    return (
        <div>
            <label htmlFor={name} className="block text-xs text-brand-dark/60 mb-1">{label}</label>
            <select
                id={name} name={name} value={value} onChange={onChange} required={required}
                className="w-full border border-brand-lilac/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
            >
                <option value="">Select category</option>
                <option value="handbags">Handbags</option>
                <option value="jewelry">Jewelry</option>
                <option value="fragrances">Fragrances</option>
                <option value="accessories">Accessories</option>
            </select>
        </div>
    );
}
