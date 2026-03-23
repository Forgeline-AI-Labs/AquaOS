/**
 * reef-pi API client.
 *
 * Configure the API base URL via the NEXT_PUBLIC_REEF_PI_API environment
 * variable. Defaults to "" (same-origin) which works when the Next.js app is
 * proxied behind reef-pi or served alongside it.
 *
 * Example:  NEXT_PUBLIC_REEF_PI_API=http://192.168.1.100:8080
 */

import type {
  SystemSummary,
  TemperatureController,
  TemperatureReading,
  Equipment,
  PhProbe,
  ATO,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_REEF_PI_API ?? "";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include", // send Basic-Auth cookie
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new ApiError(res.status, `${res.status} ${res.statusText}: ${path}`);
  }
  return res.json() as Promise<T>;
}

// ── Public API functions ───────────────────────────────────────────────

export const api = {
  /** System info / health summary */
  getInfo: () => request<SystemSummary>("/api/info"),

  /** List all temperature controllers */
  listTCs: () => request<TemperatureController[]>("/api/tcs"),

  /** Current reading for a single temperature controller */
  getTCReading: (id: string) =>
    request<TemperatureReading>(`/api/tcs/${encodeURIComponent(id)}/current_reading`),

  /** List all equipment */
  listEquipment: () => request<Equipment[]>("/api/equipment"),

  /** List all pH probes */
  listPhProbes: () => request<PhProbe[]>("/api/phprobes"),

  /** List all ATO units */
  listATOs: () => request<ATO[]>("/api/atos"),
} as const;

export { ApiError };
