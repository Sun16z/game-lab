# pixelfx試作驗收

2026-10-31；上游版本與授權見`src/vendor/pixelfx/README.md`和`NOTICE.md`。

- 375×812實際操作：第一層神準觸發collect-burst；連續三次神準依優先序觸發power-star；本機最佳1層時第二層觸發confetti。經典、霓虹、星際各截圖；另有神準和破紀錄截圖。
- reduced-motion下同樣神準操作，特效狀態為空、畫布未配置、更新0次。
- Chrome DevTools Protocol效能錄製：375×812、CPU throttle 4×，彩帶約3.4秒；16980個trace事件中無超過50ms的RunTask。另一輪202個畫面間隔平均16.64ms、最大24.7ms，無超過34ms間隔。這是桌機模擬，不等於實體中低階手機測試。
- `pnpm typecheck`、`pnpm test`、`pnpm build`、`pnpm size:check`通過；完美疊塔421282 / 425000 gzip bytes，預算未調整。
- 測試覆蓋一般Perfect無新特效、紀錄>連擊>神準、停止／清除／低動態及透明合成。未更動計分或放置規則。
- 預覽目的為兒童與正式站比較；本PR不合併或部署正式站。
