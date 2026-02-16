import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "success" | "warning" | "info" | "danger";

interface BadgeProps {
    variant?: BadgeVariant;
    children: React.ReactNode;
    className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
    default: "bg-brand-lilac/20 text-brand-dark",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    info: "bg-sky-100 text-sky-800",
    danger: "bg-red-100 text-red-800",
};

export default function Badge({ variant = "default", children, className }: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                variantStyles[variant],
                className,
            )}
        >
            {children}
        </span>
    );
}
