import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/ikayi/Shell";
import { CreditBook } from "@/components/ikayi/CreditBook";
import { enterAppMode, isAppMode } from "@/lib/app-mode";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ikayi Yange" },
      {
        name: "description",
        content: "Ikayi Yange: andika amadeni, ubwishyu, cloud sync. Shyiramo app cyangwa fungura.",
      },
      { property: "og:title", content: "Ikayi Yange — Ikayi y'amadeni" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RootEntry,
});

/**
 * Shared link https://ikayi-yange.vercel.app/
 * - Browser (not installed): → landing /welcome
 * - Installed APK / PWA / "Open app": → credit book (never marketing again)
 */
function RootEntry() {
  const navigate = useNavigate();
  const [showApp, setShowApp] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      enterAppMode();
      setShowApp(true);
      return;
    }
    if (isAppMode()) {
      enterAppMode();
      setShowApp(true);
      return;
    }
    navigate({ to: "/welcome", replace: true });
  }, [navigate]);

  if (!showApp) return null;

  return (
    <Shell>
      <CreditBook kind="customer" />
    </Shell>
  );
}
