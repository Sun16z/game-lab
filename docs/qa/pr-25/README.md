# PR25節奏花園驗收

- 預覽：https://pr-25-game-lab.fmrowfds68.workers.dev/play/rhythm-garden/?lang=zh-Hant
- 程式版本`5e3ce34`；手機375×812及桌機800×600截圖在本目錄，無水平溢出，桌機按鈕底部545px。
- 預覽以模擬觸控開始重現旋律，三段12音均完成；本機驗證按錯後保留進度、九語及RTL。
- 全repo typecheck、test、build、size:check通過；JS gzip 25,118 bytes，限額150,000 bytes。測試包含錯誤不重設進度及三段完整成功。
- 配樂與音效已接入；尚無專屬已審核配音。Playwright阻擋Service Worker，離線尚待實機驗證；iOS、Android、iPad、折疊裝置、喇叭音量及兒童實際遊玩仍待驗證。
