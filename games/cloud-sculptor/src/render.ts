import { artPath, type CloudArt } from './cafe-rules';
import type { StickerKind } from './rules';
export const paints = { cream: '#fff9df', pink: '#f2b0c1', mint: '#b5d9c6', blue: '#afd4ed' };
export const stickerIcons: Record<StickerKind, string> = { star: '✦', rain: '💧', rainbow: '🌈' };
let previewId = 0;
export function artworkSvg(art: CloudArt, guide = false): string {
    const id = `paint-${++previewId}`, path = artPath(art);
    return `<svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2=".2" y2="1"><stop offset="0" stop-color="${paints[art.color]}"/><stop offset="1" stop-color="${paints[art.secondColor ?? art.color]}"/></linearGradient><radialGradient id="${id}-glow" cx=".35" cy=".25" r=".75"><stop stop-color="#fff" stop-opacity=".85"/><stop offset=".45" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#657d69" stop-opacity=".18"/></radialGradient><clipPath id="${id}-clip"><path d="${path}" fill-rule="evenodd" clip-rule="evenodd"/></clipPath></defs><path d="${path}" fill="${guide ? 'none' : `url(#${id})`}" fill-rule="evenodd" stroke="${guide ? '#916051' : '#91a18e'}" stroke-width="${guide ? 6 : 3}" ${guide ? 'stroke-dasharray="13 11"' : `style="filter:drop-shadow(0 13px 8px #51767530) drop-shadow(0 -3px 2px #ffffff99)"`}/>${guide ? '' : `<g clip-path="url(#${id}-clip)"><path d="${path}" fill="url(#${id}-glow)" fill-rule="evenodd"/><path d="M 230 355 Q 250 240 370 265 Q 400 175 505 225 M 530 235 Q 620 200 668 280 M 290 410 Q 360 365 405 405 M 590 440 Q 650 395 700 430" fill="none" stroke="#fff" stroke-width="18" stroke-linecap="round" opacity=".24"/><ellipse cx="380" cy="270" rx="65" ry="22" fill="#fff" opacity=".23"/></g>`}${guide ? '' : art.stickers.map(s => `<text x="${s.point.x * 1000}" y="${s.point.y * 700}" font-size="72" text-anchor="middle" dominant-baseline="middle">${stickerIcons[s.kind]}</text>`).join('')}</svg>`;
}
export function drawArtwork(ctx: CanvasRenderingContext2D, art: CloudArt, w = 1000, h = 700) {
    const gradient = ctx.createLinearGradient(w * .3, h * .2, w * .6, h * .8);
    gradient.addColorStop(0, paints[art.color]);
    gradient.addColorStop(1, paints[art.secondColor ?? art.color]);
    ctx.fillStyle = gradient;
    ctx.strokeStyle = '#91a18e';
    ctx.lineWidth = 3;
    const path = new Path2D(artPath(art, w, h));
    ctx.save();
    ctx.shadowColor = '#51767530';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 12;
    ctx.fill(path, 'evenodd');
    ctx.restore();
    ctx.save();
    ctx.clip(path, 'evenodd');
    const glow = ctx.createRadialGradient(w * .35, h * .25, 0, w * .4, h * .4, w * .48);
    glow.addColorStop(0, '#ffffffcc');
    glow.addColorStop(.5, '#ffffff16');
    glow.addColorStop(1, '#657d692a');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#ffffff44';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    const wisps = new Path2D('M 230 355 Q 250 240 370 265 Q 400 175 505 225 M 530 235 Q 620 200 668 280 M 290 410 Q 360 365 405 405 M 590 440 Q 650 395 700 430');
    ctx.stroke(wisps);
    ctx.restore();
    ctx.stroke(path);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '72px sans-serif';
    for (const s of art.stickers)
        ctx.fillText(stickerIcons[s.kind], s.point.x * w, s.point.y * h);
}
