import { describe, expect, it } from "vitest";
import { buildApp } from "./app";

describe("GET /api/health", () => {
  it("returns ok with uptime", async () => {
    const app = buildApp();
    const res = await app.inject({ method: "GET", url: "/api/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ status: "ok" });
    expect(typeof res.json().uptime).toBe("number");
    await app.close();
  });
});
