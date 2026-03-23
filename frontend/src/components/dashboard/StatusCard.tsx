"use client";

import type { LucideIcon } from "lucide-react";

interface StatusCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  /** Optional accent color class, e.g. "text-success" */
  accent?: string;
}

export function StatusCard({ label, value, icon: Icon, accent }: StatusCardProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center gap-3">
        <div className={`rounded-md bg-primary/10 p-2 ${accent ?? "text-primary"}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}
