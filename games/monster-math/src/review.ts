import { validQuestionKey } from "./rules";

const KEY = "game-lab:G002:review";

export function loadReview(storage: Pick<Storage, "getItem"> | undefined): string[] {
  try {
    const value = JSON.parse(storage?.getItem(KEY) ?? "[]") as unknown;
    return Array.isArray(value) ? [...new Set(value.filter((item): item is string => typeof item === "string" && validQuestionKey(item)))].slice(0, 16) : [];
  } catch { return []; }
}

export function saveReview(storage: Pick<Storage, "setItem"> | undefined, keys: ReadonlySet<string>): void {
  try { storage?.setItem(KEY, JSON.stringify([...keys].filter(validQuestionKey).slice(0, 16))); } catch { /* Storage is optional. */ }
}
