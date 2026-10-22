import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";
import { Shell } from "@/components/ikayi/Shell";
import { CreditBook } from "@/components/ikayi/CreditBook";
import { enterAppMode, isAppMode, isNativePlatform } from "@/lib/app-mode";

export const Route = createFileRoute("/i-owe")({
  head: () => ({
    meta: [{ title: "Ikayi Yange — Abo ndimo amadeni" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: IOweEntry,
});

function IOweEntry() {
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
      <CreditBook kind="supplier" />
    </Shell>
  );
}
