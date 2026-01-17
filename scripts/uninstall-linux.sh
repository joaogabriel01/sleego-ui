#!/usr/bin/env sh
set -e

BIN="$HOME/.local/bin/sleego"
DESKTOP="$HOME/.local/share/applications/sleego.desktop"
ICON_512="$HOME/.local/share/icons/hicolor/512x512/apps/sleego.png"
ICON_1024="$HOME/.local/share/icons/hicolor/1024x1024/apps/sleego.png"

echo "Uninstalling Sleego (Linux user install)"

rm -f "$BIN"
rm -f "$DESKTOP"
rm -f "$ICON_512"
rm -f "$ICON_1024"

# Atualiza caches (se existirem)
command -v update-desktop-database >/dev/null 2>&1 && \
  update-desktop-database "$HOME/.local/share/applications" >/dev/null 2>&1 || true

command -v gtk-update-icon-cache >/dev/null 2>&1 && \
  gtk-update-icon-cache -f "$HOME/.local/share/icons/hicolor" >/dev/null 2>&1 || true

echo "Sleego removed (config preserved in ~/.config/sleego)"
echo "Logout/login if launcher entry still appears."
