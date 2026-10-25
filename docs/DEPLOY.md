# 部署：Cloudflare Workers 靜態資源（games.somewhen.life）

更新：2026-10-25（Claude查證整理，交Codex實作）。Justin定案正式網址為 `https://games.somewhen.life/`，從GitHub Pages（`https://sun16z.github.io/game-lab/`）搬到Cloudflare。原始碼仍在GitHub，GitHub Actions負責檢查與部署。

## 為什麼是Workers，不是Pages

2026-10-25查官方文件：

- [Cloudflare Pages文件](https://developers.cloudflare.com/pages/)首頁橫幅寫「Start new projects with Workers」，稱Workers為主要平台、支援大部分Pages用例。Pages沒有宣布停用，但新專案照官方建議用Workers。
- [Workers靜態資源計費](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)：「Requests to static assets are free and unlimited」，儲存不另收費。本站是純靜態輸出，不寫Worker程式碼，等於免費。
- [平台限制](https://developers.cloudflare.com/workers/platform/limits/)：免費方案每個版本最多20,000個檔案、單檔25MiB；Wrangler需4.34.0以上才吃得到新的檔案數上限。20款遊戲加音檔遠低於上限，但每款的音檔仍照[AUDIO.md](AUDIO.md)控制大小。
- `_headers`、`_redirects`、預覽網址、自訂網域Workers都支援（見[從Pages遷移指南](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)的對照表）。自訂網域要求網域的nameserver在Cloudflare；`somewhen.life`的DNS已在Cloudflare（帳號 Bigchisan@gmail.com），符合。

限制或價格日後可能變動；實作當天再看一次上面三個連結。

## 不要做的事

- 不寫Worker腳本、不開`run_worker_first`。所有請求都由靜態資源直接回應；一旦經過Worker，請求就會計費，超過免費額度會回429。
- 不使用Cloudflare的cookie、追蹤或廣告功能。兒童網站不設任何cookie。
- 不把API token、account ID寫進repo；只放GitHub Secrets。

## 需要Justin親自做的（Codex不代辦）

1. 在Cloudflare後台建立API token：用「Edit Cloudflare Workers」範本，帳號資源限定本帳號，Zone資源只選`somewhen.life`。
2. 把token與Account ID放進GitHub repo的Secrets：`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`。
3. 確認`somewhen.life`底下沒有現存的`games`紀錄（DNS頁面），避免衝突。
4. （選擇性）如果不想讓預覽網址公開，在Cloudflare Access對`*.workers.dev`的預覽版本加登入保護；預覽網址預設是公開的。

## 實作步驟（Codex）

### 1. 拿掉GitHub Pages的子路徑

- `deploy-pages.yml`設的`NEXT_PUBLIC_BASE_PATH=/game-lab`只給GitHub Pages用。Cloudflare站在網域根目錄，建置時不設這個變數（`next.config`已經是`basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined`，不用改）。
- 搜尋程式碼裡寫死的`/game-lab`、`sun16z.github.io`（分享連結、canonical、Open Graph網址、sitemap、README），改為`https://games.somewhen.life`；集中成一個常數或環境變數`NEXT_PUBLIC_SITE_URL`，不要散落各處。
- 遊戲包的Vite設定已是`base: "./"`，不用改。

### 2. 新增 `wrangler.jsonc`（repo根目錄）

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "game-lab",
  "compatibility_date": "2026-10-25",
  "assets": {
    "directory": "./apps/portal/out",
    "not_found_handling": "404-page"
  },
  "routes": [{ "pattern": "games.somewhen.life", "custom_domain": true }],
  "workers_dev": true,
  "preview_urls": true
}
```

- 沒有`main`欄位：純靜態，不部署Worker腳本。
- `not_found_handling`要明寫；Next的static export會產出`404.html`。
- `workers_dev`保持開啟，預覽網址才會產生（[Preview URLs文件](https://developers.cloudflare.com/workers/configuration/previews/)：關掉`workers_dev`時預覽預設也關閉）。正式網址的canonical一律指向`games.somewhen.life`。
- `wrangler`加進根目錄devDependencies，鎖4.34.0以上的版本。
- Next輸出是`trailingSlash: true`的目錄式頁面，部署到預覽後逐一確認`/`、`/games/<slug>/`、`/play/<slug>/index.html`與不存在的網址（應回404頁）。

### 3. 快取與安全標頭：`apps/portal/public/_headers`

放在`public/`，建置時會被複製到輸出目錄；檔案本身不會被當成資源提供。上限100條規則。

```
# 帶hash的檔名可以長期快取
/_next/static/*
  Cache-Control: public, max-age=31536000, immutable
/play/*/assets/*
  Cache-Control: public, max-age=31536000, immutable

# HTML與service worker每次都要檢查更新，否則玩家拿不到新版
/*.html
  Cache-Control: no-cache
/play/*/sw.js
  Cache-Control: no-cache

/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  Content-Security-Policy: frame-ancestors 'self'
```

- `frame-ancestors 'self'`：Portal用同源iframe嵌入遊戲（`apps/portal/app/games/[slug]/page.tsx`），所以允許自己，禁止被其他網站嵌入。
- 麥克風、相機、定位全部禁止，與AUDIO.md「不錄製兒童聲音」一致；日後真有遊戲需要，再逐路徑開放。
- 完整CSP（script-src等）先不加：Next static export有inline script，要另外處理nonce/hash；列為後續項目。
- 部署後用`curl -I`檢查各類檔案的實際標頭。

### 4. GitHub Actions

把`deploy-pages.yml`改成（或新增）`deploy-cloudflare.yml`，沿用現有的檢查步驟（`audio:check`、`typecheck`、`test`、`build`），建置時不設`NEXT_PUBLIC_BASE_PATH`，然後用[cloudflare/wrangler-action](https://github.com/cloudflare/wrangler-action)（目前主版本v4，預設Wrangler v4）：

- **push到main**：`command: deploy`，部署到正式網址。
- **pull request**：使用Wrangler 4.136.3以上的`preview --name pr-<編號>`建立獨立預覽，網址由Action寫入GitHub Deployment與job summary。首次部署前Worker尚未存在，`versions upload`會失敗，所以改用官方目前提供的Workers Previews流程。
- Secrets：`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`。
- `concurrency`照現在的做法，同一時間只跑一個正式部署。

每款新遊戲開分支、發PR，在預覽網址試玩通過再合併；這也解決多個agent共用工作目錄時「合併到main才看得到成果」的問題。

### 5. 舊網址的收尾（GitHub Pages）

舊網址已經被分享出去，玩家手機上也可能有舊的service worker快取，所以GitHub Pages不能直接關掉，要先做最後一次「轉址版」部署：

- **轉址頁**：每個舊路徑（`/game-lab/`、`/game-lab/games/<slug>/`、`/game-lab/play/<slug>/index.html`）都放一個小頁面，用`<meta http-equiv="refresh">`加一行JS，把路徑（去掉`/game-lab`前綴）與查詢字串（例如`?lang=`）帶到`https://games.somewhen.life`，並設`<link rel="canonical">`。GitHub Pages不支援伺服器端轉址，只能這樣做。
- **service worker退場**：舊的`/game-lab/play/<slug>/sw.js`換成退場版：install時`skipWaiting()`，activate時刪掉所有快取、`self.registration.unregister()`，再讓開著的頁面重新載入。舊的SW是cache-first，不換掉的話，玩家會一直拿到快取的舊遊戲，看不到轉址頁。
- 這個轉址版部署保留至少3個月，之後再關掉GitHub Pages。
- **玩家紀錄**：最佳成績、累積層數、解鎖主題都存在舊網域的localStorage，搬家後歸零。目前玩家很少，接受歸零，不做轉移功能；在轉址頁加一句「網址已搬家，紀錄需要重新開始」。

### 6. 上線驗收

- [ ] `https://games.somewhen.life/` 首頁、三款遊戲、遊戲說明頁都能開，手機與桌機都測。
- [ ] 不存在的網址回404頁。
- [ ] `curl -I`確認：hash資源`immutable`、HTML與`sw.js`為`no-cache`、安全標頭都在。
- [ ] 第一次載入後切飛航模式，遊戲仍可離線開啟（service worker在新網域正常註冊）。
- [ ] 分享圖卡與複製連結產生的網址是新網域，且保留`?lang=`。
- [ ] 開一個測試PR，確認預覽網址自動產生、內容是該分支的版本。
- [ ] 舊網址`https://sun16z.github.io/game-lab/play/perfect-stack/index.html?lang=en`會轉到新網址的對應頁面與語言。
- [ ] README、PRD、ROADMAP裡的網址都更新。

## 之後再做

- 完整Content-Security-Policy（處理Next inline script的hash）。
- 排行榜後端：Roadmap已列，屆時才加Worker腳本與資料庫，並重新評估免費額度與兒童隱私。
- Cloudflare Web Analytics（無cookie）：要開之前先確認兒童隱私與各國法規，並在頁尾說明。
