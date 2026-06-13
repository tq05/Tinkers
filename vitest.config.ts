import { defineConfig } from "vitest/config";

// Separate from vite.config (whose root is src/client for the front-end build).
// Tests live across src/server and src/client, so run from the project root.
export default defineConfig({
  test: {
    root: ".",
    globals: true,
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
