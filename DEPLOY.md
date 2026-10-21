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
