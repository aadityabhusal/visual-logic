import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import type { InlineConfig } from "vitest";

interface VitestConfigExport extends UserConfig {
  test: InlineConfig;
}

export default defineConfig({
  plugins: [react()],
  test: { globals: true, environment: "jsdom" },
  server: { port: 3001, open: true },
} as VitestConfigExport);
