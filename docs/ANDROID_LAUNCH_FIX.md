# Android launch fix (no Capacitor splash logo)

**Status:** Saved from Lovable (`lovable-sync`, Oct 2026). Reuse this every time we rebuild the APK.

## Problem

On Android 12+, the **system** shows a splash *before* the WebView loads. That theme often uses Capacitor’s default animated icon, so users see the **Capacitor** mark for a moment even when:

- Home-screen / launcher icon is already Ikayi
- In-app loading UI is branded
- `SplashScreen.launchShowDuration` is `0`

Updating the **website only** never fixes this. Only a **new APK** with patched native resources does.

## Solution (do not skip)

1. Keep Ikayi **launcher icons** (Pillow / branding step). **Do not** run `@capacitor/assets generate` in a way that restores Cap defaults unless you immediately overwrite icons again.
2. After `npx cap add android` and `npx cap sync android` (and after any icon/splash copy), run:

```bash
npm run android:fix-startup
```

This runs `scripts/fix-android-startup.mjs`, which:

- Finds the **MAIN/LAUNCHER** activity theme in `AndroidManifest.xml`
- Patches **only** launch-theme styles (`values/`, `values-v31/`, etc.)
- Sets splash background to cream `#FAF8F5` (`@color/ikayi_startup_background`)
- Sets Android 12+ `windowSplashScreenAnimatedIcon` to a **1×1 transparent** drawable (`@drawable/ikayi_startup_blank`)
- **Does not** rewrite `ic_launcher` / adaptive icon PNGs (home-screen logo stays yours)

3. Then `./gradlew assembleDebug` (or CI equivalent).

### package.json (must stay on main)

```json
"android:fix-startup": "node scripts/fix-android-startup.mjs",
"capacitor:sync:after": "node scripts/fix-android-startup.mjs --if-present"
```

`capacitor:sync:after` re-applies the patch after local `cap sync`.

### GitHub Actions (must stay on main)

In `.github/workflows/android-offline-build.yml`, **after** “Apply Ikayi branding…” and **before** Gradle:

```yaml
- name: Patch Android launch theme (no Capacitor splash logo)
  run: npm run android:fix-startup
```

## After install on a phone

Android **caches** launcher icons and sometimes splash. Always:

1. **Uninstall** the old app completely  
2. Install the new APK from  
   `https://github.com/amanididierprofessional/ikayi/releases/download/android-latest/ikayi-yange.apk`  
3. Cold-start (force-stop isn’t enough; uninstall is safer)

## What not to do

| Don’t | Why |
|--------|-----|
| Merge entire `lovable-sync` into `main` without review | Branch often diverges; can wipe auth/DB/labels |
| Rely on website-only deploy | Native theme is inside the APK |
| Only set `launchShowDuration: 0` | Doesn’t remove Android 12 system splash icon |
| Regenerate Cap assets and ship without re-running fix-startup | Cap logo can return |

## Related files

| File | Role |
|------|------|
| `scripts/fix-android-startup.mjs` | Theme patch |
| `scripts/fix-android-startup.d.mts` | Types |
| `src/test/android-startup.test.ts` | Unit test for patch (optional on CI) |
| `capacitor.config.ts` | `backgroundColor: #FAF8F5`, splash auto-hide |
| In-app branded loader | Web UI after WebView starts (separate from this native fix) |

## Quick checklist for Grok / future builds

- [ ] `scripts/fix-android-startup.mjs` present  
- [ ] `android:fix-startup` in `package.json`  
- [ ] Workflow runs `npm run android:fix-startup` after `cap sync` + branding, before Gradle  
- [ ] Actions green → release `android-latest` updated  
- [ ] User uninstalls old APK, installs new one, cold launch  

**Origin:** Lovable edit “Rebuilt APK with launch fix” on `lovable-sync` (Oct 2026), cherry-picked onto `main` without full branch merge.
