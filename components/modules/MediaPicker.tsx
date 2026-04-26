"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Trash2, Check, Image as ImageIcon, Film, Loader2 } from "lucide-react";
import { uploadToGallery } from "@/lib/uploadImage";
import type { Media } from "@/types";
import Image from "next/image";

interface MediaPickerProps {
    open: boolean;
    onClose: () => void;
    onSelect: (media: Media[]) => void;
    multiple?: boolean;
    typeFilter?: "image" | "video";
    selectedIds?: string[];
}

export default function MediaPicker({
    open,
    onClose,
    onSelect,
    multiple = false,
    typeFilter,
    selectedIds = [],
}: MediaPickerProps) {
    const [media, setMedia] = useState<Media[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds));
    const [deleting, setDeleting] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchMedia = useCallback(async () => {
        setLoading(true);
        try {
            const url = typeFilter ? `/api/media?type=${typeFilter}` : "/api/media";
            const res = await fetch(url);
            const data = await res.json();
            setMedia(data.media || []);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, [typeFilter]);

    const selectedIdsKey = selectedIds.join(",");
    useEffect(() => {
        if (open) {
            fetchMedia();
            setSelected(new Set(selectedIds));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, fetchMedia, selectedIdsKey]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            await Promise.all(Array.from(files).map((file) => uploadToGallery(file)));
            await fetchMedia();
        } catch (err) {
            console.error("Upload failed:", err);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this media permanently?")) return;
        setDeleting(id);
        try {
            await fetch(`/api/media?id=${id}`, { method: "DELETE" });
            setMedia((prev) => prev.filter((m) => m.id !== id));
            setSelected((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        } catch {
            // silent
        } finally {
            setDeleting(null);
        }
    };

    const toggleSelect = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (multiple) {
                if (next.has(id)) next.delete(id);
                else next.add(id);
            } else {
                next.clear();
                next.add(id);
            }
            return next;
        });
    };

    const handleConfirm = () => {
        const selectedMedia = media.filter((m) => selected.has(m.id));
        onSelect(selectedMedia);
        onClose();
    };

    if (!open) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <div>
                            <h2 className="text-lg font-serif text-brand-dark">Media Gallery</h2>
                            <p className="text-xs text-brand-dark/40 mt-0.5">
                                {multiple ? "Select one or more files" : "Select a file"}
                                {selected.size > 0 && ` · ${selected.size} selected`}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Upload button */}
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
                                    accept={typeFilter === "video" ? "video/*" : typeFilter === "image" ? "image/*" : "image/*,video/*"}
                                    multiple
                                    onChange={handleUpload}
                                    className="hidden"
                                    disabled={uploading}
                                />
                            </label>
                            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Gallery Grid */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 size={24} className="animate-spin text-brand-purple" />
                            </div>
                        ) : media.length === 0 ? (
                            <div className="text-center py-20">
                                <ImageIcon size={40} className="mx-auto text-gray-200 mb-3" />
                                <p className="text-brand-dark/40 text-sm">No media yet. Upload some files to get started.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                {media.map((item) => {
                                    const isSelected = selected.has(item.id);
                                    const isDeleting = deleting === item.id;

                                    return (
                                        <div
                                            key={item.id}
                                            className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                                                isSelected
                                                    ? "border-brand-purple ring-2 ring-brand-purple/20"
                                                    : "border-transparent hover:border-brand-lilac/30"
                                            }`}
                                            onClick={() => toggleSelect(item.id)}
                                        >
                                            {item.type === "image" ? (
                                                <Image
                                                    src={item.url}
                                                    alt={item.name || "Media"}
                                                    fill
                                                    className="object-cover"
                                                    sizes="200px"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                                                    <Film size={24} className="text-white/60" />
                                                    <video src={item.url} className="absolute inset-0 w-full h-full object-cover opacity-60" muted />
                                                </div>
                                            )}

                                            {/* Selected indicator */}
                                            {isSelected && (
                                                <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-brand-purple flex items-center justify-center">
                                                    <Check size={12} className="text-white" />
                                                </div>
                                            )}

                                            {/* Type badge */}
                                            {item.type === "video" && (
                                                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/50 text-[10px] text-white font-medium">
                                                    Video
                                                </div>
                                            )}

                                            {/* Delete button (on hover) */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(item.id);
                                                }}
                                                disabled={isDeleting}
                                                className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 cursor-pointer"
                                            >
                                                <Trash2 size={12} />
                                            </button>

                                            {/* File info on hover */}
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-[10px] text-white truncate">{item.name || item.publicId}</p>
                                                {item.width && item.height && (
                                                    <p className="text-[9px] text-white/60">{item.width}×{item.height}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                        <p className="text-xs text-brand-dark/30">
                            {media.length} file{media.length !== 1 ? "s" : ""} in gallery
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg text-sm text-brand-dark/60 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={selected.size === 0}
                                className="px-5 py-2 rounded-lg bg-brand-purple text-white text-sm font-medium hover:bg-brand-dark transition-colors disabled:opacity-40 cursor-pointer"
                            >
                                {selected.size > 0
                                    ? `Select ${selected.size} file${selected.size !== 1 ? "s" : ""}`
                                    : "Select"}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
