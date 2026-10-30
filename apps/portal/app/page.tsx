import { games } from "@game-lab/game-core";
import { Info } from "@phosphor-icons/react/dist/ssr";
import { ContinueCard, FilterGrid } from "../components/PlayHome";
import { GameArt } from "../components/GameArt";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function Home() {
  const playable = games.filter(game => game.status === "playable");
  const titles = Object.fromEntries(playable.map(game => [game.slug, game.title]));
  return <main id="main-content" className="shell kidHome">
    <section className="greet" aria-labelledby="home-title">
      <img src={`${basePath}/brand/pip.webp`} alt="" width="400" height="370" fetchPriority="high" />
      <h1 id="home-title">今天想玩什麼？</h1>
    </section>
    <ContinueCard titles={titles} />
    <FilterGrid count={playable.length}>
      {playable.map(game => <li key={game.slug} className="tile" data-category={game.category}>
        <a className="tilePlay" href={`${basePath}/play/${game.slug}/`} data-play={game.slug}>
          <GameArt slug={game.slug} />
          <span className="tileName">{game.title}</span>
        </a>
        <a className="tileInfo" href={`${basePath}/games/${game.slug}/`} aria-label={`${game.title}的玩法介紹`}><Info size={22} weight="bold" aria-hidden="true" /></a>
      </li>)}
    </FilterGrid>
  </main>;
}
