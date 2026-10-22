// Native APK bundle — marketing routes are still in the tree but entry always opens the app.
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
    define: {
      // App-mode always on inside the APK WebView
      "import.meta.env.VITE_NATIVE": JSON.stringify("1"),
    },
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
