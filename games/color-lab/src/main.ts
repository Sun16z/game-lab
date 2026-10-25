import { createRun, transitionRun, type GameRun } from "@game-lab/game-core";
import type { GameEvent, GameEventName } from "@game-lab/game-analytics";
import { inputInstruction, standaloneAdapter, touchPointerQuery } from "@game-lab/platform-adapters";
import { copyShareLink, createScoreCard, downloadScoreCard, shareCardOrDownload, shareLink } from "@game-lab/game-share";
import { mountAudioControls } from "@game-lab/game-audio/ui";
import { createColorAudio } from "./audio";
import { chooseLanguage, translations, type Language } from "./i18n";
import { applyMove, cloneBoard, isSolved, legalMove, LEVELS, solve, starsFor, type Board } from "./rules";
import "./style.css";
import "@game-lab/game-audio/style.css";

const VERSION = "0.1.0";
const PROGRESS_KEY = "game-lab:color-lab:progress";
const EVENT_KEY = "game-lab:session-events";
const symbols = ["●", "▲", "◆"] as const;

function element<T extends HTMLElement = HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Missing element: ${id}`);
  return found as T;
}
function safeStorage(): Storage | undefined { try { return localStorage; } catch { return undefined; } }
function savedLanguage(): string | null { try { return safeStorage()?.getItem("game-lab:language") ?? null; } catch { return null; } }
function sessionId(): string {
  try {
    const stored = sessionStorage.getItem("game-lab:session-id");
    if (stored) return stored;
    const id = crypto.randomUUID();
    sessionStorage.setItem("game-lab:session-id", id);
    return id;
  } catch { return crypto.randomUUID(); }
}
function recordEvent(event: GameEvent): void {
  try {
    const previous = JSON.parse(sessionStorage.getItem(EVENT_KEY) || "[]") as unknown;
    const events = Array.isArray(previous) ? previous.slice(-199) as GameEvent[] : [];
    events.push(event);
    sessionStorage.setItem(EVENT_KEY, JSON.stringify(events));
  } catch { /* Local-only telemetry is optional. */ }
}
function readBest(): (number | null)[] {
  try {
    const value = JSON.parse(safeStorage()?.getItem(PROGRESS_KEY) ?? "null") as unknown;
    if (!Array.isArray(value)) return Array(LEVELS.length).fill(null);
    return Array.from({ length: LEVELS.length }, (_, index) => typeof value[index] === "number" && Number.isInteger(value[index]) && value[index] > 0 ? value[index] : null);
  } catch { return Array(LEVELS.length).fill(null); }
}
function storeBest(best: (number | null)[]): void { try { safeStorage()?.setItem(PROGRESS_KEY, JSON.stringify(best)); } catch { /* Play continues without storage. */ } }
function incomingChallenge(): { level: number; moves: number } | null {
  const params = new URLSearchParams(location.search);
  const level = Number(params.get("level"));
  const moves = Number(params.get("challenge"));
  return Number.isInteger(level) && level >= 1 && level <= LEVELS.length && Number.isInteger(moves) && moves >= 1 && moves <= 999 ? { level, moves } : null;
}
function paintCard(ctx: CanvasRenderingContext2D): void {
  const colors = ["#f18d9c", "#f6c66e", "#9ca9ee"];
  for (let tube = 0; tube < 3; tube++) {
    const x = 335 + tube * 145;
    ctx.strokeStyle = "#d9fff1";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(x - 42, 365); ctx.lineTo(x - 42, 640); ctx.quadraticCurveTo(x - 42, 665, x - 16, 665); ctx.lineTo(x + 16, 665); ctx.quadraticCurveTo(x + 42, 665, x + 42, 640); ctx.lineTo(x + 42, 365); ctx.stroke();
    ctx.fillStyle = colors[tube];
    ctx.fillRect(x - 36, 390, 72, 263);
    ctx.fillStyle = "#17404b";
    ctx.font = "bold 54px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(symbols[tube], x, 550);
  }
}

class ColorLabGame {
  private readonly playerSessionId = sessionId();
  private language: Language = chooseLanguage(new URLSearchParams(location.search).get("lang") ?? savedLanguage() ?? navigator.language);
  private readonly challenge = incomingChallenge();
  private levelIndex = this.challenge ? this.challenge.level - 1 : 0;
  private run: GameRun = this.newRun();
  private board: Board = cloneBoard(LEVELS[this.levelIndex].tubes);
  private history: Board[] = [];
  private moves = 0;
  private selected: number | null = null;
  private hintMove: { source: number; target: number } | null = null;
  private best = readBest();
  private readonly audio = createColorAudio(safeStorage());
  private audioControls?: ReturnType<typeof mountAudioControls>;
  private levelWasPlaying = false;
  private readonly touchPointer = touchPointerQuery();

  init(): void {
    this.touchPointer.addEventListener("change", () => this.applyLanguage());
    const languageSelect = element<HTMLSelectElement>("language-select");
    languageSelect.value = this.language;
    languageSelect.addEventListener("change", () => {
      this.language = chooseLanguage(languageSelect.value);
      try { safeStorage()?.setItem("game-lab:language", this.language); } catch { /* Optional. */ }
      this.applyLanguage();
      this.render();
    });
    this.audioControls = mountAudioControls(element<HTMLButtonElement>("sound-button"), this.audio, this.language);
    element("start-button").addEventListener("click", () => this.start());
    element("pause-button").addEventListener("click", () => this.pause());
    element("resume-button").addEventListener("click", () => this.resume());
    element("undo-button").addEventListener("click", () => this.undo());
    element("hint-button").addEventListener("click", () => this.hint());
    element("restart-button").addEventListener("click", () => this.restart());
    element("level-button").addEventListener("click", () => this.openLevelPicker());
    element("level-close").addEventListener("click", () => this.closeLevelPicker());
    element("replay-button").addEventListener("click", () => this.restart());
    element("next-button").addEventListener("click", () => this.nextLevel());
    element("share-button").addEventListener("click", () => void this.share());
    element("download-button").addEventListener("click", () => void this.download());
    element("copy-button").addEventListener("click", () => void this.copy());
    document.addEventListener("keydown", (event) => this.onKeydown(event));
    document.addEventListener("visibilitychange", () => { if (document.hidden) this.pause(); });
    this.applyLanguage();
    this.render();
    this.showReady();
    this.emit("game_page_view");
    this.emit("game_loaded");
  }

  private newRun(): GameRun { return createRun("G003", `level-${this.levelIndex + 1}`, crypto.randomUUID()); }
  private emit(eventName: GameEventName, properties: GameEvent["properties"] = {}): void {
    recordEvent({ eventId: crypto.randomUUID(), eventName, gameId: "G003", runId: this.run.id, sessionId: this.playerSessionId, timestamp: new Date().toISOString(), gameVersion: VERSION, properties });
  }
  private get t() { return translations[this.language]; }
  private unlocked(): number {
    let next = 0;
    while (next < this.best.length && this.best[next] !== null) next++;
    return Math.min(LEVELS.length - 1, next);
  }
  private text(id: string, value: string): void { element(id).textContent = value; }
  private feedback(message: string): void { this.text("feedback", message); }

  private applyLanguage(): void {
    const t = this.t;
    document.documentElement.lang = this.language;
    document.documentElement.dir = this.language === "ar" ? "rtl" : "ltr";
    element("tubes").setAttribute("aria-label", t.title);
    document.querySelector(".lab")?.setAttribute("aria-label", t.title);
    document.title = `${t.title}｜Game Lab`;
    this.text("brand-title", `/ ${t.title}`);
    this.text("title", t.title); this.text("tagline", t.tagline);
    this.text("level-label", t.level); this.text("moves-label", t.moves); this.text("best-label", t.best); this.text("goal-label", t.goal);
    this.text("select-label", t.select); this.text("undo-label", t.undo); this.text("hint-label", t.hint); this.text("restart-label", t.restart); this.text("pause-label", t.pause);
    this.text("ready-title", t.tagline); this.text("ready-description", t.intro); this.text("start-button", `${t.start} →`);
    this.text("pause-title", t.pause); this.text("resume-button", t.resume); this.text("level-select-title", t.select);
    this.text("result-title", t.solved); this.text("next-button", `${t.next} →`); this.text("replay-button", t.replay);
    this.text("share-button", t.share); this.text("download-button", t.download); this.text("copy-button", t.copy);
    this.text("footer", t.footer);
    document.querySelector<HTMLElement>(".keyboard-hint")!.textContent = inputInstruction("1–5 · U · H · Esc", t.touchHint, this.touchPointer.matches);
    this.audioControls?.updateLanguage(this.language);
    if (this.run.state === "READY" || this.run.state === "PLAYING") this.feedback(this.selected === null ? t.selectSource : t.selectTarget);
    if (this.run.state === "RESULT") this.renderResult();
    if (this.challenge && this.levelIndex === this.challenge.level - 1) {
      this.text("challenge-intro", t.challengeIntro(this.challenge.level, this.challenge.moves));
      element("challenge-intro").classList.remove("hidden");
    } else element("challenge-intro").classList.add("hidden");
  }

  private render(): void {
    this.text("level-value", String(this.levelIndex + 1).padStart(2, "0") + " /30");
    this.text("moves-value", String(this.moves));
    this.text("goal-value", String(LEVELS[this.levelIndex].optimal));
    this.text("best-value", this.best[this.levelIndex] === null ? "—" : String(this.best[this.levelIndex]));
    this.text("ready-level", `${this.t.level} ${String(this.levelIndex + 1).padStart(2, "0")} / 30`);
    this.text("result-level", `${this.t.level} ${String(this.levelIndex + 1).padStart(2, "0")}`);
    const holder = element("tubes");
    holder.replaceChildren();
    for (let index = 0; index < this.board.length; index++) {
      const tube = this.board[index];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tube-button";
      if (this.selected === index) button.classList.add("selected");
      if (this.hintMove?.source === index) button.classList.add("hint-source");
      if (this.hintMove?.target === index) button.classList.add("hint-target");
      button.setAttribute("aria-pressed", String(this.selected === index));
      button.setAttribute("aria-label", `${index + 1} · ${tube.length}/${4} · ${tube.map((color) => symbols[color]).join(" ")}`);
      button.addEventListener("click", () => this.chooseTube(index));
      const glass = document.createElement("span"); glass.className = "glass";
      for (const color of tube) {
        const segment = document.createElement("span");
        segment.className = `segment color-${color}`;
        segment.textContent = symbols[color];
        glass.append(segment);
      }
      const shine = document.createElement("span"); shine.className = "glass-shine";
      glass.append(shine);
      const number = document.createElement("span"); number.className = "tube-index"; number.textContent = String(index + 1);
      button.append(glass, number);
      holder.append(button);
    }
    element<HTMLButtonElement>("undo-button").disabled = this.run.state !== "PLAYING" || this.history.length === 0;
    element<HTMLButtonElement>("hint-button").disabled = this.run.state !== "PLAYING";
    element<HTMLButtonElement>("restart-button").disabled = this.run.state !== "PLAYING";
  }

  private showReady(): void {
    for (const id of ["pause-panel", "result-panel", "level-panel"]) element(id).classList.add("hidden");
    element("ready-panel").classList.remove("hidden");
    this.text("ready-level", `${this.t.level} ${String(this.levelIndex + 1).padStart(2, "0")} / 30`);
    this.applyLanguage();
  }
  private start(): void {
    if (this.run.state !== "READY") return;
    this.audio.unlock(); this.audio.resume(); this.audio.music("main");
    this.run = transitionRun(this.run, "PLAYING", new Date().toISOString());
    standaloneAdapter.gameplayStart();
    element("ready-panel").classList.add("hidden");
    this.emit("game_start", { level: this.levelIndex + 1 });
    this.emit("level_start", { level: this.levelIndex + 1 });
    this.feedback(this.t.selectSource);
    this.render();
  }
  private chooseTube(index: number): void {
    if (this.run.state !== "PLAYING" || !element("level-panel").classList.contains("hidden")) return;
    if (this.selected === null) {
      if (this.board[index].length === 0) { this.feedback(this.t.selectSource); this.audio.play("invalid"); return; }
      this.selected = index;
      this.hintMove = null;
      this.feedback(this.t.selectTarget);
      this.audio.play("select");
      this.render();
      return;
    }
    if (this.selected === index) { this.selected = null; this.feedback(this.t.selectSource); this.render(); return; }
    const move = legalMove(this.board, this.selected, index);
    if (!move) {
      this.feedback(this.t.invalid);
      this.audio.play("invalid");
      if (this.board[index].length) this.selected = index;
      this.render();
      return;
    }
    this.history.push(cloneBoard(this.board));
    this.board = applyMove(this.board, move);
    this.moves++;
    this.selected = null;
    this.hintMove = null;
    this.audio.play("pour", this.moves % 5);
    this.feedback(this.t.selectSource);
    this.render();
    if (isSolved(this.board)) this.complete();
  }
  private undo(): void {
    if (this.run.state !== "PLAYING") return;
    const previous = this.history.pop();
    if (!previous) { this.feedback(this.t.undoEmpty); return; }
    this.board = previous; this.moves--; this.selected = null; this.hintMove = null;
    this.feedback(this.t.selectSource); this.audio.play("undo"); this.render();
  }
  private hint(): void {
    if (this.run.state !== "PLAYING") return;
    const move = solve(this.board)?.first;
    if (!move) { this.feedback(this.t.noHint); this.audio.play("invalid"); return; }
    this.hintMove = move; this.selected = null;
    this.feedback(this.t.hintText(move.source + 1, move.target + 1));
    this.audio.play("hint"); this.render();
  }
  private pause(): void {
    if (this.run.state !== "PLAYING") return;
    this.run = transitionRun(this.run, "PAUSED", new Date().toISOString());
    standaloneAdapter.gameplayStop(); this.audio.pause();
    element("pause-panel").classList.remove("hidden");
    this.render();
  }
  private resume(): void {
    if (this.run.state !== "PAUSED") return;
    this.run = transitionRun(this.run, "PLAYING", new Date().toISOString());
    standaloneAdapter.gameplayStart(); this.audio.resume();
    element("pause-panel").classList.add("hidden");
    this.render();
  }
  private closeRun(reason: string): void {
    if (this.run.state !== "PLAYING" && this.run.state !== "PAUSED") return;
    if (this.run.state === "PLAYING") standaloneAdapter.gameplayStop();
    this.audio.pause();
    this.run = transitionRun(this.run, "RESULT", new Date().toISOString());
    this.emit("game_end", { level: this.levelIndex + 1, moves: this.moves, reason });
  }
  private complete(): void {
    this.closeRun("completed");
    const prior = this.best[this.levelIndex];
    if (prior === null || this.moves < prior) { this.best[this.levelIndex] = this.moves; storeBest(this.best); }
    this.emit("level_complete", { level: this.levelIndex + 1, moves: this.moves, stars: starsFor(this.moves, LEVELS[this.levelIndex].optimal) });
    this.audio.play("win");
    this.renderResult();
    element("result-panel").classList.remove("hidden");
    this.render();
  }
  private renderResult(): void {
    const optimal = LEVELS[this.levelIndex].optimal;
    const stars = starsFor(this.moves, optimal);
    this.text("result-stars", "★".repeat(stars) + "☆".repeat(3 - stars));
    element("result-stars").setAttribute("aria-label", `${stars}/3`);
    this.text("result-description", this.t.result(this.moves, optimal));
    this.text("share-preview-number", String(this.moves));
    this.text("share-preview-copy", `${this.t.level} ${this.levelIndex + 1} · ${this.t.moves} ${this.moves}`);
    element<HTMLButtonElement>("next-button").classList.toggle("hidden", this.levelIndex === LEVELS.length - 1);
  }
  private restart(): void {
    if (this.run.state === "READY") return;
    this.emit("retry_click", { level: this.levelIndex + 1 });
    this.closeRun("restart");
    this.resetLevel(this.levelIndex);
    this.start();
  }
  private nextLevel(): void {
    if (this.run.state !== "RESULT" || this.levelIndex >= LEVELS.length - 1) return;
    this.resetLevel(this.levelIndex + 1);
    this.start();
  }
  private resetLevel(index: number): void {
    this.levelIndex = index;
    this.board = cloneBoard(LEVELS[index].tubes);
    this.history = []; this.moves = 0; this.selected = null; this.hintMove = null;
    this.run = this.newRun();
    this.render(); this.showReady();
  }
  private openLevelPicker(): void {
    this.levelWasPlaying = this.run.state === "PLAYING";
    if (this.levelWasPlaying) this.pause();
    const grid = element("level-grid"); grid.replaceChildren();
    for (let index = 0; index < LEVELS.length; index++) {
      const button = document.createElement("button"); button.type = "button";
      button.textContent = String(index + 1);
      button.title = index > this.unlocked() && index !== this.levelIndex ? this.t.locked : `${this.t.level} ${index + 1}${this.best[index] !== null ? ` · ${this.t.levelDone}` : ""}`;
      button.disabled = index > this.unlocked() && index !== this.levelIndex;
      button.classList.toggle("completed", this.best[index] !== null);
      button.classList.toggle("current", index === this.levelIndex);
      button.addEventListener("click", () => {
        if (this.run.state === "PLAYING" || this.run.state === "PAUSED") this.closeRun("level_change");
        this.levelWasPlaying = false;
        this.resetLevel(index);
      });
      grid.append(button);
    }
    this.text("level-message", "");
    element("level-panel").classList.remove("hidden");
  }
  private closeLevelPicker(): void {
    element("level-panel").classList.add("hidden");
    if (this.levelWasPlaying) this.resume();
    this.levelWasPlaying = false;
  }
  private onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)) return;
    if (event.key === "Escape") {
      if (!element("level-panel").classList.contains("hidden")) this.closeLevelPicker();
      else if (this.run.state === "PLAYING") this.pause();
      else if (this.run.state === "PAUSED") this.resume();
      return;
    }
    if (this.run.state !== "PLAYING") return;
    if (/^[1-5]$/.test(event.key)) { event.preventDefault(); this.chooseTube(Number(event.key) - 1); }
    else if (event.key.toLowerCase() === "u" || event.key.toLowerCase() === "z" && (event.ctrlKey || event.metaKey)) { event.preventDefault(); this.undo(); }
    else if (event.key.toLowerCase() === "h") { event.preventDefault(); this.hint(); }
  }
  private resultLink(): string {
    const url = new URL(shareLink(location.href, this.language));
    url.searchParams.set("level", String(this.levelIndex + 1));
    url.searchParams.set("challenge", String(this.moves));
    return url.toString();
  }
  private async card(): Promise<Blob> {
    return createScoreCard({ title: this.t.title, score: String(this.moves), scoreLabel: `${this.t.level} ${this.levelIndex + 1} · ${this.t.moves}`, best: String(this.best[this.levelIndex] ?? this.moves), bestLabel: this.t.best, invitation: this.t.challenge(this.levelIndex + 1, this.moves), url: this.resultLink(), language: this.language, direction: this.language === "ar" ? "rtl" : "ltr", accent: "#f9d781", drawArtwork: paintCard });
  }
  private async share(): Promise<void> {
    if (this.run.state !== "RESULT") return;
    try {
      const outcome = await shareCardOrDownload(await this.card(), `color-lab-level-${this.levelIndex + 1}.png`, this.t.title, this.resultLink(), this.t.challenge(this.levelIndex + 1, this.moves));
      if (outcome === "downloaded") this.text("share-status", this.t.downloaded);
    } catch { this.text("share-status", this.t.shareFailed); }
  }
  private async download(): Promise<void> {
    if (this.run.state !== "RESULT") return;
    try { downloadScoreCard(await this.card(), `color-lab-level-${this.levelIndex + 1}.png`); this.text("share-status", this.t.downloaded); }
    catch { this.text("share-status", this.t.shareFailed); }
  }
  private async copy(): Promise<void> {
    if (this.run.state !== "RESULT") return;
    try { await copyShareLink(this.resultLink()); this.text("share-status", this.t.copied); }
    catch { this.text("share-status", this.t.shareFailed); }
  }
}

new ColorLabGame().init();
