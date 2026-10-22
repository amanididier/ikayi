import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";
import { Shell } from "@/components/ikayi/Shell";
import { CreditBook } from "@/components/ikayi/CreditBook";
import { enterAppMode, isAppMode, isNativePlatform } from "@/lib/app-mode";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ikayi Yange" },
      {
        name: "description",
        content: "Ikayi Yange: andika amadeni, ubwishyu, cloud sync.",
      },
    ],
  }),
  component: RootEntry,
});

/**
 * Browser → /welcome marketing.
 * APK / PWA / Open app → credit book only (never marketing).
 */
function RootEntry() {
  const navigate = useNavigate();
  const [showApp, setShowApp] = useState(() => isNativePlatform() || isAppMode());

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      enterAppMode();
      setShowApp(true);
      return;
    }
    // Capacitor APK: always the app — never /welcome
    if (Capacitor.isNativePlatform() || isNativePlatform()) {
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
