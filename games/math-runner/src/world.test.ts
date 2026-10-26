import { describe, expect, it } from "vitest";
import { jumpHeight, laneX, projectPoint } from "./world";

describe("3D runner world", () => {
  it("projects avatar feet and colliding objects to identical lane centres on every screen", () => {
    for (const [w,h] of [[349,350],[774,350],[1000,520]]) {
      for (const lane of [0,1,2] as const) {
        const p=projectPoint(laneX(lane),0,2,w,h);
        expect(p.x).toBeGreaterThan(0);expect(p.x).toBeLessThan(w);
        expect(p.y).toBeGreaterThan(h*.65);expect(p.y).toBeLessThan(h);
        expect(projectPoint(laneX(lane),0,2-(.6-.6)*32,w,h)).toEqual(p);
        expect(projectPoint(laneX(lane),0,2-(1-1)*32,w,h)).toEqual(p);
      }
    }
  });
  it("requires visible clearance and lands before the next jump", () => {
    expect(jumpHeight(0,720)).toBe(0);
    expect(jumpHeight(360,720)).toBeCloseTo(1.65);
    expect(jumpHeight(720,720)).toBe(0);
    expect(jumpHeight(800,720)).toBe(0);
    expect(jumpHeight(30,720)).toBeLessThan(.72);
    expect(jumpHeight(360,720)).toBeGreaterThan(.72);
  });
});
