"use client";
import { useState } from "react";

export function InlinePlay({ title, href }: { title: string; href: string }) {
  const [open, setOpen] = useState(false);
  return <section className="inlinePlay" aria-labelledby="inline-play-heading"><div className="inlinePlayHeading"><div><p className="eyebrow">留在這裡也能玩</p><h2 id="inline-play-heading">把遊戲打開在這一頁</h2></div><button type="button" className="secondaryButton" aria-expanded={open} aria-controls="game-preview" onClick={() => setOpen(!open)}>{open ? "關閉試玩" : "在這頁試玩"}<span aria-hidden="true">{open ? "−" : "+"}</span></button></div>
    {open ? <div id="game-preview" className="inlinePlayFrame"><iframe src={href} title={`${title}頁內遊戲`} allow="fullscreen" /><a href={href}>用完整畫面遊玩 ↗</a></div> : <p id="game-preview" className="inlinePlayNote">也可以留在這頁試玩，想要更大畫面就選「開始遊玩」。</p>}
  </section>;
}
