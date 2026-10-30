import Link from "next/link";
import { games } from "@game-lab/game-core";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function Chime({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 44 52" fill="none" aria-hidden="true"><path d="M22 5V12M8 29Q8 13 22 13Q36 13 36 29Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M22 29V40M16 41 27 38 31 47 20 50Z" fill="#efc86a" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M3 9 7 12M36 8 40 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}

export function SiteHeader() {
  return <header className="siteHeader">
    <Link href="/" className="brand" aria-label="朵朵栗栗的風鈴群島首頁"><Chime /><span>朵朵栗栗<span className="brandSub">風鈴群島 · Game Lab</span></span></Link>
    <nav aria-label="主要導覽"><Link href="/parents/" className="parentNav">給大人</Link></nav>
  </header>;
}

export function SiteFooter() {
  const playable = games.filter(game => game.status === "playable").length;
  return <footer className="siteFooter"><div className="footerBrand"><Chime /><p>風鈴響了，<br />下次再一起出發。</p></div><div><Link href="/">回遊戲 ↑</Link> <Link href="/parents/">給陪玩的大人</Link><p>{playable}款可玩 · 免費遊玩 · 不用註冊</p><small>朵朵栗栗的風鈴群島 / Game Lab</small></div></footer>;
}

export function ArrivalScene() {
  return <figure className="arrivalScene" aria-label="朵朵、栗栗和小燈在漂浮島上，遠方有雲朵咖啡館和天空小屋">
    <svg className="arrivalWorld" viewBox="0 0 650 560" aria-hidden="true"><circle cx="508" cy="100" r="45" fill="#efc86a" /><path d="M90 112Q63 101 78 82Q84 67 106 76Q115 48 143 65Q169 52 180 76Q212 82 195 103Z" fill="#fffaf0" /><path d="M441 225Q414 215 429 196Q435 181 457 190Q466 162 494 179Q520 166 531 190Q563 196 546 217Z" fill="#fffaf0" /><path d="M33 343Q83 283 155 309Q210 333 173 352L94 400Z" fill="#d9c49f" /><path d="M33 343Q80 286 155 309Q212 333 173 352Q99 368 33 343" fill="#b5c39a" /><path d="M53 334H149M63 321H138" stroke="#f4ead2" strokeWidth="5" strokeLinecap="round" /><path d="M443 296Q493 258 563 284Q612 309 569 329L506 371Z" fill="#d9c49f" /><path d="M443 296Q493 258 563 284Q612 309 569 329Q491 348 443 296" fill="#a6bfa2" /><path d="M481 283V243H537V295" fill="#fff8e8" /><path d="M471 244 510 212 548 244Z" fill="#ce785b" /><path d="M499 284V262H517V286" fill="#789d82" /><path d="M134 268Q231 171 322 225T499 208" fill="none" stroke="#fff8e8" strokeWidth="3" strokeDasharray="8 10" /><path d="M209 157H313V169H209Z" fill="#fff8e8" /><path d="M209 157V174Q218 187 226 174Q236 187 244 174Q253 187 261 174Q271 187 279 174Q288 187 296 174Q305 187 313 174V157Z" fill="#ce785b" /><path d="M216 181V213H308V181" fill="#fff8e8" /><path d="M204 216H320" stroke="#a78363" strokeWidth="9" strokeLinecap="round" /><ellipse cx="261" cy="226" rx="78" ry="16" fill="#b3c6ad" /><path d="M86 435Q181 375 323 389Q485 366 584 435L505 506Q343 559 163 505Z" fill="#cbb08b" /><path d="M86 435Q181 375 323 389Q485 366 584 435Q520 487 330 490Q161 494 86 435" fill="#9db998" /><path d="M144 445Q331 390 525 447" fill="none" stroke="#ebdfbd" strokeWidth="26" strokeLinecap="round" /><path d="M565 372V411M553 383 564 363 578 383M560 373 551 358 541 372" fill="#789d82" stroke="#789d82" strokeWidth="3" /><path d="M104 443V394M87 416 104 386 122 416" fill="#789d82" stroke="#789d82" strokeWidth="4" /><path d="M381 95V132M367 132Q367 110 381 110Q395 110 395 132ZM381 132V161" stroke="#789d82" strokeWidth="3" fill="none" /><path d="M373 160 390 157 394 177 378 181Z" fill="#efc86a" /><path d="M51 207 63 201M54 220 65 217M601 169 612 176" stroke="#87ab9f" strokeWidth="3" strokeLinecap="round" /></svg>
    <img className="arrivalDodo" src={`${basePath}/brand/dodo.webp`} alt="藍色的朵朵，陪大家探索風鈴群島" width="480" height="513" fetchPriority="high" />
    <img className="arrivalLili" src={`${basePath}/brand/lili.webp`} alt="栗栗，繫紅圍巾的松鼠朋友" width="480" height="444" fetchPriority="high" />
    <img className="arrivalPip" src={`${basePath}/brand/pip.webp`} alt="小燈，陪大家探索的小夥伴" width="400" height="370" />
    <figcaption><span className="arrivalDot" />朵朵、栗栗和小燈，等你一起出發。</figcaption>
  </figure>;
}
