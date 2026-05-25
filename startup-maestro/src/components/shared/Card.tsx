import { ReactNode } from "react";
import { cn } from "../../utils/helpers";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = { none: "", sm: "p-3", md: "p-4", lg: "p-6" };

export function Card({ children, className, onClick, hover, padding = "md" }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl border",
        "bg-[var(--bg-card)] border-[var(--border)]",
        hover && "cursor-pointer hover:border-[var(--border-hover)] transition-colors",
        paddingMap[padding],
        className
      )}
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">
      {children}
    </h3>
  );
}
