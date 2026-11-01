/** Independent input adapter: releasing or cancellation never leaves a direction stuck. */
export class SnowInput {
  private left = new Set<string>();
  private right = new Set<string>();
  private jumpQueued = false;
  set(direction: 'left' | 'right', source: string, down: boolean): void {
    const set = direction === 'left' ? this.left : this.right;
    if (down) set.add(source); else set.delete(source);
  }
  jump(): void { this.jumpQueued = true; }
  read(): { steer: -1 | 0 | 1; jump: boolean } {
    const steer = (Number(this.right.size > 0) - Number(this.left.size > 0)) as -1 | 0 | 1;
    const jump = this.jumpQueued; this.jumpQueued = false;
    return { steer, jump };
  }
  clear(): void { this.left.clear(); this.right.clear(); this.jumpQueued = false; }
}
