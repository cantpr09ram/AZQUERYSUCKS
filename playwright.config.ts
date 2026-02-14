import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  use: {
    baseURL: "http://localhost:4173/azquerysucks/",
    trace: "on-first-retry",
  },
  webServer: {
    command:
      "pnpm build && pnpm start -- --host 0.0.0.0 --port 4173 --strictPort",
    url: "http://localhost:4173/azquerysucks/",
    timeout: 180000,
    reuseExistingServer: !process.env.CI,
  },
});
