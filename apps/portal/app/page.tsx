import { games, type GameCategory } from "@game-lab/game-core";
import Link from "next/link";
import { ArrivalScene } from "../components/Brand";
import { GameCard } from "../components/GameCard";
import { GameArt } from "../components/GameArt";

const categories: readonly { name: GameCategory; id: string; invitation: string; description: string }[] = [
  { name: "手感挑戰", id: "hands-on", invitation: "動動手，試試看", description: "抓時機、記旋律，或沿著天空往上跳。" },
  { name: "動腦解謎", id: "little-puzzles", invitation: "停一下，想一想", description: "找線索、配顏色，把自己的解法試出來。" },
  { name: "創作實驗", id: "make-something", invitation: "做一個自己的點子", description: "雲朵、餐盤和小橋，都是你的創作材料。" },
  { name: "探索同玩", id: "explore-together", invitation: "找個伴，一起出發", description: "走星圖、遊小島，一起商量下一步。" }
];

export default function Home() {
  const playable = games.filter(game => game.status === "playable");
  const planned = games.filter(game => game.status === "planned");
  return <main id="main-content" className="shell homePage">
    <section className="arrivalHero" aria-labelledby="arrival-title"><div className="arrivalCopy"><p className="eyebrow"><span className="tinyRule" />歡迎來到朵朵栗栗的風鈴群島</p><h1 id="arrival-title">風鈴響了，<br />一起去玩吧。</h1><p className="arrivalIntro">捏一朵雲、搭一座橋，<br className="desktopBreak" />或帶著好奇心，去下一座小島。</p><a className="primaryButton" href="#play-now">挑一個遊戲<span aria-hidden="true">↓</span></a><p className="arrivalFacts">{playable.length}款可以玩 · 免費 · 不用註冊</p></div><ArrivalScene /></section>
    <section className="featuredSection" aria-labelledby="featured-heading"><div className="sectionHead"><div><p className="eyebrow">今天想去哪裡？</p><h2 id="featured-heading">先到朋友的島上坐坐</h2></div><a className="textLink" href="#play-now">看看全部遊戲 <span aria-hidden="true">↓</span></a></div><div className="featuredGrid">
      <Link href="/games/cloud-sculptor/" className="featuredStory cafeStory"><GameArt slug="cloud-sculptor" /><div className="featuredStoryCopy"><p className="eyebrow">朵朵與栗栗的午後</p><h3>把雲朵，捏成下午茶。</h3><p>24張形狀訂單，也能慢慢自由創作。</p><span className="textLink">走進雲朵咖啡館 <span aria-hidden="true">↗</span></span></div></Link>
      <Link href="/games/cloud-climb/" className="featuredStory climbStory"><GameArt slug="cloud-climb" /><div className="featuredStoryCopy"><p className="eyebrow">沿著白雲向上走</p><h3>天空小屋，就在上面。</h3><p>角色自己跳，你來帶路。12條天空路線等你探索。</p><span className="textLink">去玩朵朵栗栗的跳跳雲 <span aria-hidden="true">↗</span></span></div></Link>
    </div></section>
    <section id="play-now" className="catalog" aria-labelledby="play-heading"><div className="sectionHead"><div><p className="eyebrow">島上的遊戲手帖</p><h2 id="play-heading">今天，想怎麼玩？</h2></div><p>{playable.length}款可玩，選你喜歡的步調。</p></div><nav className="categoryNav" aria-label="依玩法前往遊戲分類">{categories.map(category => {
      const count = playable.filter(game => game.category === category.name).length;
      return <a href={`#${category.id}`} key={category.id}>{category.name}<span>{count}</span><span aria-hidden="true">↓</span></a>;
    })}</nav>
    {categories.map(category => <section id={category.id} key={category.id} className="categoryGroup" aria-labelledby={`${category.id}-heading`}><div className="categoryHead"><div><span className="categoryLabel">{category.name}</span><h3 id={`${category.id}-heading`}>{category.invitation}</h3></div><p>{category.description}</p></div><div className="gameGrid">{playable.filter(game => game.category === category.name).map(game => <GameCard game={game} key={game.id} />)}</div></section>)}
    </section>
    <aside id="for-grownups" className="parentNote" aria-labelledby="parents-heading"><div className="parentNoteArt"><img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/brand/lili.webp`} alt="栗栗" width="160" height="148" loading="lazy" /></div><div><p className="eyebrow">給陪玩的大人</p><h2 id="parents-heading">一起試，也留一點空間給孩子。</h2><p>可以問問：「你想先試哪一步？」再聽聽孩子的發現。每款介紹都有操作方式與練習方向；年齡只是初步建議，還需要依孩子的閱讀和操作經驗選擇。</p><div className="parentFacts"><span>不用帳號</span><span>沒有廣告</span><span>分享由玩家選擇</span></div><p className="privacyNote">本站不收集孩子的姓名、學校或班級。遊戲紀錄保存在目前裝置；成績與作品圖卡在裝置上產生，再由你決定是否分享。可以陪孩子試玩，再依當天的精神與興趣調整遊玩時間。</p></div></aside>
    <section className="plannedSection" aria-labelledby="coming-heading"><div className="sectionHead"><div><p className="eyebrow">還在畫圖的島嶼</p><h2 id="coming-heading">接下來，還想試試這些</h2></div><p>{planned.length}個玩法企劃，尚未開放遊玩。</p></div><p className="sectionIntro">先把點子放在這裡。完成操作、結算與重玩流程後，才會加入可玩遊戲。</p>{categories.map(category => {
      const upcoming = planned.filter(game => game.category === category.name);
      return upcoming.length ? <div className="plannedGroup" key={category.name}><h3>{category.name}</h3><div className="gameGrid plannedGrid">{upcoming.map(game => <GameCard game={game} compact key={game.id} />)}</div></div> : null;
    })}</section>
  </main>;
}
