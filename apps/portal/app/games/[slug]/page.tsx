import { games } from "@game-lab/game-core";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteUrl } from "../../../lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return games.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = games.find((item) => item.slug === slug);
  return {
    title: game ? `${game.title}｜Game Lab` : "遊戲不存在｜Game Lab",
    description: game?.summary,
    alternates: { canonical: `${siteUrl}/games/${slug}/` },
    openGraph: { url: `${siteUrl}/games/${slug}/`, title: game?.title, description: game?.summary }
  };
}

export default async function GamePage({ params }: Props) {
  const { slug } = await params;
  const game = games.find((item) => item.slug === slug);
  if (!game) notFound();
  return (
    <main className="shell detail">
      <Link href="/" className="back">← 返回遊戲目錄</Link>
      <div className="eyebrow">{game.displayId ?? game.id} / {game.category}</div>
      <h1>{game.title}</h1>
      <p className="lead">{game.summary}</p>
      {game.status === "playable" ? (
        <section className="playSection" aria-label={`${game.title}遊戲`}>
          <a className="playDirect" href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/play/${game.slug}/`}>開啟遊戲 ↗</a>
          <iframe className="gameEmbed" src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/play/${game.slug}/`} title={`${game.title}試玩`} allow="fullscreen" />
          <p>{game.id === "G001" ? "點擊畫面或按Space放置方塊。" : game.id === "G002" ? "點選答案或按1～4答題，90秒內盡量打倒怪獸。" : game.id === "G018" ? "拖動圓點捏出雲朵，加上貼紙，完成後分享給朋友。" : "進入遊戲後依畫面提示操作。"}你也可以<a href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/play/${game.slug}/`}>開啟獨立遊戲頁</a>，在遊戲內切換語言。</p>
        </section>
      ) : (
        <div className="notice" role="status">
          <strong>開發規劃中</strong>
          <p>玩法方向：{game.summary}想再玩一次的理由：{game.replay}。完成操作、結算和快速重玩驗收後，這裡會提供試玩入口。</p>
        </div>
      )}
      <section className="detailInfo">
        <h2>開發方向</h2>
        <p>Game Lab會優先做好手機操作、即時回饋、個人最佳成績與快速重玩。每款遊戲將保留獨立HTML5發行包，方便在不同平台測試。</p>
      </section>
    </main>
  );
}
