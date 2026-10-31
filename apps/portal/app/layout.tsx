import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { games } from "@game-lab/game-core";
import { siteUrl } from "../lib/site";
import { SiteHeader, SiteFooter } from "../components/Brand";
import "./styles.css";

const themeScript = readFileSync(resolve(process.cwd(), "../../packages/game-theme/theme.js"), "utf8");

const playableCount = games.filter(game => game.status === "playable").length;
const description = `和朵朵、栗栗、小燈一起探索風鈴群島。${playableCount}款免費遊戲，從捏雲朵、搭橋到解謎與同玩，手機和鍵盤都能出發。`;
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "朵朵栗栗的風鈴群島｜Game Lab",
  description,
  alternates: { canonical: "/" },
  openGraph: { url: "/", title: "朵朵栗栗的風鈴群島｜Game Lab", description, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/icon.svg` }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head><body><a className="skipLink" href="#main-content">跳到主要內容</a><SiteHeader />{children}<SiteFooter /></body></html>;
}
