"use client";

import { Power } from "lucide-react";
import type { Equipment } from "@/lib/types";

interface EquipmentListProps {
  items: Equipment[];
}

export function EquipmentList({ items }: EquipmentListProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No equipment configured.</p>
    );
  }

  return (
    <ul className="divide-y divide-border-subtle">
      {items.map((eq) => (
        <li key={eq.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
          <div className="flex items-center gap-2">
            <Power
              size={16}
              className={eq.on ? "text-success" : "text-muted-foreground"}
            />
            <span className="text-sm text-foreground">{eq.name}</span>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              eq.on
                ? "bg-success/15 text-success"
                : "bg-muted/40 text-muted-foreground"
            }`}
          >
            {eq.on ? "ON" : "OFF"}
          </span>
        </li>
      ))}
    </ul>
  );
}
