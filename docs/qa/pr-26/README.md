# PR26紙飛機郵差驗收

- 預覽：https://pr-26-game-lab.fmrowfds68.workers.dev/play/paper-plane/?lang=zh-Hant
- 版本`2b9b4e6`；手機375×812及桌機800×600截圖在本目錄，無水平溢出，桌機放飛按鈕底部516px。
- 預覽以模擬觸控放飛並完成三條路線；本機驗證偏離後保留關卡、三次投擲通關、九語及RTL。
- 全repo typecheck、test、build、size:check通過；JS gzip 26,264 bytes，上限150,000 bytes。規則測試確認三個目的地均有可達角度及落地高度。
- 配樂與音效已接入；尚無專屬已審核配音。Playwright阻擋Service Worker，離線尚待實機驗證；iOS、Android、iPad、折疊裝置及兒童遊玩仍需驗證。
