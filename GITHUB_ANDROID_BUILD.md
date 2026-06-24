# Build Android without installing Buildozer locally

This project includes two GitHub Actions workflows:

- **Build Android test APK**: produces an APK you can install directly on a phone.
- **Build signed Google Play AAB**: produces the signed Android App Bundle uploaded to Play Console.

## What GitHub can do for you

GitHub's Linux runner installs Buildozer, Android SDK/NDK, compiles the Kivy project, and gives you a downloadable build artifact. You do not need WSL or a local Android toolchain.

## 1. Create a GitHub repository

1. Create a new private repository on GitHub.
2. Upload the contents of `tarot_journal_app`, not the outer ZIP.
3. Ensure `.github/workflows/` is included.
4. Commit the files to the `main` branch.

## 2. Generate a test APK

1. Open the repository's **Actions** tab.
2. Select **Build Android test APK**.
3. Choose **Run workflow**.
4. When it finishes, open the workflow run.
5. Download `lantern-tarot-debug-apk` from **Artifacts**.
6. Extract the artifact ZIP and copy the APK to your phone.

Android may ask you to allow installation from the browser or file manager used to open the APK.

## 3. Create your private upload key

A Play release must be signed with your upload key. Generate it once on a computer with Java installed:

```bash
keytool -genkeypair \
  -keystore lantern-tarot-upload.jks \
  -alias lantern-tarot-upload \
  -keyalg RSA \
  -keysize 4096 \
  -validity 10000
```

Keep the `.jks` file and passwords backed up securely. Never commit the keystore to GitHub.

## 4. Convert the keystore to a GitHub secret

### Windows PowerShell

```powershell
[Convert]::ToBase64String(
  [IO.File]::ReadAllBytes("lantern-tarot-upload.jks")
) | Set-Clipboard
```

### Linux

```bash
base64 -w 0 lantern-tarot-upload.jks
```

### macOS

```bash
base64 -i lantern-tarot-upload.jks | tr -d '\n'
```

## 5. Add repository secrets

In GitHub, open:

**Settings → Secrets and variables → Actions → New repository secret**

Add these four secrets:

| Secret | Value |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | Base64 text from the previous step |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | `lantern-tarot-upload` unless you chose another alias |
| `ANDROID_KEY_PASSWORD` | Alias/key password |

## 6. Generate the Play Store AAB

1. Open **Actions**.
2. Select **Build signed Google Play AAB**.
3. Choose **Run workflow**.
4. Download `lantern-tarot-signed-aab` from the finished run.
5. Extract it and upload the `.aab` to a Play Console testing or production release.

## Before the first upload

Confirm these values in `buildozer.spec`:

```ini
package.domain = com.lanterntarot
package.name = journal
```

Together they form the permanent application ID:

```text
com.lanterntarot.journal
```

Change this before the first Play upload if you do not own or want that identifier.

## Future updates

For every new Play upload:

1. Update the version in `main.py`.
2. Commit and push the change.
3. Run the signed AAB workflow again.
4. Upload the new AAB to Play Console.

Keep using the same upload key and package ID.
