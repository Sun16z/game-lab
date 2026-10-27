import { ingredients, type Ingredient, type Plate } from './rules';
export interface Save { version: 1; completed: number; plate: Plate; moves?: number }
export function decodeSave(raw: string | null): Save | undefined {
  try {
    if (!raw || raw.length > 500) return undefined;
    const v: unknown = JSON.parse(raw);
    if (!v || typeof v !== 'object') return undefined;
    const obj = v as Record<string, unknown>;
    if (obj.version !== 1 || !Number.isInteger(obj.completed) || (obj.completed as number) < 0 || (obj.completed as number) > 4 || !Array.isArray(obj.plate) || obj.plate.length !== 4 || obj.plate.some(x => x !== null && !ingredients.includes(x as Ingredient))) return undefined;
    if (obj.moves !== undefined && (!Number.isInteger(obj.moves) || (obj.moves as number) < 0 || (obj.moves as number) > 100000)) return undefined;
    return { version: 1, completed: obj.completed as number, plate: obj.plate as Plate, moves: (obj.moves as number | undefined) ?? 0 };
  } catch { return undefined }
}
export function save(storage: Pick<Storage, 'setItem'> | undefined, data: Save, key = 'game-lab:tiny-chef:v1'): boolean {
  try { if (!storage) return false; storage.setItem(key, JSON.stringify(data)); return true } catch { return false }
}
