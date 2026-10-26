import type { Metadata } from "next";
import { siteUrl } from "../lib/site";
import "./styles.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Game Lab｜HTML5遊戲實驗室",
  description: "以20款上線遊戲為目標的HTML5遊戲企劃與試玩基地，包含新增候選遊戲。",
  alternates: { canonical: "/" },
  openGraph: { url: "/", title: "Game Lab｜HTML5遊戲實驗室", description: "以20款上線遊戲為目標的HTML5遊戲企劃與試玩基地，包含新增候選遊戲。" },
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/icon.svg` }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
