import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary:
        "bg-brand-dark text-white hover:bg-brand-purple shadow-md hover:shadow-lg hover:shadow-brand-purple/20",
    secondary:
        "bg-brand-lilac/15 text-brand-dark hover:bg-brand-purple hover:text-white",
    outline:
        "border border-brand-dark/20 text-brand-dark hover:border-brand-purple hover:text-brand-purple hover:bg-brand-purple/5",
    ghost:
        "text-brand-dark hover:bg-brand-lilac/10 hover:text-brand-purple",
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: "px-4 py-2 text-xs tracking-wide",
    md: "px-6 py-2.5 text-sm tracking-wide",
    lg: "px-8 py-3.5 text-sm tracking-wider",
};

export default function Button({
    variant = "primary",
    size = "md",
    loading = false,
    className,
    children,
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center font-sans font-medium rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer select-none",
                "active:scale-[0.97] active:transition-none",
                "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 disabled:saturate-50",
                variantStyles[variant],
                sizeStyles[size],
                loading && "pointer-events-none",
                className,
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {children}
                </span>
            ) : (
                children
            )}
        </button>
    );
}
