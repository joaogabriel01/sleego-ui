#!/usr/bin/env sh
set -e

EXE="$HOME/Desktop/Sleego.exe"

echo "Uninstalling Sleego (Windows simple install)"

if [ -f "$EXE" ]; then
  rm -f "$EXE"
  echo "Removed $EXE"
else
  echo "Sleego.exe not found on Desktop"
fi

echo "Config preserved (AppData/Roaming/Sleego)"
