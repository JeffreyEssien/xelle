const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".avi", ".mkv", ".m4v", ".ogg"];

/** Detect whether a URL points to a video (Cloudinary path or file extension) */
export function isVideoUrl(url: string): boolean {
    try {
        const pathname = new URL(url).pathname.toLowerCase();
        if (pathname.includes("/video/upload/")) return true;
        return VIDEO_EXTENSIONS.some((ext) => pathname.endsWith(ext));
    } catch {
        return false;
    }
}

/** Convert a Cloudinary video URL to a static .jpg thumbnail (first frame) */
export function getVideoThumbnail(url: string): string {
    try {
        return url
            .replace("/video/upload/", "/video/upload/so_0/")
            .replace(/\.[^.]+$/, ".jpg");
    } catch {
        return url;
    }
}
