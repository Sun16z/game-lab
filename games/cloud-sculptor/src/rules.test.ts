import { describe, expect, it } from "vitest";
import { addSticker, cloudPath, initialArtwork, movePoint, moveSticker } from "./rules";

describe("cloud artwork", () => {
  it("keeps edits inside the canvas without mutating the previous artwork", () => {
    const before = initialArtwork(), after = movePoint(before, 0, { x: -20, y: 4 });
    expect(before.points[0]).toEqual({ x: .12, y: .59 });
    expect(after.points[0]).toEqual({ x: .04, y: .92 });
    expect(movePoint(after, -1, { x: 1, y: 1 })).toBe(after);
    expect(cloudPath(after.points, 300, 200)).toMatch(/^M .* Z$/);
  });
  it("limits stickers and preserves identity while moving them", () => {
    let art = initialArtwork();
    for (let i = 0; i < 13; i++) art = addSticker(art, "star", i);
    expect(art.stickers).toHaveLength(12);
    expect(addSticker(art, "rain", 0)).toBe(art);
    const moved = moveSticker(art, 0, { x: .2, y: .8 });
    expect(moved.stickers[0]).toEqual({ id: 0, kind: "star", point: { x: .2, y: .8 } });
    expect(art.stickers[0].point).toEqual({ x: .5, y: .5 });
  });
});
