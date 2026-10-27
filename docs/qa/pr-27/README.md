# G009 小小造橋師預覽驗收

- 遊戲程式版本：`86be209`。
- 預覽：https://pr-27-game-lab.fmrowfds68.workers.dev/play/bridge-builder/?lang=zh-Hant
- 截圖：`mobile-375x812.png`、`desktop-800x600.png`，皆為預覽站第二關。
- 預覽站完成三關並到達結算頁；本機另測觸控拖放、鍵盤、缺口與支撐提示、九種語言及窄螢幕版面。
- `pnpm typecheck`、`pnpm test`、`pnpm build`、`pnpm size:check` 通過；遊戲 JavaScript gzip 大小 26,869 bytes。
- 瀏覽器模擬不等同實機驗證；實體手機、平板、折疊裝置及離線功能仍待測。文案尚需母語者審閱。
