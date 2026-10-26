export type Card = { id: number; monster: number; matched: boolean };
export type Round = { cards: Card[]; open: number[]; pairs: number; turns: number; locked: boolean };

function hash(seed: string): number {
  let value = 2166136261;
  for (const char of seed) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return value >>> 0;
}

export function makeDeck(pairCount: 3 | 6 | 8, seed: string): Card[] {
  let value = hash(seed);
  const random = () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; };
  const monsters = Array.from({ length: pairCount }, (_, monster) => monster).flatMap((monster) => [monster, monster]);
  for (let index = monsters.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [monsters[index], monsters[swap]] = [monsters[swap], monsters[index]];
  }
  return monsters.map((monster, id) => ({ id, monster, matched: false }));
}

export function beginRound(pairCount: 3 | 6 | 8, seed: string): Round {
  return { cards: makeDeck(pairCount, seed), open: [], pairs: 0, turns: 0, locked: false };
}

export function flip(round: Round, id: number): Round {
  const card = round.cards[id];
  if (!card || card.matched || round.locked || round.open.includes(id) || round.open.length >= 2) return round;
  const open = [...round.open, id];
  return { ...round, open, turns: open.length === 2 ? round.turns + 1 : round.turns, locked: open.length === 2 };
}

export function resolve(round: Round): { round: Round; matched: boolean } {
  if (round.open.length !== 2) return { round, matched: false };
  const [a, b] = round.open;
  const matched = round.cards[a].monster === round.cards[b].monster;
  const cards = matched ? round.cards.map((card) => card.id === a || card.id === b ? { ...card, matched: true } : card) : round.cards;
  return { round: { ...round, cards, open: [], pairs: round.pairs + (matched ? 1 : 0), locked: false }, matched };
}
