import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";
import { Shell } from "@/components/ikayi/Shell";
import { SettingsPage } from "@/components/ikayi/SettingsPage";
import { enterAppMode, isAppMode, isNativePlatform } from "@/lib/app-mode";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [{ title: "Igenamiterere — Ikayi Yange" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: SettingsEntry,
});

function SettingsEntry() {
  const navigate = useNavigate();
  const [showApp, setShowApp] = useState(() => isNativePlatform() || isAppMode());

  useEffect(() => {
    if (Capacitor.isNativePlatform() || isNativePlatform() || isAppMode()) {
      enterAppMode();
      setShowApp(true);
      return;
    }
    navigate({ to: "/welcome", replace: true });
  }, [navigate]);

  if (!showApp) return null;
  return (
    <Shell>
      <SettingsPage />
    </Shell>
  );
}
