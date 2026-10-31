import type { Metadata } from "next";
import Link from "next/link";
import { games, type GameCategory } from "@game-lab/game-core";
import { GameCard } from "../../components/GameCard";
import { AnalyticsPrivacy } from "../../components/AnalyticsPrivacy";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const categories: readonly GameCategory[] = ["手感挑戰", "動腦解謎", "創作實驗", "探索同玩"];

export const metadata: Metadata = {
  title: "給陪玩的大人｜朵朵栗栗的風鈴群島",
  description: "風鈴群島的陪玩建議、隱私說明，以及還在規劃中的遊戲。",
  alternates: { canonical: "/parents/" }
};

export default function Parents() {
  const planned = games.filter(game => game.status === "planned");
  return <main id="main-content" className="shell parentsPage">
    <Link href="/" className="backLink">← 回遊戲</Link>
    <aside id="for-grownups" className="parentNote" aria-labelledby="parents-heading"><div className="parentNoteArt"><img src={`${basePath}/brand/lili.webp`} alt="栗栗" width="160" height="148" /></div><div><h1 id="parents-heading">一起試，也留一點空間給孩子。</h1><p>可以問問：「你想先試哪一步？」再聽聽孩子的發現。每款介紹都有操作方式與練習方向；年齡只是初步建議，還需要依孩子的閱讀和操作經驗選擇。</p><div className="parentFacts"><span>不用帳號</span><span>沒有廣告</span><span>分享由玩家選擇</span></div><p className="privacyNote">本站不收集孩子的姓名、學校或班級。遊戲紀錄保存在目前裝置；成績與作品圖卡在裝置上產生，再由你決定是否分享。可以陪孩子試玩，再依當天的精神與興趣調整遊玩時間。</p><AnalyticsPrivacy className="privacyNote" /><p className="privacyNote">官方網址是 games.somewhen.life。如果在其他網址看到相同的遊戲，那不是我們經營的網站。</p></div></aside>
    {planned.length > 0 && <section className="plannedSection" aria-labelledby="coming-heading"><div className="sectionHead"><div><h2 id="coming-heading">還在畫圖的島嶼</h2></div><p>{planned.length}個玩法企劃，尚未開放遊玩。</p></div><p className="sectionIntro">先把點子放在這裡。完成操作、結算與重玩流程後，才會加入可玩遊戲。</p>{categories.map(category => {
      const upcoming = planned.filter(game => game.category === category);
      return upcoming.length ? <div className="plannedGroup" key={category}><h3>{category}</h3><div className="gameGrid plannedGrid">{upcoming.map(game => <GameCard game={game} compact key={game.id} />)}</div></div> : null;
    })}</section>}
  </main>;
}
