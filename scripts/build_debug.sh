#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v buildozer >/dev/null 2>&1; then
  echo "Buildozer is not installed. Run: pip install --upgrade buildozer setuptools cython==0.29.37"
  exit 1
fi

buildozer android debug
printf '\nDebug APK created in: %s/bin\n' "$PWD"
