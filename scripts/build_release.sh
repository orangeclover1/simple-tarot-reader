#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

required_vars=(
  P4A_RELEASE_KEYSTORE
  P4A_RELEASE_KEYSTORE_PASSWD
  P4A_RELEASE_KEYALIAS
  P4A_RELEASE_KEYALIAS_PASSWD
)

missing=0
for name in "${required_vars[@]}"; do
  if [[ -z "${!name:-}" ]]; then
    echo "Missing environment variable: $name"
    missing=1
  fi
done

if [[ "$missing" -ne 0 ]]; then
  cat <<'MSG'

Set the signing variables before building, for example:

export P4A_RELEASE_KEYSTORE="$HOME/lantern-tarot-keys/lantern-tarot-upload.jks"
export P4A_RELEASE_KEYSTORE_PASSWD='YOUR_KEYSTORE_PASSWORD'
export P4A_RELEASE_KEYALIAS='lantern-tarot-upload'
export P4A_RELEASE_KEYALIAS_PASSWD='YOUR_KEY_PASSWORD'

Then rerun this script.
MSG
  exit 1
fi

buildozer android release
printf '\nRelease Android App Bundle created in: %s/bin\n' "$PWD"
