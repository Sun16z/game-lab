import { createRun, transitionRun, type GameRun } from "@game-lab/game-core";
import { mountHomeExit } from "@game-lab/platform-adapters";
import { GameAudio } from "@game-lab/game-audio";
import { mountAudioControls } from "@game-lab/game-audio/ui";
import { copyShareLink, createScoreCard, shareCardOrDownload, shareLink } from "@game-lab/game-share";
import { addSticker, cloudPath, initialArtwork, movePoint, moveSticker, type Artwork, type Point, type StickerKind } from "./rules";
import { chooseLanguage, copy, type Language } from "./i18n";
import { decodeArtwork, encodeArtwork } from "./challenge";
import "./style.css";

function el<T extends HTMLElement=HTMLElement>(id:string):T { const node=document.getElementById(id); if(!node)throw Error(`Missing ${id}`); return node as T; }
function storage():Storage|undefined { try { return localStorage; } catch { return undefined; } }
const icons:Record<StickerKind,string>={star:"✦",rain:"💧",rainbow:"🌈"};
const audio=new GameAudio({ cues:{ start:[.18,0,520,.01,.06,.18,0,1,90], edit:[.12,0,510,.01,.04,.12,0,1,60], sticker:[.16,0,650,.01,.06,.2,0,1,120], finish:[.2,0,620,.01,.1,.25,0,1,150] }, music:{} },storage());

class CloudGame {
  private language:Language=chooseLanguage(new URLSearchParams(location.search).get("lang")??storage()?.getItem("game-lab:language")??navigator.language);
  private seed=crypto.randomUUID(); private run:GameRun=createRun("G018",this.seed,crypto.randomUUID());
  private art:Artwork=initialArtwork(); private history:Artwork[]=[]; private nextId=0;
  private home=mountHomeExit(document.querySelector<HTMLElement>(".top-actions")!,this.language);
  private controls=mountAudioControls(el<HTMLButtonElement>("sound"),audio,this.language);
  private drag?:{kind:"point"|"sticker"; id:number; pointer:number};
  private get t(){ return copy[this.language]; }
  init(){
    const select=el<HTMLSelectElement>("language");select.value=this.language;
    select.addEventListener("change",()=>{this.language=chooseLanguage(select.value);try{storage()?.setItem("game-lab:language",this.language)}catch{}this.localize();this.render()});
    el("start").addEventListener("click",()=>this.start());el("undo").addEventListener("click",()=>this.undo());el("clear").addEventListener("click",()=>this.resetArt());el("finish").addEventListener("click",()=>this.finish());el("again").addEventListener("click",()=>this.restart());el("share").addEventListener("click",()=>void this.share());el("copy").addEventListener("click",()=>void this.copyLink());
    document.querySelectorAll<HTMLButtonElement>("[data-sticker]").forEach(button=>button.addEventListener("click",()=>this.insert(button.dataset.sticker as StickerKind)));
    const board=el("board");board.addEventListener("pointermove",event=>{if(this.drag?.pointer!==event.pointerId)return;this.move(this.drag.kind,this.drag.id,this.pointerPoint(event));});board.addEventListener("pointerup",event=>{if(this.drag?.pointer===event.pointerId)this.drag=undefined;});board.addEventListener("pointercancel",()=>{this.drag=undefined;});
    document.addEventListener("visibilitychange",()=>{if(document.hidden)audio.pause();else if(this.run.state==="PLAYING")audio.resume()});this.localize();this.render();
  }
  private localize(){
    document.documentElement.lang=this.language;document.documentElement.dir=this.language==="ar"?"rtl":"ltr";document.title=`${this.t.title}｜Game Lab`;
    for(const [id,key] of [["title","title"],["play-title","title"],["intro","intro"],["learning","learning"],["start","start"],["hint","hint"],["help","help"],["star","star"],["rain","rain"],["rainbow","rainbow"],["undo","undo"],["clear","clear"],["finish","finish"],["result-title","result"],["again","again"],["share","share"],["copy","copy"]] as const)el(id).textContent=this.t[key];
    this.home.updateLanguage(this.language);this.controls.updateLanguage(this.language);
  }
  private start(){this.seed=crypto.randomUUID();this.run=transitionRun(createRun("G018",this.seed,crypto.randomUUID()),"PLAYING",new Date().toISOString());const shared=decodeArtwork(new URLSearchParams(location.hash.slice(1)).get("art")??"");this.art=shared??initialArtwork();this.history=[];this.nextId=this.art.stickers.length;el("setup").classList.add("hidden");el("result").classList.add("hidden");el("play").classList.remove("hidden");audio.unlock();audio.resume();audio.play("start");this.render();}
  private restart(){this.run=createRun("G018",crypto.randomUUID(),crypto.randomUUID());audio.pause();el("play").classList.add("hidden");el("result").classList.add("hidden");el("setup").classList.remove("hidden");window.scrollTo({top:0,behavior:"smooth"});}
  private save(){this.history.push(this.art);if(this.history.length>40)this.history.shift();}
  private undo(){const previous=this.history.pop();if(previous){this.art=previous;audio.play("edit");this.render();}}
  private resetArt(){this.save();this.art=initialArtwork();audio.play("edit");this.render();}
  private insert(kind:StickerKind){const next=addSticker(this.art,kind,this.nextId);if(next!==this.art){this.save();this.art=next;this.nextId++;audio.play("sticker");this.render();}}
  private pointerPoint(event:PointerEvent):Point{const r=el("board").getBoundingClientRect();return{x:(event.clientX-r.left)/r.width,y:(event.clientY-r.top)/r.height};}
  private move(kind:"point"|"sticker",id:number,point:Point){this.art=kind==="point"?movePoint(this.art,id,point):moveSticker(this.art,id,point);this.render(false);}
  private attach(button:HTMLButtonElement,kind:"point"|"sticker",id:number){
    button.addEventListener("pointerdown",event=>{if(this.run.state!=="PLAYING")return;event.preventDefault();this.save();this.drag={kind,id,pointer:event.pointerId};el("board").setPointerCapture(event.pointerId);audio.play("edit");});
    button.addEventListener("keydown",event=>{const delta:Record<string,Point>={ArrowLeft:{x:-.025,y:0},ArrowRight:{x:.025,y:0},ArrowUp:{x:0,y:-.025},ArrowDown:{x:0,y:.025}};const d=delta[event.key];if(!d)return;event.preventDefault();const p=kind==="point"?this.art.points[id]:this.art.stickers.find(item=>item.id===id)?.point;if(!p)return;this.save();this.move(kind,id,{x:p.x+d.x,y:p.y+d.y});audio.play("edit");});
  }
  private render(rebuild=true){
    const d=cloudPath(this.art.points,1000,600);document.getElementById("cloud-shape")!.setAttribute("d",d);document.getElementById("cloud-shadow")!.setAttribute("d",d);
    const handles=el("handles"),stickers=el("stickers");
    if(rebuild){handles.replaceChildren();stickers.replaceChildren();this.art.points.forEach((_,i)=>{const b=document.createElement("button");b.type="button";b.className="handle";b.dataset.id=String(i);b.textContent="✦";b.setAttribute("aria-label",`${this.t.point} ${i+1}`);this.attach(b,"point",i);handles.append(b)});this.art.stickers.forEach(sticker=>{const b=document.createElement("button");b.type="button";b.className="sticker";b.dataset.id=String(sticker.id);b.textContent=icons[sticker.kind];b.setAttribute("aria-label",`${this.t.sticker}: ${this.t[sticker.kind]}`);this.attach(b,"sticker",sticker.id);stickers.append(b)});}
    this.art.points.forEach((point,i)=>{const b=handles.querySelector<HTMLElement>(`[data-id="${i}"]`);if(b){b.style.left=`${point.x*100}%`;b.style.top=`${point.y*100}%`;}});
    this.art.stickers.forEach(sticker=>{const b=stickers.querySelector<HTMLElement>(`[data-id="${sticker.id}"]`);if(b){b.style.left=`${sticker.point.x*100}%`;b.style.top=`${sticker.point.y*100}%`;}});
    el<HTMLButtonElement>("undo").disabled=this.history.length===0;
  }
  private finish(){if(this.run.state!=="PLAYING")return;this.run=transitionRun(this.run,"RESULT",new Date().toISOString());audio.play("finish");audio.pause();el("play").classList.add("hidden");el("result").classList.remove("hidden");const result=el("result-art");result.innerHTML=`<svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${this.t.art}"><path fill="#fffaf0" stroke="#608b91" stroke-width="6" d="${cloudPath(this.art.points,1000,600)}"></path>${this.art.stickers.map(s=>`<text x="${s.point.x*1000}" y="${s.point.y*600}" text-anchor="middle" font-size="72">${icons[s.kind]}</text>`).join("")}</svg>`;}
  private link(){const url=new URL(shareLink(location.href,this.language));url.hash=new URLSearchParams({art:encodeArtwork(this.art)}).toString();return url.toString();}
  private async copyLink(){try{await copyShareLink(this.link());el("share-status").textContent=this.t.copied}catch{el("share-status").textContent=this.t.failed}}
  private async share(){try{const art=this.art,blob=await createScoreCard({title:this.t.title,score:"☁",scoreLabel:this.t.art,best:String(art.stickers.length),bestLabel:this.t.sticker,invitation:this.t.share,url:this.link(),language:this.language,direction:this.language==="ar"?"rtl":"ltr",accent:"#f0b77e",drawArtwork(ctx){ctx.fillStyle="#d4ebea";ctx.fillRect(190,320,700,430);ctx.save();ctx.translate(190,320);ctx.scale(.7,.7);ctx.fillStyle="#fffaf0";ctx.fill(new Path2D(cloudPath(art.points,1000,600)));ctx.textAlign="center";ctx.font="72px sans-serif";for(const s of art.stickers)ctx.fillText(icons[s.kind],s.point.x*1000,s.point.y*600);ctx.restore();}});const result=await shareCardOrDownload(blob,"cloud-sculptor.png",this.t.title,this.link(),this.t.result);if(result==="downloaded")el("share-status").textContent=this.t.saved;}catch(error){if(!(error instanceof DOMException&&error.name==="AbortError"))el("share-status").textContent=this.t.failed;}}
}
new CloudGame().init();
