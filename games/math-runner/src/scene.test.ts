import { describe, expect, it } from "vitest";
import { roadPoint } from "./scene";

describe("road projection", () => {
  it("keeps all three lanes inside the same road at phone, tablet, and desktop sizes", () => {
    for (const [w, h] of [[349, 417], [749, 342], [892, 512], [530, 350]]) {
      for (const depth of [0, .25, .6, 1]) {
        const points = ([0, 1, 2] as const).map(lane => roadPoint(lane, depth, w, h));
        expect(points[1].x).toBe(w / 2);
        expect(points[1].x - points[0].x).toBeCloseTo(points[2].x - points[1].x);
        expect(points[0].x).toBeGreaterThan(w * .06);
        expect(points[2].x).toBeLessThan(w * .94);
        expect(points.every(p => p.y === points[0].y)).toBe(true);
      }
    }
  });
});
