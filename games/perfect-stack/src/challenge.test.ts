import { describe, expect, it } from "vitest";
import { CHALLENGE_ROLES, dailySeed, encodeChallenge, parseChallenge } from "./challenge";

describe("family challenge links", () => {
  it("encodes and parses the complete challenge payload", () => {
    const url = encodeChallenge({ layers: 23, role: "dad", seed: "family-2026-11-03", mode: "standard" }, "https://example.test/play/");
    expect(url).toBe("https://example.test/play/?c=23&r=dad&s=family-2026-11-03&m=standard");
    expect(parseChallenge(url)).toEqual({ layers: 23, role: "dad", seed: "family-2026-11-03", mode: "standard" });
  });

  it("accepts the layer boundaries and every role", () => {
    expect(parseChallenge(encodeChallenge({ layers: 0, role: "self", seed: "seed", mode: "child" }))).toMatchObject({ layers: 0, role: "self", mode: "child" });
    expect(parseChallenge(encodeChallenge({ layers: 999, role: "grandma", seed: "seed", mode: "standard" }))).toMatchObject({ layers: 999, role: "grandma" });
    expect(CHALLENGE_ROLES).toHaveLength(9);
  });

  it.each([
    "?c=-1&r=dad&s=seed&m=standard",
    "?c=1000&r=dad&s=seed&m=standard",
    "?c=1.5&r=dad&s=seed&m=standard",
    "?c=1&r=unknown&s=seed&m=standard",
    "?c=1&r=dad&s=&m=standard",
    "?c=1&r=dad&s=seed%26x&m=standard",
    "?c=1&r=dad&s=seed&m=wrong",
    "?c=1&c=2&r=dad&s=seed&m=standard"
  ])("rejects invalid challenge URL %s", (url) => {
    expect(parseChallenge(url)).toBeNull();
  });

  it("keeps the challenge when a sharing app adds its own parameters", () => {
    expect(parseChallenge("?c=23&r=dad&s=seed&m=child&fbclid=abc&utm_source=line&openExternalBrowser=1"))
      .toEqual({ layers: 23, role: "dad", seed: "seed", mode: "child" });
  });

  it("makes a local-date daily seed", () => {
    expect(dailySeed("2026-11-03")).toBe("daily-2026-11-03");
    expect(dailySeed("2026-11-04")).not.toBe(dailySeed("2026-11-03"));
    expect(() => dailySeed("2026-02-30")).toThrow();
  });
});
