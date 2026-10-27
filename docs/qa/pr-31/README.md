# 造橋改版預覽驗收

- 程式版本 `5eb05bd`；預覽：https://pr-31-game-lab.fmrowfds68.workers.dev/play/bridge-builder/?lang=zh-Hant
- 375×812和800×600預覽：第二關完整橋面缺少橋墩時標示過長跨度，加入中央橋墩後可過關；截圖為補上橋墩後、再次測試前。
- 本機手機尺寸模擬完成十關，九語未見水平溢出；規則測試涵蓋有解、跨度、材料、限制與預算。
- `pnpm typecheck`、`pnpm test`、`pnpm build`、`pnpm size:check`通過。兒童、母語者、實體手機／平板與折疊裝置仍待驗證；目前沒有跨次進度保存。
