import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.ikayiyange.app",
  appName: "Ikayi Yange",
  // Bundled SPA only — never load the marketing website in the WebView
  webDir: ".output/public",
  backgroundColor: "#FAF8F5",
  // Do NOT set server.url — that would open the online site instead of the offline app
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: "#FAF8F5",
      showSpinner: false,
      androidSplashResourceName: "splash",
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#FAF8F5",
  },
};

export default config;
