import { describe, expect, it } from "vitest";
import { beginRound, flip, makeDeck, resolve } from "./rules";

describe("memory monster rules", () => {
  it("builds deterministic pairs", () => {
    const deck = makeDeck(8, "same-day");
    expect(deck).toEqual(makeDeck(8, "same-day"));
    for (let monster = 0; monster < 8; monster++) expect(deck.filter((card) => card.monster === monster)).toHaveLength(2);
  });
  it("matches a pair and ignores locked flips", () => {
    let round = beginRound(3, "tiny");
    const first = round.cards[0];
    const partner = round.cards.find((card) => card.monster === first.monster && card.id !== first.id)!;
    round = flip(flip(round, first.id), partner.id);
    expect(flip(round, 2)).toBe(round);
    const result = resolve(round);
    expect(result.matched).toBe(true);
    expect(result.round.pairs).toBe(1);
    expect(result.round.turns).toBe(1);
  });
});
