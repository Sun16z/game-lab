import type { Metadata } from "next";
import { games } from "@game-lab/game-core";
import { siteUrl } from "../lib/site";
import "./styles.css";

const playableCount = games.filter(game => game.status === "playable").length;
const plannedCount = games.filter(game => game.status === "planned").length;
const description = `${playableCount}款HTML5遊戲可玩，${plannedCount}款開發中，包含解謎、跑酷與創作遊戲。`;
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Game Lab｜HTML5遊戲實驗室",
  description,
  alternates: { canonical: "/" },
  openGraph: { url: "/", title: "Game Lab｜HTML5遊戲實驗室", description, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/icon.svg` }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
