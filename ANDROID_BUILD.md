# Build and publish Lantern Tarot for Android

The project is configured for:

- Package ID: `com.lanterntarot.journal`
- Version: read from `main.py`
- Target SDK: Android 15 / API 35
- Minimum Android version: API 24 / Android 7.0
- Debug output: APK
- Release output: Android App Bundle (`.aab`)
- Architectures: arm64-v8a and armeabi-v7a
- Network and sensitive permissions: none

> Important: Choose the final package ID before the first Google Play upload. Google Play treats it as permanent. To change it, edit `package.domain` and `package.name` in `buildozer.spec` before publishing.

## Windows 11: build through WSL2

Buildozer runs on Linux or macOS. On Windows, use WSL2 with Ubuntu.

### 1. Install WSL2

Open PowerShell as Administrator:

```powershell
wsl --install -d Ubuntu
```

Restart if Windows asks. Open **Ubuntu** from the Start menu and create your Linux username and password.

### 2. Install Linux build dependencies

In Ubuntu/WSL:

```bash
sudo apt update
sudo apt install -y \
  git zip unzip openjdk-17-jdk python3-pip python3-venv \
  autoconf libtool pkg-config zlib1g-dev libncurses5-dev \
  libncursesw5-dev libtinfo6 cmake libffi-dev libssl-dev \
  build-essential ccache adb
```

### 3. Copy the project into the Linux filesystem

Do not build from `/mnt/c/...`; Android builds are much more reliable inside the WSL Linux filesystem.

Example:

```bash
mkdir -p ~/projects
cp -r /mnt/c/Users/YOUR_WINDOWS_NAME/Downloads/tarot_journal_app ~/projects/
cd ~/projects/tarot_journal_app
```

### 4. Create the build environment

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip setuptools wheel
python -m pip install "cython==0.29.37" buildozer
```

### 5. Build a debug APK

```bash
./scripts/build_debug.sh
```

The first build downloads the Android SDK, NDK, Gradle, and Python-for-Android, so it is the slowest build and requires internet access.

The APK appears in:

```text
bin/
```

## Install the debug APK on your phone

### Easiest method: copy the APK

1. Copy the APK from `bin/` to the phone.
2. Open it on the phone.
3. Android may ask you to allow installs from that file manager or browser.
4. Install and open Lantern Tarot.

### USB/ADB method

1. Enable Developer Options on the phone.
2. Enable USB debugging.
3. Connect the phone by USB and approve the computer.
4. In WSL/Linux:

```bash
adb devices
./scripts/install_debug.sh
```

You can also build, install, run, and view logs with:

```bash
buildozer android debug deploy run logcat
```

## Troubleshooting a crash

Run:

```bash
buildozer android logcat
```

Or filter Python messages:

```bash
adb logcat | grep -i python
```

After changing Android SDK, dependency, architecture, or package settings, perform a clean rebuild:

```bash
buildozer android clean
./scripts/build_debug.sh
```

Avoid cleaning for ordinary Python/UI changes because it forces a full rebuild.

## Create the Google Play release bundle

### 1. Create an upload keystore once

```bash
./scripts/create_upload_keystore.sh
```

Back up the resulting `.jks` file and passwords somewhere secure. Never commit the keystore to Git and never lose it.

### 2. Set signing variables

```bash
export P4A_RELEASE_KEYSTORE="$HOME/lantern-tarot-keys/lantern-tarot-upload.jks"
export P4A_RELEASE_KEYSTORE_PASSWD='YOUR_KEYSTORE_PASSWORD'
export P4A_RELEASE_KEYALIAS='lantern-tarot-upload'
export P4A_RELEASE_KEYALIAS_PASSWD='YOUR_KEY_PASSWORD'
```

Do not place real passwords in the repository.

### 3. Build the signed AAB

```bash
./scripts/build_release.sh
```

The `.aab` appears in `bin/`. Upload that bundle to Google Play Console.

## Version updates

Before every Play Store update, increase the version in `main.py`:

```python
__version__ = "0.7.1"
```

Do not reuse an already-uploaded version.

## Google Play sequence

1. Register a Play Console account.
2. Create an app named **Lantern Tarot**.
3. Complete the app-access, ads, content-rating, target-audience, data-safety, and privacy-policy sections.
4. Accept Play App Signing.
5. Upload the `.aab` to Internal testing first.
6. Test installation from Google Play.
7. Move to Closed testing if your account requires it.
8. Complete the store listing and submit for review.

For this version, the data-safety answers should reflect that readings and notes stay locally on the device and the app requests no internet permission. Verify the final build before making declarations.

## Release checklist

- [ ] Final package ID selected
- [ ] App title and icon verified on a real phone
- [ ] All spreads tested
- [ ] Saving and reopening journal entries tested
- [ ] Theme changes tested
- [ ] Font files included and licensed for redistribution
- [ ] App works in airplane mode
- [ ] No missing images or glyph boxes
- [ ] Privacy policy published at a public URL
- [ ] Store screenshots created
- [ ] Upload keystore backed up
- [ ] Signed AAB uploaded to Internal testing
