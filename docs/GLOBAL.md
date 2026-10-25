# 多語與全球流量架構

## 已實作遊戲

《完美疊塔》及《九九乘法怪獸塔》介面有`zh-Hant`、`en`、`es`、`pt-BR`、`fr`、`ar`、`sw`、`id`、`hi`。遊戲內可切換語言；阿拉伯文使用RTL排版。語言由`?lang=`、玩家本機選擇與瀏覽器語言依序決定。遊戲規則、分數與物理運算不依賴語系。

`es`使用拉美常見用語。日後若各國搜尋與留存差異明顯，再拆成`es-MX`、`es-AR`等地區頁面。非洲依國家與實際流量選英文、法文、阿拉伯文或斯瓦希里文；不設單一「非洲語系」。新增語系需檢查翻譯、字體、長字串、RTL、手機排版與玩家理解。

連擊慶祝語由`knowledge/locale-voice/catalog.json`集中管理，產生輕量的`@game-lab/locale-voice`執行資料，供所有遊戲共用。繁中在明確的`zh-TW`瀏覽器語言下使用台灣口語；其他繁中使用較通用的短句。現有短句均為待母語審核候選，地區／口語自然度不能由CLDR等通用資料單獨證明。

## 搜尋入口的下一階段

目前Portal只有繁體中文介紹頁；遊戲內切換語言本身不足以建立多語搜尋流量。公開網域確定後，為有完整翻譯內容的遊戲頁建立獨立語系URL與互相對應的`hreflang`，附上該語系的玩法、操作與常見問題。Google建議使用獨立URL，不要只靠瀏覽器語言切換；`hreflang`不支援`es-419`，拉美通用頁先標`es`。參考：[Google多語網站指南](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)、[Google本地化版本指南](https://developers.google.com/search/docs/specialty/international/localized-versions)。

## 承載與遊戲順暢度

- Portal以Next.js靜態匯出；遊戲以Vite產生獨立HTML、CSS及雜湊檔名的JavaScript。正式上線時將`apps/portal/out/`部署至具全球CDN的靜態託管，HTML短快取、雜湊資源長快取。
- 遊戲迴圈、碰撞判定、分數與重玩都在玩家裝置上執行。沒有每幀或每次放置時的後端請求；網站流量增加不會讓遊戲操作等待共用伺服器。
- 首次載入後Service Worker快取遊戲包，支援再次離線開啟。音效、配音、配樂預設開啟並可一鍵關閉（見[AUDIO.md](AUDIO.md)），背景分頁自動暫停。
- 首版事件只保存在`sessionStorage`且最多200筆，不上傳。未來若啟用分析，應在同意後非同步批次傳送、限制頻率，失敗時直接丟棄，不阻塞遊戲主迴圈。匿名指標與兒童隱私需在正式蒐集前完成設計。
- 流量承載與裝置FPS是兩件事。正式上線前需以實際CDN做負載測試，並在中階Android、iPhone及低速網路量測首屏時間、幀率、輸入延遲與離線重開。測試結果達標後再宣稱可承載特定規模。
- 遊戲畫面採固定2:3邏輯比例，外層依手機、iPad與桌機視窗寬高縮放；支援iPhone安全區與矮螢幕橫向排版。各新遊戲需在窄手機、一般手機、iPad直橫向及桌機尺寸驗收操作與結算分享畫面。
- 若瀏覽器提供Viewport Segments，雙螢幕／有鉸鏈裝置把互動遊戲留在單一分屏內，避開中間接縫；此API仍屬有限支援，未提供時以一般寬高響應式顯示。參考：[MDN Viewport Segments](https://developer.mozilla.org/en-US/docs/Web/API/Viewport_segments_API/Using)、[CSS媒體查詢](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/horizontal-viewport-segments)。
