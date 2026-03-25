# AquaOS

A modern, themeable aquarium controller platform built on [reef-pi](https://github.com/reef-pi/reef-pi). AquaOS replaces the reef-pi frontend with a Next.js application designed for wall-mounted touchscreens, tablets, and phones — while keeping the battle-tested Go backend for hardware control.

> **Status:** Early development — Phase 0 (Fork & Understand)

## Quick Links

| Resource | Description |
|----------|-------------|
| [Raspberry Pi Install Guide](./docs/RASPBERRY_PI_INSTALL.md) | End-to-end setup from fresh Pi OS to running dashboard |
| [Building from Source](./BUILDING.md) | Build prerequisites and commands (Go backend + Next.js frontend) |
| [Vision & Roadmap](./VISION.md) | Architecture, design principles, and phased roadmap |
| [Kiosk Mode](./scripts/README.md) | Chromium kiosk setup for Pi touchscreens |

## Documentation

Detailed docs live in [`docs/content/`](./docs/content/):

- [**Getting Started**](./docs/content/getting-started.mdx) — overview and first steps
- [**Architecture**](./docs/content/architecture.mdx) — system design, stack, and data flow
- [**API Reference**](./docs/content/api-reference.mdx) — REST API endpoints and authentication
- [**WebSocket**](./docs/content/websocket.mdx) — real-time communication protocol
- [**Hardware**](./docs/content/hardware.mdx) — supported boards, sensors, and peripherals
- [**Theming**](./docs/content/theming.mdx) — design token system and theme presets

The docs site is built with [Nextra](https://nextra.site) and can be run locally:

```bash
cd docs && npm install && npm run dev
```

## Install on Raspberry Pi

Follow the **[Raspberry Pi Installation Guide](./docs/RASPBERRY_PI_INSTALL.md)** for end-to-end setup instructions — from fresh Pi OS to a running AquaOS dashboard with optional kiosk mode.

## Building

See [BUILDING.md](./BUILDING.md) for local build prerequisites and commands.

## License

Apache 2.0 — consistent with the upstream [reef-pi](https://github.com/reef-pi/reef-pi) project.
