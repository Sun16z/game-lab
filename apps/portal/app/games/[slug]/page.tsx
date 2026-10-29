import { games } from "@game-lab/game-core";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteUrl } from "../../../lib/site";
import { gameProfile } from "../../../lib/game-profiles";
import { GameArt } from "../../../components/GameArt";
import { GameCard } from "../../../components/GameCard";
import { InlinePlay } from "../../../components/InlinePlay";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return games.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = games.find(item => item.slug === slug);
  return {
    title: game ? `${game.title}｜朵朵栗栗的風鈴群島` : "遊戲不存在｜朵朵栗栗的風鈴群島",
    description: game?.summary,
    robots: game?.status === "planned" ? { index: false, follow: true } : undefined,
    alternates: { canonical: `${siteUrl}/games/${slug}/` },
    openGraph: { url: `${siteUrl}/games/${slug}/`, title: game?.title, description: game?.summary, images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630 }] }
  };
}

export default async function GamePage({ params }: Props) {
  const { slug } = await params;
  const game = games.find(item => item.slug === slug);
  if (!game) notFound();
  const profile = gameProfile(slug);
  const playHref = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/play/${slug}/`;
  const playable = game.status === "playable";
  const related = games.filter(item => item.status === "playable" && item.slug !== slug && item.category === game.category).slice(0, 3);
  return <main id="main-content" className={`shell gamePage${playable ? "" : " gamePagePlanned"}`}>
    <Link href="/#play-now" className="backLink">← 回遊戲目錄</Link>
    <section className="gameHero" aria-labelledby="game-title"><div className="gameHeroCopy"><p className="eyebrow">{game.category}<span className="eyebrowSeparator">/</span>{playable ? "現在可以玩" : "玩法企劃・尚未開放"}</p><h1 id="game-title">{game.title}</h1><p className="gameHeadline">{profile.headline.split("\n").map((line, index) => <span key={line}>{index > 0 && <br />}{line}</span>)}</p><p className="gameDescription">{profile.description}</p>{playable ? <a className="primaryButton gamePlayButton" href={playHref}>開始遊玩<span aria-hidden="true">↗</span></a> : <a className="secondaryButton" href="#how-to">看看玩法構想 <span aria-hidden="true">↓</span></a>}<p className="playHint">{playable ? "直接開啟完整遊戲畫面，免下載、免註冊。" : "這一頁介紹規劃方向，還沒有可玩入口。"}</p></div><div className="gameHeroArt"><GameArt slug={slug} large /><div className="gameArtCaption"><span>{game.displayId ?? game.id}</span><span>{profile.pace}</span></div></div></section>
    <section className="learningStrip" aria-labelledby="learning-heading"><div><p className="eyebrow">{playable ? "玩一玩，練習看看" : "預計的練習方向"}</p><h2 id="learning-heading">這次會用到什麼？</h2></div><p>{profile.learning}</p></section>
    <div className="gameGuideLayout"><section id="how-to" className="howTo" aria-labelledby="how-heading"><p className="eyebrow">{playable ? "出發前，看三步就好" : "玩法構想"}</p><h2 id="how-heading">{playable ? "怎麼玩？" : "預計怎麼玩？"}</h2><ol className="playSteps">{profile.steps.map(step => <li key={step}>{step}</li>)}</ol></section><aside className="controlsPanel" aria-labelledby="controls-heading"><h2 id="controls-heading">{playable ? "找到順手的操作" : "操作規劃"}</h2><dl><dt>手機・平板</dt><dd>{profile.touch}</dd><dt>鍵盤</dt><dd>{profile.keyboard}</dd><dt>一起選遊戲</dt><dd>{profile.age}<small>年齡只是參考，可依閱讀與操作經驗選擇，也能由大人陪玩。</small></dd></dl></aside></div>
    <section className="replayNote" aria-labelledby="replay-heading"><div><p className="eyebrow">{playable ? "再來一局，由你決定" : "想再試一次的理由"}</p><h2 id="replay-heading">{game.replay}</h2></div><p>{playable ? "玩完可從結果畫面再試一次，也能選擇分享這一局的成果。隨時可以回遊戲首頁，換個步調。" : "目前仍是企劃。實際關卡、操作與重玩方式，會在可玩版完成後更新。"}</p></section>
    {playable && <InlinePlay href={playHref} title={game.title} />}
    {related.length > 0 && <section className="relatedGames" aria-labelledby="related-heading"><div className="sectionHead"><div><p className="eyebrow">下一站</p><h2 id="related-heading">也許你也想玩</h2></div><Link href="/#play-now" className="textLink">全部遊戲 ↗</Link></div><div className="gameGrid">{related.map(item => <GameCard game={item} key={item.id} />)}</div></section>}
    {playable && <div className="mobilePlayBar"><Link href="/#play-now">← 遊戲目錄</Link><a href={playHref} className="primaryButton">開始遊玩 <span aria-hidden="true">↗</span></a></div>}
  </main>;
}
