import type { Feature, SnowState } from './rules';

/** Lightweight perspective projection for a fixed logical canvas. */
export function project(distance: number, lane: number): { x: number; y: number; scale: number } {
  const depth = Math.max(0, Math.min(1, distance / 240));
  const scale = .22 + (1 - depth) * .78;
  return { x: 240 + lane * 135 * scale, y: 565 - (1 - scale) * 460, scale };
}

export function drawSnow(ctx: CanvasRenderingContext2D, state: SnowState, features: readonly Feature[], skier?: HTMLImageElement | HTMLCanvasElement, course: 0 | 1 | 2 = 0): void {
  const sky = ctx.createLinearGradient(0, 0, 0, 640);
  sky.addColorStop(0, ['#80bdd7','#645e9c','#568eaa'][course]); sky.addColorStop(.55, ['#d7eff0','#cfb9db','#b9dedd'][course]); sky.addColorStop(1, '#f6fbfa');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, 480, 640);
  const halo=ctx.createRadialGradient(392,78,12,392,78,80);halo.addColorStop(0,'#fff5d8aa');halo.addColorStop(1,'#fff5d800');ctx.fillStyle=halo;ctx.fillRect(312,0,160,158);
  ctx.fillStyle = '#fff4ce'; ctx.beginPath(); ctx.arc(392, 78, 31, 0, Math.PI * 2); ctx.fill();
  // Soft cloud banks and a little cable car add a recognizable alpine setting.
  ctx.fillStyle='#ffffff72';for(const [x,y] of [[42,58],[290,113]]){ctx.beginPath();ctx.ellipse(x,y,34,9,0,0,Math.PI*2);ctx.ellipse(x+17,y-5,16,8,0,0,Math.PI*2);ctx.fill();}
  if (course === 1) { ctx.fillStyle = '#fff9dd'; for (let i = 0; i < 20; i++) { ctx.beginPath(); ctx.arc((i * 97 + 25) % 480, 20 + (i * 53) % 150, 1 + i % 2, 0, Math.PI * 2); ctx.fill(); } }
  ctx.fillStyle = '#e8f4f4'; ctx.beginPath(); ctx.moveTo(0, 270); ctx.lineTo(105, 88); ctx.lineTo(175, 200); ctx.lineTo(270, 64); ctx.lineTo(405, 255); ctx.lineTo(480, 137); ctx.lineTo(480, 360); ctx.lineTo(0, 360); ctx.fill();
  ctx.fillStyle = '#bdd9df'; ctx.beginPath(); ctx.moveTo(0, 300); ctx.lineTo(94, 167); ctx.lineTo(159, 252); ctx.lineTo(245, 126); ctx.lineTo(363, 295); ctx.lineTo(460, 205); ctx.lineTo(480, 330); ctx.lineTo(0, 330); ctx.fill();
  // A second layer of shaded peaks makes the horizon feel like a place, not a flat backdrop.
  ctx.fillStyle = '#739aa8'; ctx.beginPath(); ctx.moveTo(0,330);ctx.lineTo(66,235);ctx.lineTo(117,285);ctx.lineTo(177,210);ctx.lineTo(240,312);ctx.lineTo(319,219);ctx.lineTo(377,285);ctx.lineTo(434,228);ctx.lineTo(480,300);ctx.lineTo(480,365);ctx.lineTo(0,365);ctx.fill();
  ctx.fillStyle = '#effbfc'; for (const [x,y] of [[66,235],[177,210],[319,219],[434,228]]) { ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-16,y+24);ctx.lineTo(x-3,y+19);ctx.lineTo(x+4,y+25);ctx.lineTo(x+16,y+24);ctx.fill(); }
  ctx.strokeStyle='#65838b';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,137);ctx.lineTo(170,190);ctx.stroke();const liftX=30+(state.elapsed*5)%120;const liftY=137+liftX*53/170;ctx.beginPath();ctx.moveTo(liftX,liftY);ctx.lineTo(liftX,liftY+8);ctx.stroke();ctx.fillStyle='#e88b69';ctx.fillRect(liftX-8,liftY+8,16,14);ctx.fillStyle='#d6f4f7';ctx.fillRect(liftX-5,liftY+10,10,6);
  const slope = ctx.createLinearGradient(0,240,0,640);slope.addColorStop(0,'#f8ffff');slope.addColorStop(.65,'#e8f8fb');slope.addColorStop(1,'#c7edf5');
  ctx.fillStyle = slope; ctx.beginPath(); ctx.moveTo(202, 240); ctx.lineTo(278, 240); ctx.lineTo(480, 640); ctx.lineTo(0, 640); ctx.closePath(); ctx.fill();
  // Roadside pines and moving markings help players perceive speed and direction.
  for (let i = 0; i < 12; i++) {
    const distance = ((i * 24 - state.distance % 24) + 288) % 288;
    if (distance > 240) continue;
    const q = project(distance, 0), width = 38 + q.scale * 184;
    for (const side of [-1, 1]) {
      const x = 240 + side * (width + 10 * q.scale), h = 65 * q.scale, w = 25 * q.scale;
      ctx.fillStyle = '#77574a';ctx.fillRect(x-3*q.scale,q.y-8*q.scale,6*q.scale,13*q.scale);
      ctx.fillStyle = course === 2 ? '#245f59' : '#3c7776'; ctx.beginPath();ctx.moveTo(x,q.y-h);ctx.lineTo(x-w,q.y);ctx.lineTo(x+w,q.y);ctx.fill();
      ctx.fillStyle = '#a9ded9';ctx.beginPath();ctx.moveTo(x,q.y-h*.85);ctx.lineTo(x-w*.65,q.y-h*.27);ctx.lineTo(x+w*.65,q.y-h*.27);ctx.fill();
      ctx.fillStyle = '#f2fbf7';ctx.beginPath();ctx.moveTo(x,q.y-h);ctx.lineTo(x-w*.45,q.y-h*.55);ctx.lineTo(x+w*.45,q.y-h*.55);ctx.fill();
    }
    ctx.fillStyle='#cde9e9';ctx.fillRect(237,q.y,6,Math.max(2,11*q.scale));
  }
  ctx.strokeStyle = '#b5dce4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(202, 240); ctx.lineTo(0, 640); ctx.moveTo(278, 240); ctx.lineTo(480, 640); ctx.stroke();
  // Peripheral streaks move with distance; the central play area stays unobscured.
  ctx.strokeStyle = '#ffffff99';ctx.lineWidth = 2;ctx.lineCap = 'round';
  for(let i=0;i<8;i++){const phase=(state.distance*1.8+i*79)%390;const side=i%2?1:-1;const x=240+side*(92+phase*.40);const y=260+phase;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+side*8,y+24+phase*.09);ctx.stroke();}
  const visible = features.filter(f => f.distance >= state.distance && f.distance - state.distance <= 240).sort((a, b) => b.distance - a.distance);
  for (const f of visible) {
    const p = project(f.distance - state.distance, f.lane);
    ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.scale, p.scale);
    if (f.kind === 'gate') {
      ctx.strokeStyle = '#e46d62'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-48, 0); ctx.lineTo(-48, -46); ctx.moveTo(48, 0); ctx.lineTo(48, -46); ctx.stroke();
      ctx.fillStyle = '#e46d62'; ctx.fillRect(-48, -46, 96, 12); ctx.fillStyle = '#fff4d4'; ctx.fillRect(-30, -43, 14, 6); ctx.fillRect(3, -43, 14, 6);
    } else {
      ctx.fillStyle = '#b9d9e1'; ctx.beginPath(); ctx.ellipse(0, -10, 28, 13, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(-4, -15, 22, 10, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  const x = 240 + state.x * 135; const y = 563 - (state.jump > 0 ? Math.sin(Math.PI * state.jump / .8) * 55 : 0);
  ctx.fillStyle = '#59899955'; ctx.beginPath(); ctx.ellipse(x, 595, 30, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#c56858'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 25, y + 25); ctx.lineTo(x + 23, y + 25); ctx.stroke();
  if (skier && (skier instanceof HTMLCanvasElement || skier.complete && skier.naturalWidth)) ctx.drawImage(skier, x - 62, y - 72, 124, 124);
  else { ctx.fillStyle = '#4297bb'; ctx.beginPath(); ctx.arc(x, y - 8, 24, 0, Math.PI * 2); ctx.fill(); }
}
