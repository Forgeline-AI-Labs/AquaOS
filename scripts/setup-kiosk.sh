#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────
# AquaOS — Kiosk Mode Setup Script
#
# Configures a Raspberry Pi running Raspberry Pi OS (with desktop) to
# auto-launch Chromium in full-screen kiosk mode on boot, pointed at
# the AquaOS web interface.
#
# Designed for the 7-inch Raspberry Pi touchscreen but works on any
# display attached to a Pi desktop session.
#
# Usage:
#   sudo ./scripts/setup-kiosk.sh [URL]
#
# The URL defaults to http://localhost:3000 (local AquaOS frontend).
# The script is idempotent — safe to re-run.
# ─────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── Configuration ───────────────────────────────────────────────────
KIOSK_URL="${1:-http://localhost:3000}"
AUTOSTART_DIR="/etc/xdg/lxsession/LXDE-pi"
AUTOSTART_FILE="${AUTOSTART_DIR}/autostart"
KIOSK_MARKER="# AquaOS kiosk — managed by setup-kiosk.sh"
LIGHTDM_CONF="/etc/lightdm/lightdm.conf"

# ── Preflight checks ───────────────────────────────────────────────
if [[ $EUID -ne 0 ]]; then
  echo "Error: this script must be run as root (sudo)." >&2
  exit 1
fi

if ! command -v chromium-browser &>/dev/null; then
  echo "Error: chromium-browser not found. Install it first:" >&2
  echo "  sudo apt-get install -y chromium-browser" >&2
  exit 1
fi

echo "AquaOS kiosk setup"
echo "  URL:  ${KIOSK_URL}"
echo ""

# ── 1. Chromium kiosk autostart ─────────────────────────────────────
# LXDE-pi autostart is the standard way to launch apps at desktop login
# on Raspberry Pi OS. We append (or replace) a Chromium kiosk entry.
#
# Chromium flags explained:
#   --kiosk              full-screen, no address bar or window controls
#   --noerrdialogs       suppress crash / restore dialogs
#   --disable-infobars   hide "Chrome is being controlled" bar
#   --check-for-update-interval=31536000  effectively disable update nags
#   --disable-features=TranslateUI        no translation popups
#   --disable-pinch                        prevent accidental pinch-zoom
#   --overscroll-history-navigation=0      prevent swipe-back gesture
#   --autoplay-policy=no-user-gesture-required  allow dashboard animations
#   --start-fullscreen   redundant with --kiosk but ensures fullscreen

CHROMIUM_CMD="chromium-browser \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --check-for-update-interval=31536000 \
  --disable-features=TranslateUI \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --autoplay-policy=no-user-gesture-required \
  --start-fullscreen \
  '${KIOSK_URL}'"

mkdir -p "${AUTOSTART_DIR}"

if [[ -f "${AUTOSTART_FILE}" ]]; then
  # Remove any previous AquaOS kiosk block (idempotent)
  sed -i "/${KIOSK_MARKER}/,+1d" "${AUTOSTART_FILE}"
else
  # Create a minimal autostart with the default LXDE-pi entries
  cat > "${AUTOSTART_FILE}" <<'DEFAULTS'
@lxpanel --profile LXDE-pi
@pcmanfm --desktop --profile LXDE-pi
DEFAULTS
fi

# Append kiosk entry
cat >> "${AUTOSTART_FILE}" <<EOF
${KIOSK_MARKER}
@${CHROMIUM_CMD}
EOF

echo "[✓] Chromium kiosk autostart configured"

# ── 2. Suppress Chromium crash / restore bubble ─────────────────────
# If Chromium exits uncleanly (power loss, etc.) it shows a "restore
# pages" dialog on next launch. We mark the session as clean.
TARGET_USER="${SUDO_USER:-pi}"
TARGET_HOME="$(getent passwd "${TARGET_USER}" | cut -d: -f6 || true)"
CHROMIUM_PREFS_DIR="${TARGET_HOME}/.config/chromium/Default"
CHROMIUM_PREFS="${CHROMIUM_PREFS_DIR}/Preferences"

if [[ -n "${TARGET_HOME}" && -d "${TARGET_HOME}" ]]; then
  mkdir -p "${CHROMIUM_PREFS_DIR}"
  chown "${TARGET_USER}:${TARGET_USER}" "${CHROMIUM_PREFS_DIR}"

  if [[ -f "${CHROMIUM_PREFS}" ]]; then
    # Patch existing preferences — set exit_type to Normal
    if command -v python3 &>/dev/null; then
      python3 -c "
import json, sys
p = '${CHROMIUM_PREFS}'
with open(p) as f:
    d = json.load(f)
d.setdefault('profile', {})['exit_type'] = 'Normal'
d.setdefault('profile', {})['exited_cleanly'] = True
with open(p, 'w') as f:
    json.dump(d, f)
"
      chown "${TARGET_USER}:${TARGET_USER}" "${CHROMIUM_PREFS}"
      echo "[✓] Chromium crash bubble suppressed (existing prefs patched for ${TARGET_USER})"
    else
      echo "[!] python3 not found — skipping Chromium prefs patch"
    fi
  else
    # Create minimal preferences file
    cat > "${CHROMIUM_PREFS}" <<'PREFS'
{
  "profile": {
    "exit_type": "Normal",
    "exited_cleanly": true
  }
}
PREFS
    chown "${TARGET_USER}:${TARGET_USER}" "${CHROMIUM_PREFS_DIR}" "${CHROMIUM_PREFS}"
    echo "[✓] Chromium crash bubble suppressed (new prefs created for ${TARGET_USER})"
  fi
else
  echo "[·] Could not resolve target home directory for kiosk user (${TARGET_USER}) — skipping Chromium prefs patch"
fi

# ── 3. Disable screen blanking / screensaver ────────────────────────
# A kiosk display should never blank. We disable DPMS and the X11
# screensaver via lightdm xserver-command and via an autostart entry.

# 3a. lightdm: pass -s 0 -dpms to the X server
if [[ -f "${LIGHTDM_CONF}" ]]; then
  if grep -q "^xserver-command=" "${LIGHTDM_CONF}"; then
    # Only patch if our flags are not already present
    if ! grep -q "\-s 0 -dpms" "${LIGHTDM_CONF}"; then
      sed -i 's|^xserver-command=.*|xserver-command=X -s 0 -dpms|' "${LIGHTDM_CONF}"
      echo "[✓] Screen blanking disabled (lightdm patched)"
    else
      echo "[·] Screen blanking already disabled in lightdm"
    fi
  elif grep -q "^\[Seat:\*\]" "${LIGHTDM_CONF}"; then
    sed -i '/^\[Seat:\*\]/a xserver-command=X -s 0 -dpms' "${LIGHTDM_CONF}"
    echo "[✓] Screen blanking disabled (lightdm entry added)"
  else
    echo "[!] Could not patch lightdm.conf — add manually:"
    echo "    xserver-command=X -s 0 -dpms  under [Seat:*]"
  fi
else
  echo "[·] lightdm.conf not found — skipping (may use a different display manager)"
fi

# 3b. Autostart: belt-and-suspenders xset calls
XSET_MARKER="# AquaOS screen-blank disable — managed by setup-kiosk.sh"
if ! grep -q "${XSET_MARKER}" "${AUTOSTART_FILE}" 2>/dev/null; then
  cat >> "${AUTOSTART_FILE}" <<EOF
${XSET_MARKER}
@xset s off
@xset -dpms
@xset s noblank
EOF
  echo "[✓] Screen blanking disabled (xset autostart entries added)"
else
  echo "[·] xset screen-blank entries already present"
fi

# ── 4. Hide the mouse cursor after idle ─────────────────────────────
# On a touchscreen the pointer is unnecessary. unclutter hides it
# after a brief idle period. Install it if missing.
if ! command -v unclutter &>/dev/null; then
  echo "[·] Installing unclutter (hides idle mouse cursor)..."
  apt-get install -y unclutter >/dev/null 2>&1 || true
fi

UNCLUTTER_MARKER="# AquaOS cursor hide — managed by setup-kiosk.sh"
if ! grep -q "${UNCLUTTER_MARKER}" "${AUTOSTART_FILE}" 2>/dev/null; then
  cat >> "${AUTOSTART_FILE}" <<EOF
${UNCLUTTER_MARKER}
@unclutter -idle 0.5 -root
EOF
  echo "[✓] Mouse cursor auto-hide configured"
else
  echo "[·] Cursor auto-hide already configured"
fi

# ── Done ────────────────────────────────────────────────────────────
echo ""
echo "Setup complete. Reboot to launch AquaOS in kiosk mode:"
echo "  sudo reboot"
echo ""
echo "To change the kiosk URL later, re-run:"
echo "  sudo ./scripts/setup-kiosk.sh <new-url>"
