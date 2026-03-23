"use client";

import {
  Thermometer,
  Droplets,
  Gauge,
  Plug,
  Server,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { api } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import {
  StatusCard,
  EquipmentList,
  SystemInfo,
  SectionCard,
} from "@/components/dashboard";
import type {
  TemperatureController,
  TemperatureReading,
} from "@/lib/types";

/** Poll interval for live data (30 seconds). */
const POLL_MS = 30_000;

// ── Small helpers ──────────────────────────────────────────────────────

async function fetchTCsWithReadings() {
  const tcs = await api.listTCs();
  const readings = await Promise.allSettled(
    tcs.map((tc) => api.getTCReading(tc.id)),
  );
  return tcs.map((tc, i) => {
    const r = readings[i];
    const temp =
      r.status === "fulfilled" ? (r.value as TemperatureReading).temperature : null;
    return { ...tc, currentTemp: temp };
  });
}

type TCWithReading = TemperatureController & { currentTemp: number | null };

function formatTemp(tc: TCWithReading): string {
  if (tc.currentTemp == null) return "—";
  const unit = tc.fahrenheit ? "°F" : "°C";
  return `${tc.currentTemp.toFixed(1)}${unit}`;
}

// ── Error / loading states ─────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex items-center gap-2 py-20 justify-center text-muted-foreground">
      <RefreshCw size={18} className="animate-spin" />
      <span className="text-sm">Connecting to reef-pi&hellip;</span>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <AlertTriangle size={28} className="text-warning" />
      <p className="text-sm text-muted-foreground max-w-md">
        Could not reach the reef-pi API. Make sure the controller is running and
        the <code className="text-xs bg-surface-alt px-1 rounded">NEXT_PUBLIC_REEF_PI_API</code> environment
        variable points to it.
      </p>
      <p className="text-xs text-danger">{error.message}</p>
      <button
        onClick={onRetry}
        className="mt-2 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
      >
        Retry
      </button>
    </div>
  );
}

// ── Dashboard page ─────────────────────────────────────────────────────

export default function DashboardPage() {
  const info = useApi(() => api.getInfo(), POLL_MS);
  const tcs = useApi(fetchTCsWithReadings, POLL_MS);
  const equipment = useApi(() => api.listEquipment(), POLL_MS);
  const ph = useApi(() => api.listPhProbes(), POLL_MS);
  const atos = useApi(() => api.listATOs(), POLL_MS);

  // Show global loading only on initial load
  const initialLoading =
    info.loading && tcs.loading && equipment.loading;

  if (initialLoading) return <LoadingState />;

  // If the system info call failed the controller is likely unreachable
  if (info.error && !info.data) {
    return <ErrorState error={info.error} onRetry={info.refresh} />;
  }

  const tcData = tcs.data ?? [];
  const eqData = equipment.data ?? [];
  const phData = ph.data ?? [];
  const atoData = atos.data ?? [];

  const enabledEq = eqData.filter((e) => e.on).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <button
          onClick={() => {
            info.refresh();
            tcs.refresh();
            equipment.refresh();
            ph.refresh();
            atos.refresh();
          }}
          title="Refresh all"
          className="rounded-md p-2 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tcData.length > 0 ? (
          tcData.map((tc) => (
            <StatusCard
              key={tc.id}
              label={tc.name}
              value={formatTemp(tc)}
              icon={Thermometer}
              accent={
                tc.currentTemp != null && (tc.currentTemp > tc.max || tc.currentTemp < tc.min)
                  ? "text-danger"
                  : undefined
              }
            />
          ))
        ) : (
          <StatusCard label="Temperature" value="—" icon={Thermometer} />
        )}

        {phData.length > 0 ? (
          phData.map((p) => (
            <StatusCard key={p.id} label={p.name} value={p.enable ? "Active" : "Disabled"} icon={Droplets} />
          ))
        ) : (
          <StatusCard label="pH" value="—" icon={Droplets} />
        )}

        <StatusCard
          label="Equipment"
          value={`${enabledEq} / ${eqData.length} on`}
          icon={Plug}
        />

        <StatusCard
          label="ATO"
          value={
            atoData.length > 0
              ? `${atoData.filter((a) => a.enable).length} active`
              : "—"
          }
          icon={Gauge}
        />
      </div>

      {/* ── Detail sections ────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Equipment">
          <EquipmentList items={eqData} />
        </SectionCard>

        {info.data && (
          <SectionCard title="System">
            <SystemInfo info={info.data} />
          </SectionCard>
        )}
      </div>

      {/* ── Connection hint when API is unreachable ────────────── */}
      {tcs.error && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 text-sm text-warning">
          <div className="flex items-center gap-2">
            <Server size={16} />
            <span>
              Some data could not be loaded. Check your reef-pi connection.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
