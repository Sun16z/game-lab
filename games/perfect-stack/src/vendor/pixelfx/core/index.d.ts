export interface Frame { w: number; h: number; ox: number; oy: number; color: Uint32Array; light: Uint32Array }
export interface Fx { readonly t: number; update(dt: number): void; draw(frame: Frame): void; stop(): void; done(): boolean }
export interface EffectModule { meta: { duration: number; loop: boolean } }
export function createFrame(w: number, h: number): Frame;
export function clearFrame(frame: Frame): Frame;
export function createFx(module: EffectModule, options: { x: number; y: number; seed: number; palette: readonly string[]; light: number }): Fx;
export function composite(frame: Frame, out: Uint8ClampedArray, background: null): Uint8ClampedArray;
