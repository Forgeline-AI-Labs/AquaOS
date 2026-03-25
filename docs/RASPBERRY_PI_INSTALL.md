# AquaOS — Raspberry Pi Installation Guide

This guide walks you through installing and running AquaOS on a Raspberry Pi from the current repo source. By the end, you will have the reef-pi backend and the AquaOS Next.js frontend running on your Pi, accessible from a browser or in full-screen kiosk mode on an attached touchscreen.

---

## Assumptions

- You have a **Raspberry Pi 4 or 5** (Pi 3 works but is slower to build).
- You are running **Raspberry Pi OS (Bookworm)** — the 32-bit or 64-bit Desktop variant.
  - The Desktop variant is required if you plan to use kiosk mode with an attached display.
  - Lite (headless) works if you only access AquaOS from another device on the network.
- Your Pi is connected to your local network (Ethernet or Wi-Fi).
- You have SSH access or a keyboard/monitor attached.
- You are comfortable using the terminal.

> **Hardware note:** AquaOS inherits reef-pi's hardware support. To control equipment (outlets, sensors, dosing pumps, lighting), you will need the corresponding HATs, relay boards, or I2C peripherals. This guide covers the software installation only. You can run the software without hardware attached — the dashboard will simply show empty or placeholder data.

---

## 1. Update your Pi

```bash
sudo apt-get update && sudo apt-get upgrade -y
```

## 2. Install system dependencies

### Go (required for the backend)

Raspberry Pi OS does not ship a recent enough Go version. Install Go 1.23+ directly:

```bash
# Download — pick the right archive for your Pi:
#   Pi 4/5 (64-bit OS): go1.23.6.linux-arm64.tar.gz
#   Pi 4/5 (32-bit OS) or Pi 3: go1.23.6.linux-armv6l.tar.gz

# Example for 64-bit Pi OS:
wget https://go.dev/dl/go1.23.6.linux-arm64.tar.gz
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf go1.23.6.linux-arm64.tar.gz

# Add Go to your PATH (add this to ~/.bashrc for persistence):
export PATH=$PATH:/usr/local/go/bin
```

Verify:

```bash
go version
# Should print: go version go1.23.6 linux/arm64 (or similar)
```

### Node.js 20+ and npm (required for the frontend)

```bash
# Install Node.js 20.x via NodeSource:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Verify:

```bash
node --version   # Should print v20.x.x or higher
npm --version    # Should print 10.x.x or higher
```

### Git and build tools

```bash
sudo apt-get install -y git make
```

## 3. Clone the repository

```bash
cd ~
git clone https://github.com/Forgeline-AI-Labs/AquaOS.git
cd AquaOS
```

If you have already cloned the repo, pull the latest:

```bash
cd ~/AquaOS
git pull origin main
```

## 4. Build and run the backend

The backend is a Go binary (reef-pi core). It manages hardware, stores data in an embedded database, and exposes the REST API that the frontend consumes.

### Build on the Pi

```bash
cd ~/AquaOS/backend
make go
```

This produces `bin/reef-pi`. On a Pi 4 this takes roughly 1–2 minutes.

> **Alternative: cross-compile on a faster machine.** If building on the Pi is too slow, you can cross-compile from a Linux or macOS workstation:
> ```bash
> cd backend
> make pi       # builds linux/arm binary
> ```
> Then copy `backend/bin/reef-pi` to the Pi via `scp`.

### Create the data directory

The backend stores its database and configuration under `/var/lib/reef-pi/` by default:

```bash
sudo mkdir -p /var/lib/reef-pi
sudo mkdir -p /etc/reef-pi
sudo cp ~/AquaOS/backend/build/config.yaml /etc/reef-pi/config.yaml
sudo chown -R $USER:$USER /var/lib/reef-pi
```

### Start the backend (first test)

For a first test, use dev mode. This enables all subsystems and listens on port 8080 (instead of port 80, which requires root):

```bash
cd ~/AquaOS/backend
DEV_MODE=1 ./bin/reef-pi daemon -config /etc/reef-pi/config.yaml
```

You should see log output indicating the HTTP server is starting on `0.0.0.0:8080`.

Test it in a second terminal:

```bash
curl -s http://localhost:8080/api/info | head -c 200
```

If you see JSON output, the backend is running.

> **Default credentials:** reef-pi ships with default credentials `reef-pi` / `reef-pi`. You can change them through the web interface or with:
> ```bash
> ./bin/reef-pi reset-password -user admin -password yourpassword -config /etc/reef-pi/config.yaml
> ```

### Run as a systemd service (optional, for persistent operation)

To have the backend start on boot:

```bash
# Copy the binary to a system path
sudo cp ~/AquaOS/backend/bin/reef-pi /usr/bin/reef-pi

# Install the systemd service
sudo cp ~/AquaOS/backend/build/reef-pi.service /etc/systemd/system/reef-pi.service
sudo systemctl daemon-reload
sudo systemctl enable reef-pi
sudo systemctl start reef-pi
```

Check status:

```bash
sudo systemctl status reef-pi
```

> **Note:** The systemd service runs the backend on port 80 (production default) as root. This is fine for a dedicated Pi controller. If you prefer port 8080, edit `/etc/reef-pi/config.yaml` or set `DEV_MODE=1` in the service file's `Environment=` line.

## 5. Install and run the frontend

The frontend is a Next.js web application that talks to the backend's REST API.

### Install dependencies

```bash
cd ~/AquaOS/frontend
npm install
```

This may take a few minutes on a Pi as native modules compile.

### Configure the API endpoint

The frontend needs to know where the backend is. Set the `NEXT_PUBLIC_REEF_PI_API` environment variable to point at the backend:

```bash
# If running both on the same Pi with DEV_MODE:
export NEXT_PUBLIC_REEF_PI_API=http://localhost:8080

# If the backend runs on port 80 (systemd service / production):
export NEXT_PUBLIC_REEF_PI_API=http://localhost
```

### Build and start the frontend

```bash
cd ~/AquaOS/frontend

# Build for production (recommended for Pi — dev mode is slow):
npm run build
npm start
```

The frontend will start on **http://localhost:3000**.

> **Dev mode (optional):** `npm run dev` starts a hot-reloading dev server, but it is significantly slower on Pi hardware. Use `npm run build && npm start` for a snappier experience.

### Verify

Open a browser on the Pi (or any device on the same network) and navigate to:

```
http://<pi-ip-address>:3000
```

You should see the AquaOS dashboard. If the backend is running, live data will populate the status cards.

> **Find your Pi's IP:** Run `hostname -I` on the Pi to see its local IP address.

## 6. Access from the Pi touchscreen or browser

### On the Pi itself

If your Pi has a desktop environment and a display attached, open Chromium and navigate to `http://localhost:3000`.

### From another device

Any device on the same local network can access AquaOS at `http://<pi-ip-address>:3000`. This works on phones, tablets, and desktop browsers — no extra setup needed.

## 7. Enable kiosk mode (optional)

Kiosk mode makes the Pi boot directly into a full-screen Chromium window showing AquaOS — ideal for a wall-mounted touchscreen controller.

**Requirements:**
- Raspberry Pi OS **Desktop** (with LXDE session)
- A display attached (the official 7" Pi touchscreen works well)

**Run the kiosk setup script:**

```bash
# Default: points at http://localhost:3000
sudo ./scripts/setup-kiosk.sh

# Or specify a custom URL:
sudo ./scripts/setup-kiosk.sh http://localhost:3000
```

**Reboot to activate:**

```bash
sudo reboot
```

After reboot, the Pi will boot into a full-screen AquaOS display with:
- No address bar or window controls
- Screen blanking disabled (display stays on)
- Mouse cursor auto-hidden (for touchscreen use)
- Crash/restore dialogs suppressed

To change the URL later, re-run the script. To revert, see [scripts/README.md](../scripts/README.md).

## 8. Putting it all together

For a complete, persistent setup where both backend and frontend start on boot:

### Backend: systemd (covered in step 4)

```bash
sudo systemctl enable reef-pi
```

### Frontend: systemd service

Create a service file:

```bash
sudo tee /etc/systemd/system/aquaos-frontend.service > /dev/null <<'EOF'
[Unit]
Description=AquaOS Frontend (Next.js)
After=network-online.target reef-pi.service
Wants=network-online.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/AquaOS/frontend
Environment=NEXT_PUBLIC_REEF_PI_API=http://localhost
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
```

> **Adjust paths:** Change `User=pi` and `WorkingDirectory` if your username or clone location differs.

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable aquaos-frontend
sudo systemctl start aquaos-frontend
```

Now both services start on boot, and kiosk mode (if configured) will connect to the locally-running frontend.

---

## Troubleshooting

### Backend won't start

- **"permission denied"** — If running on port 80, you need root or `sudo`. Use `DEV_MODE=1` for port 8080 without root, or run via systemd.
- **"database locked"** — Only one instance of reef-pi can run at a time. Check `ps aux | grep reef-pi` and stop duplicates.
- **Build fails** — Ensure Go 1.23.2+ is installed and on your PATH. Run `go version` to verify.

### Frontend shows "Error" or empty dashboard

- Verify the backend is running and accessible: `curl http://localhost:8080/api/info`
- Check that `NEXT_PUBLIC_REEF_PI_API` was set **before** running `npm run build` (it is baked in at build time).
- If you change the API URL, you must re-run `npm run build`.

### Kiosk shows a white screen

- The frontend may not have started yet. Kiosk mode launches Chromium immediately at boot — if the Next.js server takes a few seconds to start, Chromium loads before it is ready.
- **Fix:** Refresh the page (tap F5 on a keyboard, or power-cycle after both services are running).
- For a more robust setup, add a `ExecStartPre=/bin/sleep 10` to the kiosk autostart or use a wrapper that waits for the frontend port.

### Chromium shows "restore pages" dialog

- Re-run the kiosk script: `sudo ./scripts/setup-kiosk.sh`
- This resets the Chromium preferences to suppress the dialog.

### Performance is slow

- Always use `npm run build && npm start` (production mode) on a Pi — dev mode (`npm run dev`) is significantly slower.
- Pi 3 users: expect slower builds. Consider cross-compiling the Go backend on a faster machine.
- Pi 4/5 with 4GB+ RAM is recommended for a smooth experience.

### No hardware data showing

- This is expected if no reef-pi–compatible hardware (relay HATs, temperature sensors, etc.) is connected. The dashboard will show empty sections.
- Hardware setup is outside the scope of this guide. See the [reef-pi documentation](https://reef-pi.github.io/guides/) for wiring and hardware configuration.

---

## Known limitations

- **No single install command.** AquaOS does not yet have a packaged installer (`.deb`) or Docker image. Installation is from source as described above.
- **Frontend and backend are separate processes.** They must both be running for AquaOS to work. The systemd setup in step 8 handles this for persistent operation.
- **No HTTPS out of the box.** The frontend and backend communicate over plain HTTP on the local network. This is standard for local IoT controllers but should not be exposed to the public internet.
- **Early development.** AquaOS is in Phase 0. The dashboard page is functional; other pages (equipment, sensors, lighting, dosing) are not yet built.
- **NEXT_PUBLIC_REEF_PI_API is baked at build time.** If you change your network setup (e.g., the Pi gets a new IP), you need to rebuild the frontend with the updated URL.

---

## Quick reference

| What | Command |
|------|---------|
| Build backend | `cd backend && make go` |
| Start backend (dev) | `DEV_MODE=1 ./bin/reef-pi daemon -config /etc/reef-pi/config.yaml` |
| Start backend (systemd) | `sudo systemctl start reef-pi` |
| Install frontend deps | `cd frontend && npm install` |
| Build + start frontend | `NEXT_PUBLIC_REEF_PI_API=http://localhost:8080 npm run build && npm start` |
| Enable kiosk mode | `sudo ./scripts/setup-kiosk.sh` |
| Check backend status | `sudo systemctl status reef-pi` |
| Check frontend status | `sudo systemctl status aquaos-frontend` |
| View backend logs | `sudo journalctl -u reef-pi -f` |
| View frontend logs | `sudo journalctl -u aquaos-frontend -f` |
| Find Pi IP address | `hostname -I` |
