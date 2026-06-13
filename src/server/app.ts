import { existsSync } from "node:fs";
import Fastify, { type FastifyInstance } from "fastify";
import fastifyStatic from "@fastify/static";

export interface BuildAppOptions {
  /** Directory of the built client (dist/client). When present it is served statically. */
  clientDir?: string;
}

/**
 * Construct the Fastify app. Kept separate from `listen` so unit tests can
 * use `app.inject` without binding a port.
 */
export function buildApp(opts: BuildAppOptions = {}): FastifyInstance {
  const app = Fastify({ logger: process.env.NODE_ENV !== "test" });

  app.get("/api/health", async () => ({
    status: "ok",
    uptime: process.uptime(),
  }));

  if (opts.clientDir && existsSync(opts.clientDir)) {
    app.register(fastifyStatic, { root: opts.clientDir });
  }

  return app;
}
