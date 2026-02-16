import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-brand-dark text-white hover:bg-brand-purple",
    secondary: "bg-brand-lilac text-brand-dark hover:bg-brand-purple hover:text-white",
    outline: "border border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white",
    ghost: "text-brand-dark hover:bg-brand-lilac/20",
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: "px-4 py-1.5 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-3 text-lg",
};

export default function Button({
    variant = "primary",
    size = "md",
    className,
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center font-sans font-medium rounded-sm transition-all duration-300 ease-in-out cursor-pointer",
                variantStyles[variant],
                sizeStyles[size],
                className,
            )}
            {...props}
        >
            {children}
        </button>
    );
}
