import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { I18nProvider } from "@/lib/i18n";
import { Toaster } from "@/components/ui/sonner";
import { maybeSendUsage, trackAppOpen, trackPageView } from "@/lib/usage";
import { fullSync } from "@/lib/sync";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Ikayi Yange — Ikayi y'amadeni" },
      { name: "description", content: "Ikayi Yange: amadeni n'ubwishyu bwawe." },
      { name: "author", content: "Ikayi Yange" },
      { property: "og:title", content: "Ikayi Yange — Ikayi y'amadeni" },
      { property: "og:description", content: "Ikayi Yange: amadeni n'ubwishyu bwawe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="rw">
      <head>
        <HeadContent />
        <style
          dangerouslySetInnerHTML={{
            __html: `
html,body{margin:0;min-height:100%;background:#FAF8F5;color:#382B24}
#ikayi-boot{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;background:#FAF8F5;font-family:system-ui,-apple-system,sans-serif}
#ikayi-boot[data-done="1"]{display:none!important}
#ikayi-boot .box{text-align:center;padding:24px}
#ikayi-boot img{width:72px;height:72px;border-radius:18px;display:block;margin:0 auto}
#ikayi-boot .t{margin:14px 0 0;font-size:1.15rem;font-weight:700;letter-spacing:-0.02em}
#ikayi-boot .s{margin:8px 0 0;font-size:0.8rem;opacity:0.65}
`,
          }}
        />
      </head>
      <body>
        <div id="ikayi-boot" role="status" aria-live="polite">
          <div className="box">
            <img src="/favicon.png" alt="" width={72} height={72} />
            <p className="t">Ikayi Yange</p>
            <p className="s">Tegereza…</p>
          </div>
        </div>
        {children}
        <Scripts />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__ikayiHideBoot=function(){var e=document.getElementById("ikayi-boot");if(e)e.setAttribute("data-done","1");};`,
          }}
        />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await trackPageView(path);
      if (!cancelled) await maybeSendUsage();
    })();
    return () => {
      cancelled = true;
    };
  }, [path]);

  useEffect(() => {
    // Defer network work so the branded boot UI can paint first
    const send = async () => {
      await trackAppOpen();
      await maybeSendUsage();
      if (localStorage.getItem("ikayi-sync-mode") === "auto" && navigator.onLine) {
        await fullSync();
      }
    };
    const t = window.setTimeout(() => void send(), 400);
    const onOnline = () => void send();
    window.addEventListener("online", onOnline);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <Outlet />
        <Toaster />
      </I18nProvider>
    </QueryClientProvider>
  );
}
