# PR23 雙人小島任務驗收

- 遊戲預覽：https://pr-23-game-lab.fmrowfds68.workers.dev/play/island-duo/?lang=zh-Hant
- 程式版本`5b36308`，手機375×812和桌機800×600截圖附於本目錄；畫面無水平溢出，桌機棋盤完整、方向鍵底部574px。
- 預覽站驗證模擬觸控換人、完整12步過關、結果及挑戰連結回讀同關與目標步數；本機另驗證重玩、鍵盤方向、九語與阿拉伯文RTL。
- 全repo typecheck、test、build及size:check通過；G019全部JS gzip 25,924 bytes，上限150,000 bytes。兩關經自動搜尋確認輪流規則可解。
- 畫面採CSS立體透視棋盤；配樂與音效沿用已登記授權的Game Lab素材。專屬配音與母語審聽尚未完成，遊戲標示7歲以上並提供文字引導。
- 截圖與觸控為Chromium模擬；iOS Safari、Android、iPad、折疊裝置、親子實際遊玩及效能仍待驗證。Playwright環境封鎖Service Worker，不能據此宣稱離線驗證完成。
