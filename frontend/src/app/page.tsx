import { Thermometer, Droplets, Gauge, Fish } from "lucide-react";

const stats = [
  { label: "Temperature", value: "78.2°F", icon: Thermometer },
  { label: "pH Level", value: "7.4", icon: Droplets },
  { label: "Salinity", value: "1.025 sg", icon: Gauge },
  { label: "Fish Count", value: "12", icon: Fish },
];

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-lg border border-border bg-surface p-4"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <Icon size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-lg font-semibold text-foreground">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-2 text-lg font-medium text-foreground">
          System Status
        </h2>
        <p className="text-sm text-muted-foreground">
          All systems nominal. Monitoring 4 sensors across 2 tanks.
        </p>
      </div>
    </div>
  );
}
