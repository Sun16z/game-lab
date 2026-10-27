export const ingredients = ['tomato', 'lemon', 'leaf', 'star'] as const;
export type Ingredient = typeof ingredients[number];
export type Plate = readonly (Ingredient | null)[];
export interface Order { required: readonly Ingredient[]; forbidden: readonly Ingredient[]; ordered: boolean }
/** One new idea at a time: quantity, exact mix, exclusion, then left-to-right order. */
export const orders: readonly Order[] = [
  { required: ['tomato'], forbidden: [], ordered: false },
  { required: ['lemon', 'leaf'], forbidden: [], ordered: false },
  { required: ['tomato', 'star'], forbidden: [], ordered: false },
  { required: ['tomato', 'leaf'], forbidden: ['lemon'], ordered: true },
  { required: ['tomato', 'tomato'], forbidden: [], ordered: false },
  { required: ['star', 'star', 'leaf'], forbidden: ['lemon'], ordered: false },
  { required: ['lemon', 'tomato', 'leaf'], forbidden: [], ordered: false },
  { required: ['leaf', 'star', 'tomato'], forbidden: [], ordered: true },
  { required: ['tomato', 'lemon', 'tomato'], forbidden: [], ordered: true },
  { required: ['star', 'leaf', 'leaf', 'tomato'], forbidden: ['lemon'], ordered: false },
  { required: ['lemon', 'star', 'leaf', 'tomato'], forbidden: [], ordered: true },
  { required: ['star', 'tomato', 'star', 'leaf'], forbidden: ['lemon'], ordered: true }
];
export const emptyPlate = (): Plate => [null, null, null, null];
export function put(plate: Plate, index: number, ingredient: Ingredient): Plate {
  if (!Number.isInteger(index) || index < 0 || index >= plate.length || !ingredients.includes(ingredient)) return plate;
  return plate.map((item, i) => i === index ? item === ingredient ? null : ingredient : item);
}
export function remove(plate: Plate, index: number): Plate {
  if (!Number.isInteger(index) || index < 0 || index >= plate.length || plate[index] === null) return plate;
  return plate.map((item, i) => i === index ? null : item);
}
export type OrderResult = 'correct' | 'forbidden' | 'missing' | 'extra' | 'position';
export function checkOrder(order: Order, plate: Plate): OrderResult {
  const chosen = plate.filter((item): item is Ingredient => item !== null);
  if (chosen.some(item => order.forbidden.includes(item))) return 'forbidden';
  const remaining = [...chosen];
  for (const item of order.required) {
    const index = remaining.indexOf(item);
    if (index < 0) return 'missing';
    remaining.splice(index, 1);
  }
  if (remaining.length) return 'extra';
  if (order.ordered && order.required.some((item, index) => plate[index] !== item)) return 'position';
  return 'correct';
}
export function matches(order: Order, plate: Plate): boolean { return checkOrder(order, plate) === 'correct'; }
