import { describe, it, expect, vi, afterEach } from 'vitest';
import { decodeProgress, readProgress, saveProgress } from './cafe-storage';
import { blankArt } from './cafe-rules';
import { encodeArtwork } from './challenge';
afterEach(() => vi.unstubAllGlobals());
describe('bounded local café collection', () => {
    it('contains corrupt star and order metadata before rendering a gallery', () => { const art = encodeArtwork(blankArt()); const values = [-20, 1e100, 'NaN', 'Infinity', null, 2.9]; const p = decodeProgress(JSON.stringify({ best: values, album: values.map(v => ({ art, stars: v, order: v })) })); expect(p.best.slice(0, 6)).toEqual([0, 3, 0, 0, 0, 2]); expect(p.album.map(x => x.stars)).toEqual([0, 3, 0, 0, 0, 2]); expect(p.album.map(x => x.order)).toEqual([0, 24, 0, 0, 0, 2]); for (const item of p.album)
        expect(() => '★'.repeat(item.stars)).not.toThrow(); });
    it('keeps24 best values and12 valid recent artworks while dropping invalid entries', () => { const art = encodeArtwork(blankArt()); const p = decodeProgress(JSON.stringify({ best: Array(40).fill(3), album: [null, { art: 'bad' }, ...Array.from({ length: 20 }, () => ({ art, order: 2, stars: 3 }))] })); expect(p.best).toHaveLength(24); expect(p.album).toHaveLength(12); expect(decodeProgress('{bad').album).toEqual([]); expect(decodeProgress('[]').best).toHaveLength(24); });
    it('lets unavailable storage fall back to a fresh session and ignores save failure', () => { vi.stubGlobal('localStorage', { getItem() { throw Error('blocked'); }, setItem() { throw Error('quota'); } }); expect(readProgress()).toEqual({ best: Array(24).fill(0), album: [] }); expect(() => saveProgress({ best: Array(24).fill(0), album: [{ art: blankArt(), order: 0, stars: 0 }] })).not.toThrow(); });
});
