# Ikayi Yange — Supabase email templates

**Dashboard → Authentication → Email Templates**

Site URL: `https://ikayi-yange.vercel.app`  
Redirect URLs: `https://ikayi-yange.vercel.app/**`

For production delivery use **SMTP** (Brevo / Resend). Built-in Supabase mail is rate-limited.

---

## 1. Reset password (forgot password / OTP recovery)

**Subject**

```
Ikayi Yange — code yo guhindura ijambo ry'ibanga
```

**Body (HTML)** — paste all of this:

```html
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:system-ui,-apple-system,Segoe UI,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#FAF8F5;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:420px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(56,43,36,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#E87828,#D45A12);padding:28px 24px;text-align:center;">
            <p style="margin:0;color:#fff;font-size:13px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">Ikayi Yange</p>
            <h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:700;line-height:1.3;">Hindura ijambo ry'ibanga</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 24px 8px;color:#382B24;font-size:15px;line-height:1.55;">
            <p style="margin:0 0 12px;">Muraho,</p>
            <p style="margin:0 0 20px;">Koresha <strong>code</strong> ikurikira (cyangwa kanda link) kugira ngo ushyireho ijambo ry'ibanga rishya kuri konti ya <strong>Ikayi Yange</strong>.</p>
            <table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin:0 auto 20px;">
              <tr>
                <td style="background:#FAF8F5;border:2px solid #E87828;border-radius:14px;padding:14px 20px;">
                  <span style="font-size:28px;font-weight:800;letter-spacing:0.28em;color:#D45A12;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">{{ .Token }}</span>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 16px;text-align:center;">
              <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#E87828;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:999px;">Hindura ijambo ry'ibanga</a>
            </p>
            <p style="margin:0;font-size:13px;color:#6B5E56;">Code irangira vuba. Niba utasabye iki, wibagirwe iyi message.</p>
            <p style="margin:16px 0 0;font-size:13px;color:#6B5E56;">Hitamo ijambo ry'ibanga <strong>woroshye kwibuka</strong> kandi ubike aho hizewe.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 24px 28px;text-align:center;font-size:12px;color:#9A8E86;">Ikayi Yange · Ikayi y'amadeni yawe</td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
```

> `{{ .Token }}` = 6-digit code (OTP boxes style in email).  
> `{{ .ConfirmationURL }}` = recovery link. **Keep both.**

---

## 2. Magic Link (optional sign-in link)

**Subject**

```
Ikayi Yange — link yo kwinjira
```

**Body (HTML)**

```html
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:system-ui,-apple-system,Segoe UI,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#FAF8F5;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:420px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(56,43,36,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#E87828,#D45A12);padding:28px 24px;text-align:center;">
            <p style="margin:0;color:#fff;font-size:13px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">Ikayi Yange</p>
            <h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:700;">Kwinjira mu buryo bwihuse</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 24px;color:#382B24;font-size:15px;line-height:1.55;">
            <p style="margin:0 0 16px;">Kanda button ikurikira kugira ngo winjire muri <strong>Ikayi Yange</strong>. Niba utasabye iyi link, wibagirwe.</p>
            <p style="margin:0;text-align:center;">
              <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#E87828;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:999px;">Injira muri Ikayi Yange</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 24px 28px;text-align:center;font-size:12px;color:#9A8E86;">Ikayi Yange · Ikayi y'amadeni yawe</td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
```

---

## 3. Confirm signup (if email confirm is ON)

Same orange header. Subject: `Ikayi Yange — emeza email yawe`  
Body: short text + button with `{{ .ConfirmationURL }}`.

**Recommended for Ikayi Yange:** Authentication → Providers → Email → **Confirm email = OFF** so sign-up is as fast as phone.

---

## 4. After pasting templates

1. Save each template.
2. Test: Settings or login → forgot password → enter email → check inbox (+ spam).
3. Link should open `https://ikayi-yange.vercel.app/` with recovery hash so user can set a new password.
