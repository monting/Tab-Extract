import { defineConfig } from "vite";
import webExtension from "vite-plugin-web-extension";

const target = process.env.TARGET || "chrome";

export default defineConfig({
  plugins: [
    webExtension({
      browser: target,
      manifest: "manifest.json",
      disableAutoLaunch: true,
    }),
  ],
  build: {
    outDir: `dist/${target}`,
    minify: false,
    emptyOutDir: true,
  },
});
