import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost";
  size?: "sm" | "md";
}

export function Button({ variant = "default", size = "md", className = "", ...props }: ButtonProps) {
  const sizeStyles: Record<string, string> = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm"
  };
  const variantStyles: Record<string, string> = {
    default: "border border-slate-300 bg-white hover:bg-slate-50",
    ghost: "border border-transparent bg-transparent hover:bg-slate-100 text-gray-600"
  };
  return <button {...props} className={`rounded-md ${variantStyles[variant]} ${sizeStyles[size]} ${className}`} />;
}
