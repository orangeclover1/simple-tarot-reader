#!/usr/bin/env bash
set -euo pipefail

KEYSTORE_DIR="${HOME}/lantern-tarot-keys"
KEYSTORE_PATH="${KEYSTORE_DIR}/lantern-tarot-upload.jks"
ALIAS="lantern-tarot-upload"

mkdir -p "$KEYSTORE_DIR"
chmod 700 "$KEYSTORE_DIR"

if [[ -e "$KEYSTORE_PATH" ]]; then
  echo "Keystore already exists: $KEYSTORE_PATH"
  exit 1
fi

keytool -genkeypair \
  -v \
  -keystore "$KEYSTORE_PATH" \
  -alias "$ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

cat <<MSG

Created upload keystore:
  $KEYSTORE_PATH

Keep this file and both passwords backed up securely. Do not commit it to Git.
Use alias:
  $ALIAS
MSG
