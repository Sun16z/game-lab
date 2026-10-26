import type Phaser from "phaser";
import type { Theme } from "./progress";

const blend=(a:number,b:number,t:number)=>{
  const c=(shift:number)=>Math.round(((a>>shift)&255)*(1-t)+((b>>shift)&255)*t);
  return(c(16)<<16)|(c(8)<<8)|c(0);
};

/** Small, authored vector scenery. All animation stops with the game's draw loop. */
export function drawSkyWorkshop(g:Phaser.GameObjects.Graphics,layers:number,theme:Theme,time:number,reduced:boolean):void{
  const altitude=Math.min(1,layers/25),night=theme!=="classic"?1:Math.max(0,(layers-16)/9);
  const top=blend(0x91ced7,0x182747,night),bottom=blend(0xf5e4b5,0x4d5c84,night);
  for(let y=0;y<720;y+=18)g.fillStyle(blend(top,bottom,y/720),1).fillRect(0,y,480,18);
  const drift=reduced?0:Math.sin(time/3800)*12;
  g.fillStyle(0xffe29b,night? .55:.95).fillCircle(385,116,night?32:43);
  if(night)g.fillStyle(top,1).fillCircle(398,106,29);
  if(night>0){for(let i=0;i<36;i++){const x=(i*137+31)%480,y=(i*83+24)%520;g.fillStyle(0xfff7d9,night*(i%3===0?.9:.5)).fillCircle(x,y,i%5===0?2:1)}}
  // Distant roofline sinks as the tower rises, giving height a visible destination.
  const cityY=613+Math.min(layers*11,220);
  for(let i=0;i<10;i++){
    const x=i*57-28,h=50+(i*37)%110;
    g.fillStyle(blend(0x71a6b0,0x303e5f,night),.7).fillRoundedRect(x,cityY-h,47,h,4);
    g.fillStyle(0xffedb2,.6);for(let row=0;row<3;row++)for(let col=0;col<2;col++)g.fillRect(x+10+col*18,cityY-h+13+row*23,7,10);
    g.fillStyle(0x4b7b89,.7).fillTriangle(x-4,cityY-h+3,x+23,cityY-h-18,x+50,cityY-h+3);
  }
  const cloud=(x:number,y:number,w:number,alpha:number)=>{g.fillStyle(0xfffcf1,alpha).fillRoundedRect(x,y,w,21,10);g.fillCircle(x+w*.3,y,18);g.fillCircle(x+w*.6,y-4,25)};
  cloud(-26+drift,170+altitude*90,121,.62-night*.3);cloud(345-drift,298+altitude*120,162,.54-night*.2);cloud(10+drift*.5,430+altitude*90,98,.42);
  if(night<.8){
    // A balloon carrying a tiny workshop basket, deliberately off the action axis.
    const x=72+drift*.4,y=235+Math.sin(reduced?0:time/2500)*5;
    g.fillStyle(0xc6644a,.9).fillEllipse(x,y,38,46);g.fillStyle(0xf5c967,1).fillEllipse(x,y,15,45);
    g.lineStyle(1,0x725844,1).lineBetween(x-9,y+20,x-6,y+34).lineBetween(x+9,y+20,x+6,y+34);
    g.fillStyle(0x725844,1).fillRoundedRect(x-9,y+33,18,12,3);
  }else{
    g.lineStyle(3,0xd5bf98,.6).strokeEllipse(76,258,82,22);g.fillStyle(0xbc9a99,1).fillCircle(76,258,23);g.lineStyle(3,0xf6d895,.8).lineBetween(35,262,115,253);
  }
  // The workshop's floating stone foundation stays in view as the camera climbs.
  g.fillStyle(0x355568,.22).fillEllipse(240,677,335,27);
  g.fillStyle(0x486b77,1).fillTriangle(103,639,377,639,260,697);
  g.fillStyle(0x6b9393,1).fillTriangle(103,639,240,639,260,697);
  g.fillStyle(0x365b6c,1).fillTriangle(240,639,377,639,260,697);
  g.fillStyle(0x476f6c,1).fillRoundedRect(42,633,396,17,7);
  g.fillStyle(0xb6d4ab,1).fillRoundedRect(42,627,396,12,5);
  // Low-key companion: hard hat, eyes and tiny waving arm, below the drop zone.
  const wave=reduced?0:Math.sin(time/450)*3;
  g.fillStyle(0xc66349,1).fillRoundedRect(49,584,34,43,13);g.fillStyle(0xffe1a5,1).fillRoundedRect(54,592,24,21,8);
  g.fillStyle(0x284d61,1).fillCircle(61,600,2).fillCircle(72,600,2);
  g.fillStyle(0xf5c967,1).fillRoundedRect(47,579,39,9,4).fillRoundedRect(54,567,25,18,8);
  g.lineStyle(5,0xc66349,1).lineBetween(80,606,92,596+wave);
  g.fillStyle(0x284d61,1).fillEllipse(55,628,18,8).fillEllipse(78,628,18,8);
  // Right-side bunting echoes construction flags without crossing the moving block.
  g.lineStyle(2,0x56727a,.65).lineBetween(420,534,420,629);
  g.fillStyle(0xe8b954,1).fillTriangle(420,537,454,548,420,561);
}

export function drawHouseWindows(g:Phaser.GameObjects.Graphics,x:number,y:number,width:number,index:number):void{
  if(width<32)return;
  const count=Math.max(1,Math.floor((width-18)/28)),start=x+width/2-(count-1)*14;
  g.fillStyle(index%3===0?0xfff3c4:0x365b6c,.72);
  for(let i=0;i<count;i++)g.fillRoundedRect(start+i*28-4,y+13,8,10,2);
  g.lineStyle(1,0xffffff,.25).lineBetween(x+7,y+29,x+width-7,y+29);
}
