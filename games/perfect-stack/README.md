# G001 完美疊塔

首款可玩遊戲。規則見`docs/PRD.md`。本目錄可獨立建置為靜態HTML5包，不依賴Portal或分析後端即可遊玩。

```bash
pnpm --filter @game-lab/perfect-stack dev
pnpm --filter @game-lab/perfect-stack test
pnpm --filter @game-lab/perfect-stack build
```

遊戲支援觸控／滑鼠與Space鍵。介面有繁體中文、英文、西班牙文、巴西葡萄牙文、法文、阿拉伯文、斯瓦希里文、印尼文、印地文。最高層數保存在本機；事件只記在目前瀏覽器工作階段，不傳送到伺服器。

每3次連續Perfect可修復最多6px方塊寬度，上限為初始寬度。遊戲畫面顯示連擊進度與距離最佳紀錄的層數；放置時有短暫回彈、Perfect亮光及被切下方塊的落下動畫。系統偏好減少動態效果時，這些裝飾動畫會停用。
