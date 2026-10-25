# Game Lab

HTML5遊戲實驗室。第一款《完美疊塔》已可在本機遊玩；其餘四款仍在規劃中。

```bash
pnpm install
pnpm dev
```

本機網站預設在 <http://localhost:3000>，遊戲頁位於`/games/perfect-stack`。若只開發遊戲，可執行`pnpm dev:game`，Vite預設使用<http://127.0.0.1:5173>。

`pnpm build`先產生獨立遊戲包，再匯出靜態網站到`apps/portal/out/`。獨立遊戲包在`games/perfect-stack/dist/`；遊戲載入後以Service Worker預先快取發行檔案。檢查指令：`pnpm typecheck`、`pnpm test`、`pnpm build`。

推送到`main`後，GitHub Actions會以`NEXT_PUBLIC_BASE_PATH=/game-lab`建置並部署GitHub Pages。正式遊戲頁預計位於`https://<帳號>.github.io/game-lab/play/perfect-stack/index.html`。本機建置未設定此前綴，仍可在網站根路徑預覽。

規格見 [docs/PRD.md](docs/PRD.md)，順序與完成條件見 [docs/ROADMAP.md](docs/ROADMAP.md)，多語與流量架構見 [docs/GLOBAL.md](docs/GLOBAL.md)。
