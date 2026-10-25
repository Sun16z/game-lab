import { applyMove, cloneBoard, isSolved, legalMove, LEVELS, type Move } from "./rules";

export type Challenge = { level: number; moves: number; steps: Move[]; date: string | null };

export function utcDay(date: Date): string { return date.toISOString().slice(0, 10); }

export function dailyLevel(day: string): number {
  let hash = 2166136261;
  for (const character of day) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return (hash >>> 0) % LEVELS.length + 1;
}

function validDay(day: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(day) && !Number.isNaN(Date.parse(`${day}T00:00:00Z`))
    && utcDay(new Date(`${day}T00:00:00Z`)) === day;
}

export function encodeChallenge(challenge: Challenge): string {
  const steps = challenge.steps.map((move) => `${move.source}${move.target}`).join("");
  const payload = `1:${challenge.date ?? "-"}:${challenge.level}:${challenge.moves}:${steps}`;
  return new URLSearchParams({ challenge: payload }).toString();
}

export function decodeChallenge(fragment: string): Challenge | null {
  const payload = new URLSearchParams(fragment.replace(/^#/, "")).get("challenge");
  const match = /^1:(-|\d{4}-\d{2}-\d{2}):(\d{1,2}):(\d{1,3}):([0-4]*)$/.exec(payload ?? "");
  if (!match) return null;
  const [, rawDay, rawLevel, rawMoves, encodedSteps] = match;
  const date = rawDay === "-" ? null : rawDay;
  const level = Number(rawLevel);
  const moves = Number(rawMoves);
  if (date && !validDay(date) || level < 1 || level > LEVELS.length || date && dailyLevel(date) !== level
    || moves < 1 || moves > 999 || encodedSteps.length !== moves * 2) return null;
  const steps: Move[] = [];
  let board = cloneBoard(LEVELS[level - 1].tubes);
  for (let index = 0; index < encodedSteps.length; index += 2) {
    const source = Number(encodedSteps[index]);
    const target = Number(encodedSteps[index + 1]);
    const move = legalMove(board, source, target);
    if (!move) return null;
    board = applyMove(board, move);
    steps.push(move);
  }
  return isSolved(board) ? { date, level, moves, steps } : null;
}
