# 朵朵栗栗的風鈴群島：入口改版驗收

日期：2026-10-29。範圍：首頁、全部23個遊戲介紹頁、共用導覽與品牌圖像。獨立遊戲包與本機紀錄格式不變。

## 實作與驗證

- 15款可玩、8款企劃，數量由遊戲資料計算；既有路徑與候選編號保留。
- 全部介紹頁各有專屬插畫場景、學習方向、三步操作、年齡與操作建議；未上線頁保留noindex，沒有遊玩入口。
- 首頁及23頁在375×812、800×600、1024×768逐頁檢查：無水平溢出；標題、三步說明、可玩入口與OG標籤完整。
- 375px手機整卡角落可點並到達完美疊塔介紹頁；最小卡片高度291px。Tab第一站為跳至主要內容，卡片標題為原生連結並有整卡焦點框。
- 頁內試玩預設沒有iframe；按下才掛載遊戲，關閉後卸載。手機底部另有明顯完整畫面遊玩入口。
- 保留九語言404、reduced-motion、safe-area；首頁OG為1200×630實際品牌場景。
- 本機完整typecheck、test、build通過；現有15款大小檢查通過。工作區另有未提交的Lexi-Jet，已單獨建置後在本機大小檢查通過，未納入本PR。乾淨PR CI須再確認。

## 畫面

- [375×812首頁](home-mobile.png)
- [800×600首頁](home-desktop.png)
- [375×812介紹頁](detail-mobile.png)
- [800×600介紹頁](detail-desktop.png)

## 主要檔案

`apps/portal/app/{page,layout,styles,not-found}`、`app/games/[slug]/page.tsx`、`components/{Brand,GameArt,GameCard,InlinePlay}.tsx`、`lib/game-profiles.ts`、`public/{brand,icon.svg,og.png}`。

預覽、CI與正式部署結果見本PR與部署紀錄；尚未部署前不視為正式站已更新。

## PR68預覽驗收

預覽：https://pr-68-game-lab.fmrowfds68.workers.dev/ 。CI與Workers部署皆通過。375×812與800×600首頁HTTP200、23張卡片、無水平溢出；完美疊塔介紹頁的開始入口能開啟實際遊戲包。

- [預覽手機首頁](preview-home-mobile.png)、[預覽桌機首頁](preview-home-desktop.png)
- [預覽手機介紹](preview-detail-mobile.png)、[預覽桌機介紹](preview-detail-desktop.png)

此紀錄與截圖在合併前回報給使用者。
