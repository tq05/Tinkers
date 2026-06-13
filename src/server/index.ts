import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildApp } from "./app";

const here = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 3000);

// In a production build the client is emitted to dist/client. In dev, Vite
// serves the client and proxies /api here, so this path simply won't exist.
const clientDir = join(here, "..", "..", "dist", "client");

const app = buildApp({ clientDir });

app
  .listen({ port: PORT, host: "0.0.0.0" })
  .then((addr) => {
    app.log.info(`tinkers harness listening on ${addr}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
