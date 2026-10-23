# Ikayi deploy

## Why ikayi-yange.vercel.app was 404

Vercel project was linked to **amanididierprofessional/ikayi** (almost empty).
The real app is **https://github.com/amanididier/ikayi**.

### Fix (2 minutes)

1. Vercel → Project **ikayi** → **Settings → Git**
2. Disconnect current repo
3. Connect **amanididier/ikayi**
4. Root directory: `/`
5. Env vars (your **NEW** Supabase project):

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

6. Redeploy

## New Supabase project

1. SQL Editor → paste `supabase/schema.sql` → Run
2. Auth → Email → **Confirm email = OFF**
3. Auth → URL config → Site URL = `https://ikayi-yange.vercel.app`
4. Redirect URLs include `https://ikayi-yange.vercel.app/**`

## Android APK

After a successful Actions build on `main`:

`https://github.com/amanididier/ikayi/releases/download/android-latest/ikayi.apk`

Welcome page download button uses that URL.

## Fix: Capacitor screen appears before Ikayi loads

The home-screen logo is already correct. Do not regenerate launcher icons.
The unwanted white screen is Android's native launch theme, before the web app
can render. `launchShowDuration: 0` alone cannot remove Android 12's system icon.
The guarded startup patch changes only launch-theme resources, leaving all
launcher icons and the existing Ikayi loading page untouched.

In the repository that builds your APK, include `scripts/fix-android-startup.mjs`
and the updated package scripts. After the Android project exists, run:

```
npx cap sync android
npm run android:fix-startup
```

Then rebuild the APK/AAB and install that update. For GitHub Actions, run the
patch after `cap add`, `cap sync`, and any asset generation, but before Gradle.
The `capacitor:sync:after` hook also reapplies it on future syncs. Android still
requires a short system launch background; its icon is made transparent so
the Capacitor mark never appears. An already installed APK cannot be changed
by updating the website. Native files are generated outside this preview, so
validate the rebuilt APK with a cold launch on Android 12+ and an older Android.

## Usage analytics (owner only)

1. Run `supabase/schema.sql` in the SQL Editor (creates `usage_daily` + `app_admins`).
2. In Supabase → Authentication → Users, copy your own user id, then run:
   `insert into public.app_admins (user_id) values ('YOUR-USER-UUID');`
3. Open `/admin` in the app while signed in to see users and page usage.

Each device records page views locally and uploads them at most once per day
when it comes online. No credit, debtor or creditor data is tracked.

Uploads run without blocking the app on start, sign-in, internet reconnection,
and return to the app. While open, a local daily-gate check also handles midnight;
it does not upload repeatedly. Failed attempts can retry. Later visits stay
on-device until the next day's successful upload. This is not an OS background
service: a fully closed/force-stopped app sends when it next opens online.

## Verified here and remaining checks

The configured account service is reachable and the profiles table responds.
This preview has no signed-in session, so actual private credit/usage writes,
permissions, and admin access have not been verified against your live account.
Automated checks cover upload payloads, rejected uploads, daily gating, concurrent
visits and retaining credits entered during sync. Sync currently upserts records;
it does not propagate deletions or resolve conflicting edits from two devices.
Do not switch accounts with another account's credit data still on this device.
