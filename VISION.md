# AquaOS — Vision & Architecture

> An open-source, modern aquarium controller platform.
> Fork of [reef-pi](https://github.com/reef-pi/reef-pi), rebuilt with a Next.js frontend and a themeable design system.

---

## What is AquaOS?

AquaOS is a Raspberry Pi–powered aquarium controller that gives hobbyists real-time monitoring, equipment control, dosing automation, lighting schedules, and sensor analytics — all through a beautiful, touch-first web interface.

It inherits reef-pi's battle-tested Go backend for GPIO, I2C, and peripheral management, and replaces the frontend with a modern Next.js application designed for wall-mounted displays, tablets, and phones.

---

## Core Principles

1. **Touch-first, display-aware.** The primary interface is a 7" Raspberry Pi touchscreen in kiosk mode. Every tap target ≥ 44px. Layouts adapt from small attached displays to tablets to desktop browsers.

2. **Themeable from day one.** A design token system (CSS custom properties + Tailwind) powers swappable theme presets — Reef (deep blue / cyan glow), Freshwater (earthy greens), Planted (botanical), Minimal (clean light). Users can customize or create their own.

3. **Wireless by architecture.** Since the frontend is a standalone web app, any device on the local network can access it. The "wireless display" feature is just opening a browser on another device — no extra protocol needed.

4. **Keep the backend stable.** Reef-pi's Go backend handles hardware abstraction, scheduling, and data storage. We preserve its API contract and extend it incrementally. Hardware reliability is non-negotiable.

5. **Document everything.** Every architecture decision, API endpoint, install step, and hardware compatibility note is documented as it's built — not backfilled later.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│ AquaOS Frontend │
│ Next.js 14+ (App Router) │
│ │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│ │Dashboard │ │Equipment │ │ Sensors │ │Lighting│ │
│ └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│ │ Dosing │ │ ATO │ │ Settings │ │ Themes │ │
│ └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│ │
│ Theme Engine: CSS custom properties + Tailwind │
│ Real-time: WebSocket for live sensor data │
│ Charts: Recharts / Chart.js for historical data │
└────────────────────┬────────────────────────────────┘
 │ REST API + WebSocket
┌────────────────────┴────────────────────────────────┐
│ AquaOS Backend │
│ Go (reef-pi core, extended) │
│ │
│ GPIO control · I2C sensors · Outlet scheduling │
│ Dosing pumps · ATO logic · Lighting PWM │
│ Alert system · Data logging │
│ │
│ Data store: BoltDB (embedded key-value) │
└─────────────────────────────────────────────────────┘
 │
┌────────────────────┴────────────────────────────────┐
│ Raspberry Pi Hardware │
│ Pi 4/5 · 7" touchscreen · relay boards · sensors │
│ pH probe · temp probes · dosing pumps · PWM LEDs │
└─────────────────────────────────────────────────────┘
```

### Frontend Stack

| Layer | Technology |
|----------------|----------------------------------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS custom properties |
| Components | Radix UI primitives (headless) |
| Charts | Recharts |
| State | Zustand or React context (TBD) |
| Real-time | Native WebSocket |
| Icons | Lucide |

### Backend (inherited from reef-pi)

| Layer | Technology |
|----------------|----------------------------------------|
| Language | Go |
| API | REST (net/http) + WebSocket |
| Data store | BoltDB (embedded) |
| Hardware | GPIO via go-rpio, I2C, PWM |
| Build | Make + Go modules |

---

## Theme System

Themes are defined as JSON token files that map to CSS custom properties:

```json
{
 "name": "Reef",
 "colors": {
 "bg-primary": "#0a1628",
 "bg-card": "#0f2035",
 "bg-card-hover": "#142a42",
 "text-primary": "#e8f4f8",
 "text-secondary": "#7ba3be",
 "accent": "#00d4ff",
 "accent-glow": "rgba(0, 212, 255, 0.15)",
 "success": "#00c48c",
 "warning": "#ff9f43",
 "danger": "#ff6b6b",
 "border": "rgba(255,255,255,0.08)"
 },
 "radii": {
 "card": "16px",
 "button": "12px",
 "badge": "8px"
 },
 "shadows": {
 "card": "0 4px 24px rgba(0,0,0,0.3)",
 "glow": "0 0 20px var(--accent-glow)"
 }
}
```

Built-in presets:
- **Reef** — Deep ocean blues, cyan accents, subtle glow effects (matches saltwater mockups)
- **Freshwater** — Warm greens, earth tones, natural feel
- **Planted** — Rich botanical palette, leafy accents
- **Minimal Light** — Clean white, strong color contrast, no glow
- **Minimal Dark** — Neutral dark, muted accents

Users can select a preset and override individual tokens in settings.

---

## Hardware Targets

| Hardware | Status | Notes |
|----------------------|-----------|-------------------------------------------|
| Raspberry Pi 4 (2GB+)| Primary | Recommended. Most reef-pi installs use this|
| Raspberry Pi 5 | Primary | Better performance, same GPIO pinout |
| Official 7" display | Primary | Touch, kiosk mode via Chromium |
| Third-party displays | Secondary | HDMI displays, various sizes |
| Headless (no display)| Supported | Access via any browser on the network |

---

## Phased Roadmap

### Phase 0 — Fork & Understand
- [ ] Fork reef-pi into `Forgeline-AI-Labs/AquaOS`
- [ ] Get Go backend compiling and running (Pi or local)
- [ ] Map and document every REST API endpoint the current frontend calls
- [ ] Document WebSocket message format for real-time data
- [ ] Write API contract spec (`docs/api.md`)

### Phase 1 — Scaffold
- [ ] Initialize Next.js app with TypeScript + Tailwind
- [ ] Implement design token system and theme engine
- [ ] Build layout shell: sidebar nav, header, responsive breakpoints
- [ ] Build Dashboard page hitting the real Go API
- [ ] Prove end-to-end: Next.js ↔ Go API ↔ Hardware
- [ ] Kiosk mode setup script for Pi + Chromium
- [ ] Set up Nextra for project documentation

### Phase 2 — Page by Page
Each page is a separate PR with its own tests:
- [ ] Equipment — toggle cards, scheduling, add/remove
- [ ] Sensors — temperature, pH, salinity with sparklines and history
- [ ] Lighting — curve editor with channel sliders, presets (sunrise/midday/sunset/moonlight/off)
- [ ] Dosing — pump configuration, scheduling, volume tracking
- [ ] ATO — auto top-off monitoring, level display, alerts
- [ ] Settings — theme picker, system config, network info, display settings

### Phase 3 — Extend & Diverge
- [ ] Enhanced historical data and charting (longer retention, export)
- [ ] Alert system with webhook support (Telegram, Discord, email)
- [ ] Screen dimming that follows the tank's lighting schedule
- [ ] User-created custom themes (JSON upload or in-app editor)
- [ ] Multi-tank support (single Pi controlling multiple systems)
- [ ] OTA update mechanism

### Phase 4 — Community & Distribution
- [ ] One-line install script for Raspberry Pi OS
- [ ] Pre-built SD card images
- [ ] Hardware BOM (bill of materials) and wiring guides
- [ ] Community theme gallery
- [ ] Plugin architecture for third-party sensor/equipment support

---

## Repository Structure

```
AquaOS/
├── backend/ # Go backend (reef-pi core, modified)
│ ├── controller/
│ ├── drivers/
│ ├── api/
│ └── ...
├── frontend/ # Next.js application
│ ├── app/ # App Router pages
│ ├── components/ # Shared UI components
│ ├── lib/ # API client, WebSocket, utilities
│ ├── themes/ # Theme preset JSON files
│ └── public/
├── docs/ # Nextra documentation site
│ ├── pages/
│ │ ├── getting-started.mdx
│ │ ├── architecture.mdx
│ │ ├── api-reference.mdx
│ │ ├── hardware.mdx
│ │ └── theming.mdx
│ └── ...
├── scripts/ # Install scripts, kiosk setup, dev helpers
├── .github/
│ ├── workflows/ # CI: lint, test, build
│ └── PULL_REQUEST_TEMPLATE.md
├── VISION.md # This file
├── README.md
├── LICENSE # Apache 2.0 (matching reef-pi)
└── docker-compose.yml # Optional: local dev without Pi hardware
```

---

## Design References

The `docs/design/` directory contains UI mockups for key screens:
- Dashboard overview with hero sensor readings
- Equipment grid with toggle controls
- Sensor detail cards with sparkline charts and min/max
- Lighting curve editor with per-channel sliders
- System architecture diagram

These mockups establish the visual direction. The theme engine allows this look to be one of several selectable presets.

---

## Development Workflow

AquaOS is developed under the **Forgeline** workflow:

- **Orbit** (orchestrator agent) — planning, coordination, delegation
- **Forge** (coding agent) — implementation via Claude Code CLI
- All work goes through PRs with CI checks
- Documentation is updated alongside code, never deferred

---

## License

Apache 2.0, consistent with the upstream reef-pi project.
