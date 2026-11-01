import { initialSnowState, courseFeatures, stepSnow, type Course } from './rules';
import { SnowInput } from './input';
import { drawSnow } from './render';
import { copy, chooseLanguage } from './i18n';
import { GameAudio } from '@game-lab/game-audio';
import { mountAudioControls } from '@game-lab/game-audio/ui';
import { createRun, transitionRun, type GameRun } from '@game-lab/game-core';
import { noOpEventSink, type GameEventName } from '@game-lab/game-analytics';
import { createScoreCard, shareCardOrDownload, shareLink, copyShareLink } from '@game-lab/game-share';
import './style.css';
import '@game-lab/game-audio/style.css';
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const canvas = $<HTMLCanvasElement>('stage'), ctx = canvas.getContext('2d')!;
const input = new SnowInput(), image = new Image(); image.src = './dodo.webp';
function storage() { try { return localStorage; } catch { return undefined; } }
const audio = new GameAudio({ cues: { start:[.12,0,500,.01,.05,.15,0,1,70], gate:[.12,0,680,.01,.05,.12,0,1,90], hit:[.1,0,260,.01,.04,.12,0,1,40], finish:[.15,0,760,.02,.1,.2,0,1,100] }, music:{main:['./audio/mozart-k545.webm','./audio/mozart-k545.mp3']} }, storage());
function readLanguage(){try{return storage()?.getItem('game-lab:language')}catch{return null}}
let language = chooseLanguage(new URLSearchParams(location.search).get('lang') ?? readLanguage() ?? navigator.language);
const audioUI = mountAudioControls($<HTMLButtonElement>('sound'),audio,language);
let run:GameRun = createRun('G005','0',crypto.randomUUID()), ended=true; const sessionId=crypto.randomUUID();
function emit(eventName:GameEventName, properties:Record<string,string|number|boolean|null>={}) { void noOpEventSink.emit({eventId:crypto.randomUUID(),eventName,gameId:'G005',runId:run.id,sessionId,timestamp:new Date().toISOString(),gameVersion:'0.1.0',properties}); }
function localize(){const t=copy[language]; document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr';document.title=t.title;for(const [id,value] of Object.entries({home:'🏠 '+t.home,title:t.title,intro:t.intro,learning:t.learning,'course-label':t.course,start:t.start,instructions:t.instructions,pause:t.pause,resume:t.resume,jump:t.jump,'finish-title':t.finish,'paused-title':t.pause,retry:t.retry,share:t.share,copy:t.copy})) $(id).textContent=value;const options=$<HTMLSelectElement>('course').options;t.routes.forEach((v,i)=>options[i].textContent=v);$('left').setAttribute('aria-label',t.left);$('right').setAttribute('aria-label',t.right);$('sound').setAttribute('aria-label',t.sound);const raw=new URLSearchParams(location.search).get('target');$('challenge').textContent=raw!==null && /^\d{1,5}$/.test(raw)?`${t.challenge} · ${t.score} ${Number(raw)}`:'';audioUI.updateLanguage(language);}
$<HTMLSelectElement>('language').value=language;$('language').onchange=()=>{language=chooseLanguage($<HTMLSelectElement>('language').value);try{storage()?.setItem('game-lab:language',language)}catch{}localize()};localize();
let state = initialSnowState(), course: Course = 0, features = courseFeatures(course), screen: 'menu'|'play'|'paused'|'result' = 'menu', previous = 0, accumulated = 0, queuedJump = false;
function show(name: typeof screen) { screen = name; for (const id of ['menu','play','paused','result']) $(id).hidden = id !== name; $('pause').hidden = name !== 'play'; }
function start() { if(!ended) end('abandoned'); course = Number($<HTMLSelectElement>('course').value) as Course;run=transitionRun(createRun('G005',String(course),crypto.randomUUID()),'PLAYING',new Date().toISOString());ended=false;audio.unlock();audio.resume();audio.music('main');audio.play('start');emit('game_start',{course}); features = courseFeatures(course); state = initialSnowState(); input.clear(); previous = performance.now(); accumulated = 0; queuedJump=false; show('play'); }
function score(){return Math.max(0,state.gates*100-state.hits*20)}
function end(reason:string){if(ended)return;ended=true;if(run.state==='PLAYING'||run.state==='PAUSED')run=transitionRun(run,'RESULT',new Date().toISOString());emit('game_end',{reason,gates:state.gates,hits:state.hits,score:score()});audio.pause();}
function finish() { end('complete');audio.play('finish');input.clear();show('result');const t=copy[language];const raw=new URLSearchParams(location.search).get('target');const target=raw!==null && /^\d{1,5}$/.test(raw) ? Number(raw) : null;$('summary').textContent = `${t.gates} ${state.gates} · ${t.hits} ${state.hits} · ${t.distance} ${Math.round(state.distance)} m · ${t.score} ${score()}${target!==null ? ` · ${t.challenge} ${target} ${score()>=target?'✓':'↗'}` : ''}`;try{const key='game-lab:best:G005:score';storage()?.setItem(key,String(Math.max(score(),Number(storage()?.getItem(key))||0)))}catch{} }
function challengeLink(){const url=new URL(shareLink(location.href,language));url.searchParams.set('course',String(course));url.searchParams.set('target',String(score()));return url.toString()}
$('share').onclick=async()=>{const t=copy[language],url=challengeLink(),points=score(),gates=state.gates;try{const blob=await createScoreCard({title:t.title,score:String(points),scoreLabel:t.score,best:String(gates),bestLabel:t.gates,invitation:t.challenge,url,language,direction:language==='ar'?'rtl':'ltr',accent:'#a8e2ec',drawArtwork:c=>{c.fillStyle='#b5e3eb';c.fillRect(100,300,880,420);if(image.complete&&image.naturalWidth)c.drawImage(image,420,340,240,300)}});await shareCardOrDownload(blob,'snow-rush.png',t.title,url,t.challenge)}catch{$('status').textContent=t.failed}};

function pause() { if (screen !== 'play' || ended || run.state !== 'PLAYING') return; input.clear();run=transitionRun(run,'PAUSED',new Date().toISOString());audio.pause();show('paused'); }
function resume() { if (screen !== 'paused' || ended || run.state !== 'PAUSED') return; previous = performance.now();run=transitionRun(run,'PLAYING',new Date().toISOString());audio.resume();show('play'); }
$('start').onclick = start; $('retry').onclick = () => {emit('retry_click');start()}; $('pause').onclick = pause; $('resume').onclick = resume;
$('copy').onclick = async () => { try { await copyShareLink(challengeLink()); $('status').textContent = copy[language].copied; } catch { $('status').textContent = copy[language].failed; } };
for (const direction of ['left','right'] as const) { const button = $(direction); button.addEventListener('pointerdown', e => { e.preventDefault(); button.setPointerCapture(e.pointerId); input.set(direction, String(e.pointerId), true); }); for (const event of ['pointerup','pointercancel','lostpointercapture'] as const) button.addEventListener(event, e => input.set(direction, String(e.pointerId), false)); }
$('jump').addEventListener('pointerdown', e => { e.preventDefault(); input.jump(); });$('jump').addEventListener('click',e=>{if((e as MouseEvent).detail===0)input.jump()});
window.addEventListener('keydown', e => { if (e.repeat || (e.target instanceof HTMLElement && e.target.closest('select,input,textarea'))) return; if (e.code === 'ArrowLeft' || e.code === 'KeyA') { e.preventDefault(); input.set('left', 'key', true); } if (e.code === 'ArrowRight' || e.code === 'KeyD') { e.preventDefault(); input.set('right', 'key', true); } if (e.code === 'Space' && screen === 'play') { e.preventDefault(); input.jump(); } if (e.code === 'Escape') screen === 'paused' ? resume() : pause(); });
window.addEventListener('keyup', e => { if (e.code === 'ArrowLeft' || e.code === 'KeyA') input.set('left', 'key', false); if (e.code === 'ArrowRight' || e.code === 'KeyD') input.set('right', 'key', false); });
$('home').addEventListener('click',()=>end('abandoned'));window.addEventListener('pagehide',()=>end('abandoned'));window.addEventListener('pageshow',e=>{if(e.persisted&&ended&&(screen==='play'||screen==='paused'))show('menu')});document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); }); window.addEventListener('blur', pause);
const queryCourse = Number(new URLSearchParams(location.search).get('course')); if (Number.isInteger(queryCourse) && queryCourse >= 0 && queryCourse <= 2) $<HTMLSelectElement>('course').value = String(queryCourse);
function frame(now: number) { if (screen === 'play') { accumulated += Math.min(.1, Math.max(0, (now - previous) / 1000)); let controls = input.read(); queuedJump ||= controls.jump; while (accumulated >= 1/60) { controls.jump=queuedJump; queuedJump=false; const before=state;state = stepSnow(state, controls, features, 1/60);if(state.gates>before.gates)audio.play('gate');if(state.hits>before.hits)audio.play('hit'); controls = { ...controls, jump: false }; accumulated -= 1/60; if (state.elapsed >= 90) { finish(); break; } } $('clock').textContent = String(Math.max(0, Math.ceil(90 - state.elapsed))); $('hud').textContent = `${copy[language].gates} ${state.gates} · ${copy[language].hits} ${state.hits} · ${Math.round(state.speed)} m/s`; drawSnow(ctx, state, features, image, course); } previous = now; requestAnimationFrame(frame); }
requestAnimationFrame(frame);

if(import.meta.env.DEV) Object.defineProperty(window,'snowRushQA',{value:Object.freeze({snapshot:()=>structuredClone({state,course,screen,run})})});
if(import.meta.env.PROD && 'serviceWorker' in navigator) void navigator.serviceWorker.register('./sw.js').catch(()=>{});
