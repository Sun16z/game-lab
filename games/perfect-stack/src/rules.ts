export const STAGE_WIDTH = 480;
export const INITIAL_WIDTH = 220;
export const MIN_WIDTH = 18;
export const PERFECT_TOLERANCE = 6;
export const BULLSEYE_TOLERANCE = 1;
export const BASE_SPEED = 140;
export type GameMode = "standard" | "child";

export interface Block { x: number; width: number }
export interface Placement {
  success: boolean;
  block: Block | null;
  perfect: boolean;
  bullseye: boolean;
  combo: number;
  points: number;
  removed: Block | null;
  deviationPx: number;
  repairedPx: number;
}

export function speedForLayer(layers: number, mode: GameMode = "standard"): number {
  const speed = layers < 5 ? BASE_SPEED : layers < 10 ? BASE_SPEED * 1.1
    : 240 * Math.pow(1.14, Math.floor((layers - 10) / 5));
  return mode === "child" ? speed * 0.7 : speed;
}

export function startPhaseForLayer(layer: number, seed: string): number {
  if (layer < 15) return 0;
  let hash = 2166136261;
  for (const character of `${seed}:${layer}`) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x7feb352d);
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 0x846ca68b);
  hash ^= hash >>> 16;
  return (hash >>> 0) / 4294967296 * 0.45;
}

export function movingX(elapsedSeconds: number, width: number, speed: number, fromRight: boolean, phase = 0): number {
  const min = 16;
  const max = STAGE_WIDTH - 16 - width;
  const distance = max - min;
  if (distance <= 0) return min;
  const cycle = distance * 2;
  const traveled = ((elapsedSeconds * speed + phase * cycle) % cycle + cycle) % cycle;
  const position = traveled <= distance ? traveled : cycle - traveled;
  return fromRight ? max - position : min + position;
}

export function placeBlock(target: Block, moving: Block, previousCombo: number, mode: GameMode = "standard"): Placement {
  const offset = Math.abs((target.x + target.width / 2) - (moving.x + moving.width / 2));
  if (offset <= (mode === "child" ? 12 : PERFECT_TOLERANCE)) {
    const bullseye = offset <= BULLSEYE_TOLERANCE;
    const combo = previousCombo + 1;
    const comboBonus = combo >= 3 ? Math.min(200, (combo - 2) * 50) : 0;
    const repairedPx = combo % 3 === 0 ? Math.min(6, INITIAL_WIDTH - target.width) : 0;
    const width = target.width + repairedPx;
    const x = Math.max(16, Math.min(STAGE_WIDTH - 16 - width, target.x - repairedPx / 2));
    return {
      success: true,
      block: { x, width },
      perfect: true,
      bullseye,
      combo,
      points: 150 + comboBonus + (bullseye ? 75 : 0),
      removed: null,
      deviationPx: offset,
      repairedPx
    };
  }

  const left = Math.max(target.x, moving.x);
  const right = Math.min(target.x + target.width, moving.x + moving.width);
  const width = Math.max(0, right - left);
  if (width < (mode === "child" ? 12 : MIN_WIDTH)) {
    return { success: false, block: null, perfect: false, bullseye: false, combo: 0, points: 0, removed: null, deviationPx: offset, repairedPx: 0 };
  }
  const removed = moving.x < target.x
    ? { x: moving.x, width: target.x - moving.x }
    : { x: right, width: moving.x + moving.width - right };
  return { success: true, block: { x: left, width }, perfect: false, bullseye: false, combo: 0, points: 100, removed, deviationPx: offset, repairedPx: 0 };
}

export function sceneryForLayer(layers: number): "ground" | "sky" | "space" {
  if (layers >= 25) return "space";
  if (layers >= 10) return "sky";
  return "ground";
}
