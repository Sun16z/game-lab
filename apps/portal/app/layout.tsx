import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Game Lab｜HTML5遊戲實驗室",
  description: "五款HTML5遊戲的開發與試玩基地。",
  icons: { icon: "/icon.svg" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
