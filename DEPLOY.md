# Ikayi Yange deploy

Repo: **amanididierprofessional/ikayi** (full app)  
Domain: https://ikayi-yange.vercel.app

## Vercel env (your Supabase project)

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Supabase setup

1. SQL Editor → run `supabase/schema.sql`
2. Auth → Email → **Confirm email = OFF** (faster signup like phone)
3. Site URL = `https://ikayi-yange.vercel.app`
4. Redirect URLs: `https://ikayi-yange.vercel.app/**`
5. Email templates: see `EMAIL_TEMPLATES.md`

## Android APK

Primary download (website + Actions release):

`https://github.com/amanididierprofessional/ikayi/releases/download/android-latest/ikayi-yange.apk`

Welcome page (`/welcome`) uses that URL for **Shyiramo app**.

## App icons / splash (native)

`npx cap add android` may create default Capacitor icons. This repo prepares icons in CI with Pillow from `src/assets/ikayi-logo.png`. To regenerate locally:

```
# optional — only if you need @capacitor/assets (needs sharp)
npx cap sync android
```

Rebuild the APK via **Actions → Android offline build**, or Android Studio. If an old icon still shows, uninstall once and reinstall.

## Usage analytics (owner only)

1. Run `supabase/schema.sql` (creates `usage_daily` + `app_admins`).
2. In Supabase → Authentication → Users, copy your user id, then:
   `insert into public.app_admins (user_id) values ('YOUR-USER-UUID');`
3. Open `/admin` while signed in to see users and page usage.

Each device records page views locally and uploads at most once per day when online. No credit / debtor data is tracked.
