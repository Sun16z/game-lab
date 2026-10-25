# Game Lab

HTML5遊戲實驗室。目標是20款玩法各異的遊戲；《完美疊塔》和《九九乘法怪獸塔》已可玩，其餘18款仍在企劃中。

```bash
pnpm install
pnpm dev
```

本機網站預設在 <http://localhost:3000>，遊戲頁位於`/games/perfect-stack`及`/games/monster-math`。若只開發遊戲，可執行`pnpm dev:game`或`pnpm dev:monster`。

`pnpm build`先產生兩款獨立遊戲包，再匯出靜態網站到`apps/portal/out/`。遊戲載入後以Service Worker預先快取發行檔案。檢查指令：`pnpm typecheck`、`pnpm test`、`pnpm build`。

正式網址：`https://games.somewhen.life/`。PR由GitHub Actions部署Cloudflare預覽版本，合併到`main`後部署正式站；部署步驟見[`docs/DEPLOY.md`](docs/DEPLOY.md)。本機建置未設定路徑前綴，可在網站根路徑預覽。

規格見 [docs/PRD.md](docs/PRD.md)，順序與完成條件見 [docs/ROADMAP.md](docs/ROADMAP.md)，20款玩法及兒童遊玩原則見 [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md)，多語與流量架構見 [docs/GLOBAL.md](docs/GLOBAL.md)。
