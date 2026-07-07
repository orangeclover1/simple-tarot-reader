# Lantern Tarot APK notes

This copy keeps the current app look and main features, but removes the fragile assumption that the mobile APK can call a Replit-hosted `/api` backend.

## What changed

- Vite now builds with `BASE_PATH=./`, so bundled CSS/JS assets load correctly inside the Capacitor Android WebView.
- The app no longer imports `@workspace/api-client-react` in the mobile source.
- Settings, journal readings, insights, and custom decks now persist locally with `localStorage` via `src/lib/local-api.ts`.
- The GitHub Actions APK workflow no longer asks for or injects an API URL.

## What still works offline

- Theme picker
- Spreads and readings
- Save to Journal
- Recent readings
- Journal search/detail/delete
- Insights charts
- Custom deck creation/editing/deletion
- Reading from custom decks

## Build in GitHub Actions

Push this cleaned repo to GitHub and run the `Build Android APK` workflow. The debug APK will be uploaded as an artifact.

The important APK fix is this build environment value:

```yaml
BASE_PATH: "./"
```

Capacitor then syncs `dist/public` into the Android project before Gradle builds the APK.
