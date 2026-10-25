export type Player = 0 | 1;
export type Piece = "straight" | "corner" | "tee";
export type Difficulty = "easy" | "normal" | "hard";
export type Cell = { terrain: "land" | "rock" | "treasure"; tile: { player: Player; piece: Piece; rotation: number } | null; flag: Player | null };
export type Move = { index: number; piece: Piece; rotation: number };
export type State = { size: 4 | 6; cells: Cell[]; turn: Player; scores: [number, number]; moves: number; bonus: boolean; seed: number; over: boolean };

const SIDES: Record<Piece, number> = { straight: 0b0101, corner: 0b0011, tee: 0b0111 }; // N E S W
const DIRECTIONS = [[-1, 0], [0, 1], [1, 0], [0, -1]] as const;

export function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (const char of seed) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return hash >>> 0;
}

function random(seed: number): number { return (Math.imul(seed, 1664525) + 1013904223) >>> 0; }
function openings(piece: Piece, rotation: number): number {
  const mask = SIDES[piece];
  return ((mask << rotation) | (mask >>> (4 - rotation))) & 15;
}

export function createGame(seed: string, size: 4 | 6 = 6): State {
  const cells: Cell[] = Array.from({ length: size * size }, () => ({ terrain: "land", tile: null, flag: null }));
  let value = hashSeed(seed);
  const choosePair = (terrain: Cell["terrain"]): void => {
    for (let attempt = 0; attempt < 80; attempt++) {
      value = random(value);
      const index = value % cells.length;
      const mirror = cells.length - 1 - index;
      if (index === mirror || cells[index].terrain !== "land" || cells[mirror].terrain !== "land") continue;
      cells[index].terrain = terrain;
      cells[mirror].terrain = terrain;
      return;
    }
  };
  if (size === 6) choosePair("rock");
  choosePair("treasure");
  choosePair("treasure");
  // The second player receives one starting flag to offset the first move.
  return { size, cells, turn: 0, scores: [0, 1], moves: 0, bonus: false, seed: hashSeed(seed), over: false };
}

export function legalMoves(state: State): Move[] {
  if (state.over) return [];
  const result: Move[] = [];
  for (let index = 0; index < state.cells.length; index++) {
    const cell = state.cells[index];
    if (cell.terrain === "rock" || cell.tile || cell.flag !== null) continue;
    for (const piece of ["straight", "corner", "tee"] as Piece[]) {
      for (let rotation = 0; rotation < (piece === "straight" ? 2 : 4); rotation++) result.push({ index, piece, rotation });
    }
  }
  return result;
}

function neighbor(index: number, side: number, size: number): number {
  const row = Math.floor(index / size), col = index % size;
  const [dr, dc] = DIRECTIONS[side];
  const r = row + dr, c = col + dc;
  return r >= 0 && r < size && c >= 0 && c < size ? r * size + c : -1;
}

function closedCells(cells: Cell[], size: number): number[] {
  const seen = new Set<number>();
  const captured: number[] = [];
  for (let index = 0; index < cells.length; index++) {
    if (seen.has(index) || cells[index].terrain === "rock" || cells[index].tile || cells[index].flag !== null) continue;
    const queue = [index];
    seen.add(index);
    let edge = false;
    for (let head = 0; head < queue.length; head++) {
      const current = queue[head];
      const row = Math.floor(current / size), col = current % size;
      if (row === 0 || col === 0 || row === size - 1 || col === size - 1) edge = true;
      for (let side = 0; side < 4; side++) {
        const next = neighbor(current, side, size);
        if (next < 0 || seen.has(next) || cells[next].terrain === "rock" || cells[next].tile || cells[next].flag !== null) continue;
        seen.add(next);
        queue.push(next);
      }
    }
    if (!edge) captured.push(...queue);
  }
  return captured;
}

export function playMove(state: State, move: Move): { state: State; gained: number; captured: number; links: number } {
  if (state.over || !Number.isInteger(move.index) || move.index < 0 || move.index >= state.cells.length
    || !(["straight", "corner", "tee"] as string[]).includes(move.piece)
    || !Number.isInteger(move.rotation) || move.rotation < 0 || move.rotation >= (move.piece === "straight" ? 2 : 4)) throw new Error("Invalid island move");
  const cell = state.cells[move.index];
  if (cell.terrain === "rock" || cell.tile || cell.flag !== null) throw new Error("Cell is unavailable");
  const cells = state.cells.map((old) => ({ ...old, tile: old.tile ? { ...old.tile } : null }));
  const current: Player = state.turn;
  cells[move.index].tile = { player: current, piece: move.piece, rotation: move.rotation };
  let links = 0;
  const exits = openings(move.piece, move.rotation);
  for (let side = 0; side < 4; side++) {
    const next = neighbor(move.index, side, state.size);
    if (next < 0 || !(exits & (1 << side))) continue;
    const other = cells[next].tile;
    if (other?.player === current && openings(other.piece, other.rotation) & (1 << ((side + 2) % 4))) links++;
  }
  let gained = 1 + links + (cell.terrain === "treasure" ? 2 : 0);
  const capturedCells = links ? closedCells(cells, state.size) : [];
  for (const index of capturedCells) {
    cells[index].flag = current;
    gained += 1 + (cells[index].terrain === "treasure" ? 2 : 0);
  }
  const scores: [number, number] = [...state.scores];
  scores[current] += gained;
  const extra = capturedCells.length > 0 && !state.bonus;
  const over = cells.every((entry) => entry.terrain === "rock" || !!entry.tile || entry.flag !== null);
  return { state: { ...state, cells, scores, moves: state.moves + 1, turn: over || extra ? current : current === 0 ? 1 : 0, bonus: extra, over }, gained, captured: capturedCells.length, links };
}

export function winner(state: State): Player | null {
  if (!state.over || state.scores[0] === state.scores[1]) return null;
  return state.scores[0] > state.scores[1] ? 0 : 1;
}

export function chooseAiMove(state: State, difficulty: Difficulty, salt = 0): Move {
  const moves = legalMoves(state);
  if (!moves.length) throw new Error("No legal moves");
  const seed = random(state.seed ^ Math.imul(state.moves + 1, 2654435761) ^ salt);
  if (difficulty === "easy") return moves[seed % moves.length];
  const sample = difficulty === "hard" ? 48 : 16;
  let best = moves[seed % moves.length];
  let bestValue = -Infinity;
  for (let i = 0; i < sample; i++) {
    const move = moves[random(seed + Math.imul(i + 1, 2246822519)) % moves.length];
    const outcome = playMove(state, move);
    const value = outcome.gained * (difficulty === "hard" ? 3 : 2) + outcome.links
      + (outcome.captured ? 4 : 0) + (random(seed ^ i) % 100) / (difficulty === "hard" ? 100 : 20);
    if (value > bestValue) { bestValue = value; best = move; }
  }
  return best;
}
