import { ReactNode } from "react";
import { cn } from "../../utils/helpers";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size    = "sm" | "md" | "lg";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
  type?: "button" | "submit";
}

const variantClasses: Record<Variant, string> = {
  primary:   "bg-accent text-white hover:bg-accent-dim shadow-glow-accent",
  secondary: "bg-surface-800 text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--border-hover)]",
  ghost:     "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-surface-800",
  danger:    "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2 text-sm rounded-xl gap-2",
  lg: "px-6 py-3 text-sm rounded-xl gap-2",
};

export function Button({
  children,
  onClick,
  variant = "secondary",
  size = "md",
  disabled,
  loading,
  icon,
  className,
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-150",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {loading ? (
        <span className="spinner" style={{ width: 14, height: 14 }} />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
