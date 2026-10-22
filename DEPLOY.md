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

## Fix: app shows the Capacitor logo instead of the Ikayi logo

`npx cap add android` creates the default Capacitor icon and splash. Replace
them with the Ikayi assets already in this repo (`assets/` folder):

```
npm install -D @capacitor/assets
npx @capacitor/assets generate --android
npx cap sync android
```

Then rebuild the APK/AAB in Android Studio (or rerun the GitHub Actions
build). If an old icon still shows on your phone after updating, uninstall
the app once and reinstall — Android caches launcher icons.

## Usage analytics (owner only)

1. Run `supabase/schema.sql` in the SQL Editor (creates `usage_daily` + `app_admins`).
2. In Supabase → Authentication → Users, copy your own user id, then run:
   `insert into public.app_admins (user_id) values ('YOUR-USER-UUID');`
3. Open `/admin` in the app while signed in to see users and page usage.

Each device records page views locally and uploads them at most once per day
when it comes online. No credit, debtor or creditor data is tracked.
