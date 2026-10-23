# Android launch fix (no Capacitor splash logo)

**Status:** Saved from Lovable + refined Oct 2026. Reuse on every APK build.

## Problems we solved

1. **Capacitor logo** on cold start (Android 12+ system splash icon).
2. **Blank white gap** before the in-app loading screen (plain cream theme + late React paint).

## Rules (never reverse these)

| Do | Don’t |
|----|--------|
| `windowSplashScreenAnimatedIcon` = **transparent blank** drawable | Put Cap logo or default splash icon back |
| `windowBackground` = **`@drawable/splash`** (Ikayi logo on cream) | Solid white / only a color with no logo |
| HTML `#ikayi-boot` in `__root` until Shell mounts | Return `null` from `/` while deciding app mode |
| Defer `fullSync` a few hundred ms | Block first paint on network |
| Uninstall old APK before testing | Expect website deploy alone to fix native splash |

## Pipeline (CI on `main`)

1. `npm run build:native`
2. `npx cap add android` + `npx cap sync android`
3. Pillow: write Ikayi icons + **`drawable/splash.png`** (logo on `#FAF8F5`)
4. `npm run android:fix-startup` → patches launch theme only (see `scripts/fix-android-startup.mjs`)
5. `./gradlew assembleDebug` → publish `android-latest`

## Web handoff

- `__root.tsx` paints **#ikayi-boot** (cream + favicon + “Ikayi Yange”) before React is ready.
- `Shell` calls `window.__ikayiHideBoot()` as soon as the branded React loader mounts.

## After install

1. Uninstall old app  
2. Install: `https://github.com/amanididierprofessional/ikayi/releases/download/android-latest/ikayi-yange.apk`  
3. Cold start — should see **Ikayi** branding the whole time, never Cap, never empty white.
