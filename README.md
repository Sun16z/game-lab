# Game Lab

HTML5遊戲實驗室。《完美疊塔》和《九九乘法怪獸塔》已可遊玩，其餘三款仍在規劃中。

```bash
pnpm install
pnpm dev
```

本機網站預設在 <http://localhost:3000>，遊戲頁位於`/games/perfect-stack`及`/games/monster-math`。若只開發遊戲，可執行`pnpm dev:game`或`pnpm dev:monster`。

`pnpm build`先產生兩款獨立遊戲包，再匯出靜態網站到`apps/portal/out/`。遊戲載入後以Service Worker預先快取發行檔案。檢查指令：`pnpm typecheck`、`pnpm test`、`pnpm build`。

推送到`main`後，GitHub Actions會以`NEXT_PUBLIC_BASE_PATH=/game-lab`建置並部署GitHub Pages。正式遊戲頁位於`https://sun16z.github.io/game-lab/play/perfect-stack/index.html`與`https://sun16z.github.io/game-lab/play/monster-math/index.html`。本機建置未設定此前綴，仍可在網站根路徑預覽。

規格見 [docs/PRD.md](docs/PRD.md)，順序與完成條件見 [docs/ROADMAP.md](docs/ROADMAP.md)，多語與流量架構見 [docs/GLOBAL.md](docs/GLOBAL.md)。
