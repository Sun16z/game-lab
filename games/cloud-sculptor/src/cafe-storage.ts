import { decodeArtwork, encodeArtwork } from './challenge';
import type { CloudArt } from './cafe-rules';
export type AlbumItem = {
    art: CloudArt;
    order: number;
    stars: number;
};
export type Progress = {
    best: number[];
    album: AlbumItem[];
};
const KEY = 'game-lab:cloud-cafe:v1';
const empty = (): Progress => ({ best: Array(24).fill(0), album: [] });
function boundedInteger(value: unknown, max: number): number {
    const n = typeof value === 'number' || typeof value === 'string' ? Number(value) : 0;
    return Number.isFinite(n) ? Math.max(0, Math.min(max, Math.floor(n))) : 0;
}
export function storage(): Storage | undefined { try {
    return localStorage;
}
catch {
    return undefined;
} }
/** Treat persisted metadata as untrusted; malformed entries cannot break the order book. */
export function decodeProgress(value: string | null): Progress {
    try {
        const raw: unknown = JSON.parse(value ?? 'null');
        if (!raw || typeof raw !== 'object' || Array.isArray(raw))
            return empty();
        const data = raw as {
            best?: unknown;
            album?: unknown;
        };
        const best = Array.isArray(data.best) ? data.best : [];
        const album = Array.isArray(data.album) ? data.album : [];
        return { best: Array.from({ length: 24 }, (_, i) => boundedInteger(best[i], 3)), album: album.slice(-12).flatMap((item: unknown) => {
                if (!item || typeof item !== 'object' || Array.isArray(item))
                    return [];
                const x = item as {
                    art?: unknown;
                    order?: unknown;
                    stars?: unknown;
                };
                const art = typeof x.art === 'string' ? decodeArtwork(x.art) : undefined;
                return art ? [{ art: { ...art, color: art.color ?? 'cream', hole: art.hole ?? false } as CloudArt, order: boundedInteger(x.order, 24), stars: boundedInteger(x.stars, 3) }] : [];
            }) };
    }
    catch {
        return empty();
    }
}
export function readProgress(): Progress { try {
    return decodeProgress(storage()?.getItem(KEY) ?? null);
}
catch {
    return empty();
} }
export function saveProgress(p: Progress): void { try {
    storage()?.setItem(KEY, JSON.stringify({ best: p.best.slice(0, 24), album: p.album.slice(-12).map(x => ({ ...x, art: encodeArtwork(x.art) })) }));
}
catch { } }
