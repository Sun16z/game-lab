import {createRun,transitionRun,type GameRun} from "@game-lab/game-core";
import {noOpEventSink,type GameEventName} from "@game-lab/game-analytics";
import {mountHomeExit} from "@game-lab/platform-adapters";
import {GameAudio} from "@game-lab/game-audio";
import {mountAudioControls} from "@game-lab/game-audio/ui";
import {copyShareLink,createScoreCard,shareCardOrDownload,shareLink} from "@game-lab/game-share";
import {createGame,move,type Direction,type Position,type State} from "./rules";
import {chooseLanguage,copy,type Language} from "./i18n";
import "./style.css";

function el<T extends HTMLElement=HTMLElement>(id:string):T{const n=document.getElementById(id);if(!n)throw Error(`Missing ${id}`);return n as T;}
function storage():Storage|undefined{try{return localStorage}catch{return undefined}}
const audio=new GameAudio({cues:{start:[.18,0,520,.01,.06,.18,0,1,90],move:[.12,0,440,.01,.03,.08,0,1,40],blocked:[.1,0,250,.01,.04,.1,0,1,-30],gem:[.2,0,740,.01,.08,.18,0,1,120],finish:[.25,0,650,.01,.1,.3,0,1,160]},music:{main:["./audio/fur-elise.webm","./audio/fur-elise.mp3"]}},storage());
const same=(a:Position,b:Position)=>a.x===b.x&&a.y===b.y;
class IslandGame{
  private language:Language=chooseLanguage(new URLSearchParams(location.search).get("lang")??storage()?.getItem("game-lab:language")??navigator.language);
  private level=new URLSearchParams(location.search).get("level")==="1"?1:0;private state:State=createGame(this.level);
  private target=Math.max(0,Math.min(9999,Number(new URLSearchParams(location.search).get("target"))||0));
  private run:GameRun=createRun("G019",String(this.level),crypto.randomUUID());
  private readonly sessionId=crypto.randomUUID();private ended=false;
  private home=mountHomeExit(document.querySelector<HTMLElement>(".top-actions")!,this.language);
  private controls=mountAudioControls(el<HTMLButtonElement>("sound"),audio,this.language);
  private get t(){return copy[this.language]}
  init(){
    const challenge=document.createElement("p");challenge.id="challenge";challenge.className="learning";el("intro").after(challenge);const select=el<HTMLSelectElement>("language");select.value=this.language;select.addEventListener("change",()=>{this.language=chooseLanguage(select.value);try{storage()?.setItem("game-lab:language",this.language)}catch{}this.localize();this.render()});
    document.querySelectorAll<HTMLButtonElement>("[data-level]").forEach(button=>button.addEventListener("click",()=>{const level=Number(button.dataset.level);if(level!==this.level)this.target=0;this.level=level;this.updateLevels();this.localize()}));this.updateLevels();
    el("start").addEventListener("click",()=>this.start());el("again").addEventListener("click",()=>this.reset());el("share").addEventListener("click",()=>void this.share());el("copy").addEventListener("click",()=>void this.copyLink());
    document.querySelectorAll<HTMLButtonElement>("[data-direction]").forEach(button=>button.addEventListener("click",()=>this.step(button.dataset.direction as Direction)));
    window.addEventListener("keydown",event=>{const map:Record<string,Direction>={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right"};if(this.run.state==="PLAYING"&&map[event.key]){event.preventDefault();this.step(map[event.key]);}});
    document.addEventListener("visibilitychange",()=>{if(document.hidden)audio.pause();else if(this.run.state==="PLAYING"){audio.resume();audio.music("main")}});window.addEventListener("pagehide",event=>{if(!event.persisted&&this.run.state==="PLAYING")this.endEvent("abandoned")});this.localize();this.render();
  }
  private updateLevels(){document.querySelectorAll<HTMLButtonElement>("[data-level]").forEach(b=>{const selected=Number(b.dataset.level)===this.level;b.classList.toggle("selected",selected);b.setAttribute("aria-pressed",String(selected))})}
  private localize(){document.documentElement.lang=this.language;document.documentElement.dir=this.language==="ar"?"rtl":"ltr";document.title=`${this.t.title}｜Game Lab`;for(const[id,key]of[["title","title"],["play-title","title"],["intro","intro"],["learning","learning"],["start","start"],["turn-label","turn"],["treasures-label","treasures"],["result-title","complete"],["again","again"],["share","share"],["copy","copy"]]as const)el(id).textContent=this.t[key];el("instructions").textContent="✦1 → 🔒1　✦2 → 🔒2　💎 ×2 → ⛺";el("challenge").textContent=this.target?`🏆 ${this.target} ${this.t.steps}`:"";el("challenge").classList.toggle("hidden",!this.target);for(const d of ["up","down","left","right"] as const)el(d).setAttribute("aria-label",this.t[d]);this.home.updateLanguage(this.language);this.controls.updateLanguage(this.language)}
  private emit(name:GameEventName,properties:Record<string,string|number|boolean|null>={}){void noOpEventSink.emit({eventId:crypto.randomUUID(),eventName:name,gameId:"G019",runId:this.run.id,sessionId:this.sessionId,timestamp:new Date().toISOString(),gameVersion:"0.1.0",properties})}
  private endEvent(result:"complete"|"abandoned"){if(!this.ended){this.ended=true;this.emit("game_end",{result,moves:this.state.moves})}}
  private start(){this.state=createGame(this.level);this.run=transitionRun(createRun("G019",String(this.level),crypto.randomUUID()),"PLAYING",new Date().toISOString());this.ended=false;this.emit("game_start",{level:this.level});el("setup").classList.add("hidden");el("result").classList.add("hidden");el("play").classList.remove("hidden");audio.unlock();audio.resume();audio.music("main");audio.play("start");el("feedback").textContent=this.t.hint;this.render();window.scrollTo({top:0,behavior:"smooth"})}
  private reset(){this.run=createRun("G019",String(this.level),crypto.randomUUID());audio.pause();el("play").classList.add("hidden");el("result").classList.add("hidden");el("setup").classList.remove("hidden");window.scrollTo({top:0,behavior:"smooth"})}
  private step(direction:Direction){if(this.run.state!=="PLAYING")return;const next=move(this.state,direction);if(next===this.state){audio.play("blocked");el("feedback").textContent=this.t.blocked;return}const got=next.collected.length>this.state.collected.length;this.state=next;audio.play(got?"gem":"move");el("feedback").textContent=this.t.hint;this.render();if(next.won)this.finish()}
  private render(){const {board,players,turn,collected,activated}=this.state;el("turn").textContent=turn===0?"🦊 1":"🐻 2";el("treasures").textContent=`${collected.length} / ${board.gems.length}`;const container=el("board");container.replaceChildren();container.style.direction="ltr";
    for(let y=0;y<board.height;y++)for(let x=0;x<board.width;x++){const p={x,y},cell=document.createElement("div");cell.className="cell";cell.setAttribute("role","gridcell");const wall=board.walls.some(a=>same(a,p)),plate=board.plates.findIndex(a=>same(a,p)),gate=board.gates.findIndex(a=>same(a,p)),gem=board.gems.findIndex(a=>same(a,p)),exit=same(board.exit,p);
      if(wall)cell.classList.add("wall");if(gate>=0)cell.classList.add("gate",...(!activated.includes(gate)?["closed"]:[]));if(exit)cell.classList.add("exit");const symbol=document.createElement("i");symbol.className="symbol";symbol.textContent=wall?"⛰":plate>=0?`${activated.includes(plate)?"✴":"✦"}${plate+1}`:gate>=0?`${activated.includes(gate)?"▰":"🔒"}${gate+1}`:gem>=0&&!collected.includes(gem)?"💎":exit?"⛺":"";cell.append(symbol);
      const occupants=players.map((a,i)=>same(a,p)?i:-1).filter(i=>i>=0);if(occupants.length){const group=document.createElement("div");group.className="avatars";for(const i of occupants){const avatar=document.createElement("span");avatar.textContent=i===0?"🦊":"🐻";avatar.className=i===turn?"active":"";group.append(avatar)}cell.append(group)}container.append(cell)}
  }
  private finish(){this.run=transitionRun(this.run,"RESULT",new Date().toISOString());this.endEvent("complete");audio.play("finish");audio.pause();el("play").classList.add("hidden");el("result").classList.remove("hidden");el("result-copy").textContent=`${this.state.moves} ${this.t.steps} · 💎 ${this.state.collected.length}/${this.state.board.gems.length}${this.target?` · 🏆 ${this.target} ${this.t.steps}`:""}`;}
  private link(){const url=new URL(shareLink(location.href,this.language));url.searchParams.set("level",String(this.level));url.searchParams.set("target",String(this.state.moves));return url.toString()}
  private async copyLink(){try{await copyShareLink(this.link());el("share-status").textContent=this.t.copied}catch{el("share-status").textContent=this.t.failed}}
  private async share(){try{const blob=await createScoreCard({title:this.t.title,score:String(this.state.moves),scoreLabel:this.t.steps,best:String(this.state.collected.length),bestLabel:this.t.treasures,invitation:this.t.share,url:this.link(),language:this.language,direction:this.language==="ar"?"rtl":"ltr",accent:"#e9bd71",drawArtwork(ctx){ctx.fillStyle="#73bba9";ctx.beginPath();ctx.ellipse(540,550,280,160,0,0,Math.PI*2);ctx.fill();ctx.font="120px sans-serif";ctx.textAlign="center";ctx.fillText("🦊 🐻",540,560);ctx.fillText("⛺",540,690)}});const outcome=await shareCardOrDownload(blob,"island-duo.png",this.t.title,this.link(),this.t.complete);if(outcome==="downloaded")el("share-status").textContent=this.t.saved}catch(error){if(!(error instanceof DOMException&&error.name==="AbortError"))el("share-status").textContent=this.t.failed}}
}
new IslandGame().init();
if(import.meta.env.PROD&&"serviceWorker" in navigator)void navigator.serviceWorker.register("./sw.js").catch(()=>{});
