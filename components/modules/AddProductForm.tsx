"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export default function AddProductForm() {
    const [form, setForm] = useState({
        title: "",
        description: "",
        price: "",
        stock: "",
        category: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Product "${form.title}" would be created (UI only)`);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-brand-lilac/20 p-6 mb-8 space-y-4">
            <h2 className="font-serif text-lg text-brand-dark mb-2">Add New Product</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Title" name="title" value={form.title} onChange={handleChange} />
                <InputField label="Price ($)" name="price" type="number" value={form.price} onChange={handleChange} />
                <InputField label="Stock" name="stock" type="number" value={form.stock} onChange={handleChange} />
                <SelectField label="Category" name="category" value={form.category} onChange={handleChange} />
            </div>
            <TextAreaField label="Description" name="description" value={form.description} onChange={handleChange} />
            <div className="border border-dashed border-brand-lilac/30 rounded-md p-8 text-center text-brand-dark/40 text-sm">
                Image upload placeholder — drag & drop
            </div>
            <Button type="submit">Save Product</Button>
        </form>
    );
}

function InputField({ label, name, type = "text", value, onChange }: {
    label: string; name: string; type?: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <div>
            <label htmlFor={name} className="block text-xs text-brand-dark/60 mb-1">{label}</label>
            <input id={name} name={name} type={type} value={value} onChange={onChange}
                className="w-full border border-brand-lilac/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30" />
        </div>
    );
}

function TextAreaField({ label, name, value, onChange }: {
    label: string; name: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
    return (
        <div>
            <label htmlFor={name} className="block text-xs text-brand-dark/60 mb-1">{label}</label>
            <textarea id={name} name={name} rows={3} value={value} onChange={onChange}
                className="w-full border border-brand-lilac/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30" />
        </div>
    );
}

function SelectField({ label, name, value, onChange }: {
    label: string; name: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
    return (
        <div>
            <label htmlFor={name} className="block text-xs text-brand-dark/60 mb-1">{label}</label>
            <select id={name} name={name} value={value} onChange={onChange}
                className="w-full border border-brand-lilac/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30">
                <option value="">Select category</option>
                <option value="handbags">Handbags</option>
                <option value="jewelry">Jewelry</option>
                <option value="fragrances">Fragrances</option>
                <option value="accessories">Accessories</option>
            </select>
        </div>
    );
}
