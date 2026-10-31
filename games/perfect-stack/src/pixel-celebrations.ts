import { createFrame, clearFrame, createFx, type Frame, type Fx } from './vendor/pixelfx/core/index.js';
import * as collect from './vendor/pixelfx/fx/pickups/collect-burst.js';
import * as star from './vendor/pixelfx/fx/pickups/power-star.js';
import * as confetti from './vendor/pixelfx/fx/ui/confetti.js';
import type { Theme } from './progress';

export type Celebration = 'bullseye' | 'combo' | 'record';
export interface SuccessCues { bullseye: boolean; streakMilestone: boolean; justBeatRecord: boolean }
export interface PixelSurface { present(frame: Frame): void; clear(): void; destroy(): void }
const effects = { bullseye: collect, combo: star, record: confetti };
export function celebrationFor(cues: SuccessCues): Celebration | null {
  return cues.streakMilestone ? 'combo' : cues.bullseye ? 'bullseye' : null;
}
const cssColor = (color: number) => `#${color.toString(16).padStart(6, '0')}`;
export function celebrationPalette(theme: Theme, blocks: readonly number[], accent: number) {
  return theme === 'classic'
    ? { palette: ['#16406B', '#2E7FB8', '#FFB000', '#FFC83D', '#FFF3C4', '#FFFFFF'], light: .4 }
    : { palette: ['#10132F', ...blocks.map(cssColor), cssColor(accent), '#FFFFFF'], light: 1 };
}

/** One bounded effect at a time. No frame, texture or effect is created in reduced motion. */
export class PixelCelebrations {
  private frame?: Frame;
  private surface?: PixelSurface;
  private fx?: Fx;
  private kind?: Celebration;
  private stopped = false;
  private sequence = 0;
  private renders = 0;
  private clipRow = 0;
  constructor(private readonly makeSurface: () => PixelSurface) {}

  trigger(cues: SuccessCues, reduced: boolean, theme: Theme, blocks: readonly number[], accent: number, x: number, y: number): void {
    if (reduced) { this.clear(); return; }
    const kind = celebrationFor(cues);
    if (!kind) return;
    this.start(kind, theme, blocks, accent, x, y);
  }

  celebrateRecord(reduced: boolean, theme: Theme, blocks: readonly number[], accent: number): void {
    if (reduced) { this.clear(); return; }
    this.start('record', theme, blocks, accent, 240, 680);
  }

  private start(kind: Celebration, theme: Theme, blocks: readonly number[], accent: number, x: number, y: number): void {
    this.surface ??= this.makeSurface();
    this.frame ??= createFrame(240, 360);
    // These pickup assets draw their visual center 25/30px ABOVE the supplied origin.
    this.clipRow = kind === 'record' ? 0 : Math.max(0, Math.min(360, Math.ceil(y / 2)));
    const location = kind === 'record' ? { x: 120, y: 340 }
      : { x: x / 2, y: y / 2 + (kind === 'combo' ? 35 : 40) };
    this.fx = createFx(effects[kind], { ...location, seed: ++this.sequence, ...celebrationPalette(theme, blocks, accent) });
    this.kind = kind;
    this.stopped = false;
  }

  update(deltaSeconds: number): void {
    if (!this.fx || !this.frame || !this.surface) return;
    // Bound catch-up work after a stalled frame. Paused time is never sent here.
    this.fx.update(Math.min(.1, Math.max(0, deltaSeconds)));
    if (this.kind !== 'record' && !this.stopped && this.fx.t >= .48) {
      this.fx.stop();
      this.stopped = true;
    }
    if (this.fx.done() || this.kind !== 'record' && this.fx.t >= .8) { this.clear(); return; }
    clearFrame(this.frame);
    this.fx.draw(this.frame);
    if (this.clipRow) { this.frame.color.fill(0, 0, this.clipRow * 240); this.frame.light.fill(0, 0, this.clipRow * 240); }
    this.surface.present(this.frame);
    this.renders++;
  }

  clear(): void {
    if (this.fx) this.surface?.clear();
    this.fx = undefined;
    this.kind = undefined;
    this.stopped = false;
  }
  destroy(): void { this.clear(); this.surface?.destroy(); this.surface = undefined; this.frame = undefined; }
  /** Read-only QA state; never changes gameplay or exposes an effect trigger. */
  snapshot() { return { kind: this.kind ?? null, age: this.fx?.t ?? 0, stopped: this.stopped, allocated: !!this.surface, renders: this.renders }; }
}
