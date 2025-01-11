import { defineConfig, InlineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";

interface VitestConfigExport extends UserConfig {
  test: InlineConfig;
}

export default defineConfig({
  plugins: [react()],
  test: { globals: true, environment: "jsdom" },
  server: { port: 3001, open: true },
} as VitestConfigExport);
