import type { GameMode } from "./rules";

export type ChallengeRoleKey = "dad" | "mom" | "brother" | "sister" | "youngerBrother" | "youngerSister" | "grandpa" | "grandma" | "self";

export interface ChallengeRole {
  key: ChallengeRoleKey;
  avatar: "dodo" | "lili" | "pip";
}

export interface ChallengePayload {
  layers: number;
  role: ChallengeRoleKey;
  seed: string;
  mode: GameMode;
}

export const CHALLENGE_ROLES: readonly ChallengeRole[] = [
  { key: "dad", avatar: "dodo" },
  { key: "mom", avatar: "lili" },
  { key: "brother", avatar: "pip" },
  { key: "sister", avatar: "lili" },
  { key: "youngerBrother", avatar: "pip" },
  { key: "youngerSister", avatar: "lili" },
  { key: "grandpa", avatar: "dodo" },
  { key: "grandma", avatar: "lili" },
  { key: "self", avatar: "pip" }
] as const;

const roleKeys = new Set<string>(CHALLENGE_ROLES.map(({ key }) => key));
const seedPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/;

export function encodeChallenge(payload: ChallengePayload, baseUrl = "https://games.somewhen.life/play/perfect-stack/"): string {
  if (!isValidPayload(payload)) throw new Error("Invalid challenge payload");
  const url = new URL(baseUrl);
  url.search = "";
  url.hash = "";
  url.searchParams.set("c", String(payload.layers));
  url.searchParams.set("r", payload.role);
  url.searchParams.set("s", payload.seed);
  url.searchParams.set("m", payload.mode);
  return url.toString();
}

export function parseChallenge(input: string): ChallengePayload | null {
  try {
    const url = new URL(input, "https://games.somewhen.life/");
    const params = url.searchParams;
    // apps add their own parameters (fbclid, utm_*, openExternalBrowser) when a link is shared; ignore them
    if (["c", "r", "s", "m", "lang"].some((key) => params.getAll(key).length > 1)) return null;
    const layersText = params.get("c");
    const role = params.get("r");
    const seed = params.get("s");
    const mode = params.get("m");
    if (!layersText || !/^\d+$/.test(layersText) || !role || !seed || !mode) return null;
    const layers = Number(layersText);
    const payload = { layers, role, seed, mode } as ChallengePayload;
    return isValidPayload(payload) ? payload : null;
  } catch {
    return null;
  }
}

export function dailySeed(date: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Invalid date");
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) throw new Error("Invalid date");
  return `daily-${date}`;
}

function isValidPayload(payload: ChallengePayload): payload is ChallengePayload {
  return Number.isInteger(payload.layers) && payload.layers >= 0 && payload.layers <= 999
    && roleKeys.has(payload.role) && seedPattern.test(payload.seed)
    && (payload.mode === "standard" || payload.mode === "child");
}
