#!/usr/bin/env sh
set -e

BIN_SRC="build/bin/sleego-ui.exe"
DST_DIR="$HOME/Desktop"

echo "Installing Sleego (Windows simple install)"

cp "$BIN_SRC" "$DST_DIR/Sleego.exe"

echo "Copied Sleego.exe to Desktop"
echo "You can move it anywhere you like."
