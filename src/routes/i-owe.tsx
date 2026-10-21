import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/ikayi/Shell";
import { CreditBook } from "@/components/ikayi/CreditBook";
import { isAppMode } from "@/lib/app-mode";

export const Route = createFileRoute("/i-owe")({
  head: () => ({
    meta: [{ title: "Ikayi Yange — Abo mubereyemo" }],
  }),
  component: IOweEntry,
});

function IOweEntry() {
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
      <CreditBook kind="supplier" />
    </Shell>
  );
}
