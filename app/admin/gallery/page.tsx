"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload, Trash2, RefreshCw, Loader2, Image as ImageIcon, Film,
    X, Copy, Check, Search, Filter,
} from "lucide-react";
import { uploadToGallery } from "@/lib/uploadImage";
import type { Media } from "@/types";
import Image from "next/image";

type FilterType = "all" | "image" | "video";

export default function GalleryPage() {
    const [media, setMedia] = useState<Media[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState<{ synced: number; total: number } | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<FilterType>("all");
    const [preview, setPreview] = useState<Media | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchMedia = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/media");
            const data = await res.json();
            setMedia(data.media || []);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMedia();
    }, [fetchMedia]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploading(true);
        try {
            for (const file of Array.from(files)) {
                await uploadToGallery(file);
            }
            await fetchMedia();
        } catch (err) {
            console.error("Upload failed:", err);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        setSyncResult(null);
        try {
            const res = await fetch("/api/admin/gallery/sync", { method: "POST" });
            const data = await res.json();
            setSyncResult({ synced: data.synced, total: data.total });
            if (data.synced > 0) await fetchMedia();
        } catch (err) {
            console.error("Sync failed:", err);
        } finally {
            setSyncing(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this media permanently? This also removes it from Cloudinary.")) return;
        setDeleting(id);
        try {
            await fetch(`/api/media?id=${id}`, { method: "DELETE" });
            setMedia((prev) => prev.filter((m) => m.id !== id));
            if (preview?.id === id) setPreview(null);
        } catch {
            // silent
        } finally {
            setDeleting(null);
        }
    };

    const copyUrl = (url: string, id: string) => {
        navigator.clipboard.writeText(url);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const formatBytes = (bytes?: number) => {
        if (!bytes) return "—";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const filtered = media.filter((m) => {
        if (filter !== "all" && m.type !== filter) return false;
        if (search) {
            const q = search.toLowerCase();
            return (
                (m.name || "").toLowerCase().includes(q) ||
                m.publicId.toLowerCase().includes(q) ||
                (m.format || "").toLowerCase().includes(q)
            );
        }
        return true;
    });

    const imageCount = media.filter((m) => m.type === "image").length;
    const videoCount = media.filter((m) => m.type === "video").length;
    const totalSize = media.reduce((sum, m) => sum + (m.bytes || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif text-brand-dark">Media Gallery</h1>
                    <p className="text-sm text-brand-dark/50 mt-1">
                        {media.length} file{media.length !== 1 ? "s" : ""} · {formatBytes(totalSize)} total
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-brand-dark/10 text-sm text-brand-dark/70 hover:bg-brand-dark/5 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
                        {syncing ? "Syncing..." : "Sync Cloudinary"}
                    </button>
                    <label className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-purple text-white text-sm font-medium hover:bg-brand-dark transition-colors cursor-pointer">
                        {uploading ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Upload size={14} />
                        )}
                        {uploading ? "Uploading..." : "Upload"}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={handleUpload}
                            className="hidden"
                            disabled={uploading}
                        />
                    </label>
                </div>
            </div>

            {/* Sync result banner */}
            <AnimatePresence>
                {syncResult && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-800">
                            <span>
                                Sync complete — {syncResult.synced} new file{syncResult.synced !== 1 ? "s" : ""} added
                                {" "}(of {syncResult.total} on Cloudinary)
                            </span>
                            <button onClick={() => setSyncResult(null)} className="text-green-600 hover:text-green-800 cursor-pointer">
                                <X size={14} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Images", value: imageCount, icon: ImageIcon },
                    { label: "Videos", value: videoCount, icon: Film },
                    { label: "Total Size", value: formatBytes(totalSize), icon: Upload },
                ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-brand-dark/5">
                        <stat.icon size={16} className="text-brand-purple" />
                        <div>
                            <p className="text-xs text-brand-dark/40">{stat.label}</p>
                            <p className="text-sm font-semibold text-brand-dark">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search + Filter */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark/30" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, ID, or format..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-brand-dark/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple/40"
                    />
                </div>
                <div className="flex items-center gap-1 p-1 rounded-xl bg-brand-dark/5">
                    {(["all", "image", "video"] as FilterType[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                                filter === t
                                    ? "bg-brand-purple text-white"
                                    : "text-brand-dark/50 hover:text-brand-dark"
                            }`}
                        >
                            {t === "all" ? "All" : t === "image" ? "Images" : "Videos"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Gallery Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={24} className="animate-spin text-brand-purple" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                    <ImageIcon size={40} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-brand-dark/40 text-sm">
                        {search || filter !== "all" ? "No matching media found." : "No media yet. Upload files or sync from Cloudinary."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {filtered.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group relative aspect-square rounded-xl overflow-hidden border border-brand-dark/5 bg-gray-50 cursor-pointer"
                            onClick={() => setPreview(item)}
                        >
                            {item.type === "image" ? (
                                <Image
                                    src={item.url}
                                    alt={item.name || "Media"}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                                    <Film size={24} className="text-white/60" />
                                    <video src={item.url} className="absolute inset-0 w-full h-full object-cover opacity-60" muted />
                                </div>
                            )}

                            {item.type === "video" && (
                                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/50 text-[10px] text-white font-medium">
                                    Video
                                </div>
                            )}

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                                <div className="w-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-[10px] text-white truncate">{item.name || item.publicId}</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-[9px] text-white/60">
                                            {item.width && item.height ? `${item.width}×${item.height}` : ""} · {formatBytes(item.bytes)}
                                        </span>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    copyUrl(item.url, item.id);
                                                }}
                                                className="p-1 rounded bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
                                            >
                                                {copied === item.id ? <Check size={10} className="text-green-400" /> : <Copy size={10} className="text-white" />}
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(item.id);
                                                }}
                                                disabled={deleting === item.id}
                                                className="p-1 rounded bg-red-500/60 hover:bg-red-500/80 transition-colors cursor-pointer"
                                            >
                                                <Trash2 size={10} className="text-white" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Preview Modal */}
            <AnimatePresence>
                {preview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setPreview(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Preview image/video */}
                            <div className="relative w-full aspect-video bg-gray-100">
                                {preview.type === "image" ? (
                                    <Image
                                        src={preview.url}
                                        alt={preview.name || "Preview"}
                                        fill
                                        className="object-contain"
                                        sizes="600px"
                                    />
                                ) : (
                                    <video
                                        src={preview.url}
                                        controls
                                        className="w-full h-full object-contain"
                                    />
                                )}
                                <button
                                    onClick={() => setPreview(null)}
                                    className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Details */}
                            <div className="p-5 space-y-3">
                                <h3 className="font-serif text-lg text-brand-dark">
                                    {preview.name || preview.publicId}
                                </h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    {preview.width && preview.height && (
                                        <div>
                                            <span className="text-brand-dark/40">Dimensions</span>
                                            <p className="text-brand-dark">{preview.width} × {preview.height}</p>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-brand-dark/40">Size</span>
                                        <p className="text-brand-dark">{formatBytes(preview.bytes)}</p>
                                    </div>
                                    {preview.format && (
                                        <div>
                                            <span className="text-brand-dark/40">Format</span>
                                            <p className="text-brand-dark uppercase">{preview.format}</p>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-brand-dark/40">Type</span>
                                        <p className="text-brand-dark capitalize">{preview.type}</p>
                                    </div>
                                </div>

                                {/* URL */}
                                <div>
                                    <span className="text-xs text-brand-dark/40">URL</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <code className="flex-1 text-xs bg-gray-50 rounded-lg px-3 py-2 text-brand-dark/70 truncate border border-brand-dark/5">
                                            {preview.url}
                                        </code>
                                        <button
                                            onClick={() => copyUrl(preview.url, preview.id)}
                                            className="shrink-0 p-2 rounded-lg border border-brand-dark/10 text-brand-dark/50 hover:bg-brand-dark/5 transition-colors cursor-pointer"
                                        >
                                            {copied === preview.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <button
                                        onClick={() => {
                                            handleDelete(preview.id);
                                        }}
                                        disabled={deleting === preview.id}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm hover:bg-red-100 transition-colors cursor-pointer"
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
