import { describe, expect, it } from "vitest";
import { shareTranslations } from "./share-i18n";

describe("challenge copy", () => {
  it("uses singular wording for a one-layer gap in every locale", () => {
    expect(shareTranslations.en.challengeGap(1)).toBe("1 more layer to beat it");
    expect(shareTranslations.es.challengeGap(1)).toBe("Te falta 1 piso");
    expect(shareTranslations["pt-BR"].challengeGap(1)).toBe("Mais 1 andar para superar");
    expect(shareTranslations.fr.challengeGap(1)).toBe("Encore 1 étage pour dépasser");
    expect(shareTranslations.ar.challengeGap(1)).toContain("طابق إضافي");
    expect(shareTranslations.hi.challengeGap(1)).toContain("मंज़िल");
  });

  it("keeps the challenge target copy free of the layer count", () => {
    for (const copy of Object.values(shareTranslations)) {
      expect(copy.challengeTarget("Friend")).not.toMatch(/1|layers|pisos|andares|étages|طوابق|ghorofa|tingkat|मंज़िलें/);
    }
  });
});
