# G003 顏色實驗室

獨立靜態HTML5遊戲。五支試管、每管容量四格；三種顏色各四格。點選來源和目標可倒出同色連續區塊，30個固定關卡由`scripts/generate-color-levels.py`產生並以最短路徑求解器驗證。支援無限撤銷、提示、少步數三星、九語、音訊設定、本機最佳步數、離線、結算圖卡與帶關卡的挑戰連結。

```sh
pnpm dev:color
pnpm --filter @game-lab/color-lab test
```
