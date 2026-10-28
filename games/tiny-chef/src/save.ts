import { ingredients, orders, type Ingredient, type Plate } from './rules';
export interface Save { version: 1 | 2; completed: number; plate: Plate; moves?: number }
export function decodeSave(raw: string | null): Save | undefined {
  try {
    if (!raw || raw.length > 500) return undefined;
    const obj: unknown = JSON.parse(raw);
    if (!obj || typeof obj !== 'object') return undefined;
    const v = obj as Record<string, unknown>;
    if ((v.version !== 1 && v.version !== 2) || !Number.isInteger(v.completed) || (v.completed as number) < 0 || (v.completed as number) > (v.version === 1 ? 4 : orders.length) || !Array.isArray(v.plate) || v.plate.length !== 4 || v.plate.some(x => x !== null && !ingredients.includes(x as Ingredient))) return undefined;
    if (v.moves !== undefined && (!Number.isInteger(v.moves) || (v.moves as number) < 0 || (v.moves as number) > 100000)) return undefined;
    return { version: v.version, completed: v.completed as number, plate: v.plate as Plate, moves: (v.moves as number | undefined) ?? 0 };
  } catch { return undefined }
}
export function save(storage: Pick<Storage, 'setItem'> | undefined, data: Save, key = 'game-lab:tiny-chef:v1'): boolean {
  try { if (!storage) return false; storage.setItem(key, JSON.stringify(data)); return true } catch { return false }
}
