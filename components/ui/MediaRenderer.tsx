"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { isVideoUrl, getVideoThumbnail } from "@/lib/media";

interface MediaRendererProps {
    src: string;
    alt: string;
    fill?: boolean;
    sizes?: string;
    priority?: boolean;
    className?: string;
    videoClassName?: string;
    showControls?: boolean;
}

export default function MediaRenderer({
    src,
    alt,
    fill = true,
    sizes,
    priority,
    className = "object-cover",
    videoClassName,
    showControls = false,
}: MediaRendererProps) {
    if (!isVideoUrl(src)) {
        return (
            <Image
                src={src}
                alt={alt}
                fill={fill}
                sizes={sizes}
                priority={priority}
                className={className}
            />
        );
    }

    if (showControls) {
        return (
            <video
                src={src}
                poster={getVideoThumbnail(src)}
                controls
                playsInline
                preload="metadata"
                className={videoClassName || `absolute inset-0 w-full h-full ${className}`}
            />
        );
    }

    // Thumbnail mode — static image with play badge
    return (
        <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={getVideoThumbnail(src)}
                alt={alt}
                className={`w-full h-full ${className}`}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <Play size={14} className="text-white ml-0.5" fill="white" />
                </div>
            </div>
        </div>
    );
}
