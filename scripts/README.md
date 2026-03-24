# AquaOS Scripts

## setup-kiosk.sh — Raspberry Pi Kiosk Mode

Configures a Raspberry Pi running **Raspberry Pi OS (with desktop)** to auto-launch Chromium in full-screen kiosk mode, pointed at the AquaOS web interface.

### Prerequisites

- Raspberry Pi OS with desktop (LXDE session)
- `chromium-browser` installed (ships by default on Pi OS Desktop)

### Usage

```bash
# Default — launches http://localhost:3000
sudo ./scripts/setup-kiosk.sh

# Custom URL (e.g. AquaOS running on another host)
sudo ./scripts/setup-kiosk.sh http://192.168.1.50:3000
```

Reboot after running:

```bash
sudo reboot
```

### What it does

| Step | Description |
|------|-------------|
| Chromium autostart | Adds a kiosk-mode Chromium entry to the LXDE autostart file with touch-friendly flags |
| Crash bubble suppression | Sets Chromium preferences so the "restore pages" dialog never appears after power loss |
| Screen blanking disabled | Disables DPMS and X11 screensaver via lightdm and xset so the display stays on |
| Cursor auto-hide | Installs and configures `unclutter` to hide the mouse pointer on a touchscreen |

### Re-running / changing URL

The script is **idempotent** — re-run it at any time to update the kiosk URL or reapply settings. Previous AquaOS entries are removed before new ones are added.

### Reverting

To undo kiosk mode manually:

1. Remove lines between `# AquaOS kiosk` and `# AquaOS cursor hide` markers from `/etc/xdg/lxsession/LXDE-pi/autostart`
2. Optionally revert `xserver-command` in `/etc/lightdm/lightdm.conf`
3. Reboot
