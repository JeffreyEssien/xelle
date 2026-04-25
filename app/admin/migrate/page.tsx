"use client";

import { useState } from "react";

interface MigrateResult {
    done: boolean;
    migrated: number;
    skipped: number;
    failed: number;
    log: string[];
}

export default function MigratePage() {
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState<MigrateResult | null>(null);
    const [error, setError] = useState("");

    async function handleMigrate() {
        if (!confirm("This will migrate all Supabase bucket images to Cloudinary. Continue?")) return;

        setRunning(true);
        setError("");
        setResult(null);

        try {
            const res = await fetch("/api/admin/migrate", { method: "POST" });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || "Migration failed");
            }
            const data = await res.json();
            setResult(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setRunning(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-10 px-6">
            <h1 className="text-2xl font-bold text-brand-dark mb-2">Image Migration</h1>
            <p className="text-brand-dark/60 mb-6">
                One-time migration of Supabase Storage images to Cloudinary.
                Scans products, categories, site settings, and reviews.
                Only Supabase URLs are migrated — Cloudinary URLs are skipped.
            </p>

            <button
                onClick={handleMigrate}
                disabled={running}
                className="px-6 py-3 bg-brand-purple text-white rounded-lg font-medium hover:bg-brand-purple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
                {running ? "Migrating..." : "Start Migration"}
            </button>

            {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            {result && (
                <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                            <div className="text-2xl font-bold text-green-700">{result.migrated}</div>
                            <div className="text-xs text-green-600">Migrated</div>
                        </div>
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                            <div className="text-2xl font-bold text-gray-700">{result.skipped}</div>
                            <div className="text-xs text-gray-600">Skipped</div>
                        </div>
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                            <div className="text-2xl font-bold text-red-700">{result.failed}</div>
                            <div className="text-xs text-red-600">Failed</div>
                        </div>
                    </div>

                    {result.log.length > 0 && (
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-80 overflow-y-auto">
                            <h3 className="font-medium text-sm text-brand-dark mb-2">Migration Log</h3>
                            <div className="space-y-1 text-xs font-mono text-brand-dark/70">
                                {result.log.map((line, i) => (
                                    <div key={i}>{line}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
