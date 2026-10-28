import { scaleArt, sculpt, type CloudArt } from './cafe-rules';
import { moveSticker, type Point } from './rules';
/** Pointer work stays local and synchronous; no DOM replacement during an active capture. */
export class CloudEditor {
    private pointers = new Map<number, Point>();
    private dragSticker: number | undefined;
    private pinch = 0;
    private selected = 0;
    constructor(private board: HTMLElement, private get: () => CloudArt, private set: (art: CloudArt) => void, private checkpoint: () => void, private active: () => boolean, private radius = () => .17) {
        board.addEventListener('pointerdown', e => { if (!active())
            return; e.preventDefault(); checkpoint(); this.pointers.set(e.pointerId, this.point(e)); board.setPointerCapture(e.pointerId); const sticker = (e.target as HTMLElement).closest<HTMLElement>('[data-art-sticker]'); this.dragSticker = sticker ? Number(sticker.dataset.artSticker) : undefined; if (this.pointers.size === 2)
            this.pinch = this.distance(); });
        board.addEventListener('pointermove', e => { const previous = this.pointers.get(e.pointerId); if (!previous || !active())
            return; const point = this.point(e); this.pointers.set(e.pointerId, point); if (this.pointers.size >= 2) {
            const next = this.distance();
            if (this.pinch > 0)
                set(scaleArt(get(), next / this.pinch));
            this.pinch = next;
            return;
        } if (this.dragSticker !== undefined) {
            set(moveSticker(get(), this.dragSticker, point) as CloudArt);
            return;
        } set(sculpt(get(), previous, { x: point.x - previous.x, y: point.y - previous.y }, this.radius())); });
        const release = (e: PointerEvent) => { this.pointers.delete(e.pointerId); this.pinch = 0; this.dragSticker = undefined; board.classList.remove('release'); void board.offsetWidth; board.classList.add('release'); };
        board.addEventListener('pointerup', release);
        board.addEventListener('pointercancel', release);
        board.addEventListener('keydown', e => { if (!active())
            return; const steps: Record<string, Point> = { ArrowLeft: { x: -.018, y: 0 }, ArrowRight: { x: .018, y: 0 }, ArrowUp: { x: 0, y: -.018 }, ArrowDown: { x: 0, y: .018 } }; if (e.key === '+' || e.key === '=' || e.key === '-') {
            e.preventDefault();
            checkpoint();
            set(scaleArt(get(), e.key === '-' ? .94 : 1.06));
            return;
        } const d = steps[e.key]; if (d) {
            e.preventDefault();
            checkpoint();
            const p = get().points[Math.floor(this.selected * get().points.length / 8)];
            set(sculpt(get(), p, d, this.radius()));
        } });
    }
    select(index: number) { this.selected = index; this.board.dataset.selected = String(index); }
    clear() { this.pointers.clear(); this.pinch = 0; this.dragSticker = undefined; }
    private point(e: PointerEvent): Point { const r = this.board.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }; }
    private distance() { const [a, b] = [...this.pointers.values()]; return Math.hypot(a.x - b.x, a.y - b.y); }
}
