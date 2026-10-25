import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Game Lab｜HTML5遊戲實驗室",
  description: "20款不同玩法的HTML5遊戲企劃與試玩基地。",
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/icon.svg` }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
