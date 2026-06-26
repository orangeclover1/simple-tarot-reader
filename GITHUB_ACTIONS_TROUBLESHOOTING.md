# GitHub Actions Troubleshooting

## Node.js 20 deprecation warning

A message like this is a warning, not usually the build failure:

```text
Node.js 20 actions are deprecated...
Process completed with exit code 1.
```

The actual failure is usually farther down in the failed step. Expand the red failed step and search for:

```text
Error:
FAILED:
Traceback
Command failed
BUILD FAILED
```

This v9 project updates the workflow actions to Node 24-compatible versions:

```yaml
actions/checkout@v5
actions/setup-python@v6
actions/cache@v5
actions/upload-artifact@v5
```

It also sets:

```yaml
FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true
```

## If the debug APK build still fails

Common causes:

### 1. The repo contains the outer folder instead of the app files

Your repository root should contain:

```text
main.py
buildozer.spec
tarot_journal/
.github/
```

If your repo instead contains only:

```text
tarot_journal_app/
```

then GitHub Actions will not find `buildozer.spec` at the root.

Fix: move the contents of `tarot_journal_app/` to the repository root.

### 2. First Buildozer build times out or fails while downloading

Re-run the workflow once. The first build downloads Android SDK/NDK pieces and is the most fragile.

### 3. Release build secrets are missing

Only the release AAB workflow needs signing secrets. The debug APK workflow does not.

Required release secrets:

```text
ANDROID_KEYSTORE_BASE64
ANDROID_KEYSTORE_PASSWORD
ANDROID_KEY_ALIAS
ANDROID_KEY_PASSWORD
```

### 4. A generated artifact is missing

If the final upload step says no files found, the actual build failed earlier. Look above that step for the real Buildozer or Gradle error.

## What to send for diagnosis

Copy the first 80-120 lines around the first real error in the failed step, especially the lines before and after:

```text
Error:
FAILED:
Traceback
BUILD FAILED
Command failed
```


## Java 11 / Java 17 Gradle error

If Gradle says:

```text
Android Gradle plugin requires Java 17 to run. You are currently using Java 11.
```

use the v10 workflows. They add `actions/setup-java@v5` with Temurin Java 17 and print `java -version` before Buildozer runs.
