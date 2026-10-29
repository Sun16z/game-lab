import Link from "next/link";
import type { GameDefinition } from "@game-lab/game-core";
import { GameArt } from "./GameArt";
import { gameProfile } from "../lib/game-profiles";

export function GameCard({ game, compact = false }: { game: GameDefinition; compact?: boolean }) {
  const profile = gameProfile(game.slug);
  return <article className={`gameCard${compact ? " gameCardPlanned" : ""}`}>
    <GameArt slug={game.slug} />
    <div className="gameCardBody"><div className="cardKicker"><span>{game.category}</span><span>{game.status === "planned" ? "規劃中" : profile.pace.split("・")[0]}</span></div>
      <h3><Link href={`/games/${game.slug}/`}>{game.title}</Link></h3>
      <p>{game.summary}</p>
      <span className="cardAction">{game.status === "planned" ? "看看玩法企劃" : "看看怎麼玩"}<span aria-hidden="true">↗</span></span>
    </div>
  </article>;
}
