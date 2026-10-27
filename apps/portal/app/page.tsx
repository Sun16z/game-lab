import { games, type GameCategory, type GameDefinition } from "@game-lab/game-core";
import Link from "next/link";

const categories: readonly { name: GameCategory; description: string }[] = [
  { name: "手感挑戰", description: "抓時機、找節奏、練習操控。" },
  { name: "動腦解謎", description: "觀察線索，試出自己的解法。" },
  { name: "創作實驗", description: "搭建、組合，做出自己的作品。" },
  { name: "探索同玩", description: "發現故事，也能和朋友一起玩。" }
];

function GameCard({ game, compact = false }: { game: GameDefinition; compact?: boolean }) {
  return (
    <article className={`card${compact ? " cardCompact" : ""}`}>
      <div className="art" style={{ background: `linear-gradient(135deg, ${game.art[0]}, ${game.art[1]})` }} aria-hidden="true">
        <span className="artMotif">{game.motif}</span><span className="artNumber">{game.id.slice(1)}</span>
      </div>
      <div className="cardBody">
        <div className="cardTop"><span className="tag">{game.category}</span><span className="status">{game.status === "playable" ? "立即遊玩" : "開發規劃中"}</span></div>
        <h3>{game.title}</h3>
        <p>{game.summary}</p>
        <div className="replay">↻ {game.replay}</div>
        {game.status === "playable" ? (
          <a href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/play/${game.slug}/`} aria-label={`遊玩${game.title}`}>
            開始遊玩 <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <Link href={`/games/${game.slug}`} aria-label={`查看${game.title}`}>
            查看玩法企劃 <span aria-hidden="true">↗</span>
          </Link>
        )}
      </div>
    </article>
  );
}

export default function Home() {
  const playable = games.filter((game) => game.status === "playable");
  return (
    <main className="shell">
      <header className="hero">
        <div className="eyebrow">GAME LAB / {games.length} GAME IDEAS</div>
        <h1>每一局，都有新玩法。</h1>
        <p>從疊塔、打怪，到造橋、做音樂、探索星球。以20款上線遊戲為目標，目前有{games.length}個企劃與候選；先玩已開放的{playable.length}款。</p>
        <div className="heroMeta"><span>{playable.length}款已開放</span><span>{games.length}款企劃</span><span>手機觸控優先</span><span>免費遊玩</span></div>
        <a className="heroAction" href="#play-now">先玩遊戲 ↓</a>
      </header>
      <section id="play-now" aria-labelledby="play-heading" className="catalog">
        <div className="sectionHead"><div><div className="eyebrow">PLAY NOW</div><h2 id="play-heading">現在就能玩</h2></div><p>完成一局，分享成績給朋友挑戰</p></div>
        <div className="grid playableGrid">{playable.map((game) => <GameCard game={game} key={game.id} />)}</div>
      </section>
      <section aria-labelledby="coming-heading" className="catalog coming">
        <div className="sectionHead"><div><div className="eyebrow">COMING NEXT</div><h2 id="coming-heading">接下來的玩法</h2></div><p>以下是企劃，開放遊玩後會在上方出現</p></div>
        {categories.map((category) => {
          const planned = games.filter((game) => game.status === "planned" && game.category === category.name);
          return planned.length ? (
            <div className="categoryGroup" key={category.name}>
              <div className="categoryHead"><h3>{category.name}</h3><p>{category.description}</p></div>
              <div className="grid">{planned.map((game) => <GameCard compact game={game} key={game.id} />)}</div>
            </div>
          ) : null;
        })}
      </section>
      <footer>Game Lab · {playable.length}款已開放，以20款不同玩法上線為目標。</footer>
    </main>
  );
}
