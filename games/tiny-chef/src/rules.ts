export const ingredients = ['tomato', 'lemon', 'leaf', 'star'] as const;
export type Ingredient = typeof ingredients[number];
export type Plate = readonly (Ingredient | null)[];
export interface Order { required: readonly Ingredient[]; forbidden: readonly Ingredient[]; ordered: boolean }
export const orders: readonly Order[] = [
  { required: ['tomato'], forbidden: [], ordered: false },
  { required: ['lemon', 'leaf'], forbidden: [], ordered: false },
  { required: ['tomato', 'star'], forbidden: [], ordered: false },
  { required: ['tomato', 'leaf'], forbidden: ['lemon'], ordered: true }
];
export const emptyPlate = (): Plate => [null, null, null, null];
export function put(plate: Plate, index: number, ingredient: Ingredient): Plate {
  if (!Number.isInteger(index) || index < 0 || index >= plate.length || !ingredients.includes(ingredient)) return plate;
  return plate.map((item, i) => i === index ? ingredient : item);
}
export function remove(plate: Plate, index: number): Plate {
  if (!Number.isInteger(index) || index < 0 || index >= plate.length || plate[index] === null) return plate;
  return plate.map((item, i) => i === index ? null : item);
}
export function matches(order: Order, plate: Plate): boolean {
  const chosen = plate.filter((item): item is Ingredient => item !== null);
  if (chosen.some(item => order.forbidden.includes(item))) return false;
  if (order.ordered) return order.required.every((item, i) => plate[i] === item);
  const remaining = [...chosen];
  return order.required.every(item => { const i = remaining.indexOf(item); if (i < 0) return false; remaining.splice(i, 1); return true; });
}
