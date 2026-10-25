export const STAGE_WIDTH = 480;
export const INITIAL_WIDTH = 220;
export const MIN_WIDTH = 18;
export const PERFECT_TOLERANCE = 6;
export const BASE_SPEED = 140;

export interface Block { x: number; width: number }
export interface Placement {
  success: boolean;
  block: Block | null;
  perfect: boolean;
  combo: number;
  points: number;
  removed: Block | null;
  deviationPx: number;
  repairedPx: number;
}

export function speedForLayer(layers: number): number {
  return BASE_SPEED * Math.pow(1.1, Math.floor(layers / 5));
}

export function movingX(elapsedSeconds: number, width: number, speed: number, fromRight: boolean): number {
  const min = 16;
  const max = STAGE_WIDTH - 16 - width;
  const distance = max - min;
  if (distance <= 0) return min;
  const cycle = distance * 2;
  const traveled = ((elapsedSeconds * speed) % cycle + cycle) % cycle;
  const position = traveled <= distance ? traveled : cycle - traveled;
  return fromRight ? max - position : min + position;
}

export function placeBlock(target: Block, moving: Block, previousCombo: number): Placement {
  const offset = Math.abs((target.x + target.width / 2) - (moving.x + moving.width / 2));
  if (offset <= PERFECT_TOLERANCE) {
    const combo = previousCombo + 1;
    const comboBonus = combo >= 3 ? Math.min(200, (combo - 2) * 50) : 0;
    const repairedPx = combo % 3 === 0 ? Math.min(6, INITIAL_WIDTH - target.width) : 0;
    const width = target.width + repairedPx;
    const x = Math.max(16, Math.min(STAGE_WIDTH - 16 - width, target.x - repairedPx / 2));
    return {
      success: true,
      block: { x, width },
      perfect: true,
      combo,
      points: 150 + comboBonus,
      removed: null,
      deviationPx: offset,
      repairedPx
    };
  }

  const left = Math.max(target.x, moving.x);
  const right = Math.min(target.x + target.width, moving.x + moving.width);
  const width = Math.max(0, right - left);
  if (width < MIN_WIDTH) {
    return { success: false, block: null, perfect: false, combo: 0, points: 0, removed: null, deviationPx: offset, repairedPx: 0 };
  }
  const removed = moving.x < target.x
    ? { x: moving.x, width: target.x - moving.x }
    : { x: right, width: moving.x + moving.width - right };
  return { success: true, block: { x: left, width }, perfect: false, combo: 0, points: 100, removed, deviationPx: offset, repairedPx: 0 };
}
