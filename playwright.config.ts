import { defineConfig, devices } from '@playwright/test';

// E2E config for the Design Center.
//
// The dev server is pinned to a DEDICATED port (5273) with --strictPort, and we
// never reuse an existing server. This is deliberate: other Vite projects in
// this workspace squat on the default 5173, and `reuseExistingServer` would
// silently run the whole suite against the WRONG app (every test then "passes"
// or fails against unrelated markup). A private port + reuseExistingServer:false
// guarantees the suite always boots THIS app, deterministically.
const PORT = Number(process.env.DC_E2E_PORT ?? 5273);
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    // Playwright 1.60 rejects specifying both `url` and `port`; we keep `url`
    // for readiness polling and pin the port deterministically via --strictPort.
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: BASE_URL,
    // Never inherit a foreign server on this port — always launch our own app.
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
