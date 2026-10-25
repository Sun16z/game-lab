import Phaser from "phaser";
import { createRun, transitionRun, type GameRun } from "@game-lab/game-core";
import { createLocalScoreStorage } from "@game-lab/game-storage";
import type { GameEvent, GameEventName } from "@game-lab/game-analytics";
import { inputInstruction, mountHomeExit, standaloneAdapter, touchPointerQuery } from "@game-lab/platform-adapters";
import { getStreakPraise, getStreakPraiseCue } from "@game-lab/locale-voice";
import { copyShareLink, createScoreCard, downloadScoreCard, shareCardOrDownload, shareLink } from "@game-lab/game-share";
import { mountAudioControls } from "@game-lab/game-audio/ui";
import { createStackAudio } from "./audio";
import { chooseLanguage, translations, type Language } from "./i18n";
import { shareTranslations } from "./share-i18n";
import { progressCopy } from "./progress-i18n";
import { modeCopy } from "./mode-i18n";
import { advanceProgress, bestKeyForMode, isThemeUnlocked, loadMode, loadProgress, saveMode, saveProgress, themeThresholds, type Achievement, type Theme } from "./progress";
import { INITIAL_WIDTH, movingX, placeBlock, sceneryForLayer, speedForLayer, startPhaseForLayer, type Block, type GameMode } from "./rules";
import "./style.css";
import "@game-lab/game-audio/style.css";
import "@game-lab/platform-adapters/home-exit.css";

const WIDTH = 480;
const HEIGHT = 720;
const BLOCK_HEIGHT = 34;
const BASE_Y = 602;
const VERSION = "0.3.0";
const EVENT_KEY = "game-lab:session-events";

function element<T extends HTMLElement = HTMLElement>(id: string): T {
  const result = document.getElementById(id);
  if (!result) throw new Error(`Missing UI element: ${id}`);
  return result as T;
}

function safeStorage(): Storage | undefined {
  try { return window.localStorage; } catch { return undefined; }
}

function savedLanguage(): string | null {
  try { return safeStorage()?.getItem("game-lab:language") ?? null; } catch { return null; }
}

function sessionId(): string {
  try {
    const stored = window.sessionStorage.getItem("game-lab:session-id");
    if (stored) return stored;
    const created = crypto.randomUUID();
    window.sessionStorage.setItem("game-lab:session-id", created);
    return created;
  } catch { return crypto.randomUUID(); }
}

function recordEvent(event: GameEvent): void {
  // Local-only session log. No event is transmitted to a server in this release.
  try {
    const previous = JSON.parse(window.sessionStorage.getItem(EVENT_KEY) || "[]") as GameEvent[];
    const events = Array.isArray(previous) ? previous.slice(-199) : [];
    events.push(event);
    window.sessionStorage.setItem(EVENT_KEY, JSON.stringify(events));
  } catch { /* Storage can be disabled; play remains available. */ }
}

function drawStackArtwork(ctx: CanvasRenderingContext2D, theme: Theme): void {
  const colors = theme === "neon" ? ["#34e4e1", "#ff5fb7", "#c37aff", "#8affde"]
    : theme === "cosmos" ? ["#bdaaff", "#89b9ff", "#ffb9db", "#8ce0e7"]
      : ["#ffbd86", "#f58f83", "#e4799d", "#b882c8"];
  for (let index = 0; index < 9; index += 1) {
    const width = 390 - index * 12;
    const x = 540 - width / 2 + Math.sin(index * 1.8) * 9;
    const y = 710 - index * 43;
    ctx.fillStyle = colors[index % 4];
    ctx.beginPath();
    ctx.roundRect(x, y, width, 39, 7);
    ctx.fill();
  }
}

const PALETTES = [
    { background: 0x183442, blocks: [0xffbd86, 0xf58f83, 0xe4799d, 0xb882c8], accent: 0xffdf91 },
    { background: 0x173a3e, blocks: [0xa7e0bb, 0x6dc5ae, 0x5daeb8, 0x8baccb], accent: 0xf1de92 },
    { background: 0x2d304e, blocks: [0xecc6a2, 0xdca5ba, 0xbba3dc, 0x9bb3e3], accent: 0xffdf91 }
];
const THEME_PALETTES = {
  neon: { background: 0x181d3d, blocks: [0x34e4e1, 0xff5fb7, 0xc37aff, 0x8affde], accent: 0xfaf46c },
  cosmos: { background: 0x111830, blocks: [0xbdaaff, 0x89b9ff, 0xffb9db, 0x8ce0e7], accent: 0xffe9a8 }
} as const;

function paletteFor(seed: string, theme: Theme): { background: number; blocks: readonly number[]; accent: number } {
  if (theme !== "classic") return THEME_PALETTES[theme];
  const hash = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return PALETTES[hash % PALETTES.length];
}

type PlacedBlock = Block & { y: number; color: number };
type FallingPiece = Block & { y: number; color: number; direction: number; startedAt: number };
type Spark = { x: number; y: number; vx: number; vy: number; startedAt: number; color: number };

class StackScene extends Phaser.Scene {
  private graphics!: Phaser.GameObjects.Graphics;
  private run: GameRun = createRun("G001", crypto.randomUUID(), crypto.randomUUID());
  private progress = loadProgress(safeStorage());
  private runTheme: Theme = this.progress.selectedTheme;
  private palette = paletteFor(this.run.seed, this.runTheme);
  private readonly playerSessionId = sessionId();
  private readonly scoreStorage = createLocalScoreStorage(safeStorage());
  private blocks: PlacedBlock[] = [];
  private activeX = 16;
  private activeStartedAt = 0;
  private activeElapsed = 0;
  private score = 0;
  private combo = 0;
  private perfectDrops = 0;
  private bullseyes = 0;
  private repairCount = 0;
  private longestCombo = 0;
  private mode: GameMode = new URLSearchParams(location.search).get("mode") === "child" ? "child" : loadMode(safeStorage());
  private bestLayers = this.scoreStorage.getBest(bestKeyForMode(this.mode)) ?? 0;
  private recordCelebrated = false;
  private retryIndex = 0;
  private language: Language = chooseLanguage(new URLSearchParams(location.search).get("lang") ?? savedLanguage() ?? navigator.language);
  private voiceLocaleTag = new URLSearchParams(location.search).get("lang") ?? navigator.language;
  private readonly audio = createStackAudio(safeStorage());
  private audioControls?: ReturnType<typeof mountAudioControls>;
  private homeExit?: ReturnType<typeof mountHomeExit>;
  private toastTimer: number | undefined;
  private failedX: number | null = null;
  private lastResultWasBest = false;
  private lastResultBestBefore = 0;
  private feedbackStartedAt = 0;
  private feedbackPerfect = false;
  private feedbackBullseye = false;
  private fallingPieces: FallingPiece[] = [];
  private sparks: Spark[] = [];
  private lastGained: Achievement[] = [];
  private lastUnlocked: Theme[] = [];
  private readonly reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  private readonly touchPointer = touchPointerQuery();

  constructor() { super("perfect-stack"); }

  create(): void {
    this.graphics = this.add.graphics();
    this.homeExit = mountHomeExit(document.querySelector<HTMLElement>(".top-actions")!, this.language);
    this.touchPointer.addEventListener("change", () => this.applyLanguage());
    const select = element<HTMLSelectElement>("language-select");
    select.value = this.language;
    select.addEventListener("change", () => {
      this.language = chooseLanguage(select.value);
      this.voiceLocaleTag = this.language === "zh-Hant" ? navigator.language : this.language;
      try { window.localStorage.setItem("game-lab:language", this.language); } catch { /* optional */ }
      this.applyLanguage();
    });
    const modeSelect = element<HTMLSelectElement>("mode-select");
    modeSelect.value = this.mode;
    modeSelect.addEventListener("change", () => {
      this.mode = modeSelect.value === "child" ? "child" : "standard";
      this.bestLayers = this.scoreStorage.getBest(bestKeyForMode(this.mode)) ?? 0;
      saveMode(safeStorage(), this.mode);
      this.updateHud();
    });
    for (const id of ["ready-theme-select", "result-theme-select"]) {
      element<HTMLSelectElement>(id).addEventListener("change", (event) => {
        const theme = (event.target as HTMLSelectElement).value as Theme;
        if (!isThemeUnlocked(theme, this.progress.totalLayers)) return;
        this.progress.selectedTheme = theme;
        saveProgress(safeStorage(), this.progress);
        this.refreshThemeSelectors();
      });
    }
    element("start-button").addEventListener("click", () => this.startRun());
    element("retry-button").addEventListener("click", () => this.retry());
    element("share-card-button").addEventListener("click", () => void this.shareResultCard());
    element("download-card-button").addEventListener("click", () => void this.downloadResultCard());
    element("copy-link-button").addEventListener("click", () => void this.copyResultLink());
    element("pause-button").addEventListener("click", () => this.pause());
    element("resume-button").addEventListener("click", () => this.resume());
    this.audioControls = mountAudioControls(element<HTMLButtonElement>("sound-button"), this.audio, this.language);
    this.input.on("pointerdown", () => { if (this.run.state === "PLAYING") this.drop(); });
    window.addEventListener("keydown", (event) => {
      if (event.code !== "Space" || event.repeat) return;
      if (event.target instanceof HTMLElement && event.target.closest("button,select")) return;
      event.preventDefault();
      if (this.run.state === "READY") this.startRun();
      else if (this.run.state === "PLAYING") this.drop();
      else if (this.run.state === "RESULT") this.retry();
      else if (this.run.state === "PAUSED") this.resume();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && this.run.state === "PLAYING") this.pause();
    });
    this.resetTower();
    this.applyLanguage();
    this.updateHud();
    this.draw();
    this.emit("game_page_view", { source: window.self === window.top ? "standalone" : "portal" });
    this.emit("game_loaded", { source: window.self === window.top ? "standalone" : "portal" });
  }

  update(): void {
    if (this.run.state !== "PLAYING") return;
    this.activeElapsed = (performance.now() - this.activeStartedAt) / 1000;
    this.activeX = movingX(this.activeElapsed, this.currentTarget().width, speedForLayer(this.layers(), this.mode), this.fromRight(), startPhaseForLayer(this.layers(), this.run.seed));
    this.draw();
  }

  private layers(): number { return this.blocks.length - 1; }
  private currentTarget(): PlacedBlock { return this.blocks[this.blocks.length - 1]; }
  private fromRight(): boolean { return this.layers() % 2 === 1; }

  private resetTower(): void {
    this.runTheme = this.progress.selectedTheme;
    this.palette = paletteFor(this.run.seed, this.runTheme);
    const color = this.palette.blocks[0];
    this.blocks = [{ x: (WIDTH - INITIAL_WIDTH) / 2, width: INITIAL_WIDTH, y: BASE_Y, color }];
    this.activeElapsed = 0;
    this.activeX = movingX(0, INITIAL_WIDTH, speedForLayer(0, this.mode), false);
    this.score = 0;
    this.combo = 0;
    this.perfectDrops = 0;
    this.bullseyes = 0;
    this.repairCount = 0;
    this.longestCombo = 0;
    this.recordCelebrated = false;
    this.feedbackStartedAt = 0;
    this.feedbackPerfect = false;
    this.feedbackBullseye = false;
    this.fallingPieces = [];
    this.sparks = [];
    this.failedX = null;
    if (this.toastTimer) window.clearTimeout(this.toastTimer);
    element("toast").classList.add("hidden");
  }

  private startRun(): void {
    if (this.run.state !== "READY") return;
    this.audio.unlock();
    this.audio.resume();
    this.audio.music("main");
    this.resetTower();
    this.run = transitionRun(this.run, "PLAYING", new Date().toISOString());
    this.activeStartedAt = performance.now();
    this.emit("game_start", { seed: this.run.seed, retryIndex: this.retryIndex });
    standaloneAdapter.gameplayStart();
    element("ready-panel").classList.add("hidden");
    element("result-panel").classList.add("hidden");
    element("pause-panel").classList.add("hidden");
    element("pause-button").classList.remove("hidden");
    element("combo-chip").classList.remove("hidden");
    element("record-chip").classList.remove("hidden");
    this.updateHud();
    this.draw();
  }

  private drop(): void {
    if (this.run.state !== "PLAYING") return;
    this.activeElapsed = (performance.now() - this.activeStartedAt) / 1000;
    this.activeX = movingX(this.activeElapsed, this.currentTarget().width, speedForLayer(this.layers(), this.mode), this.fromRight(), startPhaseForLayer(this.layers(), this.run.seed));
    const moving = { x: this.activeX, width: this.currentTarget().width };
    const outcome = placeBlock(this.currentTarget(), moving, this.combo, this.mode);
    if (!outcome.success || !outcome.block) {
      this.failedX = this.activeX;
      this.finish("missed");
      return;
    }
    const activeY = BASE_Y - this.blocks.length * BLOCK_HEIGHT + Math.max(0, this.blocks.length - 9) * BLOCK_HEIGHT;
    if (outcome.removed && outcome.removed.width > 1 && !this.reducedMotion) {
      this.fallingPieces.push({
        ...outcome.removed, y: activeY, color: this.palette.accent,
        direction: outcome.removed.x < outcome.block.x ? -1 : 1,
        startedAt: performance.now()
      });
    }
    this.blocks.push({ ...outcome.block, y: BASE_Y - this.blocks.length * BLOCK_HEIGHT, color: this.palette.blocks[this.blocks.length % this.palette.blocks.length] });
    this.score += outcome.points;
    this.combo = outcome.combo;
    if (outcome.perfect) this.perfectDrops += 1;
    if (outcome.bullseye) this.bullseyes += 1;
    if (outcome.repairedPx > 0) this.repairCount += 1;
    this.longestCombo = Math.max(this.longestCombo, this.combo);
    this.feedbackStartedAt = performance.now();
    this.feedbackPerfect = outcome.perfect;
    this.feedbackBullseye = outcome.bullseye;
    if (!this.reducedMotion) {
      this.cameras.main.shake(outcome.bullseye ? 95 : 55, outcome.bullseye ? 0.003 : 0.0015);
      if (outcome.perfect) {
        const center = outcome.block.x + outcome.block.width / 2;
        const count = outcome.bullseye ? 18 : 10;
        for (let index = 0; index < count; index++) {
          const angle = (index / count) * Math.PI * 2;
          this.sparks.push({ x: center, y: activeY + 12, vx: Math.cos(angle) * (75 + (index % 3) * 28), vy: Math.sin(angle) * 65 - 55, startedAt: performance.now(), color: index % 2 ? this.palette.accent : 0xffffff });
        }
      }
    }
    this.activeElapsed = 0;
    this.activeStartedAt = performance.now();
    this.activeX = movingX(0, outcome.block.width, speedForLayer(this.layers(), this.mode), this.fromRight(), startPhaseForLayer(this.layers(), this.run.seed));
    this.updateHud();
    const t = translations[this.language];
    const justBeatRecord = this.bestLayers > 0 && !this.recordCelebrated && this.layers() > this.bestLayers;
    if (justBeatRecord) this.recordCelebrated = true;
    const streakMilestone = outcome.perfect && outcome.combo % 3 === 0;
    const praise = streakMilestone ? getStreakPraise(this.language, outcome.combo, this.voiceLocaleTag) : "";
    if (praise) void this.audio.say(getStreakPraiseCue(outcome.combo), this.voiceLocaleTag);
    const feedback = streakMilestone
      ? `${praise}\n${outcome.bullseye ? `${t.bullseye} ` : ""}+${outcome.points}${outcome.repairedPx > 0 ? ` · ${t.repair} +${outcome.repairedPx}px` : ""}`
      : outcome.bullseye ? `${t.bullseye} +${outcome.points}`
        : justBeatRecord ? t.newBest
          : outcome.perfect ? `${t.perfect} +${outcome.points}`
          : `${t.placed} · ${Math.round(outcome.deviationPx)}px · +${outcome.points}`;
    this.showToast(feedback, streakMilestone ? 1200 : 850, streakMilestone);
    this.playPlacementMelody(outcome.perfect, outcome.bullseye, this.layers());
    this.draw();
  }

  private finish(reason: string): void {
    if (this.run.state !== "PLAYING") return;
    this.audio.pause();
    this.audio.play("finish");
    this.run = transitionRun(this.run, "RESULT", new Date().toISOString());
    standaloneAdapter.gameplayStop();
    this.lastResultBestBefore = this.bestLayers;
    this.lastResultWasBest = this.layers() > this.bestLayers;
    if (this.lastResultWasBest) {
      this.bestLayers = this.layers();
      this.scoreStorage.saveBest(bestKeyForMode(this.mode), this.bestLayers);
    }
    const nextProgress = advanceProgress(this.progress, this.layers(), this.longestCombo);
    this.progress = nextProgress.progress;
    this.lastGained = nextProgress.gained;
    this.lastUnlocked = nextProgress.unlocked;
    saveProgress(safeStorage(), this.progress);
    this.emit("game_end", {
      reason, layers: this.layers(), score: this.score,
      perfectDrops: this.perfectDrops, bullseyes: this.bullseyes, repairs: this.repairCount, longestCombo: this.longestCombo,
      durationSeconds: Math.max(0, (Date.parse(this.run.endedAt!) - Date.parse(this.run.startedAt!)) / 1000)
    });
    element("pause-button").classList.add("hidden");
    element("result-panel").classList.remove("hidden");
    element("toast").classList.add("hidden");
    element("combo-chip").classList.add("hidden");
    element("record-chip").classList.add("hidden");
    this.updateHud();
    this.updateResult();
    this.draw();
  }

  private retry(): void {
    if (this.run.state !== "RESULT") return;
    this.emit("retry_click", { previousRunId: this.run.id });
    this.retryIndex += 1;
    this.run = createRun("G001", crypto.randomUUID(), crypto.randomUUID());
    element("share-status").textContent = "";
    this.startRun();
  }

  private resultShareLink(): string {
    const link = new URL(shareLink(location.href, this.language));
    if (this.mode === "child") link.searchParams.set("mode", "child");
    else link.searchParams.delete("mode");
    return link.toString();
  }

  private async shareResultCard(): Promise<void> {
    if (this.run.state !== "RESULT") return;
    const button = element<HTMLButtonElement>("share-card-button");
    button.disabled = true;
    const t = translations[this.language];
    const s = shareTranslations[this.language];
    try {
      const blob = await this.resultCardBlob();
      const result = await shareCardOrDownload(blob, "game-lab-perfect-stack.png", t.title, this.resultShareLink(), s.challenge(this.layers()));
      element("share-status").textContent = result === "downloaded" ? s.downloaded : "";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      element("share-status").textContent = s.shareFailed;
    } finally {
      button.disabled = false;
    }
  }

  private resultCardBlob(): Promise<Blob> {
    const t = translations[this.language];
    const s = shareTranslations[this.language];
    return createScoreCard({
      title: t.title, score: String(this.layers()), scoreLabel: t.unit,
      best: String(this.bestLayers), bestLabel: s.bestLabel,
      invitation: s.challenge(this.layers()), url: this.resultShareLink(), language: this.language,
      direction: this.language === "ar" ? "rtl" : "ltr", drawArtwork: (ctx) => drawStackArtwork(ctx, this.runTheme)
    });
  }

  private async downloadResultCard(): Promise<void> {
    if (this.run.state !== "RESULT") return;
    const s = shareTranslations[this.language];
    try {
      downloadScoreCard(await this.resultCardBlob(), "game-lab-perfect-stack.png");
      element("share-status").textContent = s.downloaded;
    } catch {
      element("share-status").textContent = s.shareFailed;
    }
  }

  private async copyResultLink(): Promise<void> {
    if (this.run.state !== "RESULT") return;
    const s = shareTranslations[this.language];
    try {
      await copyShareLink(this.resultShareLink());
      element("share-status").textContent = s.copied;
    } catch {
      element("share-status").textContent = s.shareFailed;
    }
  }

  private pause(): void {
    if (this.run.state !== "PLAYING") return;
    this.audio.pause();
    this.activeElapsed = (performance.now() - this.activeStartedAt) / 1000;
    this.run = transitionRun(this.run, "PAUSED", new Date().toISOString());
    standaloneAdapter.gameplayStop();
    element("pause-panel").classList.remove("hidden");
    element("pause-button").classList.add("hidden");
    element("combo-chip").classList.add("hidden");
    element("record-chip").classList.add("hidden");
  }

  private resume(): void {
    if (this.run.state !== "PAUSED") return;
    this.audio.resume();
    this.run = transitionRun(this.run, "PLAYING", new Date().toISOString());
    this.activeStartedAt = performance.now() - this.activeElapsed * 1000;
    standaloneAdapter.gameplayStart();
    element("pause-panel").classList.add("hidden");
    element("pause-button").classList.remove("hidden");
    this.updateProgressChips();
  }

  private emit(eventName: GameEventName, properties: GameEvent["properties"]): void {
    recordEvent({
      eventId: crypto.randomUUID(), eventName, gameId: "G001", runId: this.run.id,
      sessionId: this.playerSessionId, timestamp: new Date().toISOString(), gameVersion: VERSION, properties
    });
  }

  private updateHud(): void {
    element("layers").textContent = String(this.layers());
    element("score").textContent = this.score.toLocaleString(this.language);
    element("best").textContent = String(this.bestLayers);
    this.updateProgressChips();
  }

  private updateProgressChips(): void {
    const comboChip = element("combo-chip");
    const recordChip = element("record-chip");
    if (this.run.state !== "PLAYING") {
      comboChip.classList.add("hidden");
      recordChip.classList.add("hidden");
      return;
    }
    const t = translations[this.language];
    comboChip.textContent = `${t.perfect} ${this.combo % 3}/3`;
    recordChip.textContent = this.bestLayers === 0 ? t.recordFirst
      : this.layers() < this.bestLayers ? t.recordGap(this.bestLayers - this.layers())
        : this.layers() === this.bestLayers ? t.recordNext
          : t.recordAhead(this.layers() - this.bestLayers);
    comboChip.classList.remove("hidden");
    recordChip.classList.remove("hidden");
  }

  private updateResult(): void {
    const t = translations[this.language];
    const p = progressCopy[this.language];
    element("result-title").textContent = this.lastResultWasBest ? t.newBest : t.resultTitle;
    element("result-layers").textContent = String(this.layers());
    element("share-preview-score").textContent = `${this.layers()} ${t.unit}`;
    element("share-preview-invitation").textContent = shareTranslations[this.language].challenge(this.layers());
    element("result-summary").textContent = this.lastResultWasBest
      ? t.newBestSummary(this.bestLayers)
      : this.lastResultBestBefore > 0
        ? this.layers() === this.lastResultBestBefore
          ? t.bestTiedSummary(this.lastResultBestBefore)
          : t.bestSummary(this.lastResultBestBefore, Math.max(0, this.lastResultBestBefore - this.layers()))
        : t.noBest;
    const achievementNote = element("result-achievements");
    achievementNote.textContent = this.lastGained.length ? `${p.achievementLabel}：${this.lastGained.map((id) => p.achievements[id]).join("、")}` : "";
    achievementNote.classList.toggle("hidden", this.lastGained.length === 0);
    const unlockNote = element("result-unlocked");
    unlockNote.textContent = this.lastUnlocked.length ? p.unlocked(this.lastUnlocked.map((id) => p.themes[id]).join("、")) : "";
    unlockNote.classList.toggle("hidden", this.lastUnlocked.length === 0);
    this.refreshThemeSelectors();
  }

  private refreshThemeSelectors(): void {
    const p = progressCopy[this.language];
    for (const location of ["ready", "result"]) {
      const select = element<HTMLSelectElement>(`${location}-theme-select`);
      select.value = this.progress.selectedTheme;
      for (const option of Array.from(select.options)) {
        const theme = option.value as Theme;
        const threshold = themeThresholds[theme];
        option.disabled = !isThemeUnlocked(theme, this.progress.totalLayers);
        option.textContent = `${p.themes[theme]}${option.disabled ? ` · ${p.total(threshold)}` : ""}`;
      }
      element(`${location}-theme-label`).textContent = p.themeLabel;
      element(`${location}-total`).textContent = p.total(this.progress.totalLayers);
    }
  }

  private applyLanguage(): void {
    const t = translations[this.language];
    const s = shareTranslations[this.language];
    document.documentElement.lang = this.language;
    document.documentElement.dir = this.language === "ar" ? "rtl" : "ltr";
    document.title = `${t.title} | Game Lab`;
    element("game-canvas").setAttribute("aria-label", t.title);
    element("brand-title").textContent = `/ ${t.title}`;
    element("layers-label").textContent = t.layers;
    element("score-label").textContent = t.score;
    element("best-label").textContent = t.best;
    this.audioControls?.updateLanguage(this.language);
    this.homeExit?.updateLanguage(this.language);
    element("ready-pill").textContent = t.readyPill;
    element("ready-title").innerHTML = t.readyTitle;
    element("ready-description").textContent = inputInstruction(t.readyDescription, t.readyDescriptionTouch, this.touchPointer.matches);
    const mode = modeCopy[this.language];
    element("mode-label").textContent = mode.label;
    const modeSelect = element<HTMLSelectElement>("mode-select");
    modeSelect.options[0].textContent = mode.standard;
    modeSelect.options[1].textContent = mode.child;
    element("start-label").textContent = t.start;
    element("pause-pill").textContent = t.pausePill;
    element("pause-title").textContent = t.pauseTitle;
    element("resume-button").textContent = t.resume;
    element("result-pill").textContent = t.resultPill;
    element("result-unit").textContent = t.unit;
    element("retry-label").textContent = t.retry;
    element("share-card-button").textContent = s.shareCard;
    element("download-card-button").textContent = s.downloadCard;
    element("copy-link-button").textContent = s.copyLink;
    element("pause-button").textContent = t.pause;
    element("hint").textContent = inputInstruction(t.hint, t.hintTouch, this.touchPointer.matches);
    element("footer-text").textContent = t.footer;
    this.refreshThemeSelectors();
    this.updateHud();
    if (this.run.state === "RESULT") this.updateResult();
  }

  private showToast(message: string, duration: number, celebration: boolean): void {
    const toast = element("toast");
    toast.textContent = message;
    toast.classList.toggle("celebration", celebration);
    toast.classList.remove("hidden");
    if (this.toastTimer) window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => toast.classList.add("hidden"), duration);
  }

  private playPlacementMelody(perfect: boolean, bullseye: boolean, layers: number): void {
    const scale = [0, 2, 4, 7, 9];
    this.audio.play(bullseye ? "bullseye" : perfect ? "perfect" : "drop", scale[layers % scale.length]);
  }

  private draw(): void {
    const g = this.graphics;
    const palette = this.palette;
    const offset = Math.max(0, this.blocks.length - 9) * BLOCK_HEIGHT;
    const now = performance.now();
    const feedbackAge = now - this.feedbackStartedAt;
    const bounce = this.reducedMotion || feedbackAge >= 180 ? 0 : 7 * Math.sin(Math.PI * feedbackAge / 180);
    const scenery = sceneryForLayer(this.layers());
    g.clear();
    g.fillStyle(scenery === "space" ? 0x10162e : scenery === "sky" ? 0x245572 : palette.background, 1).fillRect(0, 0, WIDTH, HEIGHT);
    if (scenery === "sky") {
      g.fillStyle(0xe3f7f3, 0.09);
      for (let i = 0; i < 5; i++) g.fillRoundedRect((i * 137 + 45) % 490 - 25, 95 + i * 88, 145, 29, 15);
    } else {
      g.fillStyle(0xffffff, scenery === "space" ? 0.24 : 0.07);
      for (let i = 0; i < 28; i++) {
        const x = (i * 173 + 57) % WIDTH;
        const y = (i * 91 + 36) % 535;
        g.fillCircle(x, y, i % 4 === 0 ? 2 : 1);
      }
    }
    g.fillStyle(0xffffff, 0.045).fillRoundedRect(34, 116, 412, 502, 22);
    g.fillStyle(0x0b1e29, 0.5).fillRect(0, 647, WIDTH, 73);
    g.fillStyle(0xe4f3ef, 0.28).fillRect(0, 646, WIDTH, 2);
    if (this.bestLayers > 0 && this.run.state === "PLAYING") {
      const recordY = BASE_Y - this.bestLayers * BLOCK_HEIGHT + offset;
      if (recordY > 145 && recordY < 630) {
        g.lineStyle(2, palette.accent, 0.58).lineBetween(WIDTH - 83, recordY, WIDTH - 24, recordY);
        g.fillStyle(palette.accent, 0.9).fillCircle(WIDTH - 22, recordY, 4);
      }
    }
    for (let i = Math.max(0, this.blocks.length - 22); i < this.blocks.length; i++) {
      const block = this.blocks[i];
      const y = block.y + offset + bounce;
      if (y < -BLOCK_HEIGHT || y > HEIGHT) continue;
      g.fillStyle(0x071d29, 0.22).fillRoundedRect(block.x + 3, y + 5, block.width, BLOCK_HEIGHT, 5);
      g.fillStyle(block.color, 1).fillRoundedRect(block.x, y, block.width, BLOCK_HEIGHT - 2, 5);
      g.fillStyle(0xffffff, 0.18).fillRoundedRect(block.x + 5, y + 4, Math.max(0, block.width - 10), 5, 3);
      if (this.feedbackPerfect && i === this.blocks.length - 1 && feedbackAge < 280 && !this.reducedMotion) {
        g.fillStyle(this.feedbackBullseye ? palette.accent : 0xffffff, 0.5 * (1 - feedbackAge / 280)).fillRoundedRect(block.x, y, block.width, BLOCK_HEIGHT - 2, 5);
      }
    }
    this.fallingPieces = this.fallingPieces.filter((piece) => now - piece.startedAt < 420);
    for (const piece of this.fallingPieces) {
      const progress = (now - piece.startedAt) / 420;
      g.fillStyle(piece.color, 1 - progress).fillRoundedRect(
        piece.x + piece.direction * 28 * progress,
        piece.y + 190 * progress * progress,
        piece.width,
        BLOCK_HEIGHT - 2,
        4
      );
    }
    this.sparks = this.sparks.filter((spark) => now - spark.startedAt < 480);
    for (const spark of this.sparks) {
      const age = (now - spark.startedAt) / 1000;
      g.fillStyle(spark.color, 1 - age / 0.48).fillCircle(spark.x + spark.vx * age, spark.y + spark.vy * age + 260 * age * age, 3 * (1 - age / 0.48));
    }
    const activeY = BASE_Y - this.blocks.length * BLOCK_HEIGHT + offset;
    if (this.run.state !== "RESULT") {
      g.lineStyle(1, 0xffffff, 0.18).lineBetween(24, activeY + BLOCK_HEIGHT + 4, WIDTH - 24, activeY + BLOCK_HEIGHT + 4);
      g.fillStyle(palette.accent, 1).fillRoundedRect(this.activeX, activeY, this.currentTarget().width, BLOCK_HEIGHT - 2, 5);
      g.fillStyle(0xffffff, 0.25).fillRoundedRect(this.activeX + 5, activeY + 4, Math.max(0, this.currentTarget().width - 10), 5, 3);
    } else if (this.failedX !== null) {
      g.fillStyle(0xff697b, 0.75).fillRoundedRect(this.failedX, activeY, this.currentTarget().width, BLOCK_HEIGHT - 2, 5);
    }
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game-canvas",
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: "#183442",
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: StackScene,
  render: { antialias: true }
});

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => undefined);
  });
}
