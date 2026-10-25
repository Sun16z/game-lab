import { createRun, transitionRun, type GameRun } from "@game-lab/game-core";
import { createLocalScoreStorage } from "@game-lab/game-storage";
import type { GameEvent, GameEventName } from "@game-lab/game-analytics";
import { inputInstruction, mountHomeExit, standaloneAdapter, touchPointerQuery } from "@game-lab/platform-adapters";
import { getStreakPraise, getStreakPraiseCue } from "@game-lab/locale-voice";
import { copyShareLink, createScoreCard, downloadScoreCard, shareCardOrDownload, shareLink } from "@game-lab/game-share";
import { mountAudioControls } from "@game-lab/game-audio/ui";
import { createMonsterAudio } from "./audio";
import { chooseLanguage, translations, type Language } from "./i18n";
import { answerQuestion, createQuestionStream, initialBattleState, ROUND_SECONDS, type BattleState, type Question } from "./rules";
import { loadReview, saveReview } from "./review";
import "./style.css";
import "@game-lab/game-audio/style.css";
import "@game-lab/platform-adapters/home-exit.css";

const VERSION = "0.1.0";
const EVENT_KEY = "game-lab:session-events";

function element<T extends HTMLElement = HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Missing element: ${id}`);
  return found as T;
}

function safeStorage(): Storage | undefined {
  try { return window.localStorage; } catch { return undefined; }
}

function savedLanguage(): string | null {
  try { return safeStorage()?.getItem("game-lab:language") ?? null; } catch { return null; }
}

function sessionId(): string {
  try {
    const stored = sessionStorage.getItem("game-lab:session-id");
    if (stored) return stored;
    const created = crypto.randomUUID();
    sessionStorage.setItem("game-lab:session-id", created);
    return created;
  } catch { return crypto.randomUUID(); }
}

function recordEvent(event: GameEvent): void {
  try {
    const previous = JSON.parse(sessionStorage.getItem(EVENT_KEY) || "[]") as unknown;
    const events = Array.isArray(previous) ? previous.slice(-199) as GameEvent[] : [];
    events.push(event);
    sessionStorage.setItem(EVENT_KEY, JSON.stringify(events));
  } catch { /* Local event logging is optional. */ }
}

function drawMonsterCard(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "#b9edc7";
  ctx.beginPath();
  ctx.ellipse(540, 535, 180, 165, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#85d7ac";
  ctx.beginPath();
  ctx.moveTo(420, 420); ctx.lineTo(390, 315); ctx.lineTo(470, 380); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(660, 420); ctx.lineTo(690, 315); ctx.lineTo(610, 380); ctx.fill();
  ctx.fillStyle = "#251c45";
  ctx.beginPath(); ctx.ellipse(480, 520, 15, 22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(600, 520, 15, 22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#251c45"; ctx.lineWidth = 10; ctx.lineCap = "round";
  ctx.beginPath(); ctx.arc(540, 555, 35, 0.1, Math.PI - 0.1); ctx.stroke();
}

class MonsterMathGame {
  private run: GameRun = createRun("G002", crypto.randomUUID(), crypto.randomUUID());
  private readonly playerSessionId = sessionId();
  private readonly scoreStorage = createLocalScoreStorage(safeStorage());
  private language: Language = chooseLanguage(new URLSearchParams(location.search).get("lang") ?? savedLanguage() ?? navigator.language);
  private voiceLocaleTag = new URLSearchParams(location.search).get("lang") ?? navigator.language;
  private battle: BattleState = initialBattleState();
  private bestDefeated = this.scoreStorage.getBest("G002:defeated") ?? 0;
  private lastResultBest = false;
  private reviewKeys = new Set(loadReview(safeStorage()));
  private nextQuestion = createQuestionStream(this.run.seed, [...this.reviewKeys]);
  private currentQuestion: Question = this.nextQuestion();
  private remainingMs = ROUND_SECONDS * 1000;
  private deadline = 0;
  private animationFrame = 0;
  private answerLocked = false;
  private retryIndex = 0;
  private readonly audio = createMonsterAudio(safeStorage());
  private audioControls?: ReturnType<typeof mountAudioControls>;
  private homeExit?: ReturnType<typeof mountHomeExit>;
  private readonly reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  private readonly touchPointer = touchPointerQuery();
  private readonly incomingChallenge = (() => {
    const value = new URLSearchParams(location.search).get("challenge");
    return value && /^(0|[1-9]\d{0,3})$/.test(value) ? Number(value) : null;
  })();

  init(): void {
    this.homeExit = mountHomeExit(document.querySelector<HTMLElement>(".top-actions")!, this.language);
    this.touchPointer.addEventListener("change", () => this.applyLanguage());
    const languageSelect = element<HTMLSelectElement>("language-select");
    languageSelect.value = this.language;
    languageSelect.addEventListener("change", () => {
      this.language = chooseLanguage(languageSelect.value);
      this.voiceLocaleTag = this.language === "zh-Hant" ? navigator.language : this.language;
      try { safeStorage()?.setItem("game-lab:language", this.language); } catch { /* Optional preference. */ }
      this.applyLanguage();
    });
    this.audioControls = mountAudioControls(element<HTMLButtonElement>("sound-button"), this.audio, this.language);
    element("start-button").addEventListener("click", () => this.start());
    element("retry-button").addEventListener("click", () => this.retry());
    element("pause-button").addEventListener("click", () => this.pause());
    element("resume-button").addEventListener("click", () => this.resume());
    element("share-button").addEventListener("click", () => void this.shareResult());
    element("download-button").addEventListener("click", () => void this.downloadResult());
    element("copy-button").addEventListener("click", () => void this.copyLink());
    for (const button of this.answerButtons()) {
      button.addEventListener("click", () => this.answer(Number(button.dataset.answer)));
    }
    window.addEventListener("keydown", (event) => {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.target instanceof HTMLElement && event.target.closest("select,input,textarea")) return;
      if (/^[1-4]$/.test(event.key) && this.run.state === "PLAYING") {
        event.preventDefault();
        this.answer(Number(event.key) - 1);
      } else if (event.code === "KeyP") {
        if (this.run.state === "PLAYING") this.pause();
        else if (this.run.state === "PAUSED") this.resume();
      } else if (event.code === "Space" && !(event.target instanceof HTMLElement && event.target.closest("button"))) {
        event.preventDefault();
        if (this.run.state === "READY") this.start();
        else if (this.run.state === "RESULT") this.retry();
        else if (this.run.state === "PAUSED") this.resume();
      }
    });
    document.addEventListener("visibilitychange", () => { if (document.hidden) this.pause(); });
    this.applyLanguage();
    this.renderQuestion();
    this.renderBattle();
    this.emit("game_page_view", { source: window.self === window.top ? "standalone" : "portal" });
    this.emit("game_loaded", { source: window.self === window.top ? "standalone" : "portal" });
  }

  private answerButtons(): HTMLButtonElement[] {
    return Array.from(document.querySelectorAll<HTMLButtonElement>("#answers button"));
  }

  private emit(eventName: GameEventName, properties: GameEvent["properties"]): void {
    recordEvent({ eventId: crypto.randomUUID(), eventName, gameId: "G002", runId: this.run.id,
      sessionId: this.playerSessionId, timestamp: new Date().toISOString(), gameVersion: VERSION, properties });
  }

  private start(): void {
    if (this.run.state !== "READY") return;
    this.audio.unlock();
    this.audio.resume();
    this.audio.music("main");
    this.battle = initialBattleState();
    this.reviewKeys = new Set(loadReview(safeStorage()));
    this.nextQuestion = createQuestionStream(this.run.seed, [...this.reviewKeys]);
    this.currentQuestion = this.nextQuestion();
    this.remainingMs = ROUND_SECONDS * 1000;
    this.answerLocked = false;
    this.run = transitionRun(this.run, "PLAYING", new Date().toISOString());
    this.deadline = performance.now() + this.remainingMs;
    element("ready-panel").classList.add("hidden");
    element("pause-panel").classList.add("hidden");
    element("result-panel").classList.add("hidden");
    element("pause-button").classList.remove("hidden");
    this.showFeedback("");
    this.renderQuestion();
    this.renderBattle();
    this.renderHud();
    this.emit("game_start", { seed: this.run.seed, retryIndex: this.retryIndex });
    standaloneAdapter.gameplayStart();
    this.tick();
  }

  private tick = (): void => {
    if (this.run.state !== "PLAYING") return;
    this.remainingMs = Math.max(0, this.deadline - performance.now());
    const seconds = Math.ceil(this.remainingMs / 1000);
    if (element("time-value").textContent !== String(seconds)) element("time-value").textContent = String(seconds);
    if (this.remainingMs <= 0) { this.finish(); return; }
    this.animationFrame = requestAnimationFrame(this.tick);
  };

  private answer(index: number): void {
    if (this.run.state !== "PLAYING" || this.answerLocked || index < 0 || index > 3) return;
    this.answerLocked = true;
    const question = this.currentQuestion;
    const correct = index === question.correctIndex;
    const beforeBoss = this.battle.bossHealth > 0;
    const result = answerQuestion(this.battle, correct);
    this.battle = result.state;
    if (correct) this.reviewKeys.delete(question.key);
    else this.reviewKeys.add(question.key);
    const t = translations[this.language];
    const buttons = this.answerButtons();
    buttons.forEach((button) => { button.disabled = true; });
    buttons[question.correctIndex].classList.add("correct");
    if (!correct) buttons[index].classList.add("wrong");
    const monster = element("monster");
    monster.classList.remove("hit", "wrong", "defeated");
    void monster.offsetWidth;
    if (!this.reducedMotion) monster.classList.add(correct ? result.bossDefeated || !beforeBoss ? "defeated" : "hit" : "wrong");
    const praise = correct && this.battle.combo > 0 && this.battle.combo % 3 === 0
      ? getStreakPraise(this.language, this.battle.combo, this.voiceLocaleTag) : "";
    if (praise) void this.audio.say(getStreakPraiseCue(this.battle.combo), this.voiceLocaleTag);
    const feedback = !correct ? t.wrong(question.answer)
      : result.bossDefeated ? `${t.bossDown} +${result.points}`
        : result.bossAppeared ? `${t.bossIncoming} +${result.points}`
          : praise ? `${praise} +${result.points}`
            : `${result.bossHit ? t.bossHit : t.correct} +${result.points}`;
    this.showFeedback(feedback, correct ? praise ? "praise" : "correct" : "wrong");
    this.playTone(correct, beforeBoss, this.battle.combo);
    this.renderHud();
    window.setTimeout(() => {
      if (this.run.state !== "PLAYING" && this.run.state !== "PAUSED") return;
      this.currentQuestion = this.nextQuestion();
      buttons.forEach((button) => { button.disabled = false; button.classList.remove("correct", "wrong"); });
      monster.classList.remove("hit", "wrong", "defeated");
      this.answerLocked = false;
      this.renderBattle();
      this.renderQuestion();
    }, this.reducedMotion ? 160 : 310);
  }

  private pause(): void {
    if (this.run.state !== "PLAYING") return;
    this.audio.pause();
    this.remainingMs = Math.max(0, this.deadline - performance.now());
    cancelAnimationFrame(this.animationFrame);
    this.run = transitionRun(this.run, "PAUSED", new Date().toISOString());
    standaloneAdapter.gameplayStop();
    element("pause-panel").classList.remove("hidden");
    element("pause-button").classList.add("hidden");
  }

  private resume(): void {
    if (this.run.state !== "PAUSED") return;
    this.audio.resume();
    this.run = transitionRun(this.run, "PLAYING", new Date().toISOString());
    this.deadline = performance.now() + this.remainingMs;
    standaloneAdapter.gameplayStart();
    element("pause-panel").classList.add("hidden");
    element("pause-button").classList.remove("hidden");
    this.tick();
  }

  private finish(): void {
    if (this.run.state !== "PLAYING") return;
    this.audio.pause();
    this.audio.play("victory");
    cancelAnimationFrame(this.animationFrame);
    this.remainingMs = 0;
    this.run = transitionRun(this.run, "RESULT", new Date().toISOString());
    standaloneAdapter.gameplayStop();
    saveReview(safeStorage(), this.reviewKeys);
    this.lastResultBest = this.battle.defeated > this.bestDefeated;
    if (this.lastResultBest) {
      this.bestDefeated = this.battle.defeated;
      this.scoreStorage.saveBest("G002:defeated", this.bestDefeated);
    }
    this.emit("game_end", { reason: "time_up", score: this.battle.score, correct: this.battle.correct,
      wrong: this.battle.wrong, defeated: this.battle.defeated, bossesDefeated: this.battle.bossesDefeated,
      longestCombo: this.battle.longestCombo, durationSeconds: ROUND_SECONDS });
    element("pause-button").classList.add("hidden");
    element("result-panel").classList.remove("hidden");
    this.renderHud();
    this.renderResult();
  }

  private retry(): void {
    if (this.run.state !== "RESULT") return;
    this.emit("retry_click", { previousRunId: this.run.id });
    this.retryIndex += 1;
    this.run = createRun("G002", crypto.randomUUID(), crypto.randomUUID());
    element("share-status").textContent = "";
    this.start();
  }

  private renderQuestion(): void {
    const question = this.currentQuestion;
    element("question").textContent = `${question.a} × ${question.b} = ?`;
    this.answerButtons().forEach((button, index) => {
      button.querySelector("span")!.textContent = String(question.options[index]);
    });
  }

  private renderBattle(): void {
    const boss = this.battle.bossHealth > 0;
    const t = translations[this.language];
    const monster = element("monster");
    monster.classList.toggle("boss", boss);
    monster.setAttribute("aria-label", boss ? t.boss : t.monster);
    element("enemy-label").textContent = boss ? t.boss : t.monster;
    element("health").textContent = boss ? "♥".repeat(this.battle.bossHealth) + "♡".repeat(3 - this.battle.bossHealth) : "";
    element("health").setAttribute("aria-label", boss ? `${t.boss} ${this.battle.bossHealth}/3` : "");
    element("wave").innerHTML = Array.from({ length: 5 }, (_, index) => `<span class="${index < this.battle.normalSinceBoss ? "done" : ""}"></span>`).join("");
  }

  private renderHud(): void {
    const t = translations[this.language];
    element("time-value").textContent = String(Math.ceil(this.remainingMs / 1000));
    element("score-value").textContent = this.battle.score.toLocaleString(this.language);
    element("combo-value").textContent = String(this.battle.combo);
    element("best-value").textContent = String(this.bestDefeated);
    element("defeated-chip").textContent = `${t.defeated} ${this.battle.defeated}`;
  }

  private renderResult(): void {
    const t = translations[this.language];
    element("result-title").textContent = this.lastResultBest ? t.newBest : t.resultTitle;
    element("result-defeated").textContent = String(this.battle.defeated);
    element("result-unit").textContent = t.unit;
    element("result-summary").textContent = t.resultSummary(this.battle.defeated, this.battle.bossesDefeated);
    element("share-preview-number").textContent = `${this.battle.defeated} ${t.unit}`;
    element("share-preview-challenge").textContent = t.challenge(this.battle.defeated);
  }

  private applyLanguage(): void {
    const t = translations[this.language];
    document.documentElement.lang = this.language;
    document.documentElement.dir = this.language === "ar" ? "rtl" : "ltr";
    document.title = `${t.title} | Game Lab`;
    document.querySelector(".stage")?.setAttribute("aria-label", t.title);
    element("brand-title").textContent = `/ ${t.title}`;
    element("time-label").textContent = t.time;
    element("score-label").textContent = t.score;
    element("best-label").textContent = t.best;
    element("combo-label").textContent = t.combo;
    this.audioControls?.updateLanguage(this.language);
    this.homeExit?.updateLanguage(this.language);
    element("ready-pill").textContent = t.readyPill;
    element("ready-title").textContent = t.readyTitle;
    element("ready-description").textContent = inputInstruction(t.readyDescription, t.readyDescriptionTouch, this.touchPointer.matches);
    element("incoming-challenge").classList.toggle("hidden", this.incomingChallenge === null);
    if (this.incomingChallenge !== null) element("incoming-challenge").textContent = `“${t.challenge(this.incomingChallenge)}”`;
    element("start-button").textContent = t.start;
    element("pause-pill").textContent = t.pause;
    element("pause-title").textContent = t.pauseTitle;
    element("resume-button").textContent = t.resume;
    element("pause-button").textContent = t.pause;
    element("hint").textContent = inputInstruction(t.hint, t.hintTouch, this.touchPointer.matches);
    element("result-pill").textContent = t.resultPill;
    element("retry-button").textContent = t.retry;
    element("share-button").textContent = t.shareCard;
    element("download-button").textContent = t.downloadCard;
    element("copy-button").textContent = t.copyLink;
    element("footer").textContent = t.footer;
    this.renderHud();
    this.renderBattle();
    if (this.run.state === "RESULT") this.renderResult();
  }

  private showFeedback(message: string, kind: "correct" | "wrong" | "praise" | "" = ""): void {
    const feedback = element("feedback");
    feedback.textContent = message;
    feedback.className = `feedback ${kind}`;
  }

  private playTone(correct: boolean, boss: boolean, combo: number): void {
    this.audio.play(correct ? boss ? "boss" : "correct" : "wrong", Math.min(combo, 8));
  }

  private resultLink(): string {
    const url = new URL(shareLink(location.href, this.language));
    url.searchParams.set("challenge", String(this.battle.defeated));
    return url.toString();
  }

  private cardBlob(): Promise<Blob> {
    const t = translations[this.language];
    return createScoreCard({ title: t.title, score: String(this.battle.defeated), scoreLabel: t.unit,
      best: String(this.bestDefeated), bestLabel: t.best, invitation: t.challenge(this.battle.defeated),
      url: this.resultLink(), language: this.language, direction: this.language === "ar" ? "rtl" : "ltr",
      accent: "#ffd28d", drawArtwork: drawMonsterCard });
  }

  private async shareResult(): Promise<void> {
    if (this.run.state !== "RESULT") return;
    const t = translations[this.language];
    const button = element<HTMLButtonElement>("share-button");
    button.disabled = true;
    try {
      const result = await shareCardOrDownload(await this.cardBlob(), "game-lab-monster-math.png", t.title, this.resultLink(), t.challenge(this.battle.defeated));
      element("share-status").textContent = result === "downloaded" ? t.downloaded : "";
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) element("share-status").textContent = t.shareFailed;
    } finally { button.disabled = false; }
  }

  private async downloadResult(): Promise<void> {
    if (this.run.state !== "RESULT") return;
    const t = translations[this.language];
    try { downloadScoreCard(await this.cardBlob(), "game-lab-monster-math.png"); element("share-status").textContent = t.downloaded; }
    catch { element("share-status").textContent = t.shareFailed; }
  }

  private async copyLink(): Promise<void> {
    if (this.run.state !== "RESULT") return;
    const t = translations[this.language];
    try { await copyShareLink(this.resultLink()); element("share-status").textContent = t.copied; }
    catch { element("share-status").textContent = t.shareFailed; }
  }
}

new MonsterMathGame().init();

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => { navigator.serviceWorker.register("./sw.js").catch(() => undefined); });
}
