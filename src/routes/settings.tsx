import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/ikayi/Shell";
import { SettingsPage } from "@/components/ikayi/SettingsPage";
import { isAppMode } from "@/lib/app-mode";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [{ title: "Igenamiterere — Ikayi Yange" }],
  }),
  component: SettingsEntry,
});

function SettingsEntry() {
  const navigate = useNavigate();
  const [showApp, setShowApp] = useState(false);

  useEffect(() => {
    if (isAppMode()) {
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
