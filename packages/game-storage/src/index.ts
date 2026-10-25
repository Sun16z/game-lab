export interface ScoreStorage {
  getBest(key: string): number | null;
  saveBest(key: string, score: number): boolean;
}

export function createLocalScoreStorage(storage: Pick<Storage, "getItem" | "setItem"> | undefined): ScoreStorage {
  return {
    getBest(key) {
      try {
        const value = storage?.getItem(`game-lab:best:${key}`);
        const score = value === null || value === undefined ? NaN : Number(value);
        return Number.isFinite(score) && score >= 0 ? score : null;
      } catch {
        return null;
      }
    },
    saveBest(key, score) {
      if (!Number.isFinite(score) || score < 0) return false;
      try {
        storage?.setItem(`game-lab:best:${key}`, String(score));
        return Boolean(storage);
      } catch {
        return false;
      }
    }
  };
}

export interface PreferenceStorage {
  get(key: string): string | null;
  set(key: string, value: string): boolean;
}

export function createLocalPreferenceStorage(storage: Pick<Storage, "getItem" | "setItem"> | undefined): PreferenceStorage {
  return {
    get(key) {
      try { return storage?.getItem(`game-lab:preference:${key}`) ?? null; }
      catch { return null; }
    },
    set(key, value) {
      try { storage?.setItem(`game-lab:preference:${key}`, value); return Boolean(storage); }
      catch { return false; }
    }
  };
}
