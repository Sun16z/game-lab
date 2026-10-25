import { describe, expect, it } from "vitest";
import { shareLink } from "./index";

describe("replay links", () => {
  it("keeps the game path and language but drops tracking and run state", () => {
    expect(shareLink("https://example.test/play/perfect-stack/index.html?run=abc&utm_source=test#result", "pt-BR"))
      .toBe("https://example.test/play/perfect-stack/index.html?lang=pt-BR");
  });
});
