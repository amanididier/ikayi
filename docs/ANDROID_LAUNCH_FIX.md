# Android launch fix (no Capacitor splash logo)

**Canonical source:** `lovable-sync` → `scripts/fix-android-startup.mjs` (copied to `main`).

## What Lovable did (only this)

After `npx cap add android` + `npx cap sync android` + Ikayi icons:

```bash
npm run android:fix-startup
```

That script:

1. Finds the MAIN/LAUNCHER activity theme
2. Sets **windowBackground** to cream `#FAF8F5` (`@color/ikayi_startup_background`)
3. Sets **windowSplashScreenAnimatedIcon** to a **1×1 transparent** drawable (`@drawable/ikayi_startup_blank`)
4. Sets splash animation duration to **0**
5. **Does not** change home-screen launcher icons

CI on `main` must run this **before** `./gradlew assembleDebug`, and also force styles so Cap never wins (see workflow “Force Ikayi launch styles”).

## After install

Uninstall old APK → install from `android-latest` → cold start.

## APK file size

~5–6 MB debug APK is **normal**. Size does **not** mean Capacitor logo is present. Logo is controlled by native theme XML, not by being a few hundred KB larger.

## Do not

- Point `windowSplashScreenAnimatedIcon` at Cap defaults or `@mipmap/ic_launcher_foreground` for the system splash
- Skip `android:fix-startup` in CI
- Expect a website-only deploy to fix native splash
