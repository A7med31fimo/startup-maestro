import { cn } from "../../utils/helpers";
import { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "error" | "accent" | "muted";

const variants: Record<BadgeVariant, string> = {
  default: "bg-surface-800 text-[var(--text-secondary)] border-[var(--border)]",
  success: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  warning: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  error:   "bg-rose-400/10 text-rose-400 border-rose-400/20",
  accent:  "bg-accent/10 text-accent-glow border-accent/20",
  muted:   "bg-transparent text-[var(--text-muted)] border-[var(--border)]",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
