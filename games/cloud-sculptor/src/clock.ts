/** Monotonic elapsed time. A hidden page or reading overlay cannot spend a player's time. */
export class ServiceClock {
    remaining: number | null = null;
    private last = 0;
    start(seconds: number | null, now: number) { this.remaining = seconds; this.last = now; }
    tick(now: number, running: boolean): boolean { const delta = Math.max(0, Math.min(1, (now - this.last) / 1000)); this.last = now; if (running && this.remaining !== null) {
        this.remaining = Math.max(0, this.remaining - delta);
        return this.remaining === 0;
    } return false; }
}
