"use client";

import type { SystemSummary } from "@/lib/types";

interface SystemInfoProps {
  info: SystemSummary;
}

export function SystemInfo({ info }: SystemInfoProps) {
  const rows = [
    { label: "Controller", value: info.name },
    { label: "IP Address", value: info.ip },
    { label: "Uptime", value: info.uptime },
    { label: "CPU Temp", value: info.cpu_temperature },
    { label: "Version", value: info.version },
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
      {rows.map(({ label, value }) => (
        <div key={label}>
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="font-medium text-foreground">{value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
