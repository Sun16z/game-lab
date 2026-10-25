import { games } from "@game-lab/game-core";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return games.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = games.find((item) => item.slug === slug);
  return { title: game ? `${game.title}｜Game Lab` : "遊戲不存在｜Game Lab", description: game?.summary };
}

export default async function GamePage({ params }: Props) {
  const { slug } = await params;
  const game = games.find((item) => item.slug === slug);
  if (!game) notFound();
  return (
    <main className="shell detail">
      <Link href="/" className="back">← 返回遊戲目錄</Link>
      <div className="eyebrow">{game.id} / {game.priority}</div>
      <h1>{game.title}</h1>
      <p className="lead">{game.summary}</p>
      {game.status === "playable" ? (
        <section className="playSection" aria-label={`${game.title}遊戲`}>
          <iframe className="gameEmbed" src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/play/${game.slug}/index.html`} title={`${game.title}試玩`} allow="fullscreen" />
          <p>點擊畫面或按Space放置方塊。你也可以<a href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/play/${game.slug}/index.html`}>開啟獨立遊戲頁</a>，在遊戲內切換語言。</p>
        </section>
      ) : (
        <div className="notice" role="status">
          <strong>開發規劃中</strong>
          <p>這款遊戲還沒有可玩版本。完成操作、結算和快速重玩驗收後，這裡會提供試玩入口。</p>
        </div>
      )}
      <section className="detailInfo">
        <h2>開發方向</h2>
        <p>Game Lab會優先做好手機操作、即時回饋、個人最佳成績與快速重玩。每款遊戲將保留獨立HTML5發行包，方便在不同平台測試。</p>
      </section>
    </main>
  );
}
