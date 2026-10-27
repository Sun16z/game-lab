# PR24影子變變變驗收

- 預覽：https://pr-24-game-lab.fmrowfds68.workers.dev/play/shadow-friends/?lang=zh-Hant
- 版本`74af903`；手機375×812、桌機800×600截圖在本目錄，無水平溢出，桌機按鈕底部578px。
- 預覽以模擬觸控轉動後確認目標與影子邊界位置一致，三幕完成共6次轉動；本機驗證九語及阿拉伯文RTL。
- 全repo typecheck、test、build、size:check通過；JS總gzip 25,294 bytes，限額150,000 bytes。規則測試包含各關解答及蝴蝶對稱的另一個解答。
- 文字引導與配樂／音效已接入；專屬配音及母語文案審聽尚未完成。Playwright阻擋Service Worker，離線遊玩仍需實機驗證；iOS、Android、iPad、折疊裝置與兒童遊玩尚待實機測試。
