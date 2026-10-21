// Native bundle — keep normal web/Vercel build in vite.config.ts unchanged.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    spa: {
      enabled: true,
      prerender: {
        outputPath: "/index.html",
        crawlLinks: false,
        retryCount: 1,
      },
    },
  },
  vite: {
    envPrefix: ["VITE_", "NEXT_PUBLIC_"],
    plugins: [
      {
        name: "ikayi-yange-native-pwa-register-stub",
        enforce: "pre",
        resolveId(source) {
          if (source === "virtual:pwa-register") return "\0ikayi-yange-native-pwa-register-stub";
          return null;
        },
        load(id) {
          if (id === "\0ikayi-yange-native-pwa-register-stub") {
            return "export function registerSW() { return () => {}; }";
          }
          return null;
        },
      },
    ],
  },
});
