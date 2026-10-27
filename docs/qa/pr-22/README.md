# PR22：雲朵捏捏樂驗收

- 預覽：https://pr-22-game-lab.fmrowfds68.workers.dev/play/cloud-sculptor/?lang=zh-Hant
- 遊戲程式驗收版本`ce3b1a8`：手機375×812、桌機800×600截圖；無水平溢出，桌機完成按鈕底部540px。
- 預覽站驗證滑鼠及模擬觸控拖曳、撤銷、貼紙、作品分享連結重開；本機另驗證鍵盤、完成與重玩、九語與阿拉伯文RTL。
- 全repo typecheck、test、build、size:check通過；G018 JS總計gzip 26,715 bytes，限額150,000 bytes。
- 音樂與音效已接入；未有已核准的G018專屬配音，畫面提供文字提示。素材配樂來源及授權見`knowledge/audio/credits.json`。
- Playwright環境封鎖Service Worker註冊，預覽站`sw.js`回應200，但無法宣稱離線遊玩已驗證。仍需實際iOS Safari、Android、iPad／折疊設備、母語者及兒童遊玩驗收。
