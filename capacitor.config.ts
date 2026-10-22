import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.ikayiyange.app",
  appName: "Ikayi Yange",
  webDir: ".output/public",
  backgroundColor: "#FAF8F5",
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
