#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

APK="$(find bin -maxdepth 1 -type f -name '*debug*.apk' -o -name '*.apk' | sort | tail -n 1)"
if [[ -z "${APK:-}" ]]; then
  echo "No APK found in bin/. Run scripts/build_debug.sh first."
  exit 1
fi

if ! command -v adb >/dev/null 2>&1; then
  echo "adb is not installed or not on PATH. You can also copy the APK to your phone manually."
  exit 1
fi

adb install -r "$APK"
echo "Installed $APK"
