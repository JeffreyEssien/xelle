"use client";

import { useState } from "react";
import type { Profile } from "@/types";
import Image from "next/image";

export default function CustomersContent({ customers }: { customers: Profile[] }) {
    const [search, setSearch] = useState("");

    const filteredCustomers = customers.filter(
        (c) =>
            c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif text-brand-dark">Customers</h1>
                <input
                    type="text"
                    placeholder="Search customers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-4 py-2 border border-brand-lilac/30 rounded-sm focus:outline-none focus:border-brand-purple min-w-[300px]"
                />
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden border border-brand-lilac/20">
                <table className="w-full text-left text-sm">
                    <thead className="bg-brand-creme text-brand-dark">
                        <tr>
                            <th className="p-4 font-medium">Customer</th>
                            <th className="p-4 font-medium">Email</th>
                            <th className="p-4 font-medium">Role</th>
                            <th className="p-4 font-medium">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-lilac/10">
                        {filteredCustomers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">
                                    No customers found.
                                </td>
                            </tr>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-brand-creme/20">
                                    <td className="p-4 flex items-center gap-3">
                                        {customer.avatarUrl ? (
                                            <div className="relative h-8 w-8 rounded-full overflow-hidden">
                                                <Image
                                                    src={customer.avatarUrl}
                                                    alt={customer.fullName || "User"}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-brand-lilac/30 flex items-center justify-center text-brand-dark font-serif font-bold">
                                                {(customer.fullName || customer.email || "?")[0].toUpperCase()}
                                            </div>
                                        )}
                                        <span className="font-medium text-brand-dark">
                                            {customer.fullName || "N/A"}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600">{customer.email}</td>
                                    <td className="p-4">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium ${customer.role === "admin"
                                                ? "bg-purple-100 text-purple-700"
                                                : "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            {customer.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        {new Date(customer.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
