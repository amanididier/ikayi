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
 * APK / PWA / Open app → credit book (never marketing, never blank null).
 */
function RootEntry() {
  const navigate = useNavigate();
  // Default true when native/app so first paint is Shell loader, not white null
  const [showApp, setShowApp] = useState(() => {
    try {
      if (typeof window === "undefined") return true;
      return isNativePlatform() || isAppMode() || Capacitor.isNativePlatform();
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      enterAppMode();
      setShowApp(true);
      return;
    }
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
    setShowApp(false);
    navigate({ to: "/welcome", replace: true });
  }, [navigate]);

  if (!showApp) return null;

  return (
    <Shell>
      <CreditBook kind="customer" />
    </Shell>
  );
}
