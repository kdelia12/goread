import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-[var(--radius)] border border-dashed border-border-strong px-6 py-16 text-center",
        className,
      )}
    >
      {icon ? <div className="text-muted-fg [&_svg]:h-8 [&_svg]:w-8">{icon}</div> : null}
      <h3 className="font-display text-xl font-semibold text-fg">{title}</h3>
      {description ? <p className="max-w-sm text-sm text-muted-fg">{description}</p> : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
