import { games } from "@game-lab/game-core";
import Link from "next/link";

export default function Home() {
  return (
    <main className="shell">
      <header className="hero">
        <div className="eyebrow">GAME LAB / PLAYFUL EXPERIMENTS</div>
        <h1>每一局，都想再試一次。</h1>
        <p>五款HTML5遊戲正在準備中。第一站是《完美疊塔》：抓準時機、疊得更高，挑戰自己的紀錄。</p>
        <div className="heroMeta"><span>5款企劃</span><span>手機觸控優先</span><span>免費遊玩</span></div>
      </header>
      <section aria-labelledby="games-heading" className="catalog">
        <div className="sectionHead"><h2 id="games-heading">遊戲目錄</h2><p>依開發順序排列</p></div>
        <div className="grid">
          {games.map((game, index) => (
            <article className="card" key={game.id}>
              <div className={`art art${index + 1}`} aria-hidden="true"><span>{String(index + 1).padStart(2, "0")}</span></div>
              <div className="cardBody">
                <div className="cardTop"><span className="tag">{game.id}</span><span className="status">{game.status === "playable" ? "立即遊玩" : "開發規劃中"}</span></div>
                <h3>{game.title}</h3>
                <p>{game.summary}</p>
                <Link href={`/games/${game.slug}`} aria-label={`${game.status === "playable" ? "遊玩" : "查看"}${game.title}`}>{game.status === "playable" ? "開始遊玩" : "查看企劃"} <span aria-hidden="true">↗</span></Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <footer>Game Lab · 第一款《完美疊塔》已開放試玩，其餘作品持續開發中。</footer>
    </main>
  );
}
