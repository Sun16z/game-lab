import { createRun, transitionRun, type GameRun } from '@game-lab/game-core';
import { noOpEventSink, type GameEventName } from '@game-lab/game-analytics';
import { mountHomeExit } from '@game-lab/platform-adapters';
import { GameAudio } from '@game-lab/game-audio';
import { mountAudioControls } from '@game-lab/game-audio/ui';
import { copyShareLink, createScoreCard, shareCardOrDownload, shareLink } from '@game-lab/game-share';
import { addSticker, type StickerKind } from './rules';
import { blankArt, COLORS, ORDERS, SHAPES, shapePoints, targetArt, starterArt, silhouetteMinimum, scoreOrder, scaleArt, pushUndo, dailyOrder, freeDescription, sculpt, type CloudArt, type Shape } from './cafe-rules';
import { chooseLanguage, copy, type Language } from './i18n';
import { cafeCopy, shapeNames, colorNames } from './cafe-i18n';
import { extra } from './cafe-extra';
import { decodeArtwork, encodeArtwork } from './challenge';
import { storage, readProgress, saveProgress } from './cafe-storage';
import { artworkSvg, drawArtwork, paints, stickerIcons } from './render';
import { CloudEditor } from './editor';
import { ServiceClock } from './clock';
import './style.css';
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const audio = new GameAudio({ cues: { start: [.18, 0, 520, .01, .06, .18, 0, 1, 90], edit: [.1, 0, 510, .01, .04, .12, 0, 1, 60], finish: [.2, 0, 620, .01, .1, .25, 0, 1, 150] }, music: { main: ['./audio/bach-bwv846.webm', './audio/bach-bwv846.mp3'] } }, storage());
type Mode = 'standard' | 'practice' | 'challenge';
type Screen = 'menu' | 'read' | 'play' | 'result';
class CloudCafe {
    private language: Language = chooseLanguage(new URLSearchParams(location.search).get('lang') ?? this.savedLanguage());
    private screen: Screen = 'menu';
    private orderIndex = 0;
    private free = false;
    private mode: Mode = 'standard';
    private art: CloudArt = blankArt();
    private history: CloudArt[] = [];
    private progress = readProgress();
    private guide = true;
    private run: GameRun = createRun('G018', 'cafe', crypto.randomUUID());
    private ended = true;
    private session = crypto.randomUUID();
    private editor?: CloudEditor;
    private clock = new ServiceClock();
    private expired = false;
    private paused = false;
    private elapsed = 0;
    private windBeat = 0;
    private lastTick = performance.now();
    private sharedArt?: CloudArt;
    private day?: string;
    private home = mountHomeExit(document.querySelector<HTMLElement>('.top-actions')!, this.language);
    private sound = mountAudioControls($<HTMLButtonElement>('sound'), audio, this.language);
    private get t() { return cafeCopy[this.language]; }
    private get old() { return copy[this.language]; }
    private get x() { return extra(this.language); }
    private get order() { return ORDERS[this.orderIndex]; }
    private get names() { return shapeNames(this.language); }
    init() {
        const hash = new URLSearchParams(location.hash.slice(1));
        const art = decodeArtwork(hash.get('art') ?? '');
        if (art)
            this.sharedArt = { ...art, color: art.color ?? 'cream', hole: art.hole ?? false };
        const o = Number(hash.get('order'));
        if (Number.isInteger(o) && o >= 1 && o <= 24) {
            this.orderIndex = o - 1;
            this.free = false;
            this.screen = 'read';
        }
        else if (art) {
            this.free = true;
            this.screen = 'read';
        }
        if (hash.get('mode') === 'practice' || hash.get('mode') === 'challenge')
            this.mode = hash.get('mode') as Mode;
        const day = hash.get('day');
        if (day && /^\d{4}-\d{2}-\d{2}$/.test(day))
            this.day = day;
        $<HTMLSelectElement>('language').value = this.language;
        $('language').addEventListener('change', () => {
            this.language = chooseLanguage($<HTMLSelectElement>('language').value);
            try {
                storage()?.setItem('game-lab:language', this.language);
            }
            catch { }
            this.render();
        });
        document.addEventListener('visibilitychange', () => {
            this.lastTick = performance.now();
            if (document.hidden) {
                this.editor?.clear();
                if (this.screen === 'play' && !this.paused) {
                    this.paused = true;
                    if (this.run.state === 'PLAYING')
                        this.run = transitionRun(this.run, 'PAUSED', new Date().toISOString());
                    this.render();
                }
                audio.pause();
            }
        });
        document.querySelectorAll('.home-exit,.brand').forEach(link => link.addEventListener('click', () => this.end('abandoned')));
        window.addEventListener('pagehide', () => this.end('abandoned'));
        // A restored browser-history document must not resurrect an ended run.
        window.addEventListener('pageshow', event => {
            if (event.persisted && this.screen === 'play' && this.ended) {
                this.editor?.clear();
                this.paused = false;
                this.expired = false;
                this.screen = 'menu';
                audio.pause();
                this.render();
            }
        });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && this.screen === 'play' && !this.expired)
                this.togglePause();
        });
        this.render();
        if (import.meta.env.DEV)
            Object.assign(window, { __cloudCafe: { inspect: () => ({ order: this.free ? 0 : this.order.id, mode: this.mode, screen: this.screen, run: this.run, art: this.art, remaining: this.clock.remaining, score: scoreOrder(this.art, this.order) }), target: () => {
                        if (this.screen === 'play') {
                            this.art = targetArt(this.order);
                            this.draw();
                        }
                    }, expire: () => {
                        if (this.screen === 'play')
                            this.clock.start(.001, performance.now());
                    } } });
        requestAnimationFrame(now => this.tick(now));
    }
    private savedLanguage() {
        try {
            return storage()?.getItem('game-lab:language') ?? navigator.language;
        }
        catch {
            return navigator.language;
        }
    }
    private emit(eventName: GameEventName, properties: Record<string, string | number | boolean | null> = {}) { const event = { eventId: crypto.randomUUID(), eventName, gameId: 'G018' as const, runId: this.run.id, sessionId: this.session, timestamp: new Date().toISOString(), gameVersion: '0.3.0', properties }; void noOpEventSink.emit(event); window.dispatchEvent(new CustomEvent('game-lab:event', { detail: event })); }
    private end(reason: string) {
        if (this.ended)
            return;
        this.ended = true;
        if (this.run.state === 'PLAYING' || this.run.state === 'PAUSED')
            this.run = transitionRun(this.run, 'RESULT', new Date().toISOString());
        this.emit('game_end', { reason, order: this.free ? 0 : this.order.id });
    }
    private friends() { return `<div class="friends" aria-hidden="true"><img src="./friends/dodo.webp" alt=""><img src="./friends/lili.webp" alt=""><img src="./friends/pip.webp" alt=""></div>`; }
    private button(id: string, text: string, primary = false) { return `<button type="button" id="${id}" class="${primary ? 'primary' : ''}">${text}</button>`; }
    private bind(id: string, fn: () => void) { $(id)?.addEventListener('click', fn); }
    private orderTitle() { return `${String(this.order.id).padStart(2, '0')} · ${this.names[SHAPES.indexOf(this.order.shape)]}`; }
    private requirements(result = false) { const score = scoreOrder(this.art, this.order), colors = colorNames(this.language); return `<ul class="criteria">${[[this.t.shape, this.names[SHAPES.indexOf(this.order.shape)] + (result ? ` · ${Math.round(score.similarity * 100)}% / ${Math.round(silhouetteMinimum(this.order.shape) * 100)}%` : ''), score.silhouette], [this.t.holes, this.order.hole ? this.t.oneHole : this.t.noHole, score.topology], [this.t.details, `${colors[COLORS.indexOf(this.order.color)]}${this.order.secondColor ? ' + ' + colors[COLORS.indexOf(this.order.secondColor)] : ''} · ${this.order.count ? this.order.count + ' × ' + this.old[this.order.sticker!] : this.t.noSticker}`, score.detail]].map(([label, value, ok]) => `<li class="${result ? (ok ? 'met' : 'unmet') : ''}"><span>${result ? (ok ? '★' : '☆') : '○'} ${label}</span><b>${value}</b></li>`).join('')}</ul>`; }
    private render() {
        document.documentElement.lang = this.language;
        document.documentElement.dir = this.language === 'ar' ? 'rtl' : 'ltr';
        document.title = `${this.t.title} | Game Lab`;
        this.home.updateLanguage(this.language);
        this.sound.updateLanguage(this.language);
        if (this.screen === 'menu')
            this.menu();
        else if (this.screen === 'read')
            this.read();
        else if (this.screen === 'play')
            this.play();
        else
            this.result();
    }
    private menu() {
        $('app').innerHTML = `<section class="welcome paper">${this.friends()}<p class="eyebrow">G018 · ☁</p><h1>${this.t.title}</h1><p>${this.t.intro}</p><p class="learning-benefit">${this.old.learning}</p><div class="welcome-actions">${this.button('free', this.t.free, true)}${this.button('daily', this.t.daily)}</div></section><section class="menu-book"><h2>${this.t.orders}</h2>${[0, 1, 2].map(stage => `<section class="stage-page"><h3><span>${stage + 1}</span> ${this.t.stages.split(',')[stage]}</h3><div class="orders">${ORDERS.filter(o => o.stage === stage).map(o => `<button type="button" class="order-tile" data-order="${o.id - 1}" aria-label="${o.id} ${this.names[SHAPES.indexOf(o.shape)]}"><div class="mini-art">${artworkSvg(targetArt(o))}</div><b>${String(o.id).padStart(2, '0')} · ${this.names[SHAPES.indexOf(o.shape)]}</b><span class="mini-stars">${'★'.repeat(this.progress.best[o.id - 1])}${'☆'.repeat(3 - this.progress.best[o.id - 1])}</span></button>`).join('')}</div></section>`).join('')}</section><section class="paper album"><h2>${this.t.album}</h2>${this.progress.album.length ? `<div class="album-grid">${this.progress.album.map((item, i) => `<button type="button" data-album="${i}" aria-label="${this.old.art} ${i + 1}">${artworkSvg(item.art)}<span>${item.order ? '#' + item.order : '☁'} ${'★'.repeat(item.stars)}</span></button>`).join('')}</div>` : `<p>${this.t.empty}</p>`}</section>`;
        this.bind('free', () => { this.free = true; this.day = undefined; this.sharedArt = undefined; this.screen = 'read'; this.render(); });
        this.bind('daily', () => { this.day = new Date().toISOString().slice(0, 10); this.orderIndex = dailyOrder(this.day); this.free = false; this.sharedArt = undefined; this.screen = 'read'; this.render(); });
        document.querySelectorAll<HTMLElement>('[data-order]').forEach(b => b.addEventListener('click', () => { this.orderIndex = Number(b.dataset.order); this.free = false; this.day = undefined; this.sharedArt = undefined; this.screen = 'read'; this.render(); }));
        document.querySelectorAll<HTMLElement>('[data-album]').forEach(b => b.addEventListener('click', () => { this.sharedArt = this.progress.album[Number(b.dataset.album)].art; this.free = true; this.screen = 'read'; this.render(); }));
    }
    private read() {
        const received = !this.free && this.sharedArt ? `<aside class="received-art"><div><h2>${this.x.received}</h2><div class="received-preview">${artworkSvg(this.sharedArt)}</div></div>${this.button('open-received', this.x.openReceived)}</aside>` : '';
        $('app').innerHTML = `<section class="paper briefing"><p class="eyebrow">${this.t.review}${this.day ? ' · ' + this.day + ' UTC' : ''}</p><h1>${this.free ? this.t.free : this.orderTitle()}</h1><div class="briefing-body"><div class="customer"><img src="./friends/${this.free ? 'dodo' : this.order.customer}.webp" alt="${this.free ? 'Dodo' : this.order.customer}"/><div class="target-art">${artworkSvg(this.free ? (this.sharedArt ?? blankArt()) : targetArt(this.order))}</div></div><div>${this.free ? `<p>${this.t.intro}</p>` : this.requirements()}<p class="reading-note">${this.t.ready}</p>${this.free ? '' : `<label class="mode-label"><select id="mode">${(['standard', 'practice', 'challenge'] as const).map(mode => `<option value="${mode}" ${mode === this.mode ? 'selected' : ''}>${this.t[mode]}</option>`).join('')}</select></label>`}<p class="input-help">${this.t.drag}</p></div></div>${received}<div class="actions">${this.button('begin', this.t.begin, true)}${this.button('menu', this.t.menu)}</div></section>`;
        this.bind('open-received', () => { this.free = true; this.day = undefined; this.start(); });
        this.bind('begin', () => {
            const mode = $<HTMLSelectElement>('mode');
            if (mode)
                this.mode = mode.value as Mode;
            this.start();
        });
        this.bind('menu', () => { this.screen = 'menu'; this.render(); });
    }
    private start(retry = false) {
        this.end('abandoned');
        if (retry)
            this.emit('retry_click');
        this.art = this.free ? (this.sharedArt ?? blankArt()) : starterArt(this.order);
        this.history = [];
        this.elapsed = 0;
        this.windBeat = 0;
        this.expired = false;
        this.paused = false;
        this.clock.start(this.free || this.mode === 'practice' ? null : this.mode === 'challenge' ? 30 : 45, performance.now());
        this.run = transitionRun(createRun('G018', this.day ?? `order-${this.free ? 0 : this.order.id}-${this.mode}`, crypto.randomUUID()), 'PLAYING', new Date().toISOString());
        this.ended = false;
        this.emit('game_start', { order: this.free ? 0 : this.order.id, mode: this.free ? 'free' : this.mode });
        this.screen = 'play';
        audio.unlock();
        audio.resume();
        audio.music('main');
        audio.play('start');
        this.render();
        scrollTo({ top: 0, behavior: 'instant' });
    }
    private checkpoint() { this.history = pushUndo(this.history, this.art); }
    private edit(next: CloudArt) {
        if (this.paused || this.expired)
            return;
        this.art = next;
        this.draw();
    }
    private transform(fn: (art: CloudArt) => CloudArt) {
        if (this.paused || this.expired)
            return;
        this.checkpoint();
        this.edit(fn(this.art));
        audio.play('edit');
    }
    private play() {
        const advanced = this.free || this.order.stage > 0, blend = this.free || this.order.stage === 2;
        $('app').innerHTML = `<div class="play-heading"><div><p class="eyebrow">☁ ${this.t.title}</p><h1>${this.free ? this.t.free : this.orderTitle()}</h1></div><div class="play-actions"><output id="timer"></output>${this.button('pause', this.t.pause)}${this.button('menu', this.t.menu)}</div></div><div class="cafe-workspace"><aside class="order-receipt">${this.free ? this.friends() : `<img class="customer-face" src="./friends/${this.order.customer}.webp" alt="${this.order.customer}"/><div class="receipt-target">${artworkSvg(targetArt(this.order))}</div>${this.requirements()}`}${this.free ? '' : `<label class="guide-toggle"><input id="guide" type="checkbox" ${this.guide ? 'checked' : ''}>${this.t.guide}</label>`}<p class="wind-note" id="wind"></p></aside><section class="studio"><div id="board" class="board" tabindex="0" role="group" aria-label="${this.old.art}"><div class="sky-grain"></div><div id="guide-art" class="guide-art"></div><div id="cloud-art" class="cloud-art"></div><div id="art-stickers" class="art-stickers"></div><div class="contour-areas">${Array.from({ length: 8 }, (_, i) => `<button type="button" class="contour-area" data-area="${i}" aria-label="${this.x.area} ${i + 1}"></button>`).join('')}</div></div><div class="counter"><span aria-hidden="true">☕</span><span>☁</span><span aria-hidden="true">✿</span></div><p class="input-help">${this.t.drag}<br>${this.t.keyboard}</p></section></div><section class="paper tool-tray"><div class="tool-group"><span>${this.t.mold}</span><div class="molds">${((this.free ? SHAPES : ['round', 'wide', 'tall']) as Shape[]).map(shape => `<button type="button" data-mold="${shape}" aria-label="${this.names[SHAPES.indexOf(shape)]}"><div>${artworkSvg({ ...blankArt(), points: shapePoints(shape) })}</div></button>`).join('')}</div></div><div class="tool-group compact"><span>${this.t.shape}</span><div class="tool-buttons">${this.button('bigger', '＋')}${this.button('smaller', '−')}${advanced ? this.button('hole', this.t.hole) : ''}</div></div>${advanced ? `<div class="tool-group"><span>${this.t.color}</span><div class="swatches">${COLORS.map((c, i) => `<button type="button" data-color="${c}" style="--paint:${paints[c]}" aria-label="${colorNames(this.language)[i]}"></button>`).join('')}</div>${blend ? `<label class="blend-label">${this.x.second}<select id="second"><option value="">${this.x.none}</option>${COLORS.map((c, i) => `<option value="${c}" ${c === this.art.secondColor ? 'selected' : ''}>${colorNames(this.language)[i]}</option>`).join('')}</select></label>` : ''}</div><div class="tool-group"><span>${this.t.stickers}</span><div class="tool-buttons">${(['star', 'rain', 'rainbow'] as StickerKind[]).map(kind => `<button type="button" data-add="${kind}" aria-label="${this.old[kind]}">${stickerIcons[kind]}</button>`).join('')}${this.button('remove', '×')}</div></div>` : ''}<div class="final-actions">${this.button('undo', this.old.undo)}${this.button('clear', this.old.clear)}${this.button('serve', this.t.serve, true)}</div></section><div id="pause-overlay" class="local-overlay ${this.paused || this.expired ? '' : 'hidden'}"><section class="paper"><h2>${this.expired ? this.t.timeout : this.t.pause}</h2><div class="actions">${this.button('resume', this.expired ? this.t.continue : this.t.resume, true)}${this.expired ? this.button('serve-time', this.t.serve) : ''}${this.button('leave', this.t.menu)}</div></section></div>`;
        this.editor = new CloudEditor($('board'), () => this.art, art => this.edit(art), () => this.checkpoint(), () => !this.paused && !this.expired && this.screen === 'play', () => !this.free && this.order.shape === 'rabbit' ? .10 : .17);
        document.querySelectorAll<HTMLElement>('[data-area]').forEach(b => { b.addEventListener('focus', () => this.editor?.select(Number(b.dataset.area))); });
        this.bind('pause', () => this.togglePause());
        this.bind('menu', () => this.leave());
        this.bind('leave', () => this.leave());
        this.bind('resume', () => {
            if (this.expired) {
                this.mode = 'practice';
                this.clock.start(null, performance.now());
                this.expired = false;
            }
            this.paused = false;
            if (this.run.state === 'PAUSED')
                this.run = transitionRun(this.run, 'PLAYING', new Date().toISOString());
            audio.resume();
            this.render();
        });
        this.bind('serve-time', () => this.finish());
        this.bind('serve', () => this.finish());
        this.bind('bigger', () => this.transform(a => scaleArt(a, 1.07)));
        this.bind('smaller', () => this.transform(a => scaleArt(a, .93)));
        this.bind('hole', () => this.transform(a => ({ ...a, hole: !a.hole })));
        this.bind('undo', () => {
            if (this.paused || this.expired)
                return;
            const prev = this.history.pop();
            if (prev) {
                this.art = prev;
                this.draw();
            }
        });
        this.bind('clear', () => this.transform(() => this.free ? blankArt() : starterArt(this.order)));
        this.bind('remove', () => this.transform(a => ({ ...a, stickers: [] })));
        document.querySelectorAll<HTMLElement>('[data-mold]').forEach(b => b.addEventListener('click', () => this.transform(a => ({ ...a, points: shapePoints(b.dataset.mold as Shape) }))));
        document.querySelectorAll<HTMLElement>('[data-color]').forEach(b => b.addEventListener('click', () => this.transform(a => ({ ...a, color: b.dataset.color as CloudArt['color'] }))));
        document.querySelectorAll<HTMLElement>('[data-add]').forEach(b => b.addEventListener('click', () => this.transform(a => { const id = Math.max(-1, ...a.stickers.map(s => s.id)) + 1; const next = addSticker(a, b.dataset.add as StickerKind, id); return { ...next, stickers: next.stickers.map(s => s.id === id ? { ...s, point: { x: .38 + (a.stickers.length % 3) * .12, y: .46 + Math.floor(a.stickers.length / 3) * .09 } } : s) } as CloudArt; })));
        $('second')?.addEventListener('change', () => this.transform(a => ({ ...a, secondColor: ($<HTMLSelectElement>('second').value || undefined) as CloudArt['secondColor'] })));
        $('guide')?.addEventListener('change', () => { this.guide = $<HTMLInputElement>('guide').checked; this.draw(); });
        $('bigger').title = this.t.bigger;
        $('smaller').title = this.t.smaller;
        if ($('remove'))
            $('remove').title = this.t.remove;
        this.draw();
    }
    private draw() {
        if (this.screen !== 'play')
            return;
        const withoutStickers = { ...this.art, stickers: [] };
        $('cloud-art').innerHTML = artworkSvg(withoutStickers);
        $('guide-art').innerHTML = this.guide && !this.free ? artworkSvg(targetArt(this.order), true) : '';
        const container = $('art-stickers');
        for (const node of Array.from(container.children) as HTMLElement[])
            if (!this.art.stickers.some(s => s.id === Number(node.dataset.artSticker)))
                node.remove();
        for (const s of this.art.stickers) {
            let b = container.querySelector<HTMLButtonElement>(`[data-art-sticker="${s.id}"]`);
            if (!b) {
                b = document.createElement('button');
                b.type = 'button';
                b.className = 'art-sticker';
                b.dataset.artSticker = String(s.id);
                b.textContent = stickerIcons[s.kind];
                b.setAttribute('aria-label', this.old[s.kind]);
                b.addEventListener('keydown', e => {
                    const d: Record<string, [
                        number,
                        number
                    ]> = { ArrowLeft: [-.02, 0], ArrowRight: [.02, 0], ArrowUp: [0, -.02], ArrowDown: [0, .02] };
                    if (!d[e.key])
                        return;
                    e.preventDefault();
                    e.stopPropagation();
                    this.transform(a => ({ ...a, stickers: a.stickers.map(item => item.id === s.id ? { ...item, point: { x: Math.max(.04, Math.min(.96, item.point.x + d[e.key][0])), y: Math.max(.08, Math.min(.92, item.point.y + d[e.key][1])) } } : item) }));
                });
                container.append(b);
            }
            b.style.left = `${s.point.x * 100}%`;
            b.style.top = `${s.point.y * 100}%`;
        }
        document.querySelectorAll<HTMLElement>('[data-area]').forEach((b, i) => { const p = this.art.points[Math.floor(i * this.art.points.length / 8)]; b.style.left = `${p.x * 100}%`; b.style.top = `${p.y * 100}%`; });
        $<HTMLButtonElement>('undo').disabled = !this.history.length;
        $('hole')?.setAttribute('aria-pressed', String(this.art.hole));
        if ($('second'))
            $<HTMLSelectElement>('second').value = this.art.secondColor ?? '';
        document.querySelectorAll<HTMLElement>('[data-color]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.color === this.art.color)));
        $<HTMLButtonElement>('remove')?.setAttribute('aria-label', this.t.remove);
        this.timer();
    }
    private timer() {
        if (!$('timer'))
            return;
        $('timer').textContent = this.clock.remaining === null ? '∞' : `${Math.ceil(this.clock.remaining)}s`;
        $('timer').setAttribute('aria-label', this.clock.remaining === null ? this.t.practice : String(Math.ceil(this.clock.remaining)));
        if ($('wind'))
            $('wind').textContent = !this.free && this.order.wind ? (this.mode === 'practice' ? this.x.practice : `${Math.floor(this.elapsed / 6) % 2 === 0 ? '→ ' + this.x.right : '← ' + this.x.left} · ${Math.max(1, 6 - Math.floor(this.elapsed % 6))}`) : '';
    }
    private tick(now: number) {
        const delta = Math.max(0, Math.min(.2, (now - this.lastTick) / 1000));
        this.lastTick = now;
        const running = this.screen === 'play' && !this.paused && !this.expired && !document.hidden;
        const timeout = this.clock.tick(now, running);
        if (running) {
            this.elapsed += delta;
            if (!this.free && this.order.wind && this.mode !== 'practice') {
                const beat = Math.floor(this.elapsed / 6);
                if (beat > this.windBeat) {
                    this.windBeat = beat;
                    this.checkpoint();
                    this.art = sculpt(this.art, { x: .5, y: .35 }, { x: beat % 2 === 1 ? .018 : -.018, y: 0 }, .5);
                    this.draw();
                }
            }
            this.timer();
            if (timeout) {
                this.expired = true;
                this.editor?.clear();
                if (this.run.state === 'PLAYING')
                    this.run = transitionRun(this.run, 'PAUSED', new Date().toISOString());
                audio.pause();
                this.render();
            }
        }
        requestAnimationFrame(next => this.tick(next));
    }
    private togglePause() {
        if (this.expired)
            return;
        this.paused = !this.paused;
        this.editor?.clear();
        this.run = transitionRun(this.run, this.paused ? 'PAUSED' : 'PLAYING', new Date().toISOString());
        if (this.paused)
            audio.pause();
        else
            audio.resume();
        this.render();
    }
    private leave() { this.end('abandoned'); audio.pause(); this.screen = 'menu'; this.render(); }
    private finish() {
        if (this.screen !== 'play')
            return;
        this.end('served');
        audio.play('finish');
        audio.pause();
        const stars = this.free ? 0 : scoreOrder(this.art, this.order).stars;
        if (!this.free)
            this.progress.best[this.orderIndex] = Math.max(stars, this.progress.best[this.orderIndex]);
        this.progress.album.push({ art: this.art, order: this.free ? 0 : this.order.id, stars });
        this.progress.album = this.progress.album.slice(-12);
        saveProgress(this.progress);
        this.screen = 'result';
        this.render();
        scrollTo({ top: 0, behavior: 'instant' });
    }
    private result() {
        const score = scoreOrder(this.art, this.order), description = freeDescription(this.art);
        $('app').innerHTML = `<section class="paper result">${this.friends()}<p class="eyebrow">☁ ${this.t.title}</p><h1>${this.free ? this.old.result : this.orderTitle()}</h1>${this.free ? `<p>${this.t.freeFeedback} ${this.names[SHAPES.indexOf(description.shape)]} · ${this.art.stickers.length} ${this.t.stickers}</p>` : `<p class="result-stars" aria-label="${score.stars} / 3">${'★'.repeat(score.stars)}${'☆'.repeat(3 - score.stars)}</p><p>${score.passed ? this.x.complete : this.t.feedback}</p>`}<div class="result-art">${artworkSvg(this.art)}</div>${this.free ? '' : this.requirements(true)}<p class="saved-note">${this.t.saved}</p><div class="actions">${this.button('again', this.t.retry, true)}${!this.free && score.passed && this.orderIndex < 23 ? this.button('next', this.t.next, true) : ''}${this.button('menu', this.t.menu)}</div><div class="share-actions">${this.button('share', this.old.share)}${this.button('copy', this.old.copy)}</div><p id="share-status" role="status"></p></section>`;
        const primaryActions = document.querySelector('.result .actions');
        if (primaryActions)
            document.querySelector('.result-art')?.before(primaryActions);
        this.bind('again', () => this.start(true));
        this.bind('menu', () => { this.screen = 'menu'; this.render(); });
        this.bind('next', () => { this.orderIndex++; this.sharedArt = undefined; this.screen = 'read'; this.render(); });
        this.bind('copy', () => void this.copy());
        this.bind('share', () => void this.share());
    }
    private link() { const url = new URL(shareLink(location.href, this.language)); url.hash = new URLSearchParams({ art: encodeArtwork(this.art), ...(this.free ? {} : { order: String(this.order.id), mode: this.mode }), ...(this.day ? { day: this.day } : {}) }).toString(); return url.toString(); }
    private async copy() {
        try {
            await copyShareLink(this.link());
            $('share-status').textContent = this.old.copied;
        }
        catch {
            $('share-status').textContent = this.old.failed;
        }
    }
    private async share() {
        const title = this.t.title, link = this.link(), labels = this.old, language = this.language;
        const scoreLabel = this.free ? labels.art : this.orderTitle();
        try {
            const art = this.art, score = this.free ? '☁' : `${scoreOrder(art, this.order).stars} / 3`;
            const blob = await createScoreCard({ title, score, scoreLabel, best: '☁', bestLabel: title, invitation: labels.share, url: link, language, direction: language === 'ar' ? 'rtl' : 'ltr', accent: '#e5b592', drawArtwork(ctx) { ctx.fillStyle = '#d7e9e3'; ctx.fillRect(190, 320, 700, 430); ctx.save(); ctx.translate(190, 290); ctx.scale(.7, .7); drawArtwork(ctx, art); ctx.restore(); } });
            const status = await shareCardOrDownload(blob, 'cloud-cafe.png', title, link, labels.art);
            const node = $('share-status');
            if (status === 'downloaded' && node)
                node.textContent = labels.saved;
        }
        catch (error) {
            if (!(error instanceof DOMException && error.name === 'AbortError')) {
                const node = $('share-status');
                if (node) node.textContent = labels.failed;
            }
        }
    }
}
new CloudCafe().init();
if (import.meta.env.PROD && 'serviceWorker' in navigator)
    void navigator.serviceWorker.register('./sw.js').catch(() => { });
