# PR21：3D玩具城市跑酷

- PR：https://github.com/Sun16z/game-lab/pull/21
- 預覽：https://pr-21-game-lab.fmrowfds68.workers.dev/play/math-runner/?lang=zh-Hant
- 畫面驗收版本：`1b3bbd4`；375×812與800×600皆使用預覽站實際遊玩截圖，無水平溢出、無pageerror，WebGL渲染器正常。桌機操作按鈕底部572px，在600px畫面內。
- 全repo `pnpm typecheck`、`pnpm test`、`pnpm build`、`pnpm size:check`通過。G004全部遊戲JS合計gzip34,665bytes，上限150,000bytes。
- 瀏覽器控制時鐘驗證：同seed第一個橫桿不跳護盾3→2，適時跳躍保持3並加25分；避障再選正確答案得125分、連擊1、護盾3。
- 換道、加速消耗1次、跳躍、暫停5秒後保留跳躍時間、恢復、90秒結算、重玩回準備畫面均通過。
- 9語言英文高年級模式起局正常，阿拉伯文RTL及三跑道左右順序通過，手機無水平溢出。
- 模擬WebGL不可用：軟體3D正常進入遊玩並可暫停。
- 純函式測試驗證手機、桌機和大畫面的角色腳底投影、橫桿與答案門碰撞座標一致，以及起跳／落地高度邊界。

截圖為Chromium響應式模擬；實際手機GPU、Safari與不同折疊硬體仍需裝置測試。無WebGL降級以可玩為目標，效能依裝置而異。
