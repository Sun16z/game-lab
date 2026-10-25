import rawLevels from "./levels.generated.json";

export type Color = 0 | 1 | 2;
export type Board = Color[][];
export type Move = { source: number; target: number; count: number };
export type Level = { tubes: Board; optimal: number };
export const CAPACITY = 4;
export const LEVELS: readonly Level[] = rawLevels as Level[];

export function cloneBoard(board: readonly (readonly Color[])[]): Board {
  return board.map((tube) => [...tube]);
}

export function legalMove(board: readonly (readonly Color[])[], source: number, target: number): Move | null {
  if (!Number.isInteger(source) || !Number.isInteger(target) || source === target || source < 0 || target < 0 || source >= board.length || target >= board.length) return null;
  const from = board[source];
  const to = board[target];
  if (!from.length || to.length >= CAPACITY) return null;
  const color = from[from.length - 1];
  if (to.length && to[to.length - 1] !== color) return null;
  let run = 0;
  for (let index = from.length - 1; index >= 0 && from[index] === color; index--) run++;
  return { source, target, count: Math.min(run, CAPACITY - to.length) };
}

export function applyMove(board: readonly (readonly Color[])[], move: Move): Board {
  const valid = legalMove(board, move.source, move.target);
  if (!valid || valid.count !== move.count) throw new Error("Invalid pour");
  const next = cloneBoard(board);
  next[move.target].push(...next[move.source].splice(-move.count));
  return next;
}

export function isSolved(board: readonly (readonly Color[])[]): boolean {
  return board.every((tube) => tube.length === 0 || tube.length === CAPACITY && tube.every((color) => color === tube[0]));
}

function canonical(board: readonly (readonly Color[])[]): string {
  return board.map((tube) => tube.join("")).sort().join("|");
}

export function solve(board: readonly (readonly Color[])[]): { moves: number; first: Move | null } | null {
  if (isSolved(board)) return { moves: 0, first: null };
  const seen = new Set([canonical(board)]);
  const queue: { board: Board; moves: number; first: Move | null }[] = [{ board: cloneBoard(board), moves: 0, first: null }];
  for (let head = 0; head < queue.length; head++) {
    const state = queue[head];
    for (let source = 0; source < board.length; source++) {
      for (let target = 0; target < board.length; target++) {
        const move = legalMove(state.board, source, target);
        if (!move) continue;
        const next = applyMove(state.board, move);
        const key = canonical(next);
        if (seen.has(key)) continue;
        const first = state.first ?? move;
        if (isSolved(next)) return { moves: state.moves + 1, first };
        seen.add(key);
        queue.push({ board: next, moves: state.moves + 1, first });
      }
    }
  }
  return null;
}

export function starsFor(moves: number, optimal: number): 1 | 2 | 3 {
  return moves <= optimal ? 3 : moves <= optimal + 2 ? 2 : 1;
}
