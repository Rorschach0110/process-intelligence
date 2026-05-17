import { describe, expect, it, vi } from "vitest";
import { apiGet } from "./http";

describe("api client", () => {
  it("parses successful json responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: "ok" }) });
    vi.stubGlobal("fetch", fetchMock);
    await expect(apiGet<{ status: string }>("/api/health")).resolves.toEqual({ status: "ok" });
  });
});
