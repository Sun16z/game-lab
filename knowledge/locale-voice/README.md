# 遊戲情緒語句知識庫

這份目錄是所有遊戲共用的短句來源。`catalog.json`按**事件情境、語言與地區、語氣、審核狀態**記錄候選文案。新增遊戲時，先選符合事件的cue，再由`@game-lab/locale-voice`讀取；不要把台灣口語直接套到香港，也不要按IP或國籍推測玩家喜好。玩家選的語言優先，地區變體只在語言標籤明確時使用。

## 目前情境

`perfect_streak_3`：連續3次Perfect後的短暫稱讚。句子要能在約1.2秒內讀完，直接稱讚玩家的操作，避免嘲諷、刻板印象、性別假設和預設粗口。台灣變體採用使用者提出的「哇、超強」方向；「幹你超強誒」列為**未上線的較強語氣候選**，要有玩家主動選擇強語氣、年齡適用性和母語審核後才可考慮。

目前10組台詞全標`native_review_pending`。GitHub上的CLDR與風格指南能支持語言／地區標記及在地化流程，**無法證明這些口語句子在各地自然或適合所有年齡**。上線前請各目標市場母語使用者核對自然度、年齡適用性、排版及反感風險；記錄審核人、日期、目標地區與修訂版本。西語、阿拉伯語及斯瓦希里語目前尤其需要分區審核。

G001的成就及主題名稱目前在`games/perfect-stack/src/progress-i18n.ts`，同樣屬待母語審核文案。若後續遊戲重用成就語氣，再把經審核名稱轉入此知識庫。

## 調查依據（2026-10-25）

| GitHub資料 | 採用的做法 | 限制 |
| --- | --- | --- |
| [Unicode CLDR JSON](https://github.com/unicode-org/cldr-json/blob/main/README.md) | 依語言／地區維護資料；正式格式可依CLDR處理 | CLDR不收錄遊戲稱讚口語 |
| [Microsoft在地化風格指南索引](https://github.com/MicrosoftDocs/globalization/blob/main/globalization/reference/microsoft-style-guides.md) | 區分繁中、巴西葡語、西語各地區等市場用法 | 文件偏UI與技術文案，口語仍需真人審核 |
| [Microsoft可在地化設計](https://github.com/MicrosoftDocs/windows-dev-docs/blob/docs/hub/apps/design/globalizing/prepare-your-app-for-localization.md) | 字串與程式分離、保留使用情境與語氣、測長字串和RTL | 通用指南，不是特定句子的來源 |
| [Project Fluent](https://github.com/projectfluent/fluent/blob/main/README.md) | 讓譯者按情境自然表達，避免逐字硬譯 | 本專案短句量很小，暫不載入Fluent執行階段 |

## 新增與審核

1. 在`catalog.json`加入具體事件cue、地區範圍、語氣與兩句候選。避免一個「非洲語氣」或「拉美語氣」涵蓋所有國家。
2. 用`pnpm voice:generate`產生只有短句的`packages/locale-voice/src/runtime.generated.ts`。審核資訊不進入遊戲包。
3. 由當地母語使用者在實際遊戲畫面測試短句、字體、RTL、出現時間。審核後更新`review`及審核紀錄；目前的候選文案不可對外宣稱已驗證。
4. 比較連擊後重玩率與玩家回饋，再調整觸發頻率及語氣。不要為了情緒效果增加輸入、計分路徑上的網路請求。
