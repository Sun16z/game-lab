import { createRun, transitionRun, type GameRun } from "@game-lab/game-core";
import { mountHomeExit } from "@game-lab/platform-adapters";
import { copyShareLink, createScoreCard, downloadScoreCard, shareCardOrDownload, shareLink } from "@game-lab/game-share";
import { mountAudioControls } from "@game-lab/game-audio/ui";
import { createIslandAudio } from "./audio";
import { chooseLanguage, copy, type Language } from "./i18n";
import { chooseAiMove, createGame, legalMoves, playMove, winner, type Difficulty, type Move, type Piece, type State } from "./rules";
import "./style.css";
import "@game-lab/game-audio/style.css";
import "@game-lab/platform-adapters/home-exit.css";
import "./nautical.css";

const PIECES: Piece[] = ["straight", "corner", "tee"];
const MASK: Record<Piece, number> = { straight: 5, corner: 3, tee: 7 };

function element<T extends HTMLElement = HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Missing ${id}`);
  return found as T;
}
function safeStorage(): Storage | undefined { try { return localStorage; } catch { return undefined; } }
function savedLanguage(): string | null { try { return safeStorage()?.getItem("game-lab:language") ?? null; } catch { return null; } }
function incomingSeed(): string | null {
  const value = new URLSearchParams(location.search).get("seed");
  return value && /^[a-zA-Z0-9-]{1,36}$/.test(value) ? value : null;
}

function pathSvg(piece: Piece, rotation: number): string {
  const mask = ((MASK[piece] << rotation) | (MASK[piece] >>> (4 - rotation))) & 15;
  const edge = [[50, 4], [96, 50], [50, 96], [4, 50]];
  const paths = edge.map(([x, y], side) => mask & (1 << side) ? `<path d="M50 50 L${x} ${y}"/>` : "").join("");
  return `<svg class="tile-svg" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="18" fill="#ffe4a1"/>`+
    `<g fill="none" stroke="#fff5d3" stroke-width="20" stroke-linecap="round" stroke-linejoin="round">${paths}</g><circle cx="50" cy="50" r="12" fill="#ffe4a1"/></svg>`;
}

function drawIsland(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "#2b91a1"; ctx.fillRect(200, 325, 680, 380);
  ctx.fillStyle = "#80d3a7"; ctx.beginPath(); ctx.ellipse(540, 500, 290, 145, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ffe298"; ctx.font = "170px system-ui"; ctx.textAlign = "center"; ctx.fillText("🏝️", 540, 575);
}

class IslandGame {
  private language: Language = chooseLanguage(new URLSearchParams(location.search).get("lang") ?? savedLanguage() ?? navigator.language);
  private seed = incomingSeed() ?? crypto.randomUUID();
  private mode: "ai" | "local" = "ai";
  private difficulty: Difficulty = "normal";
  private state: State = createGame(this.seed);
  private run: GameRun = createRun("C001", this.seed, crypto.randomUUID());
  private selected: Piece = "straight";
  private rotation = 0;
  private aiTimer: number | undefined;
  private readonly audio = createIslandAudio(safeStorage());
  private homeExit?: ReturnType<typeof mountHomeExit>;
  private audioControls?: ReturnType<typeof mountAudioControls>;

  init(): void {
    this.homeExit = mountHomeExit(document.querySelector<HTMLElement>(".top-actions")!, this.language);
    const languageSelect = element<HTMLSelectElement>("language-select");
    languageSelect.value = this.language;
    languageSelect.addEventListener("change", () => {
      this.language = chooseLanguage(languageSelect.value);
      try { safeStorage()?.setItem("game-lab:language", this.language); } catch { /* Optional. */ }
      this.applyLanguage(); this.render();
    });
    this.audioControls = mountAudioControls(element<HTMLButtonElement>("sound-button"), this.audio, this.language);
    const size = new URLSearchParams(location.search).get("size");
    if (size === "4") element<HTMLSelectElement>("size-select").value = "4";
    element("start-button").addEventListener("click", () => this.start());
    element("rotate-button").addEventListener("click", () => { this.rotation = (this.rotation + 1) % (this.selected === "straight" ? 2 : 4); this.audio.play("rotate"); this.renderPieces(); });
    element("replay-button").addEventListener("click", () => this.replay());
    element("share-button").addEventListener("click", () => void this.share());
    element("copy-button").addEventListener("click", () => void this.copyLink());
    for (const radio of Array.from(document.querySelectorAll<HTMLInputElement>('input[name="mode"]'))) radio.addEventListener("change", () => {
      element("difficulty-field").classList.toggle("hidden", document.querySelector<HTMLInputElement>('input[name="mode"]:checked')?.value === "local");
    });
    this.applyLanguage(); this.render();
  }

  private get t() { return copy[this.language]; }
  private text(id: string, value: string): void { element(id).textContent = value; }

  private applyLanguage(): void {
    const t = this.t;
    document.documentElement.lang = this.language;
    document.documentElement.dir = this.language === "ar" ? "rtl" : "ltr";
    document.title = `${t.title}｜Game Lab`;
    this.text("brand-title", `/ ${t.title}`); this.text("title", t.title); this.text("subtitle", t.subtitle); this.text("intro", t.intro);
    this.text("mode-label", t.mode); this.text("mode-ai", t.vsAi); this.text("mode-local", t.local);
    this.text("difficulty-label", t.difficulty); this.text("size-label", t.islandSize);
    const difficulty = element<HTMLSelectElement>("difficulty-select");
    difficulty.options[0].textContent = t.easy; difficulty.options[1].textContent = t.normal; difficulty.options[2].textContent = t.hard;
    const size = element<HTMLSelectElement>("size-select");
    size.options[0].textContent = t.standard; size.options[1].textContent = t.child;
    this.text("start-button", `${t.start} →`); this.text("rotate-label", t.rotate);
    this.text("wave-label", t.team0); this.text("coral-label", t.team1);
    this.text("replay-button", t.replay); this.text("share-button", t.share); this.text("copy-button", t.copy);
    this.homeExit?.updateLanguage(this.language); this.audioControls?.updateLanguage(this.language);
  }

  private start(): void {
    if (this.aiTimer) clearTimeout(this.aiTimer);
    this.mode = document.querySelector<HTMLInputElement>('input[name="mode"]:checked')?.value === "local" ? "local" : "ai";
    this.difficulty = element<HTMLSelectElement>("difficulty-select").value as Difficulty;
    const size = element<HTMLSelectElement>("size-select").value === "4" ? 4 : 6;
    this.state = createGame(this.seed, size);
    this.run = transitionRun(createRun("C001", this.seed, crypto.randomUUID()), "PLAYING", new Date().toISOString());
    this.selected = "straight"; this.rotation = 0;
    this.audio.unlock(); this.audio.resume(); this.audio.music("main");
    element("setup").classList.add("hidden"); element("result").classList.add("hidden"); element("play-area").classList.remove("hidden");
    this.text("feedback", this.t.choosePiece);
    this.render();
  }

  private render(): void {
    this.text("wave-score", String(this.state.scores[0]));
    this.text("coral-score", String(this.state.scores[1]));
    this.text("turn-pill", this.run.state === "RESULT" ? this.t.score : this.mode === "ai" && this.state.turn === 1 ? this.t.aiThinking : this.t.turn(this.state.turn));
    const board = element("board"); board.style.setProperty("--size", String(this.state.size)); board.replaceChildren();
    for (let index = 0; index < this.state.cells.length; index++) {
      const cell = this.state.cells[index];
      const button = document.createElement("button"); button.type = "button"; button.className = "cell";
      button.setAttribute("role", "gridcell"); button.setAttribute("aria-label", `${index + 1} ${cell.terrain === "rock" ? "🪨" : cell.terrain === "treasure" ? "💎" : ""} ${cell.tile ? this.t[cell.tile.piece] : ""}`.trim());
      button.disabled = this.run.state !== "PLAYING" || cell.terrain === "rock" || !!cell.tile || cell.flag !== null || this.mode === "ai" && this.state.turn === 1;
      if (cell.terrain === "rock") { button.classList.add("rock"); button.textContent = "🪨"; }
      else if (cell.tile) { button.classList.add(`owner-${cell.tile.player}`); button.innerHTML = pathSvg(cell.tile.piece, cell.tile.rotation); }
      else if (cell.flag !== null) { button.classList.add("flagged", `owner-${cell.flag}`); button.innerHTML = '<span class="flag-icon">⚑</span>'; }
      else if (cell.terrain === "treasure") button.classList.add("treasure");
      if (cell.terrain === "treasure" && cell.flag === null) { const mark = document.createElement("span"); mark.className = "treasure-mark"; mark.textContent = "💎"; button.append(mark); }
      button.addEventListener("click", () => this.place({ index, piece: this.selected, rotation: this.rotation }));
      board.append(button);
    }
    this.renderPieces();
    element<HTMLButtonElement>("rotate-button").disabled = this.run.state !== "PLAYING" || this.mode === "ai" && this.state.turn === 1;
  }

  private renderPieces(): void {
    const holder = element("pieces"); holder.replaceChildren();
    for (const piece of PIECES) {
      const button = document.createElement("button"); button.type = "button"; button.className = "piece";
      button.classList.toggle("selected", this.selected === piece);
      button.setAttribute("aria-pressed", String(this.selected === piece));
      button.disabled = this.run.state !== "PLAYING" || this.mode === "ai" && this.state.turn === 1;
      button.innerHTML = pathSvg(piece, this.selected === piece ? this.rotation : 0);
      const name = document.createElement("span"); name.textContent = this.t[piece]; button.append(name);
      button.addEventListener("click", () => { this.selected = piece; this.rotation = 0; this.audio.play("select"); this.text("feedback", this.t.place); this.renderPieces(); });
      holder.append(button);
    }
  }

  private place(move: Move): void {
    if (this.run.state !== "PLAYING" || this.mode === "ai" && this.state.turn === 1) return;
    this.commit(move);
  }
  private commit(move: Move): void {
    try {
      const outcome = playMove(this.state, move);
      this.state = outcome.state;
      this.audio.play(outcome.captured ? "claim" : outcome.links ? "link" : "place");
      this.text("feedback", outcome.captured ? `${this.t.capture(outcome.captured)} ${this.t.bonus}` : `+${outcome.gained} · ${this.t.place}`);
      this.render();
      if (this.state.over) { this.finish(); return; }
      if (this.mode === "ai" && this.state.turn === 1) this.aiTimer = window.setTimeout(() => {
        if (this.run.state !== "PLAYING") return;
        this.commit(chooseAiMove(this.state, this.difficulty));
      }, 450);
    } catch { this.text("feedback", this.t.invalid); }
  }

  private finish(): void {
    this.run = transitionRun(this.run, "RESULT", new Date().toISOString());
    this.audio.pause(); this.audio.play("finish");
    const winning = winner(this.state);
    this.text("result-title", winning === null ? this.t.tie : this.t.win(winning));
    this.text("result-score", this.t.result(this.state.scores[0], this.state.scores[1]));
    element("result").classList.remove("hidden");
    this.render();
    element("result").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  private replay(): void {
    if (this.aiTimer) clearTimeout(this.aiTimer);
    this.audio.pause();
    this.seed = crypto.randomUUID();
    this.run = createRun("C001", this.seed, crypto.randomUUID());
    this.state = createGame(this.seed, element<HTMLSelectElement>("size-select").value === "4" ? 4 : 6);
    element("play-area").classList.add("hidden"); element("result").classList.add("hidden"); element("setup").classList.remove("hidden");
    this.render(); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  private resultLink(): string {
    const link = new URL(shareLink(location.href, this.language));
    link.searchParams.set("seed", this.seed);
    link.searchParams.set("size", String(this.state.size));
    return link.toString();
  }
  private async share(): Promise<void> {
    const invitation = this.t.result(this.state.scores[0], this.state.scores[1]);
    try {
      const blob = await createScoreCard({ title: this.t.title, score: `${this.state.scores[0]} : ${this.state.scores[1]}`, scoreLabel: this.t.score,
        best: invitation, bestLabel: "", invitation: this.t.share, url: this.resultLink(), language: this.language,
        direction: this.language === "ar" ? "rtl" : "ltr", drawArtwork: drawIsland });
      try {
        const outcome = await shareCardOrDownload(blob, "island-conquest.png", this.t.title, this.resultLink(), invitation);
        if (outcome === "downloaded") this.text("share-status", this.t.imageSaved);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        downloadScoreCard(blob, "island-conquest.png");
        this.text("share-status", this.t.imageSaved);
      }
    } catch { this.text("share-status", this.t.shareFailed); }
  }
  private async copyLink(): Promise<void> {
    try { await copyShareLink(this.resultLink()); this.text("share-status", this.t.copied); }
    catch { this.text("share-status", this.t.shareFailed); }
  }
}

new IslandGame().init();
