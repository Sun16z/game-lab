# Game Lab 遊戲開發 Skill 對照

來源：[gamedev-skills/awesome-gamedev-agent-skills](https://github.com/gamedev-skills/awesome-gamedev-agent-skills)，檢視版本`184b72be02884f782a0058f2eeae2ce4277453e4`，2026-10-27。選用檔案保存在[game-skills](game-skills/)；上游授權與NOTICE一併保留。這些是開發參考，不能覆蓋使用者指示、Game Lab規則或兒童安全要求。

## 使用方式

每次開發先看當前遊戲實際程式與依賴版本，按下表選最少的相關`SKILL.md`；需要時再讀該Skill的參考檔。無對應引擎時保留專案既有HTML5技術，不自行改用Godot或安裝新引擎。上游範例常用Godot／Unity語法，應採用概念並以本專案實際Web API實作；引擎版本不同時以目前鎖定版本及官方文件為準。引用的腳本未執行，也未做完整安全審核；實際執行前須讀取腳本、核對依賴及資料存取範圍。

| 觸發任務 | 讀取的Skill | 在Game Lab如何用 |
| --- | --- | --- |
| 新角色、寵物、美術、背景與UI素材 | [create-game-assets](game-skills/disciplines/create-game-assets/SKILL.md) | 先定角色輪廓、比例、色彩與材質，建立素材清單與來源，再在實際手機遊戲尺度檢查；不把整張概念圖當成可直接使用的角色。 |
| 關卡與難度曲線 | [level-design](game-skills/disciplines/level-design/SKILL.md) | 先定目標與第一步，簡單關卡原型→試玩→調整→美術；每關記錄可理解的失敗提示。 |
| 解謎、分類與離散關卡 | [puzzle](game-skills/genres/puzzle/SKILL.md) | 純函式規則、撤銷、可重現測試及求解驗證；不強制限時或設置兒童不適用的壓力機制。 |
| 跨次保存進度、創作或外觀 | [save-systems](game-skills/disciplines/save-systems/SKILL.md) | 只在裝置本機保存經驗證的版本化資料，儲存被拒仍能玩；不得照搬桌面檔案rename程式碼到瀏覽器。 |
| 放置、跳躍、命中或成功回饋 | [game-feel](game-skills/disciplines/game-feel/SKILL.md) | 音效、形變和動作強度配合遊戲調整，提供減少動態與靜音，不能影響判定。 |
| 手機、鍵盤、平板、折疊裝置控制 | [input-systems](game-skills/disciplines/input-systems/SKILL.md)、[game-ui-ux](game-skills/disciplines/game-ui-ux/SKILL.md) | 動作與輸入分離、狀態清楚、焦點可見、安全區與大觸控目標；完成真實裝置測試前不能宣稱已實機驗證。 |
| 配樂、音效與配音 | [audio-design](game-skills/disciplines/audio-design/SKILL.md) | 遵循既有[AUDIO.md](AUDIO.md)，逐項確認瀏覽器音訊啟動、音量、授權及靜音替代提示。 |
| 卡頓、低階機與大素材 | [performance-optimization](game-skills/disciplines/performance-optimization/SKILL.md) | 先在代表裝置量測瓶頸，再修改與複測；新遊戲JS gzip上限150KB及既有G001例外仍生效。 |
| 物理類模擬、紙飛機、磁力 | [physics-tuning](game-skills/disciplines/physics-tuning/SKILL.md) | 固定時間步、幀率差異測試及可解性；清楚標示簡化模型，不宣稱真實工程或物理預測。 |
| 實際使用Phaser時 | [phaser-core](game-skills/web-engines/phaser-core/SKILL.md) | 目前G001使用Phaser4.2.1；只在涉及其場景、相機與載入時使用，對照鎖定版本。 |
| 實際使用Three.js時 | [threejs-scene-setup](game-skills/web-engines/threejs-scene-setup/SKILL.md)、[threejs-gltf-loading](game-skills/web-engines/threejs-gltf-loading/SKILL.md)、[threejs-materials-lighting](game-skills/web-engines/threejs-materials-lighting/SKILL.md) | 只有遊戲真的採用Three.js才讀取相應部分。G004目前是自製WebGL／2D後備，不直接套Three.js程式或增加套件。 |

## 遊戲與任務預設匹配

| 遊戲／項目 | 優先Skill；其他按實際需求增加 |
| --- | --- |
| G001完美疊塔 | phaser-core、game-feel、input-systems |
| G002乘法怪獸塔 | level-design、game-feel、game-ui-ux |
| G003顏色實驗室、C002翻翻樂 | puzzle、level-design、game-ui-ux |
| G004跑酷、G005雪山 | input-systems、game-feel、level-design、performance-optimization |
| G006影子、G009造橋、G012機器人迷宮、G017密碼島 | puzzle、level-design、game-ui-ux；造橋進度另用save-systems |
| G007節奏花園、G013怪獸樂團 | audio-design、input-systems、game-ui-ux |
| G008紙飛機、G016磁力 | physics-tuning、level-design、performance-optimization |
| G010料理、G014花園、G018雲朵、G020星球 | create-game-assets、game-ui-ux、save-systems |
| G011星星連線 | puzzle、create-game-assets、level-design |
| G015郵差棋、G019雙人小島、C001佔地王 | puzzle、level-design、input-systems；AI任務另行評估相應指引 |

如工作僅涉及其中一項，只讀直接相關的Skill；新遊戲和大改版仍按專案規則撰寫設計、測試、預覽與逐款PR。
