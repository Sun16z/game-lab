# 遊戲網址修正預覽

- 程式版本 `9198eb2`；預覽：https://pr-30-game-lab.fmrowfds68.workers.dev/
- 375×812與800×600檢查首頁兩款遊戲連結皆以斜線結尾，開啟完美疊塔開始畫面；附截圖。
- 內建瀏覽器從首頁點選完美疊塔能載入；Safari在正式站以斜線網址開啟兩款開始畫面。此前帶 index.html 的網址在內建瀏覽器出現 net::ERR_FAILED。
- typecheck、test、build、size:check 通過。使用者 Safari 原始白畫面的具體成因未完全確認，仍需使用者重試。
