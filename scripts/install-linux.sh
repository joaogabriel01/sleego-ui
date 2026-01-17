#!/usr/bin/env sh
set -e

BIN_SRC="build/bin/sleego-ui"
BIN_DST="$HOME/.local/bin/sleego"

ICON_SRC="assets/sleego.png"
ICON_DIR="$HOME/.local/share/icons/hicolor/512x512/apps"
DESKTOP_DIR="$HOME/.local/share/applications"

echo "Installing Sleego (Linux user install)"

mkdir -p "$HOME/.local/bin"
cp "$BIN_SRC" "$BIN_DST"
chmod +x "$BIN_DST"

mkdir -p "$ICON_DIR"
cp "$ICON_SRC" "$ICON_DIR/sleego.png"

mkdir -p "$DESKTOP_DIR"
cat > "$DESKTOP_DIR/sleego.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=Sleego
Exec=$BIN_DST
Icon=sleego
Terminal=false
Categories=Utility;
EOF

echo "Done. Logout/login if icon does not appear."
