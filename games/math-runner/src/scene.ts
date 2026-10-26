import type { Lane } from "./rules";

/** Same trapezoid as the road artwork: 28% wide at the horizon, 88% at the feet. */
export function roadPoint(lane: Lane, depth: number, width: number, height: number) {
  const d = Math.max(0, Math.min(1, depth));
  const roadWidth = .28 + .60 * d;
  return { x: width * (.5 + (lane - 1) * roadWidth / 3), y: height * (.42 + .48 * d), scale: .58 + .42 * d };
}
